export default function SectionTitle({ title, subtitle }: { title: string, subtitle?: string }) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="h-px flex-1 bg-green/25" />
        <h2 className="font-bangers text-4xl md:text-5xl text-green tracking-wide text-glow whitespace-nowrap">
          {title}
        </h2>
        <span aria-hidden="true" className="h-px flex-1 bg-green/25" />
      </div>
      {subtitle && (
        <p className="mt-3 font-tech text-white/60 text-xs md:text-sm tracking-[0.2em] uppercase">
          {subtitle}
        </p>
      )}
    </div>
  );
}
