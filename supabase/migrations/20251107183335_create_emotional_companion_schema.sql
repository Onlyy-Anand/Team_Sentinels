/*
  # Emotional Companion Schema

  ## Overview
  Complete database schema for the Emotional Companion application with authentication,
  conversation tracking, emotion analysis, and user psychology profiling.

  ## New Tables

  ### `conversations`
  - `id` (uuid, primary key) - Unique conversation identifier
  - `user_id` (uuid, foreign key to auth.users) - User who owns the conversation
  - `created_at` (timestamptz) - When conversation started
  - `updated_at` (timestamptz) - Last message timestamp

  ### `messages`
  - `id` (uuid, primary key) - Unique message identifier
  - `conversation_id` (uuid, foreign key) - Parent conversation
  - `role` (text) - Either 'user' or 'assistant'
  - `content` (text) - Message content
  - `created_at` (timestamptz) - Message timestamp

  ### `emotional_states`
  - `id` (uuid, primary key) - Unique state identifier
  - `conversation_id` (uuid, foreign key) - Parent conversation
  - `message_id` (uuid, foreign key) - Associated message
  - `emotion` (text) - Primary detected emotion
  - `intensity` (decimal) - Emotion intensity (0-1)
  - `detected_emotions` (jsonb) - All detected emotions with scores
  - `created_at` (timestamptz) - Analysis timestamp

  ### `user_psychology_profiles`
  - `id` (uuid, primary key) - Unique profile identifier
  - `user_id` (uuid, foreign key to auth.users) - User's profile
  - `age` (integer) - User's age
  - `medical_history` (text) - Medical background
  - `trauma_history` (text) - Trauma background
  - `current_medications` (text) - Current medications
  - `therapy_history` (text) - Past therapy
  - `created_at` (timestamptz) - Profile creation
  - `updated_at` (timestamptz) - Last profile update

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Authenticated users required for all operations
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can update messages in own conversations"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in own conversations"
  ON messages FOR DELETE
  TO authenticated
  USING (
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
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  emotion text NOT NULL,
  intensity decimal(3,2) NOT NULL CHECK (intensity >= 0 AND intensity <= 1),
  detected_emotions jsonb DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE emotional_states ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can update emotional states in own conversations"
  ON emotional_states FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = emotional_states.conversation_id
      AND conversations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = emotional_states.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete emotional states in own conversations"
  ON emotional_states FOR DELETE
  TO authenticated
  USING (
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
  age integer CHECK (age > 0 AND age < 150),
  medical_history text,
  trauma_history text,
  current_medications text,
  therapy_history text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE user_psychology_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own psychology profile"
  ON user_psychology_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own psychology profile"
  ON user_psychology_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own psychology profile"
  ON user_psychology_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own psychology profile"
  ON user_psychology_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_emotional_states_conversation_id ON emotional_states(conversation_id);
CREATE INDEX IF NOT EXISTS idx_emotional_states_message_id ON emotional_states(message_id);
CREATE INDEX IF NOT EXISTS idx_user_psychology_profiles_user_id ON user_psychology_profiles(user_id);
