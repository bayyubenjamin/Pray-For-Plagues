export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Base radial gradient for subtle center lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-darkGreen/20 via-deep to-black"></div>
      
      {/* Scanlines overlay */}
      <div className="absolute inset-0 bg-scanline bg-scanline opacity-30"></div>
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-black/40 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]"></div>
      
      {/* Biohazard/Fog atmospheric hint */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-green/5 blur-[120px] rounded-full mix-blend-screen"></div>
      <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[60%] bg-green/5 blur-[150px] rounded-full mix-blend-screen"></div>
    </div>
  );
}
