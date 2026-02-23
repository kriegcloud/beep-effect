import { generateSessionOverview, STALENESS_THRESHOLD_MS, sessionStartHook } from "@beep/codebase-search";
import type { IndexMeta, PackageStat } from "@beep/codebase-search/hooks/SessionStart";
import { describe, expect, it } from "@effect/vitest";
import { Effect, type FileSystem, type Path } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { createMemoryFs } from "./memory-fs.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeValidMeta = (overrides: Partial<IndexMeta> = {}): IndexMeta => ({
  version: 1 as const,
  lastFullIndex: "2026-02-19T15:00:00.000Z",
  lastIncrementalIndex: new Date().toISOString(),
  totalSymbols: 127,
  totalFiles: 45,
  embeddingModel: "nomic-ai/nomic-embed-text-v1.5",
  embeddingDimensions: 768 as const,
  ...overrides,
});

const makeStaleMeta = (): IndexMeta =>
  makeValidMeta({
    lastIncrementalIndex: new Date(Date.now() - STALENESS_THRESHOLD_MS - 60_000).toISOString(),
  });

/**
 * Encodes an IndexMeta value to a JSON string for writing to the mock FS.
 */
const IndexMetaFromJson = S.fromJsonString(
  S.Struct({
    version: S.Literal(1),
    lastFullIndex: S.String,
    lastIncrementalIndex: S.String,
    totalSymbols: S.Number,
    totalFiles: S.Number,
    embeddingModel: S.String,
    embeddingDimensions: S.Literal(768),
  })
);
const encodeMetaToJson = (meta: IndexMeta): string => S.encodeUnknownSync(IndexMetaFromJson)(meta);

const runWithFs = <A, E>(
  initialFiles: ReadonlyArray<readonly [string, string]>,
  effect: Effect.Effect<A, E, FileSystem.FileSystem | Path.Path>
): Effect.Effect<A, E> => {
  const { layer } = createMemoryFs(initialFiles);
  return Effect.provide(effect, layer);
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SessionStart", () => {
  // -------------------------------------------------------------------------
  // generateSessionOverview — pure function tests
  // -------------------------------------------------------------------------

  describe("generateSessionOverview", () => {
    it("returns 'no index' message when indexMeta is null", () => {
      const result = generateSessionOverview(null, A.empty<PackageStat>(), false);
      expect(result).toContain("No index found");
      expect(result).toContain("reindex");
      expect(result).toContain("search_codebase");
    });

    it("returns formatted overview when indexMeta is valid", () => {
      const meta = makeValidMeta();
      const result = generateSessionOverview(meta, A.empty<PackageStat>(), false);
      expect(result).toContain("## Codebase Index Overview");
      expect(result).toContain("**127 symbols**");
      expect(result).toContain("**45 files**");
      expect(result).toContain("nomic-ai/nomic-embed-text-v1.5");
      expect(result).toContain("search_codebase");
      expect(result).toContain("find_related");
      expect(result).toContain("browse_symbols");
      expect(result).toContain("reindex");
    });

    it("includes staleness warning when isStale is true", () => {
      const meta = makeValidMeta();
      const result = generateSessionOverview(meta, A.empty<PackageStat>(), true);
      expect(result).toContain("over 1 hour old");
      expect(result).toContain("reindex");
    });

    it("does not include staleness warning when isStale is false", () => {
      const meta = makeValidMeta();
      const result = generateSessionOverview(meta, A.empty<PackageStat>(), false);
      expect(result).not.toContain("over 1 hour old");
    });

    it("fits within ~400 token budget (rough char count < 1600)", () => {
      const meta = makeValidMeta();
      const result = generateSessionOverview(meta, A.empty<PackageStat>(), true);
      expect(Str.length(result)).toBeLessThan(1600);
    });

    it("includes last indexed timestamp", () => {
      const meta = makeValidMeta({ lastIncrementalIndex: "2026-02-19T15:30:00.000Z" });
      const result = generateSessionOverview(meta, A.empty<PackageStat>(), false);
      expect(result).toContain("Last indexed: 2026-02-19T15:30:00.000Z");
    });
  });

  // -------------------------------------------------------------------------
  // sessionStartHook — Effect-based tests
  // -------------------------------------------------------------------------

  describe("sessionStartHook", () => {
    it.effect("returns 'no index' message when directory does not exist", () =>
      runWithFs(
        [],
        Effect.gen(function* () {
          const result = yield* sessionStartHook("/nonexistent/project");
          expect(result).toContain("No index found");
        })
      )
    );

    it.effect("returns 'no index' message when meta file does not exist", () =>
      runWithFs(
        [["/project/.code-index/some-other-file.json", "{}"]],
        Effect.gen(function* () {
          const result = yield* sessionStartHook("/project");
          expect(result).toContain("No index found");
        })
      )
    );

    it.effect("returns formatted overview when valid index-meta.json exists", () => {
      const meta = makeValidMeta();
      const metaJson = encodeMetaToJson(meta);
      return runWithFs(
        [["/project/.code-index/index-meta.json", metaJson]],
        Effect.gen(function* () {
          const result = yield* sessionStartHook("/project");
          expect(result).toContain("## Codebase Index Overview");
          expect(result).toContain("**127 symbols**");
          expect(result).toContain("**45 files**");
        })
      );
    });

    it.effect("reads index metadata from custom indexPath", () => {
      const meta = makeValidMeta();
      const metaJson = encodeMetaToJson(meta);
      return runWithFs(
        [["/project/.custom-index/index-meta.json", metaJson]],
        Effect.gen(function* () {
          const result = yield* sessionStartHook("/project", ".custom-index");
          expect(result).toContain("## Codebase Index Overview");
          expect(result).toContain("**127 symbols**");
        })
      );
    });

    it.effect("returns staleness warning for old index", () => {
      const meta = makeStaleMeta();
      const metaJson = encodeMetaToJson(meta);
      return runWithFs(
        [["/project/.code-index/index-meta.json", metaJson]],
        Effect.gen(function* () {
          const result = yield* sessionStartHook("/project");
          expect(result).toContain("over 1 hour old");
        })
      );
    });

    it.effect("returns empty output when meta file contains invalid JSON", () =>
      runWithFs(
        [["/project/.code-index/index-meta.json", "not valid json"]],
        Effect.gen(function* () {
          const result = yield* sessionStartHook("/project");
          expect(result).toBe("");
        })
      )
    );

    it.effect("returns empty output when meta file contains wrong schema", () =>
      runWithFs(
        [["/project/.code-index/index-meta.json", '{"version": 2, "wrong": true}']],
        Effect.gen(function* () {
          const result = yield* sessionStartHook("/project");
          expect(result).toBe("");
        })
      )
    );

    it.effect("never throws — always returns a string", () =>
      runWithFs(
        [["/project/.code-index/index-meta.json", ""]],
        Effect.gen(function* () {
          const result = yield* sessionStartHook("/project");
          expect(typeof result).toBe("string");
        })
      )
    );

    it.effect("does not include staleness warning for fresh index", () => {
      const meta = makeValidMeta();
      const metaJson = encodeMetaToJson(meta);
      return runWithFs(
        [["/project/.code-index/index-meta.json", metaJson]],
        Effect.gen(function* () {
          const result = yield* sessionStartHook("/project");
          expect(result).not.toContain("over 1 hour old");
        })
      );
    });
  });
});
