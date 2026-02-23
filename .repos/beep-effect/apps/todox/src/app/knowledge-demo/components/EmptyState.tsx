"use client";

interface EmptyStateProps {
  readonly emoji: string;
  readonly title: string;
  readonly description: string;
}

export function EmptyState({ emoji, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-muted-foreground">
      <div className="text-4xl opacity-50" suppressHydrationWarning>
        {emoji}
      </div>
      <div className="text-center">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm">{description}</p>
      </div>
    </div>
  );
}
