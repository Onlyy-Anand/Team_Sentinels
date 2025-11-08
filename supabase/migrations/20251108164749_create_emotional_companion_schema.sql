/*
  # Emotional Companion Database Schema

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `role` (text, 'user' or 'assistant')
      - `content` (text)
      - `created_at` (timestamp)
    
    - `emotional_states`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `message_id` (uuid, references messages)
      - `emotion` (text)
      - `intensity` (numeric)
      - `detected_emotions` (jsonb)
      - `created_at` (timestamp)
    
    - `user_psychology_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `profile_data` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `login_activity`
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `email` (text)
      - `device_info` (jsonb)
      - `ip_address` (text)
      - `login_source` (text)
      - `successful` (boolean)
      - `error_message` (text)
      - `login_timestamp` (timestamp)
      - `logout_timestamp` (timestamp)
      - `session_duration_minutes` (integer)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for login activity tracking
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Create emotional_states table
CREATE TABLE IF NOT EXISTS emotional_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  emotion text NOT NULL,
  intensity numeric NOT NULL CHECK (intensity >= 0 AND intensity <= 1),
  detected_emotions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE emotional_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view emotional states in own conversations"
  ON emotional_states FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = emotional_states.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create emotional states in own conversations"
  ON emotional_states FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = emotional_states.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Create user_psychology_profiles table
CREATE TABLE IF NOT EXISTS user_psychology_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  profile_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE user_psychology_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own psychology profile"
  ON user_psychology_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own psychology profile"
  ON user_psychology_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own psychology profile"
  ON user_psychology_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create login_activity table
CREATE TABLE IF NOT EXISTS login_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  email text NOT NULL,
  device_info jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  login_source text NOT NULL CHECK (login_source IN ('signup', 'signin')),
  successful boolean DEFAULT true NOT NULL,
  error_message text,
  login_timestamp timestamptz DEFAULT now() NOT NULL,
  logout_timestamp timestamptz,
  session_duration_minutes integer
);

ALTER TABLE login_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own login activity"
  ON login_activity FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Anyone can insert login activity"
  ON login_activity FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update own login activity"
  ON login_activity FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_emotional_states_conversation_id ON emotional_states(conversation_id);
CREATE INDEX IF NOT EXISTS idx_emotional_states_message_id ON emotional_states(message_id);
CREATE INDEX IF NOT EXISTS idx_login_activity_user_id ON login_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_login_activity_timestamp ON login_activity(login_timestamp DESC);