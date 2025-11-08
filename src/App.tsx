import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { recordLoginActivity, recordLogoutActivity } from './hooks/useLoginTracking';
import { HomePage } from './components/HomePage';
import { AuthForm } from './components/AuthForm';
import { EmotionalCompanion } from './components/EmotionalCompanion';
import { LoadingScreen } from './components/LoadingScreen';
import type { User } from '@supabase/supabase-js';

type Page = 'home' | 'auth' | 'companion' | 'loading';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    let previousUserId: string | null = null;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      previousUserId = session?.user?.id ?? null;
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        const newUser = session?.user ?? null;

        if (_event === 'SIGNED_OUT' && previousUserId) {
          await recordLogoutActivity(previousUserId);
          setCurrentPage('home');
        }

        if (_event === 'SIGNED_IN' && newUser) {
          await recordLoginActivity(newUser.id, newUser.email || '', 'signin', true);
        }

        setUser(newUser);
        previousUserId = newUser?.id ?? null;
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginClick = () => {
    setAuthMode('signin');
    setCurrentPage('auth');
  };

  const handleSignupClick = () => {
    setAuthMode('signup');
    setCurrentPage('auth');
  };

  const handleCopilotClick = () => {
    if (user) {
      setCurrentPage('loading');
      setTimeout(() => setCurrentPage('companion'), 800);
    } else {
      handleSignupClick();
    }
  };

  const handleAuthSuccess = () => {
    setCurrentPage('home');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (currentPage === 'loading') {
    return <LoadingScreen />;
  }

  if (currentPage === 'auth') {
    return (
      <AuthForm
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
        onBackClick={() => setCurrentPage('home')}
      />
    );
  }

  if (currentPage === 'companion' && user) {
    return <EmotionalCompanion onBackClick={() => setCurrentPage('home')} />;
  }

  return (
    <HomePage
      onLoginClick={handleLoginClick}
      onSignupClick={handleSignupClick}
      onCopilotClick={handleCopilotClick}
    />
  );
}

export default App;
