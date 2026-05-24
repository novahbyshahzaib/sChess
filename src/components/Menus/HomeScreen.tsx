import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Users, Puzzle, Settings, Play } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { fen, gameMode } = useGameStore();

  const isGameActive = gameMode !== null && fen !== 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex flex-wrap gap-12 p-8 justify-between">
        {['♟', '♞', '♜', '♝', '♛', '♚', '♙', '♘', '♖', '♗', '♕', '♔'].map((piece, i) => (
          <div 
            key={i} 
            className="text-8xl select-none"
            style={{
              animation: `float ${10 + (i % 5)}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          >
            {piece}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      <div className="z-10 text-center mb-16">
        <h1 className="text-6xl md:text-8xl font-bold font-cinzel tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-text-primary to-text-secondary drop-shadow-[0_0_15px_var(--accent-30)]">
          sChess
        </h1>
        <p className="mt-4 text-text-secondary text-lg md:text-xl tracking-wide uppercase">
          The Royal Game
        </p>
      </div>

      <div className="z-10 w-full max-w-4xl px-4 flex flex-col gap-6">
        {isGameActive && (
          <button 
            onClick={() => navigate('/game')}
            className="w-full md:w-auto mx-auto px-8 py-4 bg-accent hover:bg-opacity-90 text-background rounded-xl font-bold text-xl flex items-center justify-center gap-3 transition-transform hover:-translate-y-1"
            style={{ boxShadow: '0 4px 20px var(--accent-30)' }}
          >
            <Play size={24} />
            Resume Game
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
          <button
            onClick={() => navigate('/play-ai')}
            className="flex flex-col items-center justify-center p-8 bg-panel border border-border rounded-xl transition-all hover:-translate-y-1 hover:border-accent hover:shadow-[0_0_20px_var(--accent-30)] group"
          >
            <Cpu size={48} className="text-accent mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold text-text-primary">Play vs AI</h2>
            <p className="text-text-secondary mt-2">Challenge the Machine</p>
          </button>

          <button
            onClick={() => {
              useGameStore.getState().startGame('vsFriend');
              navigate('/game');
            }}
            className="flex flex-col items-center justify-center p-8 bg-panel border border-border rounded-xl transition-all hover:-translate-y-1 hover:border-accent hover:shadow-[0_0_20px_var(--accent-30)] group"
          >
            <Users size={48} className="text-accent mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold text-text-primary">Play vs Friend</h2>
            <p className="text-text-secondary mt-2">Pass & Play</p>
          </button>

          <button
            disabled
            className="flex flex-col items-center justify-center p-8 bg-panel border border-border rounded-xl opacity-60 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 bg-accent/20 text-accent text-xs font-bold px-2 py-1 rounded">
              Coming Soon
            </div>
            <Puzzle size={48} className="text-text-secondary mb-4" />
            <h2 className="text-2xl font-bold text-text-primary">Puzzles</h2>
            <p className="text-text-secondary mt-2">Train Your Tactics</p>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center justify-center p-8 bg-panel border border-border rounded-xl transition-all hover:-translate-y-1 hover:border-accent hover:shadow-[0_0_20px_var(--accent-30)] group"
          >
            <Settings size={48} className="text-accent mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold text-text-primary">Settings</h2>
            <p className="text-text-secondary mt-2">Customize sChess</p>
          </button>
        </div>
      </div>
    </div>
  );
};
