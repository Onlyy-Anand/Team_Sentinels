import { supabase } from '../lib/supabase';

interface DeviceInfo {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  platform: string;
  language: string;
  timezone: string;
}

interface LoginActivityData {
  user_id: string;
  email: string;
  device_info: DeviceInfo;
  ip_address?: string;
  login_source: 'signup' | 'signin';
  successful: boolean;
  error_message?: string;
}

const getDeviceInfo = (): DeviceInfo => {
  return {
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    platform: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

const getIpAddress = async (): Promise<string | undefined> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return undefined;
  }
};

export const recordLoginActivity = async (
  userId: string,
  email: string,
  source: 'signup' | 'signin',
  successful: boolean = true,
  errorMessage?: string
): Promise<void> => {
  try {
    const deviceInfo = getDeviceInfo();
    const ipAddress = await getIpAddress();

    const { error } = await supabase.from('login_activity').insert({
      user_id: userId,
      email,
      device_info: deviceInfo,
      ip_address: ipAddress,
      login_source: source,
      successful,
      error_message: errorMessage,
    });

    if (error) {
      console.error('Error recording login activity:', error);
    }
  } catch (error) {
    console.error('Failed to record login activity:', error);
  }
};

export const recordLogoutActivity = async (userId: string): Promise<void> => {
  try {
    const { data, error: selectError } = await supabase
      .from('login_activity')
      .select('id, login_timestamp')
      .eq('user_id', userId)
      .is('logout_timestamp', null)
      .order('login_timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selectError) {
      console.error('Error fetching login activity:', selectError);
      return;
    }

    if (data) {
      const loginTime = new Date(data.login_timestamp);
      const logoutTime = new Date();
      const durationMinutes = Math.floor(
        (logoutTime.getTime() - loginTime.getTime()) / (1000 * 60)
      );

      const { error: updateError } = await supabase
        .from('login_activity')
        .update({
          logout_timestamp: logoutTime,
          session_duration_minutes: durationMinutes,
        })
        .eq('id', data.id);

      if (updateError) {
        console.error('Error updating logout activity:', updateError);
      }
    }
  } catch (error) {
    console.error('Failed to record logout activity:', error);
  }
};

export const getLoginHistory = async (
  userId: string,
  limit: number = 20
): Promise<LoginActivityData[]> => {
  try {
    const { data, error } = await supabase
      .from('login_activity')
      .select('*')
      .eq('user_id', userId)
      .order('login_timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching login history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch login history:', error);
    return [];
  }
};

export const getAllUserLogins = async (limit: number = 100): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('login_activity')
      .select('user_id, email, login_timestamp, device_info, session_duration_minutes')
      .order('login_timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching all logins:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch all logins:', error);
    return [];
  }
};
