/**
 * Schema-first memory configuration models for `@beep/clawhole`.
 *
 * This module ports the upstream OpenClaw memory config types into Effect
 * schemas while preserving the documented config surface and the upstream
 * validation behavior for qmd-backed memory search settings.
 *
 * @example
 * ```typescript
 * import * as O from "effect/Option"
 * import * as S from "effect/Schema"
 * import { MemoryConfig } from "@beep/clawhole/config/Memory"
 *
 * const memory = S.decodeUnknownSync(MemoryConfig)({
 *   backend: "qmd",
 *   citations: "on",
 *   qmd: {
 *     searchTool: "  search_memory  ",
 *     includeDefaultMemory: true,
 *     paths: [{ path: "./memory" }]
 *   }
 * })
 *
 * console.log(memory.backend) // { _id: "Option", _tag: "Some", value: "qmd" }
 * console.log(O.getOrUndefined(memory.qmd)?.searchTool) // { _id: "Option", _tag: "Some", value: "search_memory" }
 * ```
 *
 * @module @beep/clawhole/config/Memory
 * @since 0.0.0
 */
import { $ClawholeId } from "@beep/identity";
import { LiteralKit, NonEmptyTrimmedStr, NonNegativeInt, PosInt } from "@beep/schema";
import * as S from "effect/Schema";
import { SessionSendPolicyConfig } from "./Base.ts";

const $I = $ClawholeId.create("config/Memory");

const memoryParseOptions = {
  exact: true as const,
  onExcessProperty: "error" as const,
};

const MemoryQmdCommand = S.String.pipe(
  $I.annoteSchema("MemoryQmdCommand", {
    description: "Command string used to invoke the qmd binary or wrapper.",
  })
);

const MemoryQmdMcporterServerName = S.String.pipe(
  $I.annoteSchema("MemoryQmdMcporterServerName", {
    description: "mcporter server name used to route qmd MCP traffic.",
  })
);

const MemoryQmdSearchTool = NonEmptyTrimmedStr.pipe(
  $I.annoteSchema("MemoryQmdSearchTool", {
    description: "Non-empty trimmed tool name used for qmd search calls.",
  })
);

const MemoryQmdIndexLocation = S.String.pipe(
  $I.annoteSchema("MemoryQmdIndexLocation", {
    description: "Filesystem location string included in the qmd memory index.",
  })
);

const MemoryQmdIndexName = S.String.pipe(
  $I.annoteSchema("MemoryQmdIndexName", {
    description: "Optional display name for a qmd index path entry.",
  })
);

const MemoryQmdIndexPattern = S.String.pipe(
  $I.annoteSchema("MemoryQmdIndexPattern", {
    description: "Optional glob-like pattern used to narrow files within an indexed path.",
  })
);

const MemoryQmdSessionExportDir = S.String.pipe(
  $I.annoteSchema("MemoryQmdSessionExportDir", {
    description: "Directory string where qmd session exports are written.",
  })
);

const MemoryQmdUpdateInterval = S.String.pipe(
  $I.annoteSchema("MemoryQmdUpdateInterval", {
    description: "Interval string controlling scheduled qmd sync updates.",
  })
);

const MemoryQmdEmbedInterval = S.String.pipe(
  $I.annoteSchema("MemoryQmdEmbedInterval", {
    description: "Interval string controlling scheduled qmd embedding refreshes.",
  })
);

/**
 * Memory backend implementations supported by the config surface.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const MemoryBackend = LiteralKit(["builtin", "qmd"]).pipe(
  $I.annoteSchema("MemoryBackend", {
    description: "Memory backend implementations supported by the config surface.",
  })
);

/**
 * Type of {@link MemoryBackend}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type MemoryBackend = typeof MemoryBackend.Type;

/**
 * Memory citation modes supported by prompt assembly.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const MemoryCitationsMode = LiteralKit(["auto", "on", "off"]).pipe(
  $I.annoteSchema("MemoryCitationsMode", {
    description: "Memory citation modes supported by prompt assembly.",
  })
);

/**
 * Type of {@link MemoryCitationsMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type MemoryCitationsMode = typeof MemoryCitationsMode.Type;

/**
 * Search modes supported by the qmd memory backend.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const MemoryQmdSearchMode = LiteralKit(["query", "search", "vsearch"]).pipe(
  $I.annoteSchema("MemoryQmdSearchMode", {
    description: "Search modes supported by the qmd memory backend.",
  })
);

/**
 * Type of {@link MemoryQmdSearchMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type MemoryQmdSearchMode = typeof MemoryQmdSearchMode.Type;

/**
 * mcporter integration settings for qmd-backed memory search.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class MemoryQmdMcporterConfig extends S.Class<MemoryQmdMcporterConfig>($I`MemoryQmdMcporterConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether qmd search requests should be routed through a long-lived mcporter runtime.",
    }),
    serverName: S.OptionFromOptionalKey(MemoryQmdMcporterServerName).annotateKey({
      description: "mcporter server name used when qmd search is routed through MCP.",
    }),
    startDaemon: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the mcporter daemon should auto-start when mcporter mode is enabled.",
    }),
  },
  $I.annote("MemoryQmdMcporterConfig", {
    description: "mcporter integration settings for qmd-backed memory search.",
    parseOptions: memoryParseOptions,
  })
) {}

/**
 * One filesystem collection entry included in the qmd memory index.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class MemoryQmdIndexPath extends S.Class<MemoryQmdIndexPath>($I`MemoryQmdIndexPath`)(
  {
    path: MemoryQmdIndexLocation.annotateKey({
      description: "Filesystem location string included in the qmd memory index.",
    }),
    name: S.OptionFromOptionalKey(MemoryQmdIndexName).annotateKey({
      description: "Optional display name associated with the indexed path.",
    }),
    pattern: S.OptionFromOptionalKey(MemoryQmdIndexPattern).annotateKey({
      description: "Optional pattern used to filter which files under the path are indexed.",
    }),
  },
  $I.annote("MemoryQmdIndexPath", {
    description: "One filesystem collection entry included in the qmd memory index.",
    parseOptions: memoryParseOptions,
  })
) {}

const MemoryQmdIndexPaths = S.Array(MemoryQmdIndexPath).pipe(
  $I.annoteSchema("MemoryQmdIndexPaths", {
    description: "Array of filesystem collections included in qmd memory indexing.",
  })
);

/**
 * Session export settings for qmd-backed memory search.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class MemoryQmdSessionConfig extends S.Class<MemoryQmdSessionConfig>($I`MemoryQmdSessionConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether qmd session export support is enabled.",
    }),
    exportDir: S.OptionFromOptionalKey(MemoryQmdSessionExportDir).annotateKey({
      description: "Directory string where qmd session export artifacts are written.",
    }),
    retentionDays: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Non-negative number of days to retain exported qmd session artifacts.",
    }),
  },
  $I.annote("MemoryQmdSessionConfig", {
    description: "Session export settings for qmd-backed memory search.",
    parseOptions: memoryParseOptions,
  })
) {}

/**
 * Update scheduling settings for qmd-backed memory indexing and embedding refreshes.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class MemoryQmdUpdateConfig extends S.Class<MemoryQmdUpdateConfig>($I`MemoryQmdUpdateConfig`)(
  {
    interval: S.OptionFromOptionalKey(MemoryQmdUpdateInterval).annotateKey({
      description: "Interval string controlling scheduled qmd sync updates.",
    }),
    debounceMs: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Non-negative debounce window in milliseconds before qmd update runs begin.",
    }),
    onBoot: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether qmd update work should run during process startup.",
    }),
    waitForBootSync: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether startup should wait for the initial qmd sync to complete.",
    }),
    embedInterval: S.OptionFromOptionalKey(MemoryQmdEmbedInterval).annotateKey({
      description: "Interval string controlling scheduled qmd embedding refreshes.",
    }),
    commandTimeoutMs: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Non-negative timeout in milliseconds for general qmd command execution.",
    }),
    updateTimeoutMs: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Non-negative timeout in milliseconds for qmd update operations.",
    }),
    embedTimeoutMs: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Non-negative timeout in milliseconds for qmd embedding operations.",
    }),
  },
  $I.annote("MemoryQmdUpdateConfig", {
    description: "Update scheduling settings for qmd-backed memory indexing and embedding refreshes.",
    parseOptions: memoryParseOptions,
  })
) {}

/**
 * Query-time limits applied to qmd-backed memory search.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class MemoryQmdLimitsConfig extends S.Class<MemoryQmdLimitsConfig>($I`MemoryQmdLimitsConfig`)(
  {
    maxResults: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Positive upper bound on how many qmd search results may be returned.",
    }),
    maxSnippetChars: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Positive upper bound on snippet characters kept from each qmd search result.",
    }),
    maxInjectedChars: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Positive upper bound on total qmd characters injected into the prompt.",
    }),
    timeoutMs: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Non-negative qmd query timeout in milliseconds.",
    }),
  },
  $I.annote("MemoryQmdLimitsConfig", {
    description: "Query-time limits applied to qmd-backed memory search.",
    parseOptions: memoryParseOptions,
  })
) {}

/**
 * qmd-specific memory backend configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class MemoryQmdConfig extends S.Class<MemoryQmdConfig>($I`MemoryQmdConfig`)(
  {
    command: S.OptionFromOptionalKey(MemoryQmdCommand).annotateKey({
      description: "Command string used to invoke the qmd binary or wrapper.",
    }),
    mcporter: S.OptionFromOptionalKey(MemoryQmdMcporterConfig).annotateKey({
      description: "mcporter integration settings for qmd-backed memory search.",
    }),
    searchMode: S.OptionFromOptionalKey(MemoryQmdSearchMode).annotateKey({
      description: "Search mode used for qmd memory queries.",
    }),
    searchTool: S.OptionFromOptionalKey(MemoryQmdSearchTool).annotateKey({
      description: "Tool name used to invoke qmd memory search, trimmed at decode time.",
    }),
    includeDefaultMemory: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the default qmd memory collections should be included alongside explicit paths.",
    }),
    paths: S.OptionFromOptionalKey(MemoryQmdIndexPaths).annotateKey({
      description: "Explicit filesystem collections added to the qmd memory index.",
    }),
    sessions: S.OptionFromOptionalKey(MemoryQmdSessionConfig).annotateKey({
      description: "Session export settings for qmd-backed memory search.",
    }),
    update: S.OptionFromOptionalKey(MemoryQmdUpdateConfig).annotateKey({
      description: "Update scheduling settings for qmd indexing and embedding refreshes.",
    }),
    limits: S.OptionFromOptionalKey(MemoryQmdLimitsConfig).annotateKey({
      description: "Query-time limits applied to qmd-backed memory search.",
    }),
    scope: S.OptionFromOptionalKey(SessionSendPolicyConfig).annotateKey({
      description: "Optional session send-policy rules that scope how qmd memory messages are delivered.",
    }),
  },
  $I.annote("MemoryQmdConfig", {
    description: "qmd-specific memory backend configuration.",
    parseOptions: memoryParseOptions,
  })
) {}

/**
 * Top-level memory configuration for backend selection and qmd settings.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class MemoryConfig extends S.Class<MemoryConfig>($I`MemoryConfig`)(
  {
    backend: S.OptionFromOptionalKey(MemoryBackend).annotateKey({
      description: "Memory backend selected for the current runtime.",
    }),
    citations: S.OptionFromOptionalKey(MemoryCitationsMode).annotateKey({
      description: "Citation mode used when memory snippets are injected into prompts.",
    }),
    qmd: S.OptionFromOptionalKey(MemoryQmdConfig).annotateKey({
      description: "qmd-specific memory backend configuration.",
    }),
  },
  $I.annote("MemoryConfig", {
    description: "Top-level memory configuration for backend selection and qmd settings.",
    parseOptions: memoryParseOptions,
  })
) {}
