import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import { systemError } from "effect/PlatformError";
import * as S from "effect/Schema";
import * as Str from "effect/String";

import type { IndexMeta, PackageStat } from "../../src/hooks/SessionStart.js";
import { generateSessionOverview, STALENESS_THRESHOLD_MS, sessionStartHook } from "../../src/hooks/SessionStart.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeValidMeta = (overrides: Partial<IndexMeta> = {}): IndexMeta => ({
  version: 1 as const,
  lastFullIndex: "2026-02-19T15:00:00.000Z",
  lastIncrementalIndex: new Date().toISOString(),
  totalSymbols: 127,
  totalFiles: 45,
  embeddingModel: "nomic-ai/CodeRankEmbed",
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

// ---------------------------------------------------------------------------
// In-memory filesystem
// ---------------------------------------------------------------------------

interface MemoryFsState {
  readonly files: Map<string, string>;
  readonly dirs: Set<string>;
}

const createMemoryFs = (
  initialFiles: ReadonlyArray<readonly [string, string]>
): {
  readonly state: MemoryFsState;
  readonly layer: Layer.Layer<FileSystem.FileSystem | Path.Path>;
} => {
  const files = new Map<string, string>();
  const dirs = new Set<string>();

  pipe(
    initialFiles,
    A.forEach(([filePath, content]) => {
      files.set(filePath, content);
      const parts = filePath.split("/");
      for (let i = 1; i < parts.length; i++) {
        dirs.add(parts.slice(0, i).join("/"));
      }
    })
  );

  const state: MemoryFsState = { files, dirs };

  const fsLayer = FileSystem.layerNoop({
    exists: (path: string) => Effect.succeed(files.has(path) || dirs.has(path)),
    readFileString: (path: string) => {
      const content = files.get(path);
      if (content !== undefined) {
        return Effect.succeed(content);
      }
      return Effect.fail(
        systemError({
          _tag: "NotFound",
          module: "FileSystem",
          method: "readFileString",
          pathOrDescriptor: path,
          description: `File not found: ${path}`,
        })
      );
    },
    writeFileString: (path: string, content: string) => {
      files.set(path, content);
      return Effect.void;
    },
    readDirectory: (path: string) => {
      const entries: Array<string> = [];
      for (const filePath of files.keys()) {
        if (filePath.startsWith(`${path}/`)) {
          const remaining = filePath.slice(path.length + 1);
          const firstPart = remaining.split("/")[0];
          if (!entries.includes(firstPart)) {
            entries.push(firstPart);
          }
        }
      }
      return Effect.succeed(entries);
    },
    stat: (path: string) => {
      if (files.has(path)) {
        return Effect.succeed({
          type: "File" as const,
          mtime: new Date(),
          atime: new Date(),
          birthtime: new Date(),
          dev: 0,
          ino: 0,
          mode: 0o644,
          nlink: 1,
          uid: 0,
          gid: 0,
          rdev: 0,
          size: FileSystem.Size(100),
          blksize: FileSystem.Size(4096),
          blocks: 1,
        });
      }
      return Effect.fail(
        systemError({
          _tag: "NotFound",
          module: "FileSystem",
          method: "stat",
          pathOrDescriptor: path,
          description: `Not found: ${path}`,
        })
      );
    },
  });

  const pathLayer = Layer.mock(Path.Path)({
    [Path.TypeId]: Path.TypeId,
    join: (...parts: ReadonlyArray<string>) => parts.join("/"),
    resolve: (...parts: ReadonlyArray<string>) => parts.join("/"),
    dirname: (p: string) => {
      const lastSlash = p.lastIndexOf("/");
      return lastSlash >= 0 ? p.slice(0, lastSlash) : ".";
    },
    basename: (p: string) => {
      const lastSlash = p.lastIndexOf("/");
      return lastSlash >= 0 ? p.slice(lastSlash + 1) : p;
    },
    extname: (p: string) => {
      const dot = p.lastIndexOf(".");
      return dot >= 0 ? p.slice(dot) : "";
    },
    format: (obj) => [obj.dir, obj.base].filter(Boolean).join("/"),
    fromFileUrl: (url) => Effect.succeed(url.pathname),
    isAbsolute: (p) => p.startsWith("/"),
    normalize: (p) => p,
    parse: (p) => {
      const lastSlash = p.lastIndexOf("/");
      const base = lastSlash >= 0 ? p.slice(lastSlash + 1) : p;
      const dot = base.lastIndexOf(".");
      const ext = dot >= 0 ? base.slice(dot) : "";
      const name = ext ? base.slice(0, -ext.length) : base;
      const dir = lastSlash >= 0 ? p.slice(0, lastSlash) : "";
      return { root: p.startsWith("/") ? "/" : "", dir, base, ext, name };
    },
    relative: (_from, to) => to,
    toFileUrl: (p) => Effect.succeed(new URL(`file://${p}`)),
    toNamespacedPath: (p) => p,
    sep: "/",
  });

  const layer = Layer.mergeAll(fsLayer, pathLayer);

  return { state, layer };
};

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
      expect(result).toContain("nomic-ai/CodeRankEmbed");
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

    it.effect("returns 'no index' message when meta file contains invalid JSON", () =>
      runWithFs(
        [["/project/.code-index/index-meta.json", "not valid json"]],
        Effect.gen(function* () {
          const result = yield* sessionStartHook("/project");
          expect(result).toContain("No index found");
        })
      )
    );

    it.effect("returns 'no index' message when meta file contains wrong schema", () =>
      runWithFs(
        [["/project/.code-index/index-meta.json", '{"version": 2, "wrong": true}']],
        Effect.gen(function* () {
          const result = yield* sessionStartHook("/project");
          expect(result).toContain("No index found");
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
