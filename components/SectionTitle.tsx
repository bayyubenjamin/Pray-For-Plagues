export default function SectionTitle({ title, subtitle }: { title: string, subtitle?: string }) {
  return (
    <div className="text-center mb-8">
      <h2 className="font-bangers text-4xl md:text-5xl text-green mb-3 tracking-wide text-glow">
        ☣ {title} ☣
      </h2>
      {subtitle && (
        <p className="font-tech text-white/60 text-xs md:text-sm tracking-[0.2em] uppercase">
          {subtitle}
        </p>
      )}
    </div>
  );
}
