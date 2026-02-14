"use client";

import { ClientSideSuspense, RoomProvider } from "@liveblocks/react";
import { type ReactNode, useMemo } from "react";
import { AiActivityOverlay } from "../plugins/AiAssistantPlugin/components/AiActivityIndicator";

/**
 * Serialized selection range for Liveblocks presence.
 * Used to track AI operation locations for conflict detection.
 */
export type SerializedRange = {
  /** Start offset of selection */
  start: number;
  /** End offset of selection */
  end: number;
  /** Node key where selection starts (for Lexical) */
  startKey?: string;
  /** Node key where selection ends (for Lexical) */
  endKey?: string;
};

/**
 * AI activity state broadcast via Liveblocks presence.
 * Allows collaborators to see when someone is using AI features.
 */
export type AiActivityPresence = {
  /** Whether AI generation is currently in progress */
  isGenerating: boolean;
  /** Label of the AI prompt being used (e.g., "Improve Writing") */
  promptLabel: string | null;
  /** Selection range where AI is operating */
  selectionRange: SerializedRange | null;
};

/**
 * Liveblocks Presence type for AI collaboration.
 */
export type AiPresence = {
  /** User's cursor position (null when not in editor) */
  cursor: { x: number; y: number } | null;
  /** User's current selection range */
  selection: SerializedRange | null;
  /** AI activity state (null when not using AI) */
  aiActivity: AiActivityPresence | null;
};

/**
 * Default presence state for new users joining a room.
 */
const initialPresence: AiPresence = {
  cursor: null,
  selection: null,
  aiActivity: null,
};

interface LiveblocksProviderProps {
  /** Whether collaboration mode is enabled */
  readonly isCollab: boolean;
  /** Room ID (usually document/page ID) */
  readonly roomId: string;
  /** Child components that can access Liveblocks hooks */
  readonly children: ReactNode;
}

/**
 * Conditional Liveblocks room provider.
 *
 * When `isCollab` is true, wraps children in a Liveblocks RoomProvider
 * to enable presence, cursors, and AI activity broadcasting.
 * When false, renders children directly without Liveblocks context.
 *
 * @example
 * ```tsx
 * <LiveblocksProvider isCollab={isCollab} roomId={documentId}>
 *   <Editor />
 * </LiveblocksProvider>
 * ```
 */
export function LiveblocksProvider({ isCollab, roomId, children }: LiveblocksProviderProps) {
  // Memoize to prevent re-renders
  const resolvedRoomId = useMemo(() => `liveblocks:playground:${roomId}`, [roomId]);

  if (!isCollab) {
    return <>{children}</>;
  }

  return (
    <RoomProvider id={resolvedRoomId} initialPresence={initialPresence} initialStorage={{ title: "" }}>
      <ClientSideSuspense fallback={<LoadingIndicator />}>
        {children}
        <AiActivityOverlay />
      </ClientSideSuspense>
    </RoomProvider>
  );
}

/**
 * Simple loading indicator shown while Liveblocks room connects.
 */
function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-pulse text-sm text-muted-foreground">Connecting to collaboration session...</div>
    </div>
  );
}
