import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';

export function useStockfish() {
  const [isReady, setIsReady] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const setGameStatus = useGameStore((state) => state.setGameStatus);
  const isAIThinking = useGameStore((state) => state.isAIThinking);

  useEffect(() => {
    try {
      // Assuming stockfish is available in public directory or bundled
      // chess.js instructions said `npm install stockfish`
      // For web use, it is usually a worker
      workerRef.current = new Worker('/stockfish/stockfish-18-lite-single.js');
      
      workerRef.current.onmessage = (e) => {
        const msg = e.data;
        if (msg === 'uciok') {
          setIsReady(true);
        }
      };

      workerRef.current.postMessage('uci');
    } catch (error) {
      console.error('Failed to load Stockfish worker', error);
      // Fallback or error handling
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const getBestMove = useCallback((fen: string, skillLevel: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject('Stockfish not initialized');
        return;
      }

      setGameStatus({ isAIThinking: true });

      const handleMessage = (e: MessageEvent) => {
        const msg = e.data as string;
        if (msg.startsWith('bestmove')) {
          workerRef.current?.removeEventListener('message', handleMessage);
          setGameStatus({ isAIThinking: false });
          
          const parts = msg.split(' ');
          const move = parts[1]; // "e2e4"
          resolve(move);
        }
      };

      workerRef.current.addEventListener('message', handleMessage);

      // Skill Level: 0 to 20
      workerRef.current.postMessage(`setoption name Skill Level value ${skillLevel}`);
      workerRef.current.postMessage(`position fen ${fen}`);
      workerRef.current.postMessage('go depth 10'); // Basic depth limit to ensure fast responses
    });
  }, [setGameStatus]);

  return {
    isReady,
    isThinking: isAIThinking,
    getBestMove
  };
}
