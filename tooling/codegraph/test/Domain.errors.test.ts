import {
  CodegraphDomainError,
  CodegraphError,
  ConfigError,
  ErrorSeverity,
  FileSystemError,
  GraphConnectionError,
  GraphQueryError,
  McpError,
  ParseError,
  WatcherError,
} from "@beep/codegraph/Domain/Domain.errors";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

const decodeCodegraphDomainError = S.decodeUnknownSync(CodegraphDomainError);
const decodeCodegraphError = S.decodeUnknownSync(CodegraphError);
const decodeErrorSeverity = S.decodeUnknownSync(ErrorSeverity);

describe("Domain.errors", () => {
  it("decodes the error severity literal domain", () => {
    expect(decodeErrorSeverity("critical")).toBe("critical");
  });

  it("decodes the broad codegraph error with and without context", () => {
    const withContext = decodeCodegraphError({
      _tag: "CodegraphError",
      message: "boom",
      code: "GENERIC",
      severity: "high",
      recoverable: false,
      context: {
        filePath: "src/index.ts",
      },
    });

    const withoutContext = CodegraphError.make("boom", "GENERIC", "medium", true);

    expect(withContext).toBeInstanceOf(CodegraphError);
    expect(withContext.context).toEqual({ filePath: "src/index.ts" });
    expect(withoutContext).toBeInstanceOf(CodegraphError);
    expect(withoutContext.context).toBeUndefined();
  });

  it("creates parse errors with fixed metadata and typed context", () => {
    const error = ParseError.make("failed to parse", "src/app.ts", 17);

    expect(error).toBeInstanceOf(ParseError);
    expect(error._tag).toBe("ParseError");
    expect(error.code).toBe("PARSE_ERROR");
    expect(error.severity).toBe("medium");
    expect(error.recoverable).toBe(true);
    expect(error.context.filePath).toBe("src/app.ts");
    expect(error.context.line).toBe(17);
  });

  it("creates graph connection errors with fixed metadata and typed context", () => {
    const error = GraphConnectionError.make("failed to connect", "bolt://localhost:7687");

    expect(error).toBeInstanceOf(GraphConnectionError);
    expect(error.code).toBe("GRAPH_CONNECTION_ERROR");
    expect(error.severity).toBe("critical");
    expect(error.recoverable).toBe(true);
    expect(error.context.uri).toBe("bolt://localhost:7687");
  });

  it("creates graph query errors with optional query context", () => {
    const error = GraphQueryError.make("query failed");

    expect(error).toBeInstanceOf(GraphQueryError);
    expect(error.code).toBe("GRAPH_QUERY_ERROR");
    expect(error.severity).toBe("high");
    expect(error.recoverable).toBe(false);
    expect(error.context.query).toBeUndefined();
  });

  it("creates config errors with optional field context", () => {
    const error = ConfigError.make("invalid config", "graph.uri");

    expect(error).toBeInstanceOf(ConfigError);
    expect(error.code).toBe("CONFIG_ERROR");
    expect(error.severity).toBe("critical");
    expect(error.recoverable).toBe(false);
    expect(error.context.field).toBe("graph.uri");
  });

  it("creates filesystem errors with fixed metadata and typed context", () => {
    const error = FileSystemError.make("missing file", "/tmp/input.ts");

    expect(error).toBeInstanceOf(FileSystemError);
    expect(error.code).toBe("FS_ERROR");
    expect(error.severity).toBe("high");
    expect(error.recoverable).toBe(true);
    expect(error.context.path).toBe("/tmp/input.ts");
  });

  it("creates watcher errors with optional path context", () => {
    const error = WatcherError.make("watcher stalled");

    expect(error).toBeInstanceOf(WatcherError);
    expect(error.code).toBe("WATCHER_ERROR");
    expect(error.severity).toBe("medium");
    expect(error.recoverable).toBe(true);
    expect(error.context.path).toBeUndefined();
  });

  it("creates MCP errors with optional tool context", () => {
    const error = McpError.make("tool failed", "resolveSymbol");

    expect(error).toBeInstanceOf(McpError);
    expect(error.code).toBe("MCP_ERROR");
    expect(error.severity).toBe("high");
    expect(error.recoverable).toBe(true);
    expect(error.context.tool).toBe("resolveSymbol");
  });

  it("decodes the concrete union to the specific tagged error classes", () => {
    const cases = [
      {
        input: ParseError.make("failed to parse", "src/parser.ts"),
        expectedClass: ParseError,
        expectedTag: "ParseError",
      },
      {
        input: GraphConnectionError.make("failed to connect", "redis://invalid"),
        expectedClass: GraphConnectionError,
        expectedTag: "GraphConnectionError",
      },
      {
        input: GraphQueryError.make("query failed", "MATCH (n) RETURN n"),
        expectedClass: GraphQueryError,
        expectedTag: "GraphQueryError",
      },
      {
        input: ConfigError.make("bad config", "parser.languages"),
        expectedClass: ConfigError,
        expectedTag: "ConfigError",
      },
      {
        input: FileSystemError.make("missing file", "src/index.ts"),
        expectedClass: FileSystemError,
        expectedTag: "FileSystemError",
      },
      {
        input: WatcherError.make("watcher failed", "src"),
        expectedClass: WatcherError,
        expectedTag: "WatcherError",
      },
      {
        input: McpError.make("mcp failed", "graph.search"),
        expectedClass: McpError,
        expectedTag: "McpError",
      },
    ] as const;

    for (const testCase of cases) {
      const decoded = decodeCodegraphDomainError(testCase.input);

      expect(decoded).toBeInstanceOf(testCase.expectedClass);
      expect(decoded._tag).toBe(testCase.expectedTag);
    }
  });
});
