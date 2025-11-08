/*
  # Create Login Activity Tracking System

  1. New Tables
    - `login_activity`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text) - snapshot of user email at login time
      - `device_info` (jsonb) - device user agent, screen size, browser
      - `ip_address` (text) - user's IP address (sanitized)
      - `login_timestamp` (timestamptz) - when the login occurred
      - `logout_timestamp` (timestamptz) - when the user logged out (nullable)
      - `session_duration_minutes` (integer) - calculated session length
      - `login_source` (text) - 'signup' or 'signin'
      - `successful` (boolean) - whether login was successful
      - `error_message` (text) - error details if login failed (nullable)
      - `created_at` (timestamptz)

  2. Indexes
    - user_id for filtering by user
    - email for finding all logins by email
    - login_timestamp for time-based queries

  3. Security
    - Enable RLS on login_activity table
    - Policies to allow users to view their own login history
    - Admin viewing restricted (optional future enhancement)

  4. Purpose
    - Track all login attempts across all devices
    - Identify patterns in user access
    - Support cross-device session management
    - Provide security audit trail
*/

CREATE TABLE IF NOT EXISTS login_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  device_info jsonb DEFAULT '{}',
  ip_address text,
  login_timestamp timestamptz DEFAULT now() NOT NULL,
  logout_timestamp timestamptz,
  session_duration_minutes integer,
  login_source text NOT NULL CHECK (login_source IN ('signup', 'signin')),
  successful boolean NOT NULL DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE login_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own login activity"
  ON login_activity FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can record their own login activity"
  ON login_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own login activity"
  ON login_activity FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_login_activity_user_id ON login_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_login_activity_email ON login_activity(email);
CREATE INDEX IF NOT EXISTS idx_login_activity_timestamp ON login_activity(login_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_login_activity_user_timestamp ON login_activity(user_id, login_timestamp DESC);