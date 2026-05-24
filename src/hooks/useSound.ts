import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useSettingsStore } from '../stores/settingsStore';

export function useSound() {
  const { soundEnabled, soundVolume, captureSound } = useSettingsStore();

  const sounds = useRef<{ [key: string]: Howl }>({});

  useEffect(() => {
    const basePath = '/sounds';
    
    sounds.current = {
      moveSelf: new Howl({ src: [`${basePath}/move-self.mp3`] }),
      moveOpponent: new Howl({ src: [`${basePath}/move-opponent.mp3`] }),
      capture: new Howl({ src: [`${basePath}/capture.mp3`] }),
      castle: new Howl({ src: [`${basePath}/castle.mp3`] }),
      check: new Howl({ src: [`${basePath}/check.mp3`] }),
      gameEnd: new Howl({ src: [`${basePath}/game-end.mp3`] }),
      illegal: new Howl({ src: [`${basePath}/illegal.mp3`] }),
    };
  }, []);

  const playSound = (name: string) => {
    if (!soundEnabled) return;
    
    // Special case for capture sound setting
    if (name === 'capture' && !captureSound) {
      name = 'moveSelf'; // fallback to standard move sound
    }

    const sound = sounds.current[name];
    if (sound) {
      sound.volume(soundVolume / 100);
      sound.play();
    }
  };

  return {
    playMove: (isOpponent = false) => playSound(isOpponent ? 'moveOpponent' : 'moveSelf'),
    playCapture: () => playSound('capture'),
    playCastle: () => playSound('castle'),
    playCheck: () => playSound('check'),
    playGameEnd: () => playSound('gameEnd'),
    playIllegal: () => playSound('illegal'),
  };
}
