import { $CodegraphId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { Option as O, Tuple } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";

const $I = $CodegraphId.create("Config/Config.models");

const PositiveInt = S.Int.check(
  S.isGreaterThan(0, {
    identifier: $I`PositiveIntGreaterThanZeroCheck`,
    title: "Positive Integer",
    description: "An integer greater than zero.",
    message: "Expected a positive integer",
  })
).pipe(
  S.annotate(
    $I.annote("PositiveInt", {
      description: "Positive integer configuration value.",
    })
  )
);

const defaultedString = (value: string) =>
  S.String.pipe(
    S.withConstructorDefault(() => O.some(value)),
    S.withDecodingDefault(() => value)
  );

const defaultedBoolean = (value: boolean) =>
  S.Boolean.pipe(
    S.withConstructorDefault(() => O.some(value)),
    S.withDecodingDefault(() => value)
  );

const defaultedPositiveInt = (value: number) =>
  PositiveInt.pipe(
    S.withConstructorDefault(() => O.some(value)),
    S.withDecodingDefault(() => value)
  );

const defaultedStringArray = (...values: ReadonlyArray<string>) =>
  S.Array(S.String).pipe(
    S.withConstructorDefault(() => O.some(A.fromIterable(values))),
    S.withDecodingDefault(() => A.fromIterable(values))
  );

const defaultedLanguageArray = (...values: ReadonlyArray<Language>) =>
  S.Array(Language).pipe(
    S.withConstructorDefault(() => O.some(A.fromIterable(values))),
    S.withDecodingDefault(() => A.fromIterable(values))
  );

const tagWithDecodingDefault = <Tag extends string>(value: Tag) =>
  S.tag(value).pipe(S.withDecodingDefault(() => value));

class GraphAuthConfig extends S.Class<GraphAuthConfig>($I`GraphAuthConfig`)(
  {
    username: defaultedString("neo4j"),
    password: defaultedString("codegraph_local"),
  },
  $I.annote("GraphAuthConfig", {
    description: "Graph database authentication settings.",
  })
) {}

class ParserExtractorsConfig extends S.Class<ParserExtractorsConfig>($I`ParserExtractorsConfig`)(
  {
    routes: defaultedBoolean(true),
    externalCalls: defaultedBoolean(true),
    dbOperations: defaultedBoolean(true),
    envVars: defaultedBoolean(true),
  },
  $I.annote("ParserExtractorsConfig", {
    description: "Feature toggles for codegraph parser extractors.",
  })
) {}

/**
 * Supported graph database drivers.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const GraphDriver = LiteralKit(["neo4j", "falkordb"] as const).annotate(
  $I.annote("GraphDriver", {
    description: "Supported graph database drivers.",
  })
);

/**
 * Supported graph database drivers.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type GraphDriver = typeof GraphDriver.Type;

/**
 * Supported parser languages.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const Language = LiteralKit(["typescript"] as const).annotate(
  $I.annote("Language", {
    description: "Supported parser languages for codegraph extraction.",
  })
);

/**
 * Supported parser languages.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type Language = typeof Language.Type;

/**
 * Supported watch strategies.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const WatchStrategy = LiteralKit(["full", "incremental"] as const).annotate(
  $I.annote("WatchStrategy", {
    description: "Supported filesystem watch strategies.",
  })
);

/**
 * Supported watch strategies.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type WatchStrategy = typeof WatchStrategy.Type;

/**
 * Supported MCP transports.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const McpTransport = LiteralKit(["stdio", "sse", "http"] as const).annotate(
  $I.annote("McpTransport", {
    description: "Supported MCP server transports.",
  })
);

/**
 * Supported MCP transports.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type McpTransport = typeof McpTransport.Type;

/**
 * Supported visualization themes.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const VizTheme = LiteralKit(["light", "dark"] as const).annotate(
  $I.annote("VizTheme", {
    description: "Supported visualization themes.",
  })
);

/**
 * Supported visualization themes.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type VizTheme = typeof VizTheme.Type;

/**
 * Supported log levels.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const LogLevel = LiteralKit(["trace", "debug", "info", "warn", "error", "fatal"] as const).annotate(
  $I.annote("LogLevel", {
    description: "Supported runtime log levels.",
  })
);

/**
 * Supported log levels.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type LogLevel = typeof LogLevel.Type;

class GraphConfigBase extends S.Class<GraphConfigBase>($I`GraphConfigBase`)(
  {
    uri: defaultedString("bolt://localhost:7687"),
    auth: GraphAuthConfig.pipe(
      S.withConstructorDefault(() => O.some(new GraphAuthConfig({}))),
      S.withDecodingDefault(() => ({}))
    ),
    maxConnectionPoolSize: defaultedPositiveInt(50),
    connectionTimeoutMs: defaultedPositiveInt(5000),
  },
  $I.annote("GraphConfigBase", {
    description: "Shared graph database configuration fields.",
  })
) {}

class GraphConfigNeo4j extends GraphConfigBase.extend<GraphConfigNeo4j>($I`GraphConfigNeo4j`)(
  {
    driver: tagWithDecodingDefault("neo4j"),
  },
  $I.annote("GraphConfigNeo4j", {
    description: "Graph configuration for the Neo4j driver.",
  })
) {}

class GraphConfigFalkordb extends GraphConfigBase.extend<GraphConfigFalkordb>($I`GraphConfigFalkordb`)(
  {
    driver: S.tag("falkordb"),
  },
  $I.annote("GraphConfigFalkordb", {
    description: "Graph configuration for the FalkorDB driver.",
  })
) {}

/**
 * Graph database configuration.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const GraphConfig = GraphDriver.mapMembers(Tuple.evolve([() => GraphConfigNeo4j, () => GraphConfigFalkordb]))
  .annotate(
    $I.annote("GraphConfig", {
      description: "Graph database configuration keyed by driver.",
    })
  )
  .pipe(S.toTaggedUnion("driver"));

/**
 * Graph database configuration.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type GraphConfig = typeof GraphConfig.Type;

/**
 * Repository scan target configuration.
 *
 * @since 0.0.0
 * @category Configuration
 */
export class TargetConfig extends S.Class<TargetConfig>($I`TargetConfig`)(
  {
    root: S.String,
    include: defaultedStringArray("**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.sql", "**/*.cs"),
    exclude: defaultedStringArray("**/node_modules/**", "**/dist/**", "**/*.test.*", "**/*.spec.*"),
  },
  $I.annote("TargetConfig", {
    description: "Repository target roots and file globs for codegraph indexing.",
  })
) {}

/**
 * Parser configuration.
 *
 * @since 0.0.0
 * @category Configuration
 */
export class ParserConfig extends S.Class<ParserConfig>($I`ParserConfig`)(
  {
    languages: defaultedLanguageArray("typescript"),
    extractors: ParserExtractorsConfig.pipe(
      S.withConstructorDefault(() => O.some(new ParserExtractorsConfig({}))),
      S.withDecodingDefault(() => ({}))
    ),
    maxFileSizeBytes: defaultedPositiveInt(1_000_000),
    concurrency: defaultedPositiveInt(4),
  },
  $I.annote("ParserConfig", {
    description: "Parser settings for source languages, extractors, and worker limits.",
  })
) {}

class WatcherConfigBase extends S.Class<WatcherConfigBase>($I`WatcherConfigBase`)(
  {
    enabled: defaultedBoolean(true),
    debounceMs: defaultedPositiveInt(500),
    maxQueueSize: defaultedPositiveInt(1000),
  },
  $I.annote("WatcherConfigBase", {
    description: "Shared file watcher configuration fields.",
  })
) {}

class WatcherConfigIncremental extends WatcherConfigBase.extend<WatcherConfigIncremental>($I`WatcherConfigIncremental`)(
  {
    strategy: tagWithDecodingDefault("incremental"),
  },
  $I.annote("WatcherConfigIncremental", {
    description: "Watcher configuration using incremental updates.",
  })
) {}

class WatcherConfigFull extends WatcherConfigBase.extend<WatcherConfigFull>($I`WatcherConfigFull`)(
  {
    strategy: S.tag("full"),
  },
  $I.annote("WatcherConfigFull", {
    description: "Watcher configuration using full rebuilds.",
  })
) {}

/**
 * File watcher configuration.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const WatcherConfig = WatchStrategy.mapMembers(
  Tuple.evolve([() => WatcherConfigFull, () => WatcherConfigIncremental])
)
  .annotate(
    $I.annote("WatcherConfig", {
      description: "Filesystem watcher configuration keyed by strategy.",
    })
  )
  .pipe(S.toTaggedUnion("strategy"));

/**
 * File watcher configuration.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type WatcherConfig = typeof WatcherConfig.Type;

class McpConfigBase extends S.Class<McpConfigBase>($I`McpConfigBase`)(
  {
    port: defaultedPositiveInt(3334),
  },
  $I.annote("McpConfigBase", {
    description: "Shared MCP server configuration fields.",
  })
) {}

class McpConfigStdio extends McpConfigBase.extend<McpConfigStdio>($I`McpConfigStdio`)(
  {
    transport: tagWithDecodingDefault("stdio"),
  },
  $I.annote("McpConfigStdio", {
    description: "MCP configuration using stdio transport.",
  })
) {}

class McpConfigSse extends McpConfigBase.extend<McpConfigSse>($I`McpConfigSse`)(
  {
    transport: S.tag("sse"),
  },
  $I.annote("McpConfigSse", {
    description: "MCP configuration using server-sent events transport.",
  })
) {}

class McpConfigHttp extends McpConfigBase.extend<McpConfigHttp>($I`McpConfigHttp`)(
  {
    transport: S.tag("http"),
  },
  $I.annote("McpConfigHttp", {
    description: "MCP configuration using HTTP transport.",
  })
) {}

/**
 * MCP server configuration.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const McpConfig = McpTransport.mapMembers(
  Tuple.evolve([() => McpConfigStdio, () => McpConfigSse, () => McpConfigHttp])
)
  .annotate(
    $I.annote("McpConfig", {
      description: "MCP server configuration keyed by transport.",
    })
  )
  .pipe(S.toTaggedUnion("transport"));

/**
 * MCP server configuration.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type McpConfig = typeof McpConfig.Type;

class VizConfigBase extends S.Class<VizConfigBase>($I`VizConfigBase`)(
  {
    port: defaultedPositiveInt(3333),
  },
  $I.annote("VizConfigBase", {
    description: "Shared visualization configuration fields.",
  })
) {}

class VizConfigLight extends VizConfigBase.extend<VizConfigLight>($I`VizConfigLight`)(
  {
    theme: S.tag("light"),
  },
  $I.annote("VizConfigLight", {
    description: "Visualization configuration using the light theme.",
  })
) {}

class VizConfigDark extends VizConfigBase.extend<VizConfigDark>($I`VizConfigDark`)(
  {
    theme: tagWithDecodingDefault("dark"),
  },
  $I.annote("VizConfigDark", {
    description: "Visualization configuration using the dark theme.",
  })
) {}

/**
 * Visualization configuration.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const VizConfig = VizTheme.mapMembers(Tuple.evolve([() => VizConfigLight, () => VizConfigDark]))
  .annotate(
    $I.annote("VizConfig", {
      description: "Visualization configuration keyed by theme.",
    })
  )
  .pipe(S.toTaggedUnion("theme"));

/**
 * Visualization configuration.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type VizConfig = typeof VizConfig.Type;

class LogConfigBase extends S.Class<LogConfigBase>($I`LogConfigBase`)(
  {
    pretty: defaultedBoolean(true),
    file: S.optional(S.String),
  },
  $I.annote("LogConfigBase", {
    description: "Shared log configuration fields.",
  })
) {}

class LogConfigTrace extends LogConfigBase.extend<LogConfigTrace>($I`LogConfigTrace`)(
  {
    level: S.tag("trace"),
  },
  $I.annote("LogConfigTrace", {
    description: "Log configuration at trace level.",
  })
) {}

class LogConfigDebug extends LogConfigBase.extend<LogConfigDebug>($I`LogConfigDebug`)(
  {
    level: S.tag("debug"),
  },
  $I.annote("LogConfigDebug", {
    description: "Log configuration at debug level.",
  })
) {}

class LogConfigInfo extends LogConfigBase.extend<LogConfigInfo>($I`LogConfigInfo`)(
  {
    level: tagWithDecodingDefault("info"),
  },
  $I.annote("LogConfigInfo", {
    description: "Log configuration at info level.",
  })
) {}

class LogConfigWarn extends LogConfigBase.extend<LogConfigWarn>($I`LogConfigWarn`)(
  {
    level: S.tag("warn"),
  },
  $I.annote("LogConfigWarn", {
    description: "Log configuration at warn level.",
  })
) {}

class LogConfigError extends LogConfigBase.extend<LogConfigError>($I`LogConfigError`)(
  {
    level: S.tag("error"),
  },
  $I.annote("LogConfigError", {
    description: "Log configuration at error level.",
  })
) {}

class LogConfigFatal extends LogConfigBase.extend<LogConfigFatal>($I`LogConfigFatal`)(
  {
    level: S.tag("fatal"),
  },
  $I.annote("LogConfigFatal", {
    description: "Log configuration at fatal level.",
  })
) {}

/**
 * Logging configuration.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const LogConfig = LogLevel.mapMembers(
  Tuple.evolve([
    () => LogConfigTrace,
    () => LogConfigDebug,
    () => LogConfigInfo,
    () => LogConfigWarn,
    () => LogConfigError,
    () => LogConfigFatal,
  ])
)
  .annotate(
    $I.annote("LogConfig", {
      description: "Runtime logging configuration keyed by log level.",
    })
  )
  .pipe(S.toTaggedUnion("level"));

/**
 * Logging configuration.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type LogConfig = typeof LogConfig.Type;

/**
 * Top-level codegraph configuration.
 *
 * @since 0.0.0
 * @category Configuration
 */
export class CodegraphConfig extends S.Class<CodegraphConfig>($I`CodegraphConfig`)(
  {
    target: TargetConfig,
    graph: GraphConfig.pipe(
      S.withConstructorDefault(() => O.some(new GraphConfigNeo4j({}))),
      S.withDecodingDefault(() => ({}))
    ),
    parser: ParserConfig.pipe(
      S.withConstructorDefault(() => O.some(new ParserConfig({}))),
      S.withDecodingDefault(() => ({}))
    ),
    watcher: WatcherConfig.pipe(
      S.withConstructorDefault(() => O.some(new WatcherConfigIncremental({}))),
      S.withDecodingDefault(() => ({}))
    ),
    mcp: McpConfig.pipe(
      S.withConstructorDefault(() => O.some(new McpConfigStdio({}))),
      S.withDecodingDefault(() => ({}))
    ),
    viz: VizConfig.pipe(
      S.withConstructorDefault(() => O.some(new VizConfigDark({}))),
      S.withDecodingDefault(() => ({}))
    ),
    log: LogConfig.pipe(
      S.withConstructorDefault(() => O.some(new LogConfigInfo({}))),
      S.withDecodingDefault(() => ({}))
    ),
  },
  $I.annote("CodegraphConfig", {
    description: "Top-level runtime configuration for the codegraph tooling package.",
  })
) {}

/**
 * Encoded input accepted by {@link CodegraphConfig}.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type CodegraphConfigInput = typeof CodegraphConfig.Encoded;
