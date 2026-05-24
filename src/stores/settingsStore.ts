import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  themeId: string;                  // default: 'classic'
  showLegalMoves: boolean;          // default: true
  showCoordinates: boolean;         // default: true
  autoPromoteQueen: boolean;        // default: true
  animateMoves: boolean;            // default: true
  allowUndoVsAI: boolean;           // default: false
  soundEnabled: boolean;            // default: true
  soundVolume: number;              // default: 80
  captureSound: boolean;            // default: true
  alwaysFlipForPlayer: boolean;     // default: false
  setTheme: (id: string) => void;
  toggleSetting: (key: keyof SettingsState) => void;
  setSoundVolume: (v: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeId: 'classic',
      showLegalMoves: true,
      showCoordinates: true,
      autoPromoteQueen: true,
      animateMoves: true,
      allowUndoVsAI: false,
      soundEnabled: true,
      soundVolume: 80,
      captureSound: true,
      alwaysFlipForPlayer: false,
      setTheme: (id) => set({ themeId: id }),
      toggleSetting: (key) => set((state) => ({ [key]: !state[key as keyof typeof state] })),
      setSoundVolume: (v) => set({ soundVolume: v }),
    }),
    {
      name: 'schess-settings',
    }
  )
);
