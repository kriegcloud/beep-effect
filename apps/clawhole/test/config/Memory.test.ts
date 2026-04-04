import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  MemoryConfig,
  MemoryQmdConfig,
  MemoryQmdIndexPath,
  MemoryQmdLimitsConfig,
  MemoryQmdMcporterConfig,
  MemoryQmdSessionConfig,
  MemoryQmdUpdateConfig,
} from "../../src/config/Memory.ts";

const decodeMemoryConfig = S.decodeUnknownSync(MemoryConfig);
const strictParseOptions = { onExcessProperty: "error" } as const;

describe("MemoryConfig", () => {
  it("decodes a minimal memory config", () => {
    const config = decodeMemoryConfig({});

    expect(config).toBeInstanceOf(MemoryConfig);
    expect(config.backend).toEqual(O.none());
    expect(config.citations).toEqual(O.none());
    expect(config.qmd).toEqual(O.none());
  });

  it("decodes populated qmd memory config", () => {
    const config = decodeMemoryConfig(
      {
        backend: "qmd",
        citations: "on",
        qmd: {
          command: "qmd --profile local",
          mcporter: {
            enabled: true,
            serverName: "qmd",
            startDaemon: false,
          },
          searchMode: "vsearch",
          searchTool: "  search_memory  ",
          includeDefaultMemory: true,
          paths: [
            {
              path: "./memory",
              name: "workspace-memory",
              pattern: "**/*.md",
            },
          ],
          sessions: {
            enabled: true,
            exportDir: "./.openclaw/memory",
            retentionDays: 30,
          },
          update: {
            interval: "5m",
            debounceMs: 250,
            onBoot: true,
            waitForBootSync: false,
            embedInterval: "30m",
            commandTimeoutMs: 1_000,
            updateTimeoutMs: 2_000,
            embedTimeoutMs: 3_000,
          },
          limits: {
            maxResults: 10,
            maxSnippetChars: 500,
            maxInjectedChars: 2_000,
            timeoutMs: 0,
          },
          scope: {
            default: "allow",
            rules: [
              {
                action: "deny",
                match: {
                  channel: "ops",
                  chatType: "channel",
                },
              },
            ],
          },
        },
      },
      strictParseOptions
    );

    expect(config.backend).toEqual(O.some("qmd"));
    expect(config.citations).toEqual(O.some("on"));
    expect(O.isSome(config.qmd)).toBe(true);

    if (O.isSome(config.qmd)) {
      const qmd = config.qmd.value;

      expect(qmd).toBeInstanceOf(MemoryQmdConfig);
      expect(qmd.command).toEqual(O.some("qmd --profile local"));
      expect(qmd.searchMode).toEqual(O.some("vsearch"));
      expect(qmd.searchTool).toEqual(O.some("search_memory"));
      expect(qmd.includeDefaultMemory).toEqual(O.some(true));

      expect(O.isSome(qmd.mcporter)).toBe(true);
      if (O.isSome(qmd.mcporter)) {
        expect(qmd.mcporter.value).toBeInstanceOf(MemoryQmdMcporterConfig);
        expect(qmd.mcporter.value.enabled).toEqual(O.some(true));
        expect(qmd.mcporter.value.serverName).toEqual(O.some("qmd"));
        expect(qmd.mcporter.value.startDaemon).toEqual(O.some(false));
      }

      expect(O.isSome(qmd.paths)).toBe(true);
      if (O.isSome(qmd.paths)) {
        expect(qmd.paths.value[0]).toBeInstanceOf(MemoryQmdIndexPath);
        expect(qmd.paths.value[0]?.path).toBe("./memory");
        expect(qmd.paths.value[0]?.name).toEqual(O.some("workspace-memory"));
        expect(qmd.paths.value[0]?.pattern).toEqual(O.some("**/*.md"));
      }

      expect(O.isSome(qmd.sessions)).toBe(true);
      if (O.isSome(qmd.sessions)) {
        expect(qmd.sessions.value).toBeInstanceOf(MemoryQmdSessionConfig);
        expect(qmd.sessions.value.enabled).toEqual(O.some(true));
        expect(qmd.sessions.value.exportDir).toEqual(O.some("./.openclaw/memory"));
        expect(qmd.sessions.value.retentionDays).toEqual(O.some(30));
      }

      expect(O.isSome(qmd.update)).toBe(true);
      if (O.isSome(qmd.update)) {
        expect(qmd.update.value).toBeInstanceOf(MemoryQmdUpdateConfig);
        expect(qmd.update.value.interval).toEqual(O.some("5m"));
        expect(qmd.update.value.debounceMs).toEqual(O.some(250));
        expect(qmd.update.value.onBoot).toEqual(O.some(true));
        expect(qmd.update.value.waitForBootSync).toEqual(O.some(false));
        expect(qmd.update.value.embedInterval).toEqual(O.some("30m"));
        expect(qmd.update.value.commandTimeoutMs).toEqual(O.some(1_000));
        expect(qmd.update.value.updateTimeoutMs).toEqual(O.some(2_000));
        expect(qmd.update.value.embedTimeoutMs).toEqual(O.some(3_000));
      }

      expect(O.isSome(qmd.limits)).toBe(true);
      if (O.isSome(qmd.limits)) {
        expect(qmd.limits.value).toBeInstanceOf(MemoryQmdLimitsConfig);
        expect(qmd.limits.value.maxResults).toEqual(O.some(10));
        expect(qmd.limits.value.maxSnippetChars).toEqual(O.some(500));
        expect(qmd.limits.value.maxInjectedChars).toEqual(O.some(2_000));
        expect(qmd.limits.value.timeoutMs).toEqual(O.some(0));
      }

      expect(O.isSome(qmd.scope)).toBe(true);
      if (O.isSome(qmd.scope)) {
        expect(qmd.scope.value.default).toEqual(O.some("allow"));
      }
    }
  });

  it("rejects invalid literal values", () => {
    expect(() =>
      decodeMemoryConfig(
        {
          backend: "sqlite",
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeMemoryConfig(
        {
          qmd: {
            searchMode: "vector",
          },
        },
        strictParseOptions
      )
    ).toThrow();
  });

  it("rejects empty search tool names after trimming", () => {
    expect(() =>
      decodeMemoryConfig(
        {
          qmd: {
            searchTool: "   ",
          },
        },
        strictParseOptions
      )
    ).toThrow();
  });

  it("rejects invalid non-negative integer fields", () => {
    expect(() =>
      decodeMemoryConfig(
        {
          qmd: {
            sessions: {
              retentionDays: -1,
            },
          },
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeMemoryConfig(
        {
          qmd: {
            update: {
              debounceMs: 1.5,
            },
          },
        },
        strictParseOptions
      )
    ).toThrow();
  });

  it("rejects non-positive qmd limits", () => {
    expect(() =>
      decodeMemoryConfig(
        {
          qmd: {
            limits: {
              maxResults: 0,
            },
          },
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeMemoryConfig(
        {
          qmd: {
            limits: {
              maxSnippetChars: -2,
            },
          },
        },
        strictParseOptions
      )
    ).toThrow();
  });

  it("rejects excess properties", () => {
    expect(() =>
      decodeMemoryConfig(
        {
          backend: "builtin",
          extra: true,
        },
        strictParseOptions
      )
    ).toThrow();

    expect(() =>
      decodeMemoryConfig(
        {
          qmd: {
            update: {
              interval: "5m",
              extra: true,
            },
          },
        },
        strictParseOptions
      )
    ).toThrow();
  });
});
