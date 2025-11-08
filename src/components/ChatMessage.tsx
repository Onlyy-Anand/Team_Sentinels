import { User, Bot, AlertCircle, HelpCircle, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import type { Message } from '../types/emotion';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [showAssessment, setShowAssessment] = useState(false);

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-500' : 'bg-emerald-500'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      <div className={`flex-1 max-w-2xl ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        <div className={`px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-500 text-white rounded-tr-sm'
            : 'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.psychologyAssessment && !isUser && (
          <div className="w-full max-w-2xl">
            <button
              onClick={() => setShowAssessment(!showAssessment)}
              className="flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-1"
            >
              <ClipboardList className="w-4 h-4" />
              {showAssessment ? 'Hide' : 'Show'} Psychological Analysis
            </button>

            {showAssessment && (
              <div className="mt-2 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg p-3 border border-emerald-200 space-y-3">
                {message.psychologyAssessment.identified_concerns.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-semibold text-gray-700">Identified Areas of Concern</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {message.psychologyAssessment.identified_concerns.map((concern, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-emerald-200 text-emerald-900 px-2 py-1 rounded capitalize"
                        >
                          {concern}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {message.psychologyAssessment.data_gaps.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-semibold text-gray-700">Information to Share</h4>
                    </div>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {message.psychologyAssessment.data_gaps.map((gap, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {message.psychologyAssessment.preliminary_observations && (
                  <div className="pt-2 border-t border-emerald-200">
                    <p className="text-xs text-gray-700 italic">
                      <span className="font-semibold">Observations: </span>
                      {message.psychologyAssessment.preliminary_observations}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
