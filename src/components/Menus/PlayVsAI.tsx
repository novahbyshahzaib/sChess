import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Dna } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

export const PlayVsAI: React.FC = () => {
  const navigate = useNavigate();
  const startGame = useGameStore((state) => state.startGame);
  
  const [level, setLevel] = useState(10);
  const [color, setColor] = useState<'w' | 'b' | 'random'>('random');

  const handlePlay = () => {
    const finalColor = color === 'random' ? (Math.random() > 0.5 ? 'w' : 'b') : color;
    startGame('vsAI', level, finalColor);
    navigate('/game');
  };

  const getBotProfile = (l: number) => {
    if (l <= 5) return { title: 'Rookie', elo: 400 + l * 80, color: '#4ade80' };
    if (l <= 10) return { title: 'Club Player', elo: 900 + (l - 5) * 100, color: '#60a5fa' };
    if (l <= 15) return { title: 'Expert', elo: 1500 + (l - 10) * 100, color: '#c084fc' };
    if (l <= 19) return { title: 'Master', elo: 2000 + (l - 15) * 160, color: '#fbbf24' };
    return { title: 'Maximum', elo: 3200, color: '#ef4444' };
  };

  const profile = getBotProfile(level);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-panel rounded-2xl border border-border shadow-2xl p-6">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/5 rounded-full transition-colors mr-4">
            <ArrowLeft className="text-text-primary" />
          </button>
          <h1 className="text-2xl font-bold font-cinzel text-text-primary">Choose Your Opponent</h1>
        </div>

        {/* Bot Profile Card */}
        <div className="bg-background/50 rounded-xl p-6 flex flex-col items-center mb-8 border border-border">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors"
            style={{ backgroundColor: `${profile.color}20`, color: profile.color, border: `2px solid ${profile.color}` }}
          >
            <Dna size={40} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">{profile.title}</h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-text-secondary text-sm">Est. Rating:</span>
            <span 
              className="px-3 py-1 rounded-full text-sm font-bold bg-opacity-20 border"
              style={{ backgroundColor: `${profile.color}15`, color: profile.color, borderColor: `${profile.color}40` }}
            >
              {level === 20 ? 'MAX 3200' : profile.elo}
            </span>
          </div>
        </div>

        {/* Difficulty Slider */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm text-text-secondary">
            <span>Level 1</span>
            <span>Level 20</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={level} 
            onChange={(e) => setLevel(parseInt(e.target.value))}
            className="w-full accent-accent"
          />
        </div>

        {/* Color Selection */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">Play As</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setColor('w')}
              className={`flex-1 py-3 rounded-lg border font-bold transition-colors ${color === 'w' ? 'bg-white text-black border-white' : 'bg-transparent text-text-primary border-border hover:border-text-secondary'}`}
            >
              White
            </button>
            <button 
              onClick={() => setColor('random')}
              className={`flex-1 py-3 rounded-lg border font-bold transition-colors ${color === 'random' ? 'bg-accent text-background border-accent' : 'bg-transparent text-text-primary border-border hover:border-text-secondary'}`}
            >
              Random
            </button>
            <button 
              onClick={() => setColor('b')}
              className={`flex-1 py-3 rounded-lg border font-bold transition-colors ${color === 'b' ? 'bg-[#1a1a1a] text-white border-white/30' : 'bg-transparent text-text-primary border-border hover:border-text-secondary'}`}
            >
              Black
            </button>
          </div>
        </div>

        <button 
          onClick={handlePlay}
          className="w-full py-4 rounded-xl bg-accent text-background font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{ boxShadow: '0 4px 20px var(--accent-30)' }}
        >
          <Play fill="currentColor" />
          Play Match
        </button>
      </div>
    </div>
  );
};
