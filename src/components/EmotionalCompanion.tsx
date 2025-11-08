import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, LogOut, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Message, EmotionAnalysis } from '../types/emotion';
import { ChatMessage } from './ChatMessage';

interface EmotionalCompanionProps {
  onBackClick?: () => void;
}

export function EmotionalCompanion({ onBackClick }: EmotionalCompanionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeConversation();
  }, []);

  const initializeConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('No authenticated user');
        return;
      }

      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({ user_id: user.id })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (conversation) {
        setConversationId(conversation.id);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string, emotion?: EmotionAnalysis) => {
    if (!conversationId) return;

    try {
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role,
          content,
        })
        .select()
        .maybeSingle();

      if (messageError) throw messageError;

      if (emotion && messageData) {
        await supabase.from('emotional_states').insert({
          conversation_id: conversationId,
          message_id: messageData.id,
          emotion: emotion.primaryEmotion,
          intensity: emotion.intensity,
          detected_emotions: emotion.detectedEmotions,
        });
      }

      return messageData;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const getEmotionalHistory = async (): Promise<EmotionAnalysis[]> => {
    if (!conversationId) return [];

    try {
      const { data, error } = await supabase
        .from('emotional_states')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data.map(state => ({
        primaryEmotion: state.emotion,
        intensity: state.intensity,
        detectedEmotions: state.detected_emotions as Record<string, number>,
        context: 'historical',
      }));
    } catch (error) {
      console.error('Error fetching emotional history:', error);
      return [];
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    const tempUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const emotionalHistory = await getEmotionalHistory();
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data: { user } } = await supabase.auth.getUser();
      let userProfile = null;

      if (user) {
        const { data: profile } = await supabase
          .from('user_psychology_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        userProfile = profile;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/emotional-companion`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
          emotionalHistory,
          userProfile,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const result = await response.json();

      const userMsgWithEmotion: Message = {
        ...tempUserMsg,
        emotion: result.emotionAnalysis,
      };

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        created_at: new Date().toISOString(),
        psychologyAssessment: result.psychologyAssessment,
      };

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = userMsgWithEmotion;
        return [...updated, assistantMsg];
      });

      await saveMessage('user', userMessage, result.emotionAnalysis);
      await saveMessage('assistant', result.response);
    } catch (error) {
      console.error('Error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-gradient-to-r from-purple-900/60 to-pink-900/40 border-b border-purple-500/20 px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBackClick && (
              <button
                onClick={onBackClick}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-95"
                title="Back to home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Emotional Companion
              </h1>
              <p className="text-sm text-white/80 mt-1">
                A safe space to share your feelings and receive supportive guidance
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 border border-white/30 hover:border-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 active:scale-95"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg shadow-purple-500/20">
                <span className="text-3xl">💜</span>
              </div>
              <h2 className="text-xl font-medium text-white mb-2">
                Welcome to Your Emotional Companion
              </h2>
              <p className="text-white/80 max-w-md mx-auto">
                Share how you're feeling, and I'll listen with empathy and understanding.
                I'm here to support you through whatever you're experiencing.
              </p>
            </div>
          )}

          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/20 px-4 py-3 rounded-2xl rounded-tl-sm shadow-lg border border-purple-500/20">
                <p className="text-sm text-white/80">Thinking...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-900/60 to-pink-900/40 border-t border-purple-500/20 px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="flex-1 resize-none rounded-xl border border-white/30 bg-white/5 text-white placeholder-white/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent min-h-[60px] max-h-[200px] transition-all duration-300"
              rows={1}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="group flex-shrink-0 relative px-6 py-3 rounded-xl font-medium overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-100 group-disabled:opacity-50"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative text-white flex items-center justify-center">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </span>
            </button>
          </div>
          <p className="text-xs text-white/50 mt-2 text-center">
            This is a supportive companion, not a replacement for professional mental health care
          </p>
        </div>
      </div>
    </div>
  );
}
