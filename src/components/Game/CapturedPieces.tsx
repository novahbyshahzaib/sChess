import React from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { themes } from '../../themes/themes';

interface CapturedPiecesProps {
  pieces: string[]; // array of piece chars like 'p', 'n', 'b', 'r', 'q'
  color: 'w' | 'b';
  advantage: number; // e.g. +3. If 0, don't show
}

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ pieces, color, advantage }) => {
  const { themeId } = useSettingsStore();
  const theme = themes.find(t => t.id === themeId) || themes[0];
  
  // Sort order: Q, R, B, N, P
  const order: Record<string, number> = { 'q': 1, 'r': 2, 'b': 3, 'n': 4, 'p': 5 };
  
  const sortedPieces = [...pieces].sort((a, b) => {
    return (order[a.toLowerCase()] || 99) - (order[b.toLowerCase()] || 99);
  });

  if (pieces.length === 0 && advantage <= 0) {
    return <div className="h-6"></div>; // Placeholder to maintain height
  }

  return (
    <div className="flex items-center gap-1 h-6">
      <div className="flex -space-x-1.5">
        {sortedPieces.map((p, i) => (
          <img 
            key={i} 
            src={`/pieces/${theme.pieceSet}/${color}${p.toUpperCase()}.svg`} 
            alt={p} 
            className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
          />
        ))}
      </div>
      {advantage > 0 && (
        <span className="text-xs font-bold text-text-secondary ml-1">+{advantage}</span>
      )}
    </div>
  );
};
