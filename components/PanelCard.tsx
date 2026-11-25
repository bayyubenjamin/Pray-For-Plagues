export default function PanelCard({
  title,
  children,
  className = "",
  id,
  compact = false,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  compact?: boolean;
}) {
  return (
    <section id={id} className={`card-panel ${compact ? "p-3 sm:p-3" : "p-5 sm:p-6"} ${className}`}>
      {title && (
        <p className={`font-tech text-[10px] tracking-[0.18em] text-white/55 uppercase ${compact ? "mb-1" : "mb-4"}`}>
          {title}
        </p>
      )}
      {children}
    </section>
  );
}
