import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useChessGame } from '../../hooks/useChessGame';
import { useStockfish } from '../../hooks/useStockfish';
import { useLLMOpponent } from '../../hooks/useLLMOpponent';
import { useSound } from '../../hooks/useSound';
import { Board } from '../Board/Board';
import { PlayerBar } from './PlayerBar';
import { MoveList } from './MoveList';
import { GameControls } from './GameControls';
import { LLMChatBox } from './LLMChatBox';
import { GameOver } from '../Menus/GameOver';

export const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  const { 
    gameMode, aiLevel, playerColor, turn, moveHistory, 
    capturedByWhite, capturedByBlack, isCheckmate, isStalemate, isDraw,
    reviewIndex, setReviewIndex, setGameStatus
  } = useGameStore();
  
  const { alwaysFlipForPlayer } = useSettingsStore();
  
  const { chess, makeMove, undoMove, getLegalMoves, getPseudoLegalMoves, syncFromHistory } = useChessGame();
  const { isReady: sfReady, isThinking: aiThinking, getBestMove } = useStockfish();
  const { isThinking: llmThinking, getBestMove: getLLMMove } = useLLMOpponent();
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

  const lastAITurnRef = useRef<number>(-1);

  // AI Move Logic
  useEffect(() => {
    if ((gameMode !== 'vsAI' && gameMode !== 'vsLLM' && gameMode !== 'vsAIAI' && gameMode !== 'vsLLMLLM') || reviewIndex !== null) return;
    
    // If it's the AI's turn
    const isAITurn = gameMode === 'vsAIAI' || gameMode === 'vsLLMLLM' || 
      (gameMode === 'vsAI' && ((playerColor === 'w' && turn === 'b') || (playerColor === 'b' && turn === 'w'))) ||
      (gameMode === 'vsLLM' && ((playerColor === 'w' && turn === 'b') || (playerColor === 'b' && turn === 'w')));

    if (isAITurn) {
      if (lastAITurnRef.current === moveHistory.length) return;
      lastAITurnRef.current = moveHistory.length;

      if (!isCheckmate && !isStalemate && !isDraw) {
        // AI should move
        const fen = chess.fen();
        
        // Small delay so it feels natural
        const timer = setTimeout(() => {
          if (gameMode === 'vsLLM' || gameMode === 'vsLLMLLM') {
            getLLMMove(fen, turn, moveHistory).then(moveStr => {
              if (moveStr) {
                // LLM outputs SAN string directly (e.g. "e4")
                const success = makeMove(moveStr);
                if (success) {
                  const isCapture = chess.history({verbose:true}).slice(-1)[0]?.captured;
                  if (chess.isCheck()) sound.playCheck();
                  else if (isCapture) sound.playCapture();
                  else sound.playMove(true);
                }
              }
            });
          } else if (sfReady) { // Stockfish handles vsAI and vsAIAI
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
  }, [turn, gameMode, playerColor, isCheckmate, isStalemate, isDraw, reviewIndex, sfReady, chess, aiLevel, getBestMove, getLLMMove, moveHistory, makeMove, sound]);

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
      const isPlayerTurn = gameMode === 'vsFriend' || ((gameMode === 'vsAI' || gameMode === 'vsLLM') && turn === (playerColor === 'w' ? 'b' : 'w')); 
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
  const prevReviewIndex = useRef<number | null>(reviewIndex);
  useEffect(() => {
    // Only rebuild the chess board if reviewIndex actually changed (or transitioned to/from null)
    if (reviewIndex === prevReviewIndex.current) return;
    prevReviewIndex.current = reviewIndex;

    syncFromHistory(moveHistory, reviewIndex);
  }, [reviewIndex, moveHistory, syncFromHistory]);

  const handleCustomMakeMove = (from: string, to: string) => {
    const success = makeMove(from, to);
    return success;
  };

  const handleHint = async () => {
    if (sfReady && !aiThinking && !llmThinking) {
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
    if (gameMode === 'vsAI' || gameMode === 'vsLLM') {
      undoMove(); // Undo AI
      undoMove(); // Undo Player
    } else if (gameMode === 'vsAIAI' || gameMode === 'vsLLMLLM') {
      undoMove(); // Just undo 1 for AI vs AI, or maybe we don't want them to undo, but let's allow 1
    } else {
      undoMove();
    }
    historyLenRef.current = moveHistory.length;
    lastAITurnRef.current = -1;
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
  const topPlayerIsBlack = playerColor === 'w' || gameMode === 'vsFriend' || gameMode === 'vsAIAI' || gameMode === 'vsLLMLLM';
  
  const botElo = getEloLabel(aiLevel);
  const botName = (gameMode === 'vsLLM' || gameMode === 'vsLLMLLM') ? 'LLM Opponent' : (aiLevel === 20 ? 'Maximum AI' : 'sChess Bot');

  const isAIGame = gameMode === 'vsAI' || gameMode === 'vsLLM' || gameMode === 'vsAIAI' || gameMode === 'vsLLMLLM';

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
        <div className="w-full md:max-w-[400px] lg:max-w-[450px] flex-shrink-0 mx-auto flex flex-col">
          
          {/* Top Player Bar */}
          <PlayerBar 
            name={isAIGame && topPlayerIsBlack ? botName : (topPlayerIsBlack ? 'Black Player' : 'White Player')}
            isAI={isAIGame && topPlayerIsBlack}
            elo={isAIGame && topPlayerIsBlack && gameMode !== 'vsLLM' ? botElo : undefined}
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
            {/* Hint Arrow Overlay */}
            {hintArrow && (
              <div className="absolute inset-0 pointer-events-none z-30">
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
            name={(gameMode === 'vsAIAI' || gameMode === 'vsLLMLLM') ? botName : (isAIGame && !topPlayerIsBlack ? botName : 'You')}
            isAI={(gameMode === 'vsAIAI' || gameMode === 'vsLLMLLM') || (isAIGame && !topPlayerIsBlack)}
            elo={((gameMode === 'vsAIAI' || gameMode === 'vsLLMLLM') || (isAIGame && !topPlayerIsBlack)) && gameMode !== 'vsLLM' && gameMode !== 'vsLLMLLM' ? botElo : undefined}
            isActive={turn === (!topPlayerIsBlack ? 'b' : 'w')}
            capturedPieces={!topPlayerIsBlack ? capturedByBlack : capturedByWhite}
            capturedColor={!topPlayerIsBlack ? 'w' : 'b'}
            materialAdvantage={!topPlayerIsBlack ? blackAdvantage : whiteAdvantage}
          />

        </div>

        {/* Right Column - Controls & History */}
        <div className="flex-1 flex flex-col min-w-[260px] max-w-sm mx-auto md:mx-0 w-full mb-6 md:mb-0 gap-4 h-full">
          {gameMode === 'vsLLM' ? (
            <div className="flex flex-col h-[600px] gap-4">
              <div className="flex-1 min-h-[250px]">
                <LLMChatBox />
              </div>
              <div className="flex-[0.6] min-h-[150px]">
                <MoveList />
              </div>
            </div>
          ) : (
            <MoveList />
          )}
          
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
