"use client";

import { cn } from "@beep/todox/lib/utils";
import { useOthers } from "@liveblocks/react/suspense";

/**
 * Visual indicator showing when a collaborator is using AI features.
 * Designed to be positioned near the collaborator's cursor.
 */
interface AiActivityIndicatorProps {
  /** ID of the user to show AI activity for */
  readonly userId: string;
  /** Additional CSS classes */
  readonly className?: string;
}

/**
 * Displays an AI activity badge for a specific collaborator.
 *
 * Shows the prompt label (e.g., "Improve Writing") with a sparkle icon
 * when the user is actively generating AI content.
 *
 * @example
 * ```tsx
 * // Position near collaborator cursor
 * <div className="relative">
 *   <CollaboratorCursor user={user} />
 *   <AiActivityIndicator userId={user.id} />
 * </div>
 * ```
 */
export function AiActivityIndicator({ userId, className }: AiActivityIndicatorProps) {
  const others = useOthers();
  const other = others.find((o) => o.id === userId);

  // Don't render if user not found or not generating
  if (!other?.presence?.aiActivity?.isGenerating) {
    return null;
  }

  const { promptLabel } = other.presence.aiActivity;
  const userColor = other.info?.color ?? "#9333ea"; // Default purple

  return (
    <div
      className={cn(
        "absolute -top-6 left-0 px-2 py-0.5 rounded-md",
        "text-xs font-medium whitespace-nowrap",
        "flex items-center gap-1.5",
        "shadow-sm border border-current/20",
        "animate-pulse",
        className
      )}
      style={{
        backgroundColor: `${userColor}20`,
        color: userColor,
      }}
    >
      <SparkleIcon className="size-3" />
      <span>{promptLabel ?? "Generating..."}</span>
    </div>
  );
}

/**
 * Displays AI activity badges for all collaborators currently using AI.
 * Use this in a floating overlay to show all AI activity in the document.
 *
 * @example
 * ```tsx
 * // In a portal overlay
 * <AiActivityOverlay />
 * ```
 */
export function AiActivityOverlay() {
  const others = useOthers();

  const activeAiUsers = others.filter((other) => other.presence?.aiActivity?.isGenerating === true);

  if (activeAiUsers.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {activeAiUsers.map((user) => (
        <div
          key={user.id}
          className={cn(
            "px-3 py-1.5 rounded-lg",
            "text-xs font-medium",
            "flex items-center gap-2",
            "shadow-lg border",
            "bg-white dark:bg-zinc-900",
            "animate-in slide-in-from-right-2"
          )}
          style={{
            borderColor: user.info?.color ?? "#9333ea",
          }}
        >
          <div
            className="size-2 rounded-full animate-pulse"
            style={{ backgroundColor: user.info?.color ?? "#9333ea" }}
          />
          <span className="text-muted-foreground">{user.info?.name ?? "Someone"} is using AI</span>
          <SparkleIcon className="size-3" style={{ color: user.info?.color ?? "#9333ea" }} />
        </div>
      ))}
    </div>
  );
}

/**
 * Simple sparkle/magic wand icon for AI activity indication.
 */
function SparkleIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v2M12 19v2M4.93 4.93l1.41 1.41M16.24 16.24l1.41 1.41M3 12h2M19 12h2M4.93 19.07l1.41-1.41M16.24 7.76l1.41-1.41" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

export type { AiActivityIndicatorProps };
