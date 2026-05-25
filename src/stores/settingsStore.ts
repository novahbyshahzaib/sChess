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
  llmProvider: 'gemini' | 'openrouter';
  llmApiKey: string;
  llmModelId: string;
  setTheme: (id: string) => void;
  toggleSetting: (key: keyof SettingsState) => void;
  setSoundVolume: (v: number) => void;
  setLLMSettings: (provider: 'gemini' | 'openrouter', apiKey: string, modelId: string) => void;
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
      llmProvider: 'gemini',
      llmApiKey: '',
      llmModelId: 'gemini-1.5-flash',
      setTheme: (id) => set({ themeId: id }),
      toggleSetting: (key) => set((state) => ({ [key]: !state[key as keyof typeof state] })),
      setSoundVolume: (v) => set({ soundVolume: v }),
      setLLMSettings: (provider, apiKey, modelId) => set({ llmProvider: provider, llmApiKey: apiKey, llmModelId: modelId }),
    }),
    {
      name: 'schess-settings',
    }
  )
);
