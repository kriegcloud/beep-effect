/**
 * PlaceholderView Component
 *
 * File: apps/todox/src/components/placeholder-view.tsx
 *
 * Prerequisites:
 *   mkdir -p apps/todox/src/components
 */

interface PlaceholderViewProps {
  viewMode: string;
}

export function PlaceholderView({ viewMode }: PlaceholderViewProps) {
  const formattedName = viewMode
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
      <div className="text-4xl opacity-50">
        {getViewIcon(viewMode)}
      </div>
      <div className="text-center">
        <h2 className="text-lg font-medium">{formattedName}</h2>
        <p className="text-sm">Coming soon</p>
      </div>
    </div>
  );
}

function getViewIcon(viewMode: string): string {
  const icons: Record<string, string> = {
    workspace: "🖥️",
    calendar: "📅",
    "knowledge-base": "🧠",
    todos: "✅",
    people: "👥",
    tasks: "📋",
    files: "📁",
    "heat-map": "📊",
  };
  return icons[viewMode] ?? "📄";
}
