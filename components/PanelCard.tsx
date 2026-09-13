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
        <p className={`font-tech text-[9px] tracking-widest text-gray ${compact ? "mb-1" : "mb-4"}`}>
          {title}
        </p>
      )}
      {children}
    </section>
  );
}
