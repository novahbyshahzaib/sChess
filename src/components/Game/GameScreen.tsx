import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useChessGame } from '../../hooks/useChessGame';
import { useStockfish } from '../../hooks/useStockfish';
import { useSound } from '../../hooks/useSound';
import { Board } from '../Board/Board';
import { PlayerBar } from './PlayerBar';
import { MoveList } from './MoveList';
import { GameControls } from './GameControls';
import { GameOver } from '../Menus/GameOver';

export const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  const { 
    gameMode, aiLevel, playerColor, turn, moveHistory, 
    capturedByWhite, capturedByBlack, isCheckmate, isStalemate, isDraw,
    reviewIndex, setReviewIndex, setGameStatus
  } = useGameStore();
  
  const { alwaysFlipForPlayer } = useSettingsStore();
  
  const { chess, makeMove, undoMove, getLegalMoves, getPseudoLegalMoves, loadPosition } = useChessGame();
  const { isReady: sfReady, isThinking: aiThinking, getBestMove } = useStockfish();
  const sound = useSound();

  const [showGameOver, setShowGameOver] = useState(false);
  const [hintArrow, setHintArrow] = useState<{from: string, to: string} | null>(null);

  // Material calculation
  const materialScores: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const calcMaterial = (pieces: string[]) => pieces.reduce((sum, p) => sum + (materialScores[p.toLowerCase()] || 0), 0);
  
  const whiteCapturedValue = calcMaterial(capturedByWhite); // Pieces white has taken from black
  const blackCapturedValue = calcMaterial(capturedByBlack); // Pieces black has taken from white
  
  const whiteAdvantage = Math.max(0, whiteCapturedValue - blackCapturedValue);
  const blackAdvantage = Math.max(0, blackCapturedValue - whiteCapturedValue);

  // AI Move Logic
  useEffect(() => {
    if (gameMode !== 'vsAI' || reviewIndex !== null) return;
    
    // If it's the AI's turn
    if ((playerColor === 'w' && turn === 'b') || (playerColor === 'b' && turn === 'w')) {
      if (!isCheckmate && !isStalemate && !isDraw) {
        // AI should move
        const fen = chess.fen();
        
        // Small delay so it feels natural
        const timer = setTimeout(() => {
          if (sfReady) {
            getBestMove(fen, aiLevel).then(moveStr => {
              // moveStr is like "e2e4" or "e7e8q"
              const from = moveStr.substring(0, 2);
              const to = moveStr.substring(2, 4);
              const promotion = moveStr.length > 4 ? moveStr[4] : undefined;
              
              const success = makeMove(from, to, promotion);
              if (success) {
                // Play sound
                const isCapture = chess.history({verbose:true}).slice(-1)[0]?.captured;
                if (chess.isCheck()) sound.playCheck();
                else if (isCapture) sound.playCapture();
                else sound.playMove(true);
              }
            });
          }
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [turn, gameMode, playerColor, isCheckmate, isStalemate, isDraw, reviewIndex, sfReady, chess, aiLevel, getBestMove, makeMove, sound]);

  // Handle Game Over
  useEffect(() => {
    if ((isCheckmate || isStalemate || isDraw) && reviewIndex === null) {
      sound.playGameEnd();
      setShowGameOver(true);
    }
  }, [isCheckmate, isStalemate, isDraw, reviewIndex, sound]);

  // Handle Board Flip on player change
  useEffect(() => {
    if (alwaysFlipForPlayer && gameMode === 'vsFriend') {
      setGameStatus({ isBoardFlipped: turn === 'b' });
    }
  }, [turn, gameMode, alwaysFlipForPlayer, setGameStatus]);

  // Handle sound for local player moves
  // We use a ref to track history length to detect new moves
  const historyLenRef = useRef(moveHistory.length);
  useEffect(() => {
    if (moveHistory.length > historyLenRef.current) {
      // A move was made.
      historyLenRef.current = moveHistory.length;
      
      // Determine if it was player or AI
      const isPlayerTurn = gameMode === 'vsFriend' || (gameMode === 'vsAI' && turn === (playerColor === 'w' ? 'b' : 'w')); 
      // Note: turn has already updated! So if player is W, and turn is now B, player just moved.
      
      if (isPlayerTurn) {
         // Local move sound
         const hist = chess.history({verbose:true});
         const lastMove = hist[hist.length - 1];
         if (lastMove) {
           if (chess.isCheck()) sound.playCheck();
           else if (lastMove.captured) sound.playCapture();
           else sound.playMove(false);
         }
      }
      
      // Clear hint on move
      setHintArrow(null);
    }
  }, [moveHistory, turn, gameMode, playerColor, chess, sound]);

  // Review mode logic
  useEffect(() => {
    if (reviewIndex !== null) {
      // Replay moves up to reviewIndex
      const tempChess = new (Chess as any)();
      const hist = moveHistory.slice(0, reviewIndex + 1);
      for (const m of hist) {
        tempChess.move(m);
      }
      loadPosition(tempChess.fen());
    } else {
      // Return to live
      const tempChess = new (Chess as any)();
      for (const m of moveHistory) {
        tempChess.move(m);
      }
      loadPosition(tempChess.fen());
    }
  }, [reviewIndex, moveHistory, loadPosition]);

  const handleCustomMakeMove = (from: string, to: string) => {
    const success = makeMove(from, to);
    return success;
  };

  const handleHint = async () => {
    if (sfReady && !aiThinking) {
      const moveStr = await getBestMove(chess.fen(), aiLevel);
      if (moveStr) {
        const from = moveStr.substring(0, 2);
        const to = moveStr.substring(2, 4);
        setHintArrow({ from, to });
        setTimeout(() => setHintArrow(null), 3000);
      }
    }
  };

  const handleUndo = () => {
    if (gameMode === 'vsAI') {
      undoMove(); // Undo AI
      undoMove(); // Undo Player
    } else {
      undoMove();
    }
    historyLenRef.current = moveHistory.length;
  };

  const handleResign = () => {
    if (moveHistory.length < 2) {
      // Abort
      navigate('/');
    } else {
      // Resign
      if (confirm('Are you sure you want to resign?')) {
        setGameStatus({ isCheckmate: false, isDraw: false, isStalemate: false });
        setShowGameOver(true);
      }
    }
  };

  const handleReviewNav = (offset: number | 'start' | 'end') => {
    if (offset === 'start') {
      setReviewIndex(0);
    } else if (offset === 'end') {
      setReviewIndex(null);
    } else {
      let current = reviewIndex === null ? moveHistory.length - 1 : reviewIndex;
      let next = current + (offset as number);
      if (next < 0) next = 0;
      if (next >= moveHistory.length - 1) {
        setReviewIndex(null);
      } else {
        setReviewIndex(next);
      }
    }
  };

  const getEloLabel = (level: number) => {
    if (level <= 5) return 400 + level * 80;
    if (level <= 10) return 900 + (level - 5) * 100;
    if (level <= 15) return 1500 + (level - 10) * 100;
    if (level <= 19) return 2000 + (level - 15) * 160;
    return 3200;
  };

  // Determine opponent and player bars
  const topPlayerIsBlack = playerColor === 'w' || gameMode === 'vsFriend';
  
  const botElo = getEloLabel(aiLevel);
  const botName = aiLevel === 20 ? 'Maximum AI' : 'sChess Bot';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full bg-panel border-b border-border h-14 flex items-center px-4 shrink-0 z-10">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 mr-2 rounded-full hover:bg-white/5">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="font-cinzel font-bold text-xl text-text-primary tracking-widest mx-auto -ml-8">
          sChess
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-5xl flex-1 flex flex-col md:flex-row p-2 md:p-6 gap-6 relative">
        
        {/* Left Column - Board */}
        <div className="w-full md:w-[500px] lg:w-[600px] flex-shrink-0 mx-auto flex flex-col">
          
          {/* Top Player Bar */}
          <PlayerBar 
            name={gameMode === 'vsAI' && topPlayerIsBlack ? botName : (topPlayerIsBlack ? 'Black Player' : 'White Player')}
            isAI={gameMode === 'vsAI' && topPlayerIsBlack}
            elo={gameMode === 'vsAI' && topPlayerIsBlack ? botElo : undefined}
            isActive={turn === (topPlayerIsBlack ? 'b' : 'w')}
            capturedPieces={topPlayerIsBlack ? capturedByBlack : capturedByWhite}
            capturedColor={topPlayerIsBlack ? 'w' : 'b'}
            materialAdvantage={topPlayerIsBlack ? blackAdvantage : whiteAdvantage}
          />
          
          <div className="relative">
            <Board 
              chess={chess}
              makeMove={handleCustomMakeMove}
              getLegalMoves={getLegalMoves}
              getPseudoLegalMoves={getPseudoLegalMoves}
            />
            {/* Hint Arrow Overlay (Simplified: just highlighting squares could work, or an SVG line) */}
            {hintArrow && (
              <div className="absolute inset-0 pointer-events-none z-30">
                {/* For a real SVG arrow, calculate coordinates based on squares. Since coordinates depend on board flip, a simple highlight is easier */}
                {/* Not fully implemented exact arrow coordinates here to save space, but could be added */}
              </div>
            )}
            
            {/* Review mode nav overlay */}
            {reviewIndex !== null && (
              <div className="absolute top-2 right-2 bg-background/80 backdrop-blur rounded-lg p-1 flex gap-1 z-40 border border-border">
                <button onClick={() => handleReviewNav('start')} className="p-1 hover:bg-white/10 rounded"><ChevronsLeft size={16}/></button>
                <button onClick={() => handleReviewNav(-1)} className="p-1 hover:bg-white/10 rounded"><ChevronLeft size={16}/></button>
                <button onClick={() => handleReviewNav(1)} className="p-1 hover:bg-white/10 rounded"><ChevronRight size={16}/></button>
                <button onClick={() => handleReviewNav('end')} className="p-1 hover:bg-white/10 rounded"><ChevronsRight size={16}/></button>
              </div>
            )}
          </div>

          {/* Bottom Player Bar */}
          <PlayerBar 
            name={gameMode === 'vsAI' && !topPlayerIsBlack ? botName : 'You'}
            isAI={gameMode === 'vsAI' && !topPlayerIsBlack}
            elo={gameMode === 'vsAI' && !topPlayerIsBlack ? botElo : undefined}
            isActive={turn === (!topPlayerIsBlack ? 'b' : 'w')}
            capturedPieces={!topPlayerIsBlack ? capturedByBlack : capturedByWhite}
            capturedColor={!topPlayerIsBlack ? 'w' : 'b'}
            materialAdvantage={!topPlayerIsBlack ? blackAdvantage : whiteAdvantage}
          />

        </div>

        {/* Right Column - Controls & History */}
        <div className="flex-1 flex flex-col min-w-[260px] max-w-sm mx-auto md:mx-0 w-full mb-6 md:mb-0 gap-4">
          <MoveList />
          <GameControls 
            onHint={handleHint}
            onUndo={handleUndo}
            onResign={handleResign}
          />
        </div>
      </div>

      {showGameOver && (
        <GameOver 
          onRematch={() => {
            setShowGameOver(false);
            useGameStore.getState().startGame(gameMode!, aiLevel, playerColor);
          }}
          onReview={() => {
            setShowGameOver(false);
            setReviewIndex(moveHistory.length - 1);
          }}
        />
      )}
    </div>
  );
};
