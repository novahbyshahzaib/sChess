import React, { useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

export const LLMChatBox: React.FC = () => {
  const { llmChatHistory, isAIThinking } = useGameStore();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [llmChatHistory, isAIThinking]);

  return (
    <div className="flex flex-col bg-panel border border-border rounded-xl h-full max-h-[400px] overflow-hidden">
      <div className="bg-accent/10 border-b border-border p-3 flex items-center gap-2">
        <Bot size={20} className="text-accent" />
        <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider">AI Opponent</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {llmChatHistory.length === 0 && (
          <div className="text-center text-text-secondary text-sm italic mt-4">
            The AI is ready to play. Make your move!
          </div>
        )}
        
        {llmChatHistory.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-accent/20 text-accent' : 'bg-white/10 text-text-primary'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`rounded-xl p-3 text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-accent text-background rounded-tr-none' : 'bg-white/5 text-text-secondary rounded-tl-none border border-border'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isAIThinking && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/10 text-text-primary">
              <Bot size={16} />
            </div>
            <div className="rounded-xl p-3 text-sm bg-white/5 text-text-secondary rounded-tl-none border border-border flex items-center gap-2">
              <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};
