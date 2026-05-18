'use client';

import { useRef, useCallback } from 'react';

const bgmPath = '/music/Merry Christmas Mr.Lawr.mp3';

export default function AudioController() {
  const bgmRef = useRef(null);
  const sfxPool = useRef({});

  const getBgm = useCallback(() => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio(bgmPath);
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.4;
    }
    return bgmRef.current;
  }, []);

  const playBgm = useCallback(async () => {
    try {
      const bgm = getBgm();
      bgm.currentTime = 0;
      await bgm.play();
    } catch (e) {
      // Autoplay blocked — user interaction required
    }
  }, [getBgm]);

  const stopBgm = useCallback(() => {
    const bgm = bgmRef.current;
    if (bgm) {
      bgm.pause();
      bgm.currentTime = 0;
    }
  }, []);

  const playSfx = useCallback(async (src) => {
    try {
      if (!sfxPool.current[src]) {
        sfxPool.current[src] = new Audio(src);
        sfxPool.current[src].volume = 0.7;
      }
      const sfx = sfxPool.current[src];
      sfx.currentTime = 0;
      await sfx.play();
    } catch (e) {
      // Ignore autoplay errors
    }
  }, []);

  return { playBgm, stopBgm, playSfx };
}
