import React, { useState } from 'react';
import { Menu, Flag, Lightbulb, Undo2, X } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';

interface GameControlsProps {
  onHint: () => void;
  onUndo: () => void;
  onResign: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({ onHint, onUndo, onResign }) => {
  const { gameMode, moveHistory } = useGameStore();
  const { allowUndoVsAI } = useSettingsStore();
  const [showMenu, setShowMenu] = useState(false);
  
  const canUndo = gameMode === 'vsFriend' || (gameMode === 'vsAI' && allowUndoVsAI);
  const isEarlyGame = moveHistory.length < 2;

  return (
    <>
      <div className="flex items-center justify-between bg-panel p-2 rounded-xl border border-border mt-auto">
        <button 
          onClick={() => setShowMenu(true)}
          className="p-3 rounded-lg text-text-primary hover:bg-white/5 transition-colors flex flex-col items-center gap-1"
        >
          <Menu size={20} />
          <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Options</span>
        </button>

        <button 
          onClick={onResign}
          className="p-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors flex flex-col items-center gap-1"
        >
          <Flag size={20} />
          <span className="text-[10px] uppercase font-bold tracking-wider">{isEarlyGame ? 'Abort' : 'Resign'}</span>
        </button>

        <button 
          onClick={onHint}
          disabled={gameMode !== 'vsAI'}
          className={`p-3 rounded-lg transition-colors flex flex-col items-center gap-1 ${gameMode === 'vsAI' ? 'text-accent hover:bg-accent/10' : 'text-text-secondary opacity-50 cursor-not-allowed'}`}
        >
          <Lightbulb size={20} />
          <span className="text-[10px] uppercase font-bold tracking-wider">Hint</span>
        </button>

        <button 
          onClick={onUndo}
          disabled={!canUndo || moveHistory.length === 0}
          className={`p-3 rounded-lg transition-colors flex flex-col items-center gap-1 ${canUndo && moveHistory.length > 0 ? 'text-text-primary hover:bg-white/5' : 'text-text-secondary opacity-50 cursor-not-allowed'}`}
        >
          <Undo2 size={20} />
          <span className="text-[10px] uppercase font-bold tracking-wider">Undo</span>
        </button>
      </div>

      {/* Options Menu Modal */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-panel border border-border rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-cinzel text-text-primary">Options</h3>
              <button onClick={() => setShowMenu(false)} className="text-text-secondary hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  useGameStore.getState().flipBoard();
                  setShowMenu(false);
                }}
                className="w-full py-3 bg-transparent border border-border text-text-primary rounded-lg font-bold hover:bg-white/5 transition-colors"
              >
                Flip Board
              </button>
              
              <button 
                onClick={() => {
                  // Implement draw offer logic
                  setShowMenu(false);
                }}
                className="w-full py-3 bg-transparent border border-border text-text-primary rounded-lg font-bold hover:bg-white/5 transition-colors"
              >
                Offer Draw
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
