import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";
import {
  CodegraphConfig,
  GraphConfig,
  LogConfig,
  McpConfig,
  ParserConfig,
  TargetConfig,
  VizConfig,
  WatcherConfig,
} from "../src/Config/Config.models.ts";

const decodeGraphConfig = S.decodeUnknownSync(GraphConfig);
const decodeLogConfig = S.decodeUnknownSync(LogConfig);
const decodeMcpConfig = S.decodeUnknownSync(McpConfig);
const decodeCodegraphConfig = S.decodeUnknownSync(CodegraphConfig);
const decodeParserConfig = S.decodeUnknownSync(ParserConfig);
const decodeVizConfig = S.decodeUnknownSync(VizConfig);
const decodeWatcherConfig = S.decodeUnknownSync(WatcherConfig);

describe("Config models", () => {
  it("decodes the top-level config with zod-equivalent defaults", () => {
    const config = decodeCodegraphConfig({
      target: {
        root: ".",
      },
    });

    expect(config).toBeInstanceOf(CodegraphConfig);
    expect(config.target.root).toBe(".");
    expect(config.target.include).toEqual(["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.sql", "**/*.cs"]);
    expect(config.target.exclude).toEqual(["**/node_modules/**", "**/dist/**", "**/*.test.*", "**/*.spec.*"]);
    expect(config.graph.driver).toBe("neo4j");
    expect(config.graph.uri).toBe("bolt://localhost:7687");
    expect(config.graph.auth.username).toBe("neo4j");
    expect(config.graph.auth.password).toBe("codegraph_local");
    expect(config.parser.languages).toEqual(["typescript"]);
    expect(config.parser.extractors.routes).toBe(true);
    expect(config.parser.extractors.externalCalls).toBe(true);
    expect(config.parser.extractors.dbOperations).toBe(true);
    expect(config.parser.extractors.envVars).toBe(true);
    expect(config.watcher.strategy).toBe("incremental");
    expect(config.mcp.transport).toBe("stdio");
    expect(config.viz.theme).toBe("dark");
    expect(config.log.level).toBe("info");
    expect(config.log.pretty).toBe(true);
    expect(config.log.file).toBeUndefined();
  });

  it("fills nested object defaults when partial nested objects are provided", () => {
    const config = decodeCodegraphConfig({
      target: {
        root: ".",
      },
      graph: {
        auth: {},
      },
      parser: {
        extractors: {},
      },
    });

    expect(config.graph.driver).toBe("neo4j");
    expect(config.graph.auth.username).toBe("neo4j");
    expect(config.graph.auth.password).toBe("codegraph_local");
    expect(config.parser.languages).toEqual(["typescript"]);
    expect(config.parser.extractors.routes).toBe(true);
    expect(config.parser.extractors.externalCalls).toBe(true);
    expect(config.parser.extractors.dbOperations).toBe(true);
    expect(config.parser.extractors.envVars).toBe(true);
  });

  it("preserves explicit overrides for discriminants and scalar fields", () => {
    const config = decodeCodegraphConfig({
      target: {
        root: "/repo",
        include: ["**/*.md"],
        exclude: ["**/*.tmp"],
      },
      graph: {
        driver: "falkordb",
        uri: "redis://localhost:6379",
        maxConnectionPoolSize: 10,
        connectionTimeoutMs: 6000,
      },
      parser: {
        languages: ["typescript"],
        maxFileSizeBytes: 2000,
        concurrency: 2,
      },
      watcher: {
        strategy: "full",
        enabled: false,
        debounceMs: 100,
        maxQueueSize: 10,
      },
      mcp: {
        transport: "http",
        port: 9999,
      },
      viz: {
        theme: "light",
        port: 4444,
      },
      log: {
        level: "error",
        pretty: false,
        file: "codegraph.log",
      },
    });

    expect(config.target.include).toEqual(["**/*.md"]);
    expect(config.target.exclude).toEqual(["**/*.tmp"]);
    expect(config.graph.driver).toBe("falkordb");
    expect(config.graph.uri).toBe("redis://localhost:6379");
    expect(config.graph.maxConnectionPoolSize).toBe(10);
    expect(config.graph.connectionTimeoutMs).toBe(6000);
    expect(config.watcher.strategy).toBe("full");
    expect(config.mcp.transport).toBe("http");
    expect(config.viz.theme).toBe("light");
    expect(config.log.level).toBe("error");
    expect(config.log.pretty).toBe(false);
    expect(config.log.file).toBe("codegraph.log");
  });

  it("defaults missing discriminants on the discriminated config unions", () => {
    expect(decodeGraphConfig({}).driver).toBe("neo4j");
    expect(decodeWatcherConfig({}).strategy).toBe("incremental");
    expect(decodeMcpConfig({}).transport).toBe("stdio");
    expect(decodeVizConfig({}).theme).toBe("dark");
    expect(decodeLogConfig({}).level).toBe("info");
    expect(decodeParserConfig({}).languages).toEqual(["typescript"]);
  });

  it("rejects non-positive integers for constrained numeric fields", () => {
    expect(() =>
      decodeCodegraphConfig({
        target: {
          root: ".",
        },
        graph: {
          connectionTimeoutMs: 0,
        },
      })
    ).toThrow("Expected a positive integer");

    expect(() =>
      decodeCodegraphConfig({
        target: {
          root: ".",
        },
        watcher: {
          debounceMs: -1,
        },
      })
    ).toThrow("Expected a positive integer");

    expect(() =>
      decodeCodegraphConfig({
        target: {
          root: ".",
        },
        mcp: {
          port: 0,
        },
      })
    ).toThrow("Expected a positive integer");
  });

  it("applies constructor defaults on the top-level class", () => {
    const config = new CodegraphConfig({
      target: new TargetConfig({
        root: ".",
      }),
    });

    expect(config.graph.driver).toBe("neo4j");
    expect(config.graph.uri).toBe("bolt://localhost:7687");
    expect(config.watcher.strategy).toBe("incremental");
    expect(config.mcp.transport).toBe("stdio");
    expect(config.viz.theme).toBe("dark");
    expect(config.log.level).toBe("info");
    expect(config.log.pretty).toBe(true);
    expect(config.log.file).toBeUndefined();
  });
});
