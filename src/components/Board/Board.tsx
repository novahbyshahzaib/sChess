import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useSound } from '../../hooks/useSound';
import { Square } from './Square';
import { Piece } from './Piece';
import { themes } from '../../themes/themes';

interface BoardProps {
  chess: Chess;
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  getLegalMoves: (square: string) => string[];
  getPseudoLegalMoves: (square: string) => string[];
}

export const Board: React.FC<BoardProps> = ({ chess, makeMove, getLegalMoves, getPseudoLegalMoves }) => {
  const { 
    isBoardFlipped, 
    selectedSquare, 
    legalMoves, 
    pseudoLegalMoves,
    lastMove, 
    isCheck, 
    turn,
    gameMode,
    selectSquare,
    clearSelection,
    setLegalMoves,
    setPseudoLegalMoves
  } = useGameStore();
  
  const { themeId, showCoordinates, showLegalMoves, autoPromoteQueen } = useSettingsStore();
  const theme = themes.find(t => t.id === themeId) || themes[0];
  const sound = useSound();

  const board = chess.board();
  
  const [flashSquare, setFlashSquare] = useState<string | null>(null);
  const [promotionMove, setPromotionMove] = useState<{from: string, to: string} | null>(null);

  const handleInvalidMove = (square: string) => {
    sound.playIllegal();
    setFlashSquare(square);
    setTimeout(() => setFlashSquare(null), 400);
  };

  const requiresPromotion = (from: string, to: string): boolean => {
    const piece = chess.get(from as any);
    if (piece?.type !== 'p') return false;
    const targetRank = to[1];
    return (piece.color === 'w' && targetRank === '8') || 
           (piece.color === 'b' && targetRank === '1');
  };
  
  const handleSquareClick = (squareStr: string) => {
    // If not player's turn or game hasn't started, don't allow selecting
    if (gameMode === null) return;
    
    // Case 1: No piece selected yet
    if (!selectedSquare) {
      const piece = chess.get(squareStr as any);
      if (!piece || piece.color !== turn) return; // Not our piece
      
      const legal = getLegalMoves(squareStr);
      const pseudo = getPseudoLegalMoves(squareStr);
      
      selectSquare(squareStr);
      setLegalMoves(legal);
      setPseudoLegalMoves(pseudo);
      return;
    }

    // Case 2: Same square clicked — deselect
    if (squareStr === selectedSquare) {
      clearSelection();
      return;
    }

    // Case 3: Another friendly piece clicked — switch selection
    const clickedPiece = chess.get(squareStr as any);
    if (clickedPiece && clickedPiece.color === turn) {
      const legal = getLegalMoves(squareStr);
      const pseudo = getPseudoLegalMoves(squareStr);
      selectSquare(squareStr);
      setLegalMoves(legal);
      setPseudoLegalMoves(pseudo);
      return;
    }

    // Case 4: Attempting a move
    if (legalMoves.includes(squareStr)) {
      if (requiresPromotion(selectedSquare, squareStr)) {
        if (autoPromoteQueen) {
          executeMove(selectedSquare, squareStr, 'q');
        } else {
          setPromotionMove({ from: selectedSquare, to: squareStr });
        }
      } else {
        executeMove(selectedSquare, squareStr);
      }
    } else {
      // Illegal move
      handleInvalidMove(selectedSquare);
      clearSelection();
    }
  };

  const executeMove = (from: string, to: string, promotion?: string) => {
    const success = makeMove(from, to, promotion);
    if (success) {
      clearSelection();
    } else {
      handleInvalidMove(from);
      clearSelection();
    }
    setPromotionMove(null);
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
        const isPseudoLegal = showLegalMoves && selectedSquare !== null && pseudoLegalMoves.includes(sq) && !legalMoves.includes(sq);
        const isFlashIllegal = flashSquare === sq;
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
              isPseudoLegal={isPseudoLegal}
              isFlashIllegal={isFlashIllegal}
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
    <div className="relative w-full aspect-square">
      <div 
        className="w-full h-full grid grid-cols-8 grid-rows-8 shadow-2xl rounded-sm overflow-hidden"
        style={{ backgroundColor: 'var(--board-bg)' }}
      >
        {renderSquares()}
      </div>
      
      {promotionMove && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 rounded-sm backdrop-blur-sm">
          <div className="bg-panel p-6 rounded-lg shadow-xl border border-border flex flex-col items-center gap-4">
            <h3 className="text-xl font-cinzel text-text-primary font-bold">Promote to</h3>
            <div className="flex gap-4">
              {['q', 'r', 'b', 'n'].map(p => (
                <button 
                  key={p}
                  onClick={() => executeMove(promotionMove.from, promotionMove.to, p)}
                  className="w-16 h-16 bg-white/5 hover:bg-white/15 rounded-md p-2 transition-colors"
                >
                  <img src={`/pieces/${theme.pieceSet}/${turn}${p.toUpperCase()}.svg`} alt={p} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
            <button 
              onClick={() => { setPromotionMove(null); clearSelection(); }}
              className="mt-2 text-sm text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
