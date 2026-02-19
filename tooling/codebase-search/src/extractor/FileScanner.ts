/**
 * Scans the filesystem for TypeScript source files and detects changes via
 * content hashing for incremental indexing. Uses the Effect FileSystem and
 * Path services for all I/O operations.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import * as crypto from "node:crypto";
import { Effect, FileSystem, Path } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

import { IndexingError } from "../errors.js";

// ---------------------------------------------------------------------------
// FileHash
// ---------------------------------------------------------------------------

/**
 * A record of a file path and its SHA-256 content hash, used for change
 * detection during incremental indexing.
 * @since 0.0.0
 * @category types
 */
export interface FileHash {
  readonly filePath: string;
  readonly contentHash: string;
}

// ---------------------------------------------------------------------------
// ScanResult
// ---------------------------------------------------------------------------

/**
 * The result of a file scan operation, classifying discovered files into
 * added, modified, deleted, and unchanged categories for incremental
 * indexing decisions.
 * @since 0.0.0
 * @category types
 */
export interface ScanResult {
  readonly added: ReadonlyArray<string>;
  readonly modified: ReadonlyArray<string>;
  readonly deleted: ReadonlyArray<string>;
  readonly unchanged: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// ScanMode
// ---------------------------------------------------------------------------

/**
 * The scanning mode: "full" treats all files as newly added, "incremental"
 * compares against previously stored content hashes.
 * @since 0.0.0
 * @category types
 */
export type ScanMode = "full" | "incremental";

// ---------------------------------------------------------------------------
// FileHashEntry Schema
// ---------------------------------------------------------------------------

/**
 * Effect Schema for a single file hash entry persisted in the file hashes JSON.
 * @since 0.0.0
 * @category schemas
 */
const FileHashEntry = S.Struct({
  filePath: S.String,
  contentHash: S.String,
}).annotate({
  identifier: "@beep/codebase-search/extractor/FileScanner/FileHashEntry",
  title: "File Hash Entry",
  description: "A single file path and its SHA-256 content hash for change detection.",
});

/**
 * Effect Schema for the persisted file hashes JSON file, an array of hash entries.
 * @since 0.0.0
 * @category schemas
 */
const FileHashesFile = S.Array(FileHashEntry).annotate({
  identifier: "@beep/codebase-search/extractor/FileScanner/FileHashesFile",
  title: "File Hashes File",
  description: "Array of file hash entries persisted for incremental indexing change detection.",
});

/** @internal Schema for decoding file hashes from JSON string */
const FileHashesFromJson = S.fromJsonString(FileHashesFile);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * The relative path to the stored file hashes JSON within the index directory.
 * @since 0.0.0
 * @category constants
 */
export const FILE_HASHES_PATH = ".code-index/file-hashes.json" as const;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** @internal */
const GLOB_PATTERNS: ReadonlyArray<string> = ["tooling/*/src/**/*.ts", "packages/*/src/**/*.ts"];

/** @internal */
const EXCLUDE_PATTERNS: ReadonlyArray<RegExp> = [/\.test\./, /\.spec\./, /\/internal\//, /\.d\.ts$/];

/** @internal */
const shouldIncludeFile = (filePath: string): boolean => !A.some(EXCLUDE_PATTERNS, (pattern) => pattern.test(filePath));

/** @internal */
const computeFileHash = (content: string): string => crypto.createHash("sha256").update(content).digest("hex");

/** @internal */
const collectTsFiles: (
  rootDir: string
) => Effect.Effect<ReadonlyArray<string>, IndexingError, FileSystem.FileSystem | Path.Path> = Effect.fn(function* (
  rootDir: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const allFiles = A.empty<string>();

  for (const pattern of GLOB_PATTERNS) {
    // Extract the base directory from the glob pattern (first segment)
    const patternParts = Str.split("/")(pattern);
    const baseDir = pipe(
      A.head(patternParts),
      O.getOrElse(() => "")
    );

    const fullBaseDir = path.join(rootDir, baseDir);

    // Check if the base directory exists
    const exists = yield* pipe(
      fs.exists(fullBaseDir),
      Effect.orElseSucceed(() => false)
    );

    if (!exists) continue;

    // Walk the base directory recursively to find .ts files
    const walkDir: (dir: string) => Effect.Effect<void, IndexingError, FileSystem.FileSystem> = Effect.fn(function* (
      dir: string
    ) {
      const entries = yield* pipe(
        fs.readDirectory(dir),
        Effect.mapError(
          (err) =>
            new IndexingError({
              message: `Failed to read directory ${dir}: ${String(err)}`,
              phase: "file-scan",
            })
        )
      );

      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = yield* pipe(
          fs.stat(fullPath),
          Effect.mapError(
            (err) =>
              new IndexingError({
                message: `Failed to stat ${fullPath}: ${String(err)}`,
                phase: "file-scan",
              })
          )
        );

        if (stat.type === "Directory") {
          yield* walkDir(fullPath);
        } else if (stat.type === "File" && Str.endsWith(".ts")(entry)) {
          // Convert to relative path from rootDir
          const relativePath = fullPath.startsWith(`${rootDir}/`) ? fullPath.slice(Str.length(rootDir) + 1) : fullPath;

          // Check if this file matches the expected src pattern
          if (Str.includes("/src/")(relativePath) && shouldIncludeFile(relativePath)) {
            allFiles.push(relativePath);
          }
        }
      }
    });

    yield* walkDir(fullBaseDir);
  }

  return allFiles;
});

// ---------------------------------------------------------------------------
// loadStoredHashes
// ---------------------------------------------------------------------------

/** @internal */
const loadStoredHashes: (
  rootDir: string
) => Effect.Effect<ReadonlyArray<FileHash>, IndexingError, FileSystem.FileSystem | Path.Path> = Effect.fn(function* (
  rootDir: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const hashesPath = path.join(rootDir, FILE_HASHES_PATH);

  const exists = yield* pipe(
    fs.exists(hashesPath),
    Effect.orElseSucceed(() => false)
  );

  if (!exists) {
    return [] as ReadonlyArray<FileHash>;
  }

  const content = yield* pipe(
    fs.readFileString(hashesPath),
    Effect.mapError(
      (err) =>
        new IndexingError({
          message: `Failed to read file hashes: ${String(err)}`,
          phase: "file-scan",
        })
    )
  );

  return yield* pipe(
    S.decodeUnknownEffect(FileHashesFromJson)(content),
    Effect.mapError(
      (err) =>
        new IndexingError({
          message: `Failed to parse file hashes JSON: ${String(err)}`,
          phase: "file-scan",
        })
    )
  );
});

// ---------------------------------------------------------------------------
// scanFiles
// ---------------------------------------------------------------------------

/**
 * Scans the filesystem for TypeScript source files and classifies them into
 * added, modified, deleted, and unchanged categories. In "full" mode, all
 * discovered files are classified as added. In "incremental" mode, compares
 * current file content hashes against previously stored hashes.
 *
 * Scans `tooling` and `packages` workspaces for `.ts` source files, filtering out
 * test files, spec files, internal directories, and declaration files.
 *
 * @since 0.0.0
 * @category scanners
 */
export const scanFiles: (
  rootDir: string,
  mode: ScanMode
) => Effect.Effect<ScanResult, IndexingError, FileSystem.FileSystem | Path.Path> = Effect.fn(function* (
  rootDir: string,
  mode: ScanMode
) {
  // Discover all matching TypeScript files
  const currentFiles = yield* collectTsFiles(rootDir);

  // Full mode: everything is "added"
  if (mode === "full") {
    return {
      added: currentFiles,
      modified: [],
      deleted: [],
      unchanged: [],
    } satisfies ScanResult;
  }

  // Incremental mode: compare against stored hashes
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const storedHashes = yield* loadStoredHashes(rootDir);

  // Build a map of stored file path -> hash
  const storedHashMap = MutableHashMap.empty<string, string>();
  pipe(
    storedHashes,
    A.forEach((entry) => {
      MutableHashMap.set(storedHashMap, entry.filePath, entry.contentHash);
    })
  );

  // Classify current files
  const added = A.empty<string>();
  const modified = A.empty<string>();
  const unchanged = A.empty<string>();

  for (const filePath of currentFiles) {
    const fullPath = path.join(rootDir, filePath);
    const content = yield* pipe(
      fs.readFileString(fullPath),
      Effect.mapError(
        (err) =>
          new IndexingError({
            message: `Failed to read file ${fullPath}: ${String(err)}`,
            phase: "file-scan",
          })
      )
    );

    const currentHash = computeFileHash(content);
    const storedHash = MutableHashMap.get(storedHashMap, filePath);

    if (O.isNone(storedHash)) {
      added.push(filePath);
    } else if (storedHash.value !== currentHash) {
      modified.push(filePath);
    } else {
      unchanged.push(filePath);
    }

    // Remove from stored map so we can detect deletions
    MutableHashMap.remove(storedHashMap, filePath);
  }

  // Remaining entries in storedHashMap are deleted files
  const deleted = A.fromIterable(MutableHashMap.keys(storedHashMap));

  return {
    added,
    modified,
    deleted,
    unchanged,
  } satisfies ScanResult;
});

// ---------------------------------------------------------------------------
// computeFileHashes
// ---------------------------------------------------------------------------

/**
 * Computes SHA-256 content hashes for all provided file paths. Used to
 * generate the hash entries that will be persisted for future incremental
 * scans.
 *
 * @since 0.0.0
 * @category helpers
 */
export const computeFileHashes: (
  rootDir: string,
  filePaths: ReadonlyArray<string>
) => Effect.Effect<ReadonlyArray<FileHash>, IndexingError, FileSystem.FileSystem | Path.Path> = Effect.fn(function* (
  rootDir: string,
  filePaths: ReadonlyArray<string>
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const results = A.empty<FileHash>();

  for (const filePath of filePaths) {
    const fullPath = path.join(rootDir, filePath);
    const content = yield* pipe(
      fs.readFileString(fullPath),
      Effect.mapError(
        (err) =>
          new IndexingError({
            message: `Failed to read file ${fullPath} for hashing: ${String(err)}`,
            phase: "file-scan",
          })
      )
    );

    results.push({
      filePath,
      contentHash: computeFileHash(content),
    });
  }

  return results;
});

// ---------------------------------------------------------------------------
// saveFileHashes
// ---------------------------------------------------------------------------

/**
 * Persists the current file hashes to `.code-index/file-hashes.json` for
 * future incremental scan comparisons. Creates the `.code-index/` directory
 * if it does not exist.
 *
 * @since 0.0.0
 * @category persistence
 */
export const saveFileHashes: (
  rootDir: string,
  hashes: ReadonlyArray<FileHash>
) => Effect.Effect<void, IndexingError, FileSystem.FileSystem | Path.Path> = Effect.fn(function* (
  rootDir: string,
  hashes: ReadonlyArray<FileHash>
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const dirPath = path.join(rootDir, ".code-index");
  const hashesPath = path.join(rootDir, FILE_HASHES_PATH);

  // Ensure directory exists
  yield* pipe(
    fs.makeDirectory(dirPath, { recursive: true }),
    Effect.mapError(
      (err) =>
        new IndexingError({
          message: `Failed to create directory ${dirPath}: ${String(err)}`,
          phase: "file-scan",
        })
    )
  );

  // Encode hashes to JSON string and write
  const encoded = yield* pipe(
    S.encodeUnknownEffect(FileHashesFromJson)(A.fromIterable(hashes)),
    Effect.mapError(
      (err) =>
        new IndexingError({
          message: `Failed to encode file hashes: ${String(err)}`,
          phase: "file-scan",
        })
    )
  );

  yield* pipe(
    fs.writeFileString(hashesPath, encoded),
    Effect.mapError(
      (err) =>
        new IndexingError({
          message: `Failed to write file hashes: ${String(err)}`,
          phase: "file-scan",
        })
    )
  );
});
