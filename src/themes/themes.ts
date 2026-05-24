export interface ChessTheme {
  id: string;
  name: string;
  pieceSet: string;        // folder under /public/pieces/
  lightSquare: string;     // CSS color
  darkSquare: string;
  boardBackground: string;
  appBackground: string;
  accentColor: string;
  selectedSquare: string;
  legalMoveDot: string;
  lastMoveHighlight: string;
  checkHighlight: string;
  textPrimary: string;
  textSecondary: string;
  panelBackground: string;
  buttonBackground: string;
  borderColor: string;
}

export const themes: ChessTheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    pieceSet: 'classic',           // cburnett pieces
    lightSquare: '#F0D9B5',
    darkSquare: '#B58863',
    boardBackground: '#8B6340',
    appBackground: '#1a1a2e',
    accentColor: '#F6A429',
    selectedSquare: 'rgba(246,164,41,0.75)',
    legalMoveDot: 'rgba(0,0,0,0.22)',
    lastMoveHighlight: 'rgba(246,164,41,0.38)',
    checkHighlight: 'rgba(220,50,50,0.65)',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0B0',
    panelBackground: '#16213e',
    buttonBackground: '#0f3460',
    borderColor: 'rgba(255,255,255,0.07)',
  },
  {
    id: 'neo',
    name: 'Neo Dark',
    pieceSet: 'neo',               // spatial pieces
    lightSquare: '#dee3e6',
    darkSquare: '#8ca2ad',
    boardBackground: '#2c3e50',
    appBackground: '#0d1117',
    accentColor: '#58a6ff',
    selectedSquare: 'rgba(88,166,255,0.62)',
    legalMoveDot: 'rgba(255,255,255,0.28)',
    lastMoveHighlight: 'rgba(88,166,255,0.32)',
    checkHighlight: 'rgba(220,50,50,0.65)',
    textPrimary: '#e6edf3',
    textSecondary: '#8b949e',
    panelBackground: '#161b22',
    buttonBackground: '#21262d',
    borderColor: 'rgba(255,255,255,0.07)',
  },
  {
    id: 'gothic',
    name: 'Gothic',
    pieceSet: 'gothic',            // gothic pieces
    lightSquare: '#c8b89a',
    darkSquare: '#4a3728',
    boardBackground: '#2d1f14',
    appBackground: '#0a0a0a',
    accentColor: '#c0392b',
    selectedSquare: 'rgba(192,57,43,0.62)',
    legalMoveDot: 'rgba(255,100,100,0.4)',
    lastMoveHighlight: 'rgba(192,57,43,0.32)',
    checkHighlight: 'rgba(255,80,80,0.7)',
    textPrimary: '#e8dcc8',
    textSecondary: '#9b8a7a',
    panelBackground: '#111111',
    buttonBackground: '#1a1a1a',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  {
    id: 'neon',
    name: 'Neon',
    pieceSet: 'alpha',             // alpha (outlined) pieces look best on dark squares
    lightSquare: '#1a1a2e',
    darkSquare: '#16213e',
    boardBackground: '#0f3460',
    appBackground: '#000000',
    accentColor: '#00ff88',
    selectedSquare: 'rgba(0,255,136,0.38)',
    legalMoveDot: 'rgba(0,255,136,0.55)',
    lastMoveHighlight: 'rgba(0,255,136,0.18)',
    checkHighlight: 'rgba(255,50,50,0.6)',
    textPrimary: '#00ff88',
    textSecondary: '#00aa55',
    panelBackground: '#0a0a0a',
    buttonBackground: '#0f0f0f',
    borderColor: 'rgba(0,255,136,0.12)',
  },
  {
    id: 'forest',
    name: 'Forest',
    pieceSet: 'fantasy',           // fantasy illustrated pieces
    lightSquare: '#d4e8c2',
    darkSquare: '#3d6b3d',
    boardBackground: '#2d5a2d',
    appBackground: '#1a2f1a',
    accentColor: '#7bc67e',
    selectedSquare: 'rgba(123,198,126,0.62)',
    legalMoveDot: 'rgba(255,255,255,0.28)',
    lastMoveHighlight: 'rgba(123,198,126,0.38)',
    checkHighlight: 'rgba(220,50,50,0.65)',
    textPrimary: '#e8f5e9',
    textSecondary: '#a5d6a7',
    panelBackground: '#1e3a1e',
    buttonBackground: '#264d26',
    borderColor: 'rgba(255,255,255,0.07)',
  },
  {
    id: 'marble',
    name: 'Marble',
    pieceSet: 'pirouetti',         // pirouetti minimalist pieces
    lightSquare: '#f5f0eb',
    darkSquare: '#8a7968',
    boardBackground: '#6b5d50',
    appBackground: '#2a2520',
    accentColor: '#d4af37',
    selectedSquare: 'rgba(212,175,55,0.62)',
    legalMoveDot: 'rgba(212,175,55,0.52)',
    lastMoveHighlight: 'rgba(212,175,55,0.28)',
    checkHighlight: 'rgba(220,50,50,0.65)',
    textPrimary: '#f5f0eb',
    textSecondary: '#c4b9aa',
    panelBackground: '#332d28',
    buttonBackground: '#3d3530',
    borderColor: 'rgba(255,255,255,0.06)',
  },
];

export const defaultTheme = themes[0];
