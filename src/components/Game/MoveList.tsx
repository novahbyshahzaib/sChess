import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';

export const MoveList: React.FC = () => {
  const { moveHistory, reviewIndex, setReviewIndex } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && reviewIndex === null) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory, reviewIndex]);

  // Group moves into pairs [whiteMove, blackMove]
  const pairs: string[][] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    pairs.push([moveHistory[i], moveHistory[i + 1]]);
  }

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto max-h-[150px] md:max-h-full bg-panel/50 rounded-lg p-2 font-mono text-sm border border-border"
    >
      {pairs.length === 0 && (
        <div className="text-text-secondary text-center italic mt-2">No moves yet</div>
      )}
      <table className="w-full text-left">
        <tbody>
          {pairs.map((pair, rowIndex) => {
            const whiteIndex = rowIndex * 2;
            const blackIndex = whiteIndex + 1;
            
            return (
              <tr key={rowIndex} className="border-b border-border/50 last:border-0 hover:bg-white/5">
                <td className="py-1 px-2 text-text-secondary w-8 select-none">{rowIndex + 1}.</td>
                
                {/* White Move */}
                <td className="py-1 px-2">
                  <button
                    onClick={() => setReviewIndex(whiteIndex)}
                    className={`px-2 py-0.5 rounded transition-colors ${reviewIndex === whiteIndex || (reviewIndex === null && whiteIndex === moveHistory.length - 1) ? 'bg-accent text-background font-bold' : 'text-text-primary hover:bg-white/10'}`}
                  >
                    {pair[0]}
                  </button>
                </td>
                
                {/* Black Move */}
                <td className="py-1 px-2">
                  {pair[1] && (
                    <button
                      onClick={() => setReviewIndex(blackIndex)}
                      className={`px-2 py-0.5 rounded transition-colors ${reviewIndex === blackIndex || (reviewIndex === null && blackIndex === moveHistory.length - 1) ? 'bg-accent text-background font-bold' : 'text-text-primary hover:bg-white/10'}`}
                    >
                      {pair[1]}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
