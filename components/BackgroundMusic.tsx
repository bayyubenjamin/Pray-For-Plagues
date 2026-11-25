'use client';

import { useState, useRef, useEffect } from 'react';

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    // Music starts only after a user interaction (click/keypress) — never
    // autoplayed on load. The toggle below is the explicit control.
    const startAudio = () => {
      if (audioRef.current && !hasStarted.current) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            hasStarted.current = true;
          })
          .catch(() => {
            /* waiting for a real interaction */
          });
      }
    };

    window.addEventListener("click", startAudio);
    window.addEventListener("keydown", startAudio);
    return () => {
      window.removeEventListener("click", startAudio);
      window.removeEventListener("keydown", startAudio);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="fixed top-20 md:top-24 right-4 z-[9999]">
      <audio ref={audioRef} src="/audio/music.mp3" loop preload="none" />

      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Mute background music" : "Play background music"}
        aria-pressed={isPlaying}
        className="w-8 h-8 flex items-center justify-center bg-black/80 border border-green text-green rounded-full shadow-[0_0_15px_rgba(74,222,128,0.6)] hover:bg-green hover:text-black transition backdrop-blur-lg"
      >
        <span className="text-sm">{isPlaying ? '🔊' : '🔇'}</span>
      </button>
    </div>
  );
}
