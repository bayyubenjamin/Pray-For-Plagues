'use client';

import { useEffect, useRef } from 'react';

// Soft click on every button / link press. Volume is deliberately low
// (0.18) so it stays subtle. The audio element is created after mount,
// and playback only ever happens inside a real click handler, so there
// is no autoplay-policy issue.
export default function ClickSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/audio/click.mp3');
    audio.volume = 0.18;
    audio.preload = 'auto';
    audioRef.current = audio;

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('button, a, [role="button"]')) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          /* click sound is best-effort */
        });
      }
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  return null;
}
