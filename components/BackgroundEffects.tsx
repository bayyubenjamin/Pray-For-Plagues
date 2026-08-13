export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black flex items-center justify-center">
      
      {/* 1. Video untuk Desktop */}
      <div className="absolute inset-0 w-full h-full overflow-hidden hidden md:block">
        <video
          autoPlay
          loop
          muted
          playsInline
          // Menggunakan object-top agar bagian atas terkunci dan tidak terpotong
          className="w-full h-full object-cover object-top opacity-85"
        >
          <source src="/images/hero-hooded.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 2. Video untuk Mobile */}
      <div className="absolute inset-0 w-full h-full overflow-hidden block md:hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          // Menggunakan object-top agar bagian atas terkunci dan tidak terpotong
          className="w-full h-full object-cover object-top opacity-85"
        >
          <source src="/images/hero-mobile.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Efek Gradasi Sinematik */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.7)_80%,#000000_100%)]"></div>
      
      {/* Scanlines tipis */}
      <div className="absolute inset-0 bg-scanline opacity-15"></div>
    </div>
  );
}
