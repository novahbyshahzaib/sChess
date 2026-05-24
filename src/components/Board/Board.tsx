import React from 'react';
import { Chess } from 'chess.js';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Square } from './Square';
import { Piece } from './Piece';
import { themes } from '../../themes/themes';

interface BoardProps {
  chess: Chess;
  makeMove: (from: string, to: string) => boolean;
  getLegalMoves: (square: string) => string[];
}

export const Board: React.FC<BoardProps> = ({ chess, makeMove, getLegalMoves }) => {
  const { 
    isBoardFlipped, 
    selectedSquare, 
    legalMoves, 
    lastMove, 
    isCheck, 
    turn,
    selectSquare,
    setLegalMoves
  } = useGameStore();
  
  const { themeId, showCoordinates, showLegalMoves } = useSettingsStore();
  const theme = themes.find(t => t.id === themeId) || themes[0];

  const board = chess.board();
  
  const handleSquareClick = (squareStr: string) => {
    // If a square is already selected, try to move
    if (selectedSquare) {
      if (legalMoves.includes(squareStr)) {
        const success = makeMove(selectedSquare, squareStr);
        if (success) {
          selectSquare(null);
          setLegalMoves([]);
          return;
        }
      }
      
      // If clicking on own piece, select it instead
      const piece = chess.get(squareStr as any);
      if (piece && piece.color === turn) {
        selectSquare(squareStr);
        setLegalMoves(getLegalMoves(squareStr));
      } else {
        // Deselect
        selectSquare(null);
        setLegalMoves([]);
      }
    } else {
      // Nothing selected, try to select
      const piece = chess.get(squareStr as any);
      if (piece && piece.color === turn) {
        selectSquare(squareStr);
        setLegalMoves(getLegalMoves(squareStr));
      }
    }
  };

  const getSquareStr = (rIndex: number, fIndex: number) => {
    const file = String.fromCharCode(97 + fIndex);
    const rank = 8 - rIndex;
    return `${file}${rank}`;
  };

  const renderSquares = () => {
    const squares = [];
    const ranks = isBoardFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const files = isBoardFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    for (let r of ranks) {
      for (let f of files) {
        const sq = getSquareStr(r, f);
        const piece = board[r][f];
        const isLight = (r + f) % 2 === 0;
        
        const isSelected = selectedSquare === sq;
        const isLastMove = lastMove?.from === sq || lastMove?.to === sq;
        const hasLegalMoveDot = showLegalMoves && legalMoves.includes(sq);
        const isInCheck = isCheck && piece?.type === 'k' && piece?.color === turn;
        
        const showFileLabel = showCoordinates && r === (isBoardFlipped ? 0 : 7);
        const showRankLabel = showCoordinates && f === (isBoardFlipped ? 7 : 0);

        squares.push(
          <div key={sq} className="relative w-full h-full">
            <Square
              square={sq}
              isLight={isLight}
              isSelected={isSelected}
              isLastMove={isLastMove}
              isInCheck={isInCheck}
              hasLegalMoveDot={hasLegalMoveDot}
              isOccupied={!!piece}
              onClick={() => handleSquareClick(sq)}
            >
              {piece && (
                <Piece type={piece.type} color={piece.color} theme={theme.pieceSet} />
              )}
            </Square>
            
            {showRankLabel && (
              <div className={`absolute top-1 left-1 text-[10px] sm:text-xs font-semibold ${isLight ? 'text-[var(--dark-sq)]' : 'text-[var(--light-sq)]'} select-none pointer-events-none`}>
                {8 - r}
              </div>
            )}
            {showFileLabel && (
              <div className={`absolute bottom-0.5 right-1.5 text-[10px] sm:text-xs font-semibold ${isLight ? 'text-[var(--dark-sq)]' : 'text-[var(--light-sq)]'} select-none pointer-events-none`}>
                {String.fromCharCode(97 + f)}
              </div>
            )}
          </div>
        );
      }
    }
    return squares;
  };

  return (
    <div 
      className="w-full aspect-square grid grid-cols-8 grid-rows-8 shadow-2xl rounded-sm overflow-hidden"
      style={{ backgroundColor: 'var(--board-bg)' }}
    >
      {renderSquares()}
    </div>
  );
};
