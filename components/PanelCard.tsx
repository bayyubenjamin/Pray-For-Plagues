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
    <section id={id} className={`card-panel ${compact ? "p-4 sm:p-4" : "p-5 sm:p-6"} ${className}`}>
      {title && (
        <div className={`flex items-center gap-3 ${compact ? "mb-2" : "mb-5"}`}>
          <p className="font-tech text-[10px] tracking-[0.25em] text-white/55 uppercase shrink-0">
            {title}
          </p>
          <span aria-hidden="true" className="h-px flex-1 bg-green/15" />
        </div>
      )}
      {children}
    </section>
  );
}
