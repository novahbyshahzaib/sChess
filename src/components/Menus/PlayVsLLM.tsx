import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, AlertTriangle } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';

export const PlayVsLLM: React.FC = () => {
  const navigate = useNavigate();
  const startGame = useGameStore((state) => state.startGame);
  const { llmApiKey, llmProvider } = useSettingsStore();

  const handleStart = (color: 'w' | 'b') => {
    startGame('vsLLM', undefined, color);
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-panel border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
        
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-3xl font-bold font-cinzel text-center text-text-primary mb-8 mt-2">
          Play vs LLM
        </h1>

        {!llmApiKey ? (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex flex-col items-center text-center gap-3">
            <AlertTriangle className="text-red-400" size={32} />
            <div>
              <h3 className="font-bold text-red-200">Missing API Key</h3>
              <p className="text-sm text-red-300/80 mt-1">You need to set up your {llmProvider === 'gemini' ? 'Gemini' : 'OpenRouter'} API key in settings before you can play.</p>
            </div>
            <button 
              onClick={() => navigate('/settings')}
              className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-100 rounded-lg transition-colors text-sm font-bold"
            >
              Go to Settings
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-4 text-center">Choose Your Color</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleStart('w')}
                  className="flex flex-col items-center p-4 bg-white hover:bg-gray-200 text-black rounded-xl transition-transform hover:-translate-y-1 shadow-lg"
                >
                  <span className="text-4xl mb-2">♔</span>
                  <span className="font-bold">Play White</span>
                </button>
                <button
                  onClick={() => handleStart('b')}
                  className="flex flex-col items-center p-4 bg-gray-900 border border-gray-700 hover:bg-black text-white rounded-xl transition-transform hover:-translate-y-1 shadow-lg"
                >
                  <span className="text-4xl mb-2">♚</span>
                  <span className="font-bold">Play Black</span>
                </button>
              </div>
            </div>
            
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => handleStart(Math.random() > 0.5 ? 'w' : 'b')}
                className="px-6 py-3 bg-panel border border-border hover:border-accent text-text-primary rounded-xl flex items-center gap-2 transition-all hover:text-accent"
              >
                <Play size={20} />
                Random Color
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
