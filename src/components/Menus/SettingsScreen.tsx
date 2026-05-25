import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { themes } from '../../themes/themes';

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const settings = useSettingsStore();

  const handleToggle = (key: keyof typeof settings) => {
    settings.toggleSetting(key as any);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center mb-8 sticky top-0 bg-background/90 backdrop-blur py-4 z-10">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/5 rounded-full transition-colors mr-4">
            <ArrowLeft />
          </button>
          <h1 className="text-3xl font-bold font-cinzel">Settings</h1>
        </div>

        <div className="space-y-12 pb-12">
          {/* Theme Selection */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-text-secondary uppercase tracking-wider text-sm">Theme</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => settings.setTheme(t.id)}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${settings.themeId === t.id ? 'border-accent bg-accent/10 shadow-[0_0_15px_var(--accent-30)]' : 'border-border bg-panel hover:border-text-secondary'}`}
                >
                  <div className="w-16 h-16 relative flex items-center justify-center rounded overflow-hidden" style={{ backgroundColor: t.boardBackground }}>
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-50">
                      <div style={{ backgroundColor: t.lightSquare }}></div>
                      <div style={{ backgroundColor: t.darkSquare }}></div>
                      <div style={{ backgroundColor: t.darkSquare }}></div>
                      <div style={{ backgroundColor: t.lightSquare }}></div>
                    </div>
                    <img src={`/pieces/${t.pieceSet}/wN.svg`} alt="Knight" className="w-12 h-12 relative z-10 drop-shadow-md" />
                    {settings.themeId === t.id && (
                      <div className="absolute top-1 right-1 bg-accent text-background rounded-full p-0.5 z-20">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  <span className="font-semibold">{t.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* AI Provider Settings */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-text-secondary uppercase tracking-wider text-sm">AI Provider Settings (Play vs LLM)</h2>
            <div className="bg-panel rounded-xl border border-border overflow-hidden p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Provider</label>
                <select 
                  value={settings.llmProvider}
                  onChange={(e) => settings.setLLMSettings(e.target.value as 'gemini' | 'openrouter', settings.llmApiKey, settings.llmModelId)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-text-primary focus:border-accent focus:outline-none"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openrouter">OpenRouter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">API Key</label>
                <input 
                  type="password"
                  value={settings.llmApiKey}
                  onChange={(e) => settings.setLLMSettings(settings.llmProvider, e.target.value, settings.llmModelId)}
                  placeholder={`Enter your ${settings.llmProvider === 'gemini' ? 'Gemini' : 'OpenRouter'} API Key`}
                  className="w-full bg-background border border-border rounded-lg p-2 text-text-primary focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Model ID</label>
                <input 
                  type="text"
                  value={settings.llmModelId}
                  onChange={(e) => settings.setLLMSettings(settings.llmProvider, settings.llmApiKey, e.target.value)}
                  placeholder={settings.llmProvider === 'gemini' ? "gemini-1.5-flash" : "google/gemini-2.5-flash"}
                  className="w-full bg-background border border-border rounded-lg p-2 text-text-primary focus:border-accent focus:outline-none"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Default for Gemini: <span className="font-mono text-accent">gemini-1.5-flash</span>. 
                  Default for OpenRouter: <span className="font-mono text-accent">google/gemini-2.5-flash</span>
                </p>
              </div>
            </div>
          </section>

          {/* Gameplay */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-text-secondary uppercase tracking-wider text-sm">Gameplay</h2>
            <div className="bg-panel rounded-xl border border-border divide-y divide-border overflow-hidden">
              <ToggleRow label="Show Legal Moves" checked={settings.showLegalMoves} onChange={() => handleToggle('showLegalMoves')} />
              <ToggleRow label="Show Coordinates" checked={settings.showCoordinates} onChange={() => handleToggle('showCoordinates')} />
              <ToggleRow label="Auto-Promote to Queen" checked={settings.autoPromoteQueen} onChange={() => handleToggle('autoPromoteQueen')} />
              <ToggleRow label="Allow Undo vs AI" checked={settings.allowUndoVsAI} onChange={() => handleToggle('allowUndoVsAI')} />
            </div>
          </section>

          {/* Sound */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-text-secondary uppercase tracking-wider text-sm">Sound</h2>
            <div className="bg-panel rounded-xl border border-border divide-y divide-border overflow-hidden">
              <ToggleRow label="Master Sound" checked={settings.soundEnabled} onChange={() => handleToggle('soundEnabled')} />
              <div className="p-4 flex items-center justify-between">
                <span className="font-medium text-text-primary">Volume</span>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={settings.soundVolume} 
                  onChange={(e) => settings.setSoundVolume(parseInt(e.target.value))}
                  disabled={!settings.soundEnabled}
                  className="w-1/2 accent-accent opacity-disabled"
                  style={{ opacity: settings.soundEnabled ? 1 : 0.5 }}
                />
              </div>
              <ToggleRow label="Capture Sound" checked={settings.captureSound} onChange={() => handleToggle('captureSound')} disabled={!settings.soundEnabled} />
            </div>
          </section>
          
          {/* Display */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-text-secondary uppercase tracking-wider text-sm">Display</h2>
            <div className="bg-panel rounded-xl border border-border divide-y divide-border overflow-hidden">
              <ToggleRow label="Always Flip For Player (Black at bottom)" checked={settings.alwaysFlipForPlayer} onChange={() => handleToggle('alwaysFlipForPlayer')} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const ToggleRow = ({ label, checked, onChange, disabled = false }: { label: string, checked: boolean, onChange: () => void, disabled?: boolean }) => (
  <label className={`flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <span className="font-medium">{label}</span>
    <input type="checkbox" className="hidden" checked={checked} onChange={onChange} disabled={disabled} />
    <div className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-accent' : 'bg-background border border-border'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${checked ? 'bg-background left-7' : 'bg-text-secondary left-1'}`} />
    </div>
  </label>
);
