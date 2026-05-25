import { create } from 'zustand';

interface GameState {
  fen: string;
  turn: 'w' | 'b';
  moveHistory: string[];         // algebraic notation array
  capturedByWhite: string[];     // piece chars
  capturedByBlack: string[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  selectedSquare: string | null; // e.g. "e2"
  legalMoves: string[];          // destination squares
  pseudoLegalMoves: string[];    // pinned piece paths
  lastMove: { from: string; to: string } | null;
  gameMode: 'vsAI' | 'vsFriend' | 'vsLLM' | 'vsAIAI' | 'vsLLMLLM' | null;
  aiLevel: number;               // 1–20
  playerColor: 'w' | 'b';
  isBoardFlipped: boolean;
  isAIThinking: boolean;
  reviewIndex: number | null;    // null = live game, number = review mode position
  llmChatHistory: { role: 'user' | 'assistant'; text: string }[];
  
  // actions
  startGame: (mode: 'vsAI' | 'vsFriend' | 'vsLLM' | 'vsAIAI' | 'vsLLMLLM', aiLevel?: number, playerColor?: 'w' | 'b') => void;
  setGameStatus: (status: Partial<GameState>) => void;
  selectSquare: (square: string | null) => void;
  clearSelection: () => void;
  setLegalMoves: (moves: string[]) => void;
  setPseudoLegalMoves: (moves: string[]) => void;
  flipBoard: () => void;
  setReviewIndex: (i: number | null) => void;
  addLLMChatMessage: (msg: { role: 'user' | 'assistant'; text: string }) => void;
  clearLLMChat: () => void;
  resetGame: () => void;
}

const initialGameState = {
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  turn: 'w' as const,
  moveHistory: [],
  capturedByWhite: [],
  capturedByBlack: [],
  isCheck: false,
  isCheckmate: false,
  isStalemate: false,
  isDraw: false,
  selectedSquare: null,
  legalMoves: [],
  pseudoLegalMoves: [],
  lastMove: null,
  gameMode: null,
  aiLevel: 10,
  playerColor: 'w' as const,
  isBoardFlipped: false,
  isAIThinking: false,
  reviewIndex: null,
  llmChatHistory: [],
};

export const useGameStore = create<GameState>((set) => ({
  ...initialGameState,
  
  startGame: (mode, aiLevel = 10, playerColor = 'w') => set({
    ...initialGameState,
    gameMode: mode,
    aiLevel,
    playerColor,
    isBoardFlipped: playerColor === 'b',
    llmChatHistory: [],
  }),
  
  setGameStatus: (status) => set((state) => ({ ...state, ...status })),
  
  selectSquare: (square) => set({ selectedSquare: square }),
  
  clearSelection: () => set({ selectedSquare: null, legalMoves: [], pseudoLegalMoves: [] }),
  
  setLegalMoves: (moves) => set({ legalMoves: moves }),
  
  setPseudoLegalMoves: (moves) => set({ pseudoLegalMoves: moves }),
  
  flipBoard: () => set((state) => ({ isBoardFlipped: !state.isBoardFlipped })),
  
  setReviewIndex: (i) => set({ reviewIndex: i }),

  addLLMChatMessage: (msg) => set((state) => ({ llmChatHistory: [...state.llmChatHistory, msg] })),

  clearLLMChat: () => set({ llmChatHistory: [] }),
  
  resetGame: () => set(initialGameState),
}));
