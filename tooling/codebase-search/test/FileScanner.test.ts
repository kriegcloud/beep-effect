import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import { systemError } from "effect/PlatformError";
import * as S from "effect/Schema";
import type { FileHash, ScanResult } from "../src/extractor/FileScanner.js";
import { FILE_HASHES_PATH, saveFileHashes, scanFiles } from "../src/extractor/FileScanner.js";

// ---------------------------------------------------------------------------
// In-memory filesystem helpers
// ---------------------------------------------------------------------------

/**
 * A minimal in-memory filesystem state. Maps absolute file paths to content.
 */
interface MemoryFsState {
  readonly files: Map<string, string>;
  readonly dirs: Set<string>;
}

/**
 * Creates a mock FileSystem layer backed by an in-memory Map.
 */
const createMemoryFs = (
  initialFiles: ReadonlyArray<readonly [string, string]>
): {
  readonly state: MemoryFsState;
  readonly layer: Layer.Layer<FileSystem.FileSystem | Path.Path>;
} => {
  const files = new Map<string, string>();
  const dirs = new Set<string>();

  // Populate initial files and derive directories
  pipe(
    initialFiles,
    A.forEach(([filePath, content]) => {
      files.set(filePath, content);
      // Derive parent directories
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
      // Collect direct children of this directory
      for (const filePath of files.keys()) {
        if (filePath.startsWith(`${path}/`)) {
          const remaining = filePath.slice(path.length + 1);
          const firstPart = remaining.split("/")[0];
          if (!entries.includes(firstPart)) {
            entries.push(firstPart);
          }
        }
      }
      // Also check directories
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
          ctime: new Date(),
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
          ctime: new Date(),
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
    makeDirectory: (
      path: string,
      _options?: {
        readonly recursive?: boolean | undefined;
        readonly mode?: number | undefined;
      }
    ) => {
      dirs.add(path);
      return Effect.void;
    },
  });

  const pathLayer = Layer.mock(Path.Path)({
    [Path.TypeId]: Path.TypeId,
    sep: "/",
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
    toFileUrl: (p: string) => Effect.succeed(new URL(`file://${p}`)),
    toNamespacedPath: (p: string) => p,
  });

  const layer = Layer.mergeAll(fsLayer, pathLayer);

  return { state, layer };
};

// ---------------------------------------------------------------------------
// Helper to run an effect with a mock FS layer
// ---------------------------------------------------------------------------

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

describe("FileScanner", () => {
  // -------------------------------------------------------------------------
  // Full scan
  // -------------------------------------------------------------------------

  describe("scanFiles (full mode)", () => {
    it.effect("returns all TypeScript files as added", () =>
      runWithFs(
        [
          ["/root/tooling/cli/src/index.ts", "export const x = 1;"],
          ["/root/tooling/cli/src/commands/run.ts", "export const run = () => {};"],
          ["/root/tooling/utils/src/helpers.ts", "export const help = true;"],
        ],
        Effect.gen(function* () {
          const result: ScanResult = yield* scanFiles("/root", "full");
          expect(A.length(result.added)).toBeGreaterThan(0);
          expect(A.length(result.modified)).toBe(0);
          expect(A.length(result.deleted)).toBe(0);
          expect(A.length(result.unchanged)).toBe(0);
        })
      )
    );

    it.effect("filters out test files", () =>
      runWithFs(
        [
          ["/root/tooling/cli/src/index.ts", "export const x = 1;"],
          ["/root/tooling/cli/src/index.test.ts", "test('foo', () => {});"],
          ["/root/tooling/cli/src/utils.spec.ts", "describe('utils', () => {});"],
        ],
        Effect.gen(function* () {
          const result: ScanResult = yield* scanFiles("/root", "full");
          const hasTest = A.some(result.added, (f) => f.includes(".test."));
          const hasSpec = A.some(result.added, (f) => f.includes(".spec."));
          expect(hasTest).toBe(false);
          expect(hasSpec).toBe(false);
        })
      )
    );

    it.effect("filters out internal directory files", () =>
      runWithFs(
        [
          ["/root/tooling/cli/src/index.ts", "export const x = 1;"],
          ["/root/tooling/cli/src/internal/private.ts", "const secret = 42;"],
        ],
        Effect.gen(function* () {
          const result: ScanResult = yield* scanFiles("/root", "full");
          const hasInternal = A.some(result.added, (f) => f.includes("/internal/"));
          expect(hasInternal).toBe(false);
        })
      )
    );

    it.effect("filters out declaration files", () =>
      runWithFs(
        [
          ["/root/tooling/cli/src/index.ts", "export const x = 1;"],
          ["/root/tooling/cli/src/types.d.ts", "declare module 'foo' {}"],
        ],
        Effect.gen(function* () {
          const result: ScanResult = yield* scanFiles("/root", "full");
          const hasDts = A.some(result.added, (f) => f.endsWith(".d.ts"));
          expect(hasDts).toBe(false);
        })
      )
    );
  });

  // -------------------------------------------------------------------------
  // Incremental scan
  // -------------------------------------------------------------------------

  describe("scanFiles (incremental mode)", () => {
    it.effect("detects new file as added", () => {
      // Stored hashes have one file, current FS has two
      const storedHashes = JSON.stringify([{ filePath: "tooling/cli/src/index.ts", contentHash: "abc123" }]);

      return runWithFs(
        [
          ["/root/tooling/cli/src/index.ts", "export const x = 1;"],
          ["/root/tooling/cli/src/newFile.ts", "export const y = 2;"],
          ["/root/.code-index/file-hashes.json", storedHashes],
        ],
        Effect.gen(function* () {
          const result: ScanResult = yield* scanFiles("/root", "incremental");
          expect(A.some(result.added, (f) => f.includes("newFile.ts"))).toBe(true);
        })
      );
    });

    it.effect("detects modified file by hash change", () => {
      // Stored hash differs from current content hash
      const storedHashes = JSON.stringify([
        { filePath: "tooling/cli/src/index.ts", contentHash: "old-hash-value-that-does-not-match" },
      ]);

      return runWithFs(
        [
          ["/root/tooling/cli/src/index.ts", "export const x = 'changed';"],
          ["/root/.code-index/file-hashes.json", storedHashes],
        ],
        Effect.gen(function* () {
          const result: ScanResult = yield* scanFiles("/root", "incremental");
          expect(A.some(result.modified, (f) => f.includes("index.ts"))).toBe(true);
        })
      );
    });

    it.effect("detects deleted file", () => {
      // Stored hashes have a file that no longer exists on disk
      const storedHashes = JSON.stringify([
        { filePath: "tooling/cli/src/index.ts", contentHash: "abc123" },
        { filePath: "tooling/cli/src/deleted.ts", contentHash: "def456" },
      ]);

      return runWithFs(
        [
          ["/root/tooling/cli/src/index.ts", "export const x = 1;"],
          ["/root/.code-index/file-hashes.json", storedHashes],
        ],
        Effect.gen(function* () {
          const result: ScanResult = yield* scanFiles("/root", "incremental");
          expect(A.some(result.deleted, (f) => f.includes("deleted.ts"))).toBe(true);
        })
      );
    });

    it.effect("classifies unchanged files correctly", () => {
      // First compute the actual hash of our file content
      const content = "export const x = 1;";
      const crypto = require("node:crypto");
      const actualHash = crypto.createHash("sha256").update(content).digest("hex");

      const storedHashes = JSON.stringify([{ filePath: "tooling/cli/src/index.ts", contentHash: actualHash }]);

      return runWithFs(
        [
          ["/root/tooling/cli/src/index.ts", content],
          ["/root/.code-index/file-hashes.json", storedHashes],
        ],
        Effect.gen(function* () {
          const result: ScanResult = yield* scanFiles("/root", "incremental");
          expect(A.some(result.unchanged, (f) => f.includes("index.ts"))).toBe(true);
        })
      );
    });

    it.effect("handles missing hashes file gracefully (treats all as added)", () =>
      runWithFs(
        [["/root/tooling/cli/src/index.ts", "export const x = 1;"]],
        Effect.gen(function* () {
          const result: ScanResult = yield* scanFiles("/root", "incremental");
          expect(A.length(result.added)).toBeGreaterThan(0);
          expect(A.length(result.modified)).toBe(0);
          expect(A.length(result.deleted)).toBe(0);
        })
      )
    );
  });

  // -------------------------------------------------------------------------
  // saveFileHashes
  // -------------------------------------------------------------------------

  describe("saveFileHashes", () => {
    it.effect("writes hashes to the expected path", () => {
      const memFs = createMemoryFs([]);

      const hashes: ReadonlyArray<FileHash> = [
        { filePath: "tooling/cli/src/index.ts", contentHash: "abc123" },
        { filePath: "tooling/cli/src/commands/run.ts", contentHash: "def456" },
      ];

      return pipe(
        saveFileHashes("/root", hashes),
        Effect.flatMap(Effect.fn(function* () {
            const fs = yield* FileSystem.FileSystem;
            const content = yield* fs.readFileString("/root/.code-index/file-hashes.json");
            const parsed = yield* S.decodeUnknownEffect(
              S.fromJsonString(S.Array(S.Struct({ filePath: S.String, contentHash: S.String })))
            )(content);
            expect(A.length(parsed)).toBe(2);
          })
        ),
        Effect.provide(memFs.layer)
      );
    });
  });

  // -------------------------------------------------------------------------
  // FILE_HASHES_PATH constant
  // -------------------------------------------------------------------------

  describe("FILE_HASHES_PATH", () => {
    it("has the expected value", () => {
      expect(FILE_HASHES_PATH).toBe(".code-index/file-hashes.json");
    });
  });
});
