/**
 * MCP (Model Context Protocol) server exposing codebase search as tools.
 * Provides stdio-based server for integration with AI assistants.
 * @since 0.0.0
 * @packageDocumentation
 */

export type {
  /**
   * @since 0.0.0
   */
  FormattedBrowseResult,
  /**
   * @since 0.0.0
   */
  FormattedReindexResult,
  /**
   * @since 0.0.0
   */
  FormattedRelatedSymbol,
  /**
   * @since 0.0.0
   */
  FormattedSearchResult,
  /**
   * @since 0.0.0
   */
  ParsedSymbolId,
  /**
   * @since 0.0.0
   */
  RawRelatedSymbol,
  /**
   * @since 0.0.0
   */
  RawSearchResult,
} from "./formatters.js";
export {
  /**
   * @since 0.0.0
   */
  formatBrowseResult,
  /**
   * @since 0.0.0
   */
  formatReindexResult,
  /**
   * @since 0.0.0
   */
  formatRelatedResults,
  /**
   * @since 0.0.0
   */
  formatSearchResults,
  /**
   * @since 0.0.0
   */
  HOOK_SIGNATURE_MAX_LENGTH,
  /**
   * @since 0.0.0
   */
  MCP_SIGNATURE_MAX_LENGTH,
  /**
   * @since 0.0.0
   */
  parseSymbolId,
  /**
   * @since 0.0.0
   */
  truncateSignature,
} from "./formatters.js";
export type {
  /**
   * @since 0.0.0
   */
  ErrorCode,
  /**
   * @since 0.0.0
   */
  McpErrorResponse,
  /**
   * @since 0.0.0
   */
  McpServerConfig,
} from "./McpServer.js";
export {
  /**
   * @since 0.0.0
   */
  BrowseSymbolsTool,
  /**
   * @since 0.0.0
   */
  CodebaseSearchToolkit,
  /**
   * @since 0.0.0
   */
  ErrorCodes,
  /**
   * @since 0.0.0
   */
  FindRelatedTool,
  /**
   * @since 0.0.0
   */
  formatError,
  /**
   * @since 0.0.0
   */
  handleBrowseSymbols,
  /**
   * @since 0.0.0
   */
  handleFindRelated,
  /**
   * @since 0.0.0
   */
  handleReindex,
  /**
   * @since 0.0.0
   */
  handleSearchCodebase,
  /**
   * @since 0.0.0
   */
  makeServerLayer,
  /**
   * @since 0.0.0
   */
  makeToolkitHandlerLayer,
  /**
   * @since 0.0.0
   */
  ReindexTool,
  /**
   * @since 0.0.0
   */
  SearchCodebaseTool,
} from "./McpServer.js";
