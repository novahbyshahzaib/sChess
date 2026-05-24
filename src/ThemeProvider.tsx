import { useEffect } from 'react';
import { useSettingsStore } from './stores/settingsStore';
import { themes } from './themes/themes';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const themeId = useSettingsStore((state) => state.themeId);
  const theme = themes.find((t) => t.id === themeId) || themes[0];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--light-sq', theme.lightSquare);
    root.style.setProperty('--dark-sq', theme.darkSquare);
    root.style.setProperty('--board-bg', theme.boardBackground);
    root.style.setProperty('--app-bg', theme.appBackground);
    root.style.setProperty('--accent', theme.accentColor);
    root.style.setProperty('--selected-sq', theme.selectedSquare);
    root.style.setProperty('--legal-dot', theme.legalMoveDot);
    root.style.setProperty('--last-move', theme.lastMoveHighlight);
    root.style.setProperty('--check-highlight', theme.checkHighlight);
    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    root.style.setProperty('--panel-bg', theme.panelBackground);
    root.style.setProperty('--btn-bg', theme.buttonBackground);
    root.style.setProperty('--border-color', theme.borderColor);
  }, [theme]);

  return <>{children}</>;
};
