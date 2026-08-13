'use client';

import { useState, useRef, useEffect } from 'react';

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Fungsi untuk mencoba memutar musik pada interaksi pertama pengguna (klik/tap)
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            // Hapus event listener setelah musik berhasil berputar
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
          })
          .catch((error) => {
            console.log("Autoplay diblokir browser:", error);
          });
      }
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Tambahkan atribut preload="auto" */}
      <audio ref={audioRef} src="/audio/music.mp3" preload="auto" loop />
      
      <button 
        onClick={togglePlay}
        className="px-4 py-2 bg-black/80 border border-green/40 text-green font-tech text-xs tracking-wider rounded-full shadow-lg hover:bg-green hover:text-black transition uppercase backdrop-blur-md"
      >
        {isPlaying ? '🔊 MUSIC: ON' : '🔇 MUSIC: OFF'}
      </button>
    </div>
  );
}
