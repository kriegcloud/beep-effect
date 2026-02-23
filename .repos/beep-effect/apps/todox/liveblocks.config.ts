/**
 * Serialized selection range for Liveblocks presence.
 * Used to track AI operation locations for conflict detection.
 * Note: Types are mutable for Liveblocks JSON compatibility.
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
 * Note: Types are mutable for Liveblocks JSON compatibility.
 */
export type AiActivityPresence = {
  /** Whether AI generation is currently in progress */
  isGenerating: boolean;
  /** Label of the AI prompt being used (e.g., "Improve Writing") */
  promptLabel: string | null;
  /** Selection range where AI is operating */
  selectionRange: SerializedRange | null;
};

declare global {
  interface Liveblocks {
    Presence: {
      /** User's cursor position (null when not in editor) */
      cursor: { x: number; y: number } | null;
      /** User's current selection range */
      selection: SerializedRange | null;
      /** AI activity state (null when not using AI) */
      aiActivity: AiActivityPresence | null;
    };
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };
    Storage: {
      title: string;
    };
  }
}
