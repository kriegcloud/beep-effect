import { $CodegraphId } from "@beep/identity";
import { SeverityLevel, TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $CodegraphId.create("Domain/Domain.errors");

const CodegraphErrorContext = S.Record(S.String, S.Unknown).annotate(
  $I.annote("CodegraphErrorContext", {
    description: "Generic structured context attached to broad codegraph errors.",
  })
);

class ParseErrorContext extends S.Class<ParseErrorContext>($I`ParseErrorContext`)(
  {
    filePath: S.String,
    line: S.optional(S.Number),
  },
  $I.annote("ParseErrorContext", {
    description: "Context for parse failures including the file path and optional line number.",
  })
) {}

class GraphConnectionErrorContext extends S.Class<GraphConnectionErrorContext>($I`GraphConnectionErrorContext`)(
  {
    uri: S.String,
  },
  $I.annote("GraphConnectionErrorContext", {
    description: "Context for graph connection failures including the graph database URI.",
  })
) {}

class GraphQueryErrorContext extends S.Class<GraphQueryErrorContext>($I`GraphQueryErrorContext`)(
  {
    query: S.optional(S.String),
  },
  $I.annote("GraphQueryErrorContext", {
    description: "Context for graph query failures including the optional query text.",
  })
) {}

class ConfigErrorContext extends S.Class<ConfigErrorContext>($I`ConfigErrorContext`)(
  {
    field: S.optional(S.String),
  },
  $I.annote("ConfigErrorContext", {
    description: "Context for configuration failures including the optional field name.",
  })
) {}

class FileSystemErrorContext extends S.Class<FileSystemErrorContext>($I`FileSystemErrorContext`)(
  {
    path: S.String,
  },
  $I.annote("FileSystemErrorContext", {
    description: "Context for filesystem failures including the affected path.",
  })
) {}

class WatcherErrorContext extends S.Class<WatcherErrorContext>($I`WatcherErrorContext`)(
  {
    path: S.optional(S.String),
  },
  $I.annote("WatcherErrorContext", {
    description: "Context for watcher failures including the optional watched path.",
  })
) {}

class McpErrorContext extends S.Class<McpErrorContext>($I`McpErrorContext`)(
  {
    tool: S.optional(S.String),
  },
  $I.annote("McpErrorContext", {
    description: "Context for MCP failures including the optional tool name.",
  })
) {}

/**
 * Severity assigned to a codegraph domain error.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ErrorSeverity = SeverityLevel.annotate(
  $I.annote("ErrorSeverity", {
    description: "Severity assigned to a codegraph domain error.",
  })
);

/**
 * Severity assigned to a codegraph domain error.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ErrorSeverity = typeof ErrorSeverity.Type;

/**
 * Broad base error for codegraph domain failures.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CodegraphError extends TaggedErrorClass<CodegraphError>($I`CodegraphError`)(
  "CodegraphError",
  {
    message: S.String,
    code: S.String,
    severity: ErrorSeverity,
    recoverable: S.Boolean,
    context: S.optional(CodegraphErrorContext),
  },
  $I.annote("CodegraphError", {
    description: "Broad base error for codegraph domain failures.",
  })
) {
  static readonly make = (
    message: string,
    code: string,
    severity: ErrorSeverity,
    recoverable: boolean,
    context?: Readonly<Record<string, unknown>>
  ) =>
    new CodegraphError({
      message,
      code,
      severity,
      recoverable,
      context,
    });
}

/**
 * Parsing failure while extracting graph information from source input.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ParseError extends TaggedErrorClass<ParseError>($I`ParseError`)(
  "ParseError",
  {
    message: S.String,
    code: S.Literal("PARSE_ERROR"),
    severity: S.Literal("medium"),
    recoverable: S.Literal(true),
    context: ParseErrorContext,
  },
  $I.annote("ParseError", {
    description: "Parsing failure while extracting graph information from source input.",
  })
) {
  static readonly make = (message: string, filePath: string, line?: number) =>
    new ParseError({
      message,
      code: "PARSE_ERROR",
      severity: "medium",
      recoverable: true,
      context: new ParseErrorContext({
        filePath,
        line,
      }),
    });
}

/**
 * Failure while connecting to the backing graph database.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class GraphConnectionError extends TaggedErrorClass<GraphConnectionError>($I`GraphConnectionError`)(
  "GraphConnectionError",
  {
    message: S.String,
    code: S.Literal("GRAPH_CONNECTION_ERROR"),
    severity: S.Literal("critical"),
    recoverable: S.Literal(true),
    context: GraphConnectionErrorContext,
  },
  $I.annote("GraphConnectionError", {
    description: "Failure while connecting to the backing graph database.",
  })
) {
  static readonly make = (message: string, uri: string) =>
    new GraphConnectionError({
      message,
      code: "GRAPH_CONNECTION_ERROR",
      severity: "critical",
      recoverable: true,
      context: new GraphConnectionErrorContext({
        uri,
      }),
    });
}

/**
 * Failure while executing or interpreting a graph query.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class GraphQueryError extends TaggedErrorClass<GraphQueryError>($I`GraphQueryError`)(
  "GraphQueryError",
  {
    message: S.String,
    code: S.Literal("GRAPH_QUERY_ERROR"),
    severity: S.Literal("high"),
    recoverable: S.Literal(false),
    context: GraphQueryErrorContext,
  },
  $I.annote("GraphQueryError", {
    description: "Failure while executing or interpreting a graph query.",
  })
) {
  static readonly make = (message: string, query?: string) =>
    new GraphQueryError({
      message,
      code: "GRAPH_QUERY_ERROR",
      severity: "high",
      recoverable: false,
      context: new GraphQueryErrorContext({
        query,
      }),
    });
}

/**
 * Failure while loading or validating codegraph configuration.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ConfigError extends TaggedErrorClass<ConfigError>($I`ConfigError`)(
  "ConfigError",
  {
    message: S.String,
    code: S.Literal("CONFIG_ERROR"),
    severity: S.Literal("critical"),
    recoverable: S.Literal(false),
    context: ConfigErrorContext,
  },
  $I.annote("ConfigError", {
    description: "Failure while loading or validating codegraph configuration.",
  })
) {
  static readonly make = (message: string, field?: string) =>
    new ConfigError({
      message,
      code: "CONFIG_ERROR",
      severity: "critical",
      recoverable: false,
      context: new ConfigErrorContext({
        field,
      }),
    });
}

/**
 * Filesystem failure encountered while reading or writing project sources.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class FileSystemError extends TaggedErrorClass<FileSystemError>($I`FileSystemError`)(
  "FileSystemError",
  {
    message: S.String,
    code: S.Literal("FS_ERROR"),
    severity: S.Literal("high"),
    recoverable: S.Literal(true),
    context: FileSystemErrorContext,
  },
  $I.annote("FileSystemError", {
    description: "Filesystem failure encountered while reading or writing project sources.",
  })
) {
  static readonly make = (message: string, path: string) =>
    new FileSystemError({
      message,
      code: "FS_ERROR",
      severity: "high",
      recoverable: true,
      context: new FileSystemErrorContext({
        path,
      }),
    });
}

/**
 * Watcher failure encountered while monitoring project changes.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class WatcherError extends TaggedErrorClass<WatcherError>($I`WatcherError`)(
  "WatcherError",
  {
    message: S.String,
    code: S.Literal("WATCHER_ERROR"),
    severity: S.Literal("medium"),
    recoverable: S.Literal(true),
    context: WatcherErrorContext,
  },
  $I.annote("WatcherError", {
    description: "Watcher failure encountered while monitoring project changes.",
  })
) {
  static readonly make = (message: string, path?: string) =>
    new WatcherError({
      message,
      code: "WATCHER_ERROR",
      severity: "medium",
      recoverable: true,
      context: new WatcherErrorContext({
        path,
      }),
    });
}

/**
 * Failure encountered while calling or orchestrating MCP tooling.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class McpError extends TaggedErrorClass<McpError>($I`McpError`)(
  "McpError",
  {
    message: S.String,
    code: S.Literal("MCP_ERROR"),
    severity: S.Literal("high"),
    recoverable: S.Literal(true),
    context: McpErrorContext,
  },
  $I.annote("McpError", {
    description: "Failure encountered while calling or orchestrating MCP tooling.",
  })
) {
  static readonly make = (message: string, tool?: string) =>
    new McpError({
      message,
      code: "MCP_ERROR",
      severity: "high",
      recoverable: true,
      context: new McpErrorContext({
        tool,
      }),
    });
}

/**
 * Union of public codegraph domain errors.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const CodegraphDomainError = S.Union([
  ParseError,
  GraphConnectionError,
  GraphQueryError,
  ConfigError,
  FileSystemError,
  WatcherError,
  McpError,
]).annotate(
  $I.annote("CodegraphDomainError", {
    description: "Union of public codegraph domain errors.",
  })
);

/**
 * Union of public codegraph domain errors.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CodegraphDomainError = typeof CodegraphDomainError.Type;

/**
 * Encoded union of public codegraph domain errors.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CodegraphDomainErrorEncoded = typeof CodegraphDomainError.Encoded;
