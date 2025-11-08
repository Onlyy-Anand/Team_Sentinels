import { Heart, Frown, Smile, AlertCircle, Cloud, Sparkles, HelpCircle, Users } from 'lucide-react';
import type { EmotionAnalysis } from '../types/emotion';

interface EmotionIndicatorProps {
  emotion: EmotionAnalysis;
}

const emotionConfig = {
  anger: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-50', label: 'Anger' },
  sadness: { icon: Frown, color: 'text-blue-500', bgColor: 'bg-blue-50', label: 'Sadness' },
  anxiety: { icon: Cloud, color: 'text-orange-500', bgColor: 'bg-orange-50', label: 'Anxiety' },
  joy: { icon: Smile, color: 'text-green-500', bgColor: 'bg-green-50', label: 'Joy' },
  guilt: { icon: Heart, color: 'text-gray-500', bgColor: 'bg-gray-50', label: 'Guilt' },
  optimism: { icon: Sparkles, color: 'text-teal-500', bgColor: 'bg-teal-50', label: 'Optimism' },
  confusion: { icon: HelpCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-50', label: 'Confusion' },
  loneliness: { icon: Users, color: 'text-slate-500', bgColor: 'bg-slate-50', label: 'Loneliness' },
  neutral: { icon: Heart, color: 'text-gray-400', bgColor: 'bg-gray-50', label: 'Neutral' },
};

export function EmotionIndicator({ emotion }: EmotionIndicatorProps) {
  const config = emotionConfig[emotion.primaryEmotion as keyof typeof emotionConfig] || emotionConfig.neutral;
  const Icon = config.icon;
  const intensityPercentage = Math.round(emotion.intensity * 100);

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${config.bgColor}`}>
      <Icon className={`w-5 h-5 ${config.color}`} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
          <span className={`text-xs font-semibold ${config.color}`}>{intensityPercentage}%</span>
        </div>
        <div className="w-full bg-white rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${config.color.replace('text', 'bg')}`}
            style={{ width: `${intensityPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
