/*
  # Login Activity Tracking Schema

  ## Overview
  Tracks user login/logout activity with device information and session duration.

  ## New Tables

  ### `login_activity`
  - `id` (uuid, primary key) - Unique activity record identifier
  - `user_id` (text) - User identifier (can be email prefix for failed logins)
  - `email` (text) - User's email address
  - `device_info` (jsonb) - Device information (user agent, screen size, platform, etc.)
  - `ip_address` (text) - User's IP address
  - `login_source` (text) - Either 'signup' or 'signin'
  - `successful` (boolean) - Whether login was successful
  - `error_message` (text) - Error message if login failed
  - `login_timestamp` (timestamptz) - When user logged in
  - `logout_timestamp` (timestamptz) - When user logged out
  - `session_duration_minutes` (integer) - Session duration in minutes

  ## Security
  - RLS enabled on login_activity table
  - Users can only view their own login activity
  - Users can insert their own login records
  - System can update logout information
*/

-- Create login_activity table
CREATE TABLE IF NOT EXISTS login_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  email text NOT NULL,
  device_info jsonb DEFAULT '{}' NOT NULL,
  ip_address text,
  login_source text NOT NULL CHECK (login_source IN ('signup', 'signin')),
  successful boolean DEFAULT true NOT NULL,
  error_message text,
  login_timestamp timestamptz DEFAULT now() NOT NULL,
  logout_timestamp timestamptz,
  session_duration_minutes integer
);

ALTER TABLE login_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own login activity"
  ON login_activity FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anonymous users can insert login attempts"
  ON login_activity FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can view own login activity"
  ON login_activity FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text OR email = auth.jwt()->>'email');

CREATE POLICY "Users can update own login activity"
  ON login_activity FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text OR email = auth.jwt()->>'email')
  WITH CHECK (user_id = auth.uid()::text OR email = auth.jwt()->>'email');

CREATE POLICY "Users can delete own login activity"
  ON login_activity FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text OR email = auth.jwt()->>'email');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_activity_user_id ON login_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_login_activity_email ON login_activity(email);
CREATE INDEX IF NOT EXISTS idx_login_activity_timestamp ON login_activity(login_timestamp DESC);
