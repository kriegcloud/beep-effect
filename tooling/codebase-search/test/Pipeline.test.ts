import { describe, expect, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import { systemError } from "effect/PlatformError";
import { Bm25WriterMock } from "../src/indexer/Bm25Writer.js";
import { EmbeddingServiceMock } from "../src/indexer/EmbeddingService.js";
import { LanceDbWriterMock } from "../src/indexer/LanceDbWriter.js";
import type { PipelineConfig, PipelineStats } from "../src/indexer/Pipeline.js";
import { Pipeline, PipelineLive, PipelineMock } from "../src/indexer/Pipeline.js";

// ---------------------------------------------------------------------------
// In-memory filesystem helpers (adapted from FileScanner.test.ts)
// ---------------------------------------------------------------------------

/**
 * Creates a mock FileSystem + Path layer backed by in-memory Maps.
 */
const createMemoryFs = (
  initialFiles: ReadonlyArray<readonly [string, string]>
): {
  readonly files: Map<string, string>;
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
      const entries = A.empty<string>();
      for (const filePath of files.keys()) {
        if (filePath.startsWith(`${path}/`)) {
          const remaining = filePath.slice(path.length + 1);
          const firstPart = remaining.split("/")[0];
          if (!entries.includes(firstPart)) {
            entries.push(firstPart);
          }
        }
      }
      for (const dirPath of dirs) {
        if (dirPath.startsWith(`${path}/`)) {
          const remaining = dirPath.slice(path.length + 1);
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
          size: FileSystem.Size(files.get(path)!.length),
          blksize: FileSystem.Size(4096),
          blocks: 1,
        });
      }
      if (dirs.has(path)) {
        return Effect.succeed({
          type: "Directory" as const,
          mtime: new Date(),
          atime: new Date(),
          birthtime: new Date(),
          dev: 0,
          ino: 0,
          mode: 0o755,
          nlink: 2,
          uid: 0,
          gid: 0,
          rdev: 0,
          size: FileSystem.Size(4096),
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
    makeDirectory: (path: string, _options?: {
      readonly recursive?: boolean | undefined;
      readonly mode?: number | undefined;
    }) => {
      dirs.add(path);
      return Effect.void;
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
    format: (obj) =>
      [obj.dir, obj.base].filter(Boolean).join("/"),
    fromFileUrl: (url: URL) => Effect.succeed(url.pathname),
    isAbsolute: (p: string) => p.startsWith("/"),
    normalize: (p: string) => p,
    parse: (p: string) => {
      const lastSlash = p.lastIndexOf("/");
      const base = lastSlash >= 0 ? p.slice(lastSlash + 1) : p;
      const dot = base.lastIndexOf(".");
      const ext = dot >= 0 ? base.slice(dot) : "";
      const name = ext ? base.slice(0, -ext.length) : base;
      const dir = lastSlash >= 0 ? p.slice(0, lastSlash) : "";
      return {
        root: p.startsWith("/") ? "/" : "",
        dir,
        base,
        ext,
        name,
      };
    },
    relative: (_from: string, to: string) => to,
    toFileUrl: (p: string) => Effect.succeed(new URL("file://" + p)),
    toNamespacedPath: (p: string) => p,
    sep: "/",
  });

  return { files, layer: Layer.mergeAll(fsLayer, pathLayer) };
};

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------

/** Minimal valid TypeScript source with an export and JSDoc. */
const SAMPLE_TS_SOURCE = `
/**
 * A simple greeting utility for testing the pipeline.
 * @since 0.0.0
 * @category constants
 */
export const GREETING = "hello" as const;
`;

/** Another source file for multi-file tests. */
const SAMPLE_TS_SOURCE_2 = `
/**
 * A numeric constant used for testing pipeline stats.
 * @since 0.0.0
 * @category constants
 */
export const ANSWER = 42 as const;
`;

const ROOT = "/root";
const INDEX_PATH = "/root/.code-index";

const makeConfig = (overrides: Partial<PipelineConfig> = {}): PipelineConfig => ({
  rootDir: ROOT,
  indexPath: INDEX_PATH,
  mode: "full",
  ...overrides,
});

// ---------------------------------------------------------------------------
// Mock Pipeline tests
// ---------------------------------------------------------------------------

layer(PipelineMock)("Pipeline (Mock)", (it) => {
  it.effect("returns PipelineStats with all zero values", () =>
    Effect.gen(function* () {
      const pipeline = yield* Pipeline;
      const stats: PipelineStats = yield* pipeline.run(makeConfig());
      expect(stats.filesScanned).toBe(0);
      expect(stats.filesChanged).toBe(0);
      expect(stats.symbolsIndexed).toBe(0);
      expect(stats.symbolsRemoved).toBe(0);
      expect(stats.durationMs).toBe(0);
    })
  );

  it.effect("accepts incremental mode config", () =>
    Effect.gen(function* () {
      const pipeline = yield* Pipeline;
      const stats = yield* pipeline.run(makeConfig({ mode: "incremental" }));
      expect(stats.filesScanned).toBe(0);
    })
  );

  it.effect("accepts packageFilter config", () =>
    Effect.gen(function* () {
      const pipeline = yield* Pipeline;
      const stats = yield* pipeline.run(makeConfig({ packageFilter: "@beep/cli" }));
      expect(stats.symbolsIndexed).toBe(0);
    })
  );
});

// ---------------------------------------------------------------------------
// Live Pipeline tests (with mock services + in-memory filesystem)
// ---------------------------------------------------------------------------

/** Combined mock layer providing all three indexer services. */
const MockServicesLayer = Layer.mergeAll(EmbeddingServiceMock, LanceDbWriterMock, Bm25WriterMock);

/** Default empty FS/Path layer so that TestPipelineLayer satisfies FileSystem | Path. */
const defaultFsPathLayer = createMemoryFs([]).layer;

/** PipelineLive backed by mock services, with default FS/Path included. */
const TestPipelineLayer = PipelineLive.pipe(
  Layer.provide(MockServicesLayer),
  Layer.provideMerge(defaultFsPathLayer)
);

layer(TestPipelineLayer)("Pipeline (Live with mocks)", (it) => {
  describe("full mode", () => {
    it.effect("returns correct filesScanned for single file", () =>
      Effect.gen(function* () {
        const { layer: fsLayer } = createMemoryFs([[`${ROOT}/tooling/cli/src/index.ts`, SAMPLE_TS_SOURCE]]);

        const pipeline = yield* Pipeline;
        const stats = yield* pipe(pipeline.run(makeConfig()), Effect.provide(fsLayer));

        expect(stats.filesScanned).toBe(1);
      })
    );

    it.effect("returns correct filesChanged count", () =>
      Effect.gen(function* () {
        const { layer: fsLayer } = createMemoryFs([
          [`${ROOT}/tooling/cli/src/index.ts`, SAMPLE_TS_SOURCE],
          [`${ROOT}/tooling/cli/src/constants.ts`, SAMPLE_TS_SOURCE_2],
        ]);

        const pipeline = yield* Pipeline;
        const stats = yield* pipe(pipeline.run(makeConfig()), Effect.provide(fsLayer));

        // In full mode, all files are "added" and thus "changed"
        expect(stats.filesChanged).toBe(2);
      })
    );

    it.effect("returns symbolsIndexed > 0 for file with exports", () =>
      Effect.gen(function* () {
        const { layer: fsLayer } = createMemoryFs([[`${ROOT}/tooling/cli/src/index.ts`, SAMPLE_TS_SOURCE]]);

        const pipeline = yield* Pipeline;
        const stats = yield* pipe(pipeline.run(makeConfig()), Effect.provide(fsLayer));

        expect(stats.symbolsIndexed).toBeGreaterThan(0);
      })
    );

    it.effect("reports durationMs >= 0", () =>
      Effect.gen(function* () {
        const { layer: fsLayer } = createMemoryFs([[`${ROOT}/tooling/cli/src/index.ts`, SAMPLE_TS_SOURCE]]);

        const pipeline = yield* Pipeline;
        const stats = yield* pipe(pipeline.run(makeConfig()), Effect.provide(fsLayer));

        expect(stats.durationMs).toBeGreaterThanOrEqual(0);
      })
    );

    it.effect("writes index-meta.json to the index path", () =>
      Effect.gen(function* () {
        const memFs = createMemoryFs([[`${ROOT}/tooling/cli/src/index.ts`, SAMPLE_TS_SOURCE]]);

        const pipeline = yield* Pipeline;
        yield* pipe(pipeline.run(makeConfig()), Effect.provide(memFs.layer));

        // Verify the meta file was written
        const hasMetaFile = memFs.files.has(`${INDEX_PATH}/index-meta.json`);
        expect(hasMetaFile).toBe(true);
      })
    );

    it.effect("writes file-hashes.json after pipeline run", () =>
      Effect.gen(function* () {
        const memFs = createMemoryFs([[`${ROOT}/tooling/cli/src/index.ts`, SAMPLE_TS_SOURCE]]);

        const pipeline = yield* Pipeline;
        yield* pipe(pipeline.run(makeConfig()), Effect.provide(memFs.layer));

        const hasHashesFile = memFs.files.has(`${ROOT}/.code-index/file-hashes.json`);
        expect(hasHashesFile).toBe(true);
      })
    );

    it.effect("returns symbolsRemoved = 0 in full mode", () =>
      Effect.gen(function* () {
        const { layer: fsLayer } = createMemoryFs([[`${ROOT}/tooling/cli/src/index.ts`, SAMPLE_TS_SOURCE]]);

        const pipeline = yield* Pipeline;
        const stats = yield* pipe(pipeline.run(makeConfig()), Effect.provide(fsLayer));

        expect(stats.symbolsRemoved).toBe(0);
      })
    );
  });

  describe("incremental mode", () => {
    it.effect("processes only changed files", () =>
      Effect.gen(function* () {
        const crypto = require("node:crypto");
        const unchangedContent = "export const x = 1;";
        const unchangedHash = crypto.createHash("sha256").update(unchangedContent).digest("hex");

        const storedHashes = JSON.stringify([
          {
            filePath: "tooling/cli/src/unchanged.ts",
            contentHash: unchangedHash,
          },
        ]);

        const { layer: fsLayer } = createMemoryFs([
          [`${ROOT}/tooling/cli/src/unchanged.ts`, unchangedContent],
          [`${ROOT}/tooling/cli/src/newfile.ts`, SAMPLE_TS_SOURCE],
          [`${ROOT}/.code-index/file-hashes.json`, storedHashes],
        ]);

        const pipeline = yield* Pipeline;
        const stats = yield* pipe(pipeline.run(makeConfig({ mode: "incremental" })), Effect.provide(fsLayer));

        // 2 files scanned total, but only 1 changed (newfile is added)
        expect(stats.filesScanned).toBe(2);
        expect(stats.filesChanged).toBe(1);
      })
    );

    it.effect("counts deleted files in symbolsRemoved", () =>
      Effect.gen(function* () {
        const storedHashes = JSON.stringify([
          {
            filePath: "tooling/cli/src/index.ts",
            contentHash: "some-old-hash",
          },
          {
            filePath: "tooling/cli/src/deleted.ts",
            contentHash: "deleted-hash",
          },
        ]);

        const { layer: fsLayer } = createMemoryFs([
          [`${ROOT}/tooling/cli/src/index.ts`, SAMPLE_TS_SOURCE],
          [`${ROOT}/.code-index/file-hashes.json`, storedHashes],
        ]);

        const pipeline = yield* Pipeline;
        const stats = yield* pipe(pipeline.run(makeConfig({ mode: "incremental" })), Effect.provide(fsLayer));

        // deleted.ts is no longer on disk, so symbolsRemoved should count it
        expect(stats.symbolsRemoved).toBe(1);
      })
    );
  });

  describe("empty project", () => {
    it.effect("handles project with no TypeScript files gracefully", () =>
      Effect.gen(function* () {
        const { layer: fsLayer } = createMemoryFs([]);

        const pipeline = yield* Pipeline;
        const stats = yield* pipe(pipeline.run(makeConfig()), Effect.provide(fsLayer));

        expect(stats.filesScanned).toBe(0);
        expect(stats.filesChanged).toBe(0);
        expect(stats.symbolsIndexed).toBe(0);
      })
    );
  });

  describe("package filter", () => {
    it.effect("restricts extraction to the specified package", () =>
      Effect.gen(function* () {
        const { layer: fsLayer } = createMemoryFs([
          [`${ROOT}/tooling/cli/src/index.ts`, SAMPLE_TS_SOURCE],
          [`${ROOT}/tooling/utils/src/helpers.ts`, SAMPLE_TS_SOURCE_2],
        ]);

        const pipeline = yield* Pipeline;
        const statsFiltered = yield* pipe(
          pipeline.run(makeConfig({ packageFilter: "@beep/cli" })),
          Effect.provide(fsLayer)
        );

        const statsAll = yield* pipe(pipeline.run(makeConfig()), Effect.provide(fsLayer));

        // Filtered should have fewer or equal symbols
        expect(statsFiltered.symbolsIndexed).toBeLessThanOrEqual(statsAll.symbolsIndexed);
      })
    );
  });
});
