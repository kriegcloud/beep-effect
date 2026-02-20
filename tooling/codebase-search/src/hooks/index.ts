/**
 * Hooks for Claude Code integration and automatic index maintenance.
 * Provides session start overview generation and prompt-submit context injection.
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * Re-export prompt-submit hook APIs.
 * @since 0.0.0
 */
export * from "./PromptSubmit.js";
export type {
  /**
   * Session-start package statistics entry.
   * @since 0.0.0
   */
  PackageStat,
} from "./SessionStart.js";
/**
 * Session-start package statistics entry.
 * @since 0.0.0
 */
export {
  /**
   * Builds the compact session overview text.
   * @since 0.0.0
   */
  generateSessionOverview,
  /**
   * Default index directory used by session-start hooks.
   * @since 0.0.0
   */
  INDEX_DIR,
  /**
   * Metadata file name within the index directory.
   * @since 0.0.0
   */
  INDEX_META_FILE,
  /**
   * Schema for session-start hook input payload.
   * @since 0.0.0
   */
  SessionStartInput,
  /**
   * Staleness threshold for session-start guidance.
   * @since 0.0.0
   */
  STALENESS_THRESHOLD_MS,
  /**
   * Entry-point effect for the SessionStart hook.
   * @since 0.0.0
   */
  sessionStartHook,
} from "./SessionStart.js";
