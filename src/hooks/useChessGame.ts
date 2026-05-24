import { useState, useEffect, useCallback } from 'react';
import { Chess, Move } from 'chess.js';
import { useGameStore } from '../stores/gameStore';

export function useChessGame() {
  const [chess] = useState(new Chess());
  const { setGameStatus, reviewIndex } = useGameStore();

  const updateGameState = useCallback(() => {
    const history = chess.history({ verbose: true }) as Move[];
    
    // Calculate captured pieces
    const capturedWhite: string[] = [];
    const capturedBlack: string[] = [];
    
    history.forEach((move) => {
      if (move.captured) {
        if (move.color === 'w') {
          // White captured a black piece
          capturedWhite.push(move.captured);
        } else {
          // Black captured a white piece
          capturedBlack.push(move.captured);
        }
      }
    });

    const lastMove = history.length > 0 ? history[history.length - 1] : null;

    setGameStatus({
      fen: chess.fen(),
      turn: chess.turn(),
      capturedByWhite: capturedWhite,
      capturedByBlack: capturedBlack,
      isCheck: chess.isCheck(),
      isCheckmate: chess.isCheckmate(),
      isStalemate: chess.isStalemate(),
      isDraw: chess.isDraw(),
      lastMove: lastMove ? { from: lastMove.from, to: lastMove.to } : null,
      legalMoves: [], // Reset legal moves on state update
      pseudoLegalMoves: [],
      selectedSquare: null,
    });
  }, [chess, setGameStatus]);

  // Handle resetting or starting a new game
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state, prevState) => {
      // If we go from an active game back to null (reset), reset the board
      if (state.gameMode === null && prevState.gameMode !== null) {
        chess.reset();
        updateGameState();
      }
    });
    return unsubscribe;
  }, [chess, updateGameState]);

  const makeMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (reviewIndex !== null) return false; // Cannot move in review mode

    try {
      const move = chess.move({
        from,
        to,
        promotion: promotion || 'q',
      });

      if (move) {
        setGameStatus({ moveHistory: chess.history() });
        updateGameState();
        return true;
      }
    } catch (e) {
      // Invalid move
      return false;
    }
    return false;
  }, [chess, reviewIndex, updateGameState, setGameStatus]);

  const undoMove = useCallback(() => {
    chess.undo();
    setGameStatus({ moveHistory: chess.history() });
    updateGameState();
  }, [chess, updateGameState, setGameStatus]);

  const getLegalMoves = useCallback((square: string): string[] => {
    if (reviewIndex !== null) return []; // No legal moves in review mode
    
    const moves = chess.moves({ square: square as any, verbose: true }) as Move[];
    return moves.map(m => m.to);
  }, [chess, reviewIndex]);

  const getPseudoLegalMoves = useCallback((square: string): string[] => {
    if (reviewIndex !== null) return [];
    const piece = chess.get(square as any);
    if (!piece) return [];
    
    const tempChess = new Chess(chess.fen());
    const board = tempChess.board();
    let kingSquare = '';
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.type === 'k' && board[r][c]?.color === piece.color) {
          kingSquare = `${String.fromCharCode(97 + c)}${8 - r}`;
        }
      }
    }
    
    if (kingSquare) tempChess.remove(kingSquare as any);
    const pseudoMoves = tempChess.moves({ square: square as any, verbose: true }) as Move[];
    return pseudoMoves.map(m => m.to);
  }, [chess, reviewIndex]);
  
  const loadPosition = useCallback((fen: string) => {
    try {
      chess.load(fen);
      updateGameState();
    } catch (e) {
      console.error("Invalid FEN", e);
    }
  }, [chess, updateGameState]);

  return {
    chess,
    makeMove,
    undoMove,
    getLegalMoves,
    getPseudoLegalMoves,
    updateGameState,
    loadPosition
  };
}
