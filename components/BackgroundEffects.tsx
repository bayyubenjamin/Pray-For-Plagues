'use client';

import { useEffect, useRef } from 'react';

// Two videos, same responsive logic as before: desktop at md and up,
// mobile below md. Only the visible one is ever loaded and played —
// the hidden one stays untouched, so the page never downloads both.
// Autoplay guard: (re)plays the visible video on mount, when the tab
// becomes visible again, when the breakpoint flips, and if it ever
// pauses while visible. There is no pause control in the UI, so any
// pause while the page is visible is treated as unwanted.
export default function BackgroundEffects() {
  const desktopRef = useRef<HTMLVideoElement>(null);
  const mobileRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');

    const visibleVideo = () =>
      media.matches ? desktopRef.current : mobileRef.current;
    const hiddenVideo = () =>
      media.matches ? mobileRef.current : desktopRef.current;

    const playVisible = () => {
      const video = visibleVideo();
      if (!video || !video.paused) return;
      video.play().catch(() => {
        /* autoplay blocked (e.g. low-power mode) — retry on next trigger */
      });
    };

    const onBreakpointChange = () => {
      hiddenVideo()?.pause();
      playVisible();
    };

    const onVisibilityChange = () => {
      if (!document.hidden) playVisible();
    };

    const onPause = (event: Event) => {
      const video = event.target as HTMLVideoElement;
      if (video === visibleVideo() && !document.hidden) playVisible();
    };

    const desktop = desktopRef.current;
    const mobile = mobileRef.current;
    desktop?.addEventListener('pause', onPause);
    mobile?.addEventListener('pause', onPause);
    media.addEventListener('change', onBreakpointChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    playVisible();

    return () => {
      desktop?.removeEventListener('pause', onPause);
      mobile?.removeEventListener('pause', onPause);
      media.removeEventListener('change', onBreakpointChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black flex items-center justify-center">
      {/* 1. Video for desktop — poster first, video lazy so it never blocks render */}
      <div className="absolute inset-0 w-full h-full overflow-hidden hidden md:block">
        <video
          ref={desktopRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/images/hero-hooded.webp"
          className="w-full h-full object-cover object-top opacity-85"
        >
          <source src="/images/hero-hooded.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 2. Video for mobile */}
      <div className="absolute inset-0 w-full h-full overflow-hidden block md:hidden">
        <video
          ref={mobileRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/images/hero-hooded.webp"
          className="w-full h-full object-cover object-top opacity-85"
        >
          <source src="/images/hero-mobile.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Cinematic gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.7)_80%,#000000_100%)]"></div>

      {/* Thin scanlines */}
      <div className="absolute inset-0 bg-scanline opacity-15"></div>
    </div>
  );
}
