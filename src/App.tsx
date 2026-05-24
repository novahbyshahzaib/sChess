import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { HomeScreen } from './components/Menus/HomeScreen';
import { PlayVsAI } from './components/Menus/PlayVsAI';
import { SettingsScreen } from './components/Menus/SettingsScreen';
import { GameScreen } from './components/Game/GameScreen';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/play-ai" element={<PlayVsAI />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/game" element={<GameScreen />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
