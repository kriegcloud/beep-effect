/**
 * Hooks for Claude Code integration and automatic index maintenance.
 * Provides session start overview generation, user prompt context
 * injection via BM25 keyword search, and incremental re-indexing
 * of changed files.
 * @since 0.0.0
 * @packageDocumentation
 */

export type {
  /**
   * @since 0.0.0
   */
  SearchResultForHook,
} from "./PromptSubmit.js";
export {
  /**
   * @since 0.0.0
   */
  BM25_INDEX_FILE,
  /**
   * @since 0.0.0
   */
  constructSearchQuery,
  /**
   * @since 0.0.0
   */
  formatContextInjection,
  /**
   * @since 0.0.0
   */
  formatSymbolIdResults,
  /**
   * @since 0.0.0
   */
  MAX_QUERY_LENGTH,
  /**
   * @since 0.0.0
   */
  MAX_RESULTS,
  /**
   * @since 0.0.0
   */
  MIN_PROMPT_LENGTH,
  /**
   * @since 0.0.0
   */
  MIN_SCORE,
  /**
   * @since 0.0.0
   */
  PromptSubmitInput,
  /**
   * @since 0.0.0
   */
  promptSubmitHook,
  /**
   * @since 0.0.0
   */
  shouldSkipSearch,
} from "./PromptSubmit.js";
export type {
  /**
   * @since 0.0.0
   */
  PackageStat,
} from "./SessionStart.js";
export {
  /**
   * @since 0.0.0
   */
  generateSessionOverview,
  /**
   * @since 0.0.0
   */
  INDEX_DIR,
  /**
   * @since 0.0.0
   */
  INDEX_META_FILE,
  /**
   * @since 0.0.0
   */
  SessionStartInput,
  /**
   * @since 0.0.0
   */
  STALENESS_THRESHOLD_MS,
  /**
   * @since 0.0.0
   */
  sessionStartHook,
} from "./SessionStart.js";
