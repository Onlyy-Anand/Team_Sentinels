export interface EmotionAnalysis {
  primaryEmotion: string;
  intensity: number;
  detectedEmotions: Record<string, number>;
  context: string;
}

export interface PsychologyAssessment {
  identified_concerns: string[];
  suggested_questions: string[];
  data_gaps: string[];
  preliminary_observations: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  emotion?: EmotionAnalysis;
  psychologyAssessment?: PsychologyAssessment;
}

export interface Conversation {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
