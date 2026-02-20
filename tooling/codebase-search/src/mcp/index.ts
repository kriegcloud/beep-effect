/**
 * MCP module public exports.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

export { BrowseSymbolsTool, handleBrowseSymbols } from "./BrowseSymbolsTool.js";
export type { ErrorCode, McpErrorResponse } from "./contracts.js";
export { ErrorCodeSchema, ErrorCodes, formatError, McpErrorResponseSchema } from "./contracts.js";
export { FindRelatedTool, handleFindRelated } from "./FindRelatedTool.js";
export type {
  BrowseItem,
  BrowseLevel,
  FormattedBrowseResult,
  FormattedReindexResult,
  FormattedRelatedResult,
  FormattedRelatedSymbol,
  FormattedSearchResult,
  ParsedSymbolId,
  RawRelatedSymbol,
  RawSearchResult,
  RelatedSource,
  SearchResultRow,
} from "./formatters.js";
export {
  formatBrowseResult,
  formatReindexResult,
  formatRelatedResults,
  formatSearchResults,
  HOOK_SIGNATURE_MAX_LENGTH,
  MCP_SIGNATURE_MAX_LENGTH,
  parseSymbolId,
  truncateSignature,
} from "./formatters.js";
export type { McpServerConfig } from "./McpServer.js";
export { CodebaseSearchToolkit, makeServerLayer, makeToolkitHandlerLayer } from "./McpServer.js";
export type { ReindexStats, ReindexSuccess } from "./ReindexTool.js";
export { handleReindex, ReindexStatsSchema, ReindexSuccessSchema, ReindexTool } from "./ReindexTool.js";
export { handleSearchCodebase, SearchCodebaseTool } from "./SearchCodebaseTool.js";
