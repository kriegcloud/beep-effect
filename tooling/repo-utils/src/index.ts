/**
 * Effect-based monorepo utilities for repository analysis and workspace management.
 *
 * @since 0.0.0
 * @packageDocumentation
 */
// cspell:ignore codegraph

/**
 * @since 0.0.0
 * @category constants
 */
export const VERSION = "0.0.0" as const;

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  callMcpTool,
  /**
   * @since 0.0.0
   */
  callMcpToolOrFail,
  /**
   * @since 0.0.0
   */
  decodeMcpJsonRpcPayload,
  /**
   * @since 0.0.0
   */
  ensureGraphitiProxyPreflight,
  /**
   * @since 0.0.0
   */
  GraphitiPreflightError,
  /**
   * @since 0.0.0
   */
  GraphitiProtocolError,
  /**
   * @since 0.0.0
   */
  GraphitiToolCallError,
  /**
   * @since 0.0.0
   */
  initializeMcpSession,
  /**
   * @since 0.0.0
   */
  isLoopbackHost,
  /**
   * @since 0.0.0
   */
  isProxyGraphitiMcpUrl,
  /**
   * @since 0.0.0
   */
  JsonRpcVersion,
  /**
   * @since 0.0.0
   */
  McpClientInfo,
  /**
   * @since 0.0.0
   */
  McpInitializedNotification,
  /**
   * @since 0.0.0
   */
  McpInitializeParams,
  /**
   * @since 0.0.0
   */
  McpInitializeRequest,
  /**
   * @since 0.0.0
   */
  McpJsonRpcPayload,
  /**
   * @since 0.0.0
   */
  McpToolCallParams,
  /**
   * @since 0.0.0
   */
  McpToolCallRequest,
  /**
   * @since 0.0.0
   */
  type McpToolResult,
  /**
   * @since 0.0.0
   */
  mcpPost,
  /**
   * @since 0.0.0
   */
  parseMcpPayload,
  /**
   * @since 0.0.0
   */
  parseMcpToolResult,
} from "./codegraph/graphiti/index.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  ArtifactStats,
  /**
   * @since 0.0.0
   */
  AstKgEdgeV2,
  /**
   * @since 0.0.0
   */
  AstKgEnvelopeVersion,
  /**
   * @since 0.0.0
   */
  AstKgGroupId,
  /**
   * @since 0.0.0
   */
  AstKgNodeV2,
  /**
   * @since 0.0.0
   */
  AstKgWriteReceiptV1,
  /**
   * @since 0.0.0
   */
  ChangedPathsCsv,
  /**
   * @since 0.0.0
   */
  decodeChangedPathsCsv,
  /**
   * @since 0.0.0
   */
  decodeGraphitiLedger,
  /**
   * @since 0.0.0
   */
  decodeJsonEnvelopeLine,
  /**
   * @since 0.0.0
   */
  decodeNonNegativeInt,
  /**
   * @since 0.0.0
   */
  decodeSinkPublishLedger,
  /**
   * @since 0.0.0
   */
  decodeSnapshotManifest,
  /**
   * @since 0.0.0
   */
  decodeSnapshotRecord,
  /**
   * @since 0.0.0
   */
  decodeSnapshotRecordJsonLine,
  /**
   * @since 0.0.0
   */
  EnvelopeMetadata,
  /**
   * @since 0.0.0
   */
  encodeSnapshotRecordJsonLine,
  /**
   * @since 0.0.0
   */
  FileArtifact,
  /**
   * @since 0.0.0
   */
  GraphitiLedger,
  /**
   * @since 0.0.0
   */
  IndexMode,
  /**
   * @since 0.0.0
   */
  IndexSummary,
  /**
   * @since 0.0.0
   */
  JsonEnvelopeLine,
  /**
   * @since 0.0.0
   */
  KgEdge,
  /**
   * @since 0.0.0
   */
  KgNode,
  /**
   * @since 0.0.0
   */
  KgNodeKind,
  /**
   * @since 0.0.0
   */
  KgSchemaVersion,
  /**
   * @since 0.0.0
   */
  KgSchemaVersionTag,
  /**
   * @since 0.0.0
   */
  NormalizedPath,
  /**
   * @since 0.0.0
   */
  ParityProfile,
  /**
   * @since 0.0.0
   */
  Provenance,
  /**
   * @since 0.0.0
   */
  PublishSummary,
  /**
   * @since 0.0.0
   */
  PublishTarget,
  /**
   * @since 0.0.0
   */
  parseBoolean,
  /**
   * @since 0.0.0
   */
  parsePositiveInt,
  /**
   * @since 0.0.0
   */
  parsePositiveNumber,
  /**
   * @since 0.0.0
   */
  SinkPublishLedger,
  /**
   * @since 0.0.0
   */
  SinkTarget,
  /**
   * @since 0.0.0
   */
  SnapshotManifest,
  /**
   * @since 0.0.0
   */
  SnapshotManifestEntry,
  /**
   * @since 0.0.0
   */
  SnapshotRecord,
  /**
   * @since 0.0.0
   */
  SnapshotRecordJsonLine,
} from "./codegraph/kg/index.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  extractWorkspaceDependencies,
} from "./Dependencies.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  buildRepoDependencyIndex,
} from "./DependencyIndex.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  CyclicDependencyError,
  /**
   * @since 0.0.0
   */
  DomainError,
  /**
   * @since 0.0.0
   */
  NoSuchFileError,
} from "./errors/index.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  FsUtils,
  /**
   * @since 0.0.0
   */
  FsUtilsLive,
  /**
   * @since 0.0.0
   */
  type FsUtilsShape,
  /**
   * @since 0.0.0
   */
  type GlobOptions,
} from "./FsUtils.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  computeTransitiveClosure,
  /**
   * @since 0.0.0
   */
  detectCycles,
  /**
   * @since 0.0.0
   */
  topologicalSort,
} from "./Graph.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  jsonParse,
  /**
   * @since 0.0.0
   */
  jsonStringifyCompact,
  /**
   * @since 0.0.0
   */
  jsonStringifyPretty,
} from "./JsonUtils.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  findRepoRoot,
} from "./Root.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  decodePackageJson,
  /**
   * @since 0.0.0
   */
  decodePackageJsonEffect,
  /**
   * @since 0.0.0
   */
  decodePackageJsonExit,
  /**
   * @since 0.0.0
   */
  encodePackageJsonEffect,
  /**
   * @since 0.0.0
   */
  encodePackageJsonPrettyEffect,
  /**
   * @since 0.0.0
   */
  encodePackageJsonToJsonEffect,
  /**
   * @since 0.0.0
   */
  PackageJson,
} from "./schemas/PackageJson.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  type DependencyRecord,
  /**
   * @since 0.0.0
   */
  emptyWorkspaceDeps,
  /**
   * @since 0.0.0
   */
  type WorkspaceDeps,
} from "./schemas/WorkspaceDeps.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  collectTsConfigPaths,
} from "./TsConfig.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  collectUniqueNpmDependencies,
  /**
   * @since 0.0.0
   */
  type UniqueNpmDeps,
} from "./UniqueDeps.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  getWorkspaceDir,
  /**
   * @since 0.0.0
   */
  resolveWorkspaceDirs,
} from "./Workspaces.js";
// bench
