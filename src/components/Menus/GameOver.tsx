import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Home, Eye } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

interface GameOverProps {
  onRematch: () => void;
  onReview: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ onRematch, onReview }) => {
  const navigate = useNavigate();
  const { isCheckmate, isStalemate, isDraw, turn, gameMode, playerColor } = useGameStore();

  let title = "Game Over";
  let subtitle = "";
  let icon = "♔";

  if (isCheckmate) {
    const winner = turn === 'w' ? 'Black' : 'White';
    if (gameMode === 'vsAI') {
      const playerWon = (turn === 'b' && playerColor === 'w') || (turn === 'w' && playerColor === 'b');
      title = playerWon ? "You Win! 🎉" : "sChess Bot Wins";
    } else {
      title = `${winner} Wins!`;
    }
    subtitle = "by Checkmate";
    icon = turn === 'w' ? '♚' : '♔'; // Show winner's king
  } else if (isStalemate) {
    title = "Draw";
    subtitle = "by Stalemate";
    icon = "½";
  } else if (isDraw) {
    title = "Draw";
    subtitle = "by Repetition / Insufficient Material";
    icon = "½";
  } else {
    // Resignation or Abort
    const winner = turn === 'w' ? 'Black' : 'White';
    if (gameMode === 'vsAI') {
      const playerWon = (turn === 'b' && playerColor === 'w') || (turn === 'w' && playerColor === 'b');
      title = playerWon ? "You Win!" : "sChess Bot Wins";
    } else {
      title = `${winner} Wins!`;
    }
    subtitle = "by Resignation";
    icon = turn === 'w' ? '♚' : '♔';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-panel border border-border rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        
        <div className="text-8xl mb-4 text-accent drop-shadow-[0_0_15px_var(--accent-30)]">
          {icon}
        </div>
        
        <h2 className="text-3xl font-bold font-cinzel text-text-primary mb-2">{title}</h2>
        <p className="text-text-secondary mb-8">{subtitle}</p>

        <div className="w-full space-y-3">
          <button 
            onClick={onRematch}
            className="w-full py-3 bg-accent text-background rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_4px_15px_var(--accent-30)]"
          >
            <RotateCcw size={20} />
            Rematch
          </button>
          
          <button 
            onClick={onReview}
            className="w-full py-3 bg-transparent border border-border text-text-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
          >
            <Eye size={20} />
            Review Game
          </button>

          <button 
            onClick={() => navigate('/')}
            className="w-full py-3 bg-transparent border border-border text-text-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
          >
            <Home size={20} />
            Home
          </button>
        </div>
      </div>
    </div>
  );
};
