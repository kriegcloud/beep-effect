interface InfoSectionProps {
  title: string;
  description: string;
  className?: string;
}

export function InfoSection({
  title,
  description,
  className = "",
}: InfoSectionProps) {
  return (
    <div className={`space-y-1 ${className} w-full`}>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-base text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
