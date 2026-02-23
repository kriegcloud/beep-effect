/**
 * Pipeline orchestrator for the full indexing workflow. Coordinates file
 * scanning, symbol extraction, embedding generation, and storage across
 * LanceDB (vector) and BM25 (keyword) indexes.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, FileSystem, Layer, Path } from "effect";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import { pipe } from "effect/Function";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as ServiceMap from "effect/ServiceMap";
import * as Str from "effect/String";
import { Project } from "ts-morph";
import { IndexingError } from "../errors.js";
import type { ScanResult } from "../extractor/index.js";
import {
  assembleSymbols,
  computeFileHashes,
  resolveImports,
  resolveLayerContractErrors,
  resolveModuleName,
  saveFileHashes,
  scanFiles,
} from "../extractor/index.js";
import type { IndexedSymbol } from "../IndexedSymbol.js";
import { IndexMeta } from "../IndexedSymbol.js";
import { Bm25Writer } from "./Bm25Writer.js";
import { EmbeddingService } from "./EmbeddingService.js";
import type { SymbolWithVector } from "./LanceDbWriter.js";
import { LanceDbWriter } from "./LanceDbWriter.js";

// ---------------------------------------------------------------------------
// PipelineConfig
// ---------------------------------------------------------------------------

/**
 * Configuration for a single pipeline run.
 *
 * @since 0.0.0
 * @category types
 */
export interface PipelineConfig {
  /** Absolute path to the monorepo root directory. */
  readonly rootDir: string;
  /** Absolute path to the index output directory. */
  readonly indexPath: string;
  /** Whether to perform a full rebuild or incremental update. */
  readonly mode: "full" | "incremental";
  /** Optional filter to restrict indexing to a single package name. */
  readonly packageFilter?: string | undefined;
}

// ---------------------------------------------------------------------------
// PipelineStats
// ---------------------------------------------------------------------------

/**
 * Statistics returned by a pipeline run summarising the work performed.
 *
 * @since 0.0.0
 * @category types
 */
export interface PipelineStats {
  /** Total number of TypeScript files discovered during the scan. */
  readonly filesScanned: number;
  /** Number of files classified as added or modified. */
  readonly filesChanged: number;
  /** Number of symbol+vector pairs written to the indexes. */
  readonly symbolsIndexed: number;
  /** Number of symbols removed from the indexes. */
  readonly symbolsRemoved: number;
  /** Wall-clock milliseconds elapsed for the entire run. */
  readonly durationMs: number;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Shape of the Pipeline service interface.
 *
 * @since 0.0.0
 * @category models
 */
export interface PipelineShape {
  /**
   * Execute the full indexing pipeline and return run statistics.
   *
   * @since 0.0.0
   */
  readonly run: (
    config: PipelineConfig
  ) => Effect.Effect<PipelineStats, IndexingError, FileSystem.FileSystem | Path.Path>;
}

/**
 * Service tag for `Pipeline`.
 *
 * Orchestrates file scanning, symbol extraction, embedding generation,
 * and storage across vector and keyword indexes.
 *
 * @since 0.0.0
 * @category services
 */
export class Pipeline extends ServiceMap.Service<Pipeline, PipelineShape>()("@beep/codebase-search/indexer/Pipeline") {}

// ---------------------------------------------------------------------------
// IndexMeta persistence schema
// ---------------------------------------------------------------------------

/** @internal JSON string <-> IndexMeta schema */
const IndexMetaFromJson = S.fromJsonString(IndexMeta);

/** @internal Default file name for index metadata */
const INDEX_META_FILE = "index-meta.json" as const;

/**
 * Read and decode previously persisted index metadata if present.
 *
 * @param indexPath indexPath parameter value.
 * @internal
 * @returns Returns the computed value.
 */
const readExistingIndexMeta = (
  indexPath: string
): Effect.Effect<O.Option<typeof IndexMeta.Type>, IndexingError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fsSvc = yield* FileSystem.FileSystem;
    const pathSvc = yield* Path.Path;
    const metaFilePath = pathSvc.join(indexPath, INDEX_META_FILE);

    const exists = yield* fsSvc.exists(metaFilePath).pipe(Effect.orElseSucceed(() => false));
    if (!exists) {
      return O.none();
    }

    const raw = yield* pipe(
      fsSvc.readFileString(metaFilePath),
      Effect.mapError(
        (error) =>
          new IndexingError({
            message: `Failed to read existing IndexMeta file: ${String(error)}`,
            phase: "meta-write",
          })
      )
    );

    const decoded = yield* pipe(
      S.decodeUnknownEffect(IndexMetaFromJson)(raw),
      Effect.mapError(
        (error) =>
          new IndexingError({
            message: `Failed to decode existing IndexMeta file: ${String(error)}`,
            phase: "meta-write",
          })
      )
    );

    return O.some(decoded);
  });

// ---------------------------------------------------------------------------
// Internal: extract package name from file path
// ---------------------------------------------------------------------------

/**
 * Extracts the package name from a relative file path by looking at the
 * first two path segments (e.g. `tooling/cli/src/foo.ts` -> `@beep/cli`).
 *
 * @param filePath filePath parameter value.
 * @internal
 * @returns Returns the computed value.
 */
const resolvePackageName = (filePath: string): string => {
  const normalizedFilePath = pipe(filePath, Str.replace(/\\/g, "/"), Str.replace(/^\.\//, ""), Str.replace(/^\/+/, ""));
  // Convention: tooling/<name>/src/... or packages/<name>/src/...
  const segments = Str.split("/")(normalizedFilePath);
  if (A.length(segments) >= 2) {
    const scope = A.get(segments, 0);
    const name = A.get(segments, 1);
    if (O.isSome(scope) && O.isSome(name)) {
      return `@beep/${name.value}`;
    }
  }
  return "@beep/unknown";
};

/**
 * Build the deterministic symbol ID prefix for a source file.
 *
 * @param filePath filePath parameter value.
 * @internal
 * @returns Returns the computed value.
 */
const resolveSymbolPrefixFromFilePath = (filePath: string): string => {
  const pkg = resolvePackageName(filePath);
  const moduleName = resolveModuleName(filePath);
  return `${pkg}/${moduleName}/`;
};

/**
 * Filter file paths by package when a package filter is provided.
 *
 * @param filePaths filePaths parameter value.
 * @param packageFilter packageFilter parameter value.
 * @internal
 * @returns Returns the computed value.
 */
const filterFilesByPackage = (
  filePaths: ReadonlyArray<string>,
  packageFilter: string | undefined
): ReadonlyArray<string> =>
  packageFilter === undefined
    ? filePaths
    : A.filter(filePaths, (filePath) => resolvePackageName(filePath) === packageFilter);

// ---------------------------------------------------------------------------
// Internal: extract symbols from files using ts-morph
// ---------------------------------------------------------------------------

/** @internal */
const extractSymbolsFromFiles: (
  rootDir: string,
  filePaths: ReadonlyArray<string>,
  packageFilter: string | undefined
) => Effect.Effect<ReadonlyArray<IndexedSymbol>, IndexingError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (rootDir: string, filePaths: ReadonlyArray<string>, packageFilter: string | undefined) {
    if (A.isReadonlyArrayEmpty(filePaths)) {
      return A.empty<IndexedSymbol>();
    }

    const fs = yield* FileSystem.FileSystem;
    const pathSvc = yield* Path.Path;

    // Read all file contents via Effect FileSystem so tests can use in-memory FS
    const fileContents = yield* Effect.forEach(filePaths, (fp) => {
      const normalizedPath = Str.replace(/^\.\//, "")(fp);
      const absPath = pathSvc.join(rootDir, normalizedPath);
      return pipe(
        fs.readFileString(absPath),
        Effect.map((content) => [normalizedPath, content] as const),
        Effect.mapError(
          (error) =>
            new IndexingError({
              message: `Failed to read file for extraction: ${absPath}: ${String(error)}`,
              phase: "symbol-extraction",
            })
        )
      );
    });

    return yield* Effect.try({
      try: () => {
        const project = new Project({
          useInMemoryFileSystem: true,
          skipAddingFilesFromTsConfig: true,
          skipFileDependencyResolution: true,
          compilerOptions: { strict: true },
        });

        // Create source files from in-memory content
        pipe(
          fileContents,
          A.forEach(([fp, content]) => {
            const absPath = pathSvc.join(rootDir, fp);
            project.createSourceFile(absPath, content);
          })
        );

        // Extract symbols from each source file
        const allSymbols = A.empty<IndexedSymbol>();
        const sourceFiles = project.getSourceFiles();
        const fileToSymbolIds = MutableHashMap.empty<string, ReadonlyArray<string>>();

        pipe(
          A.fromIterable(sourceFiles),
          A.forEach((sourceFile) => {
            const sfPath = sourceFile.getFilePath();
            // Convert back to normalized relative path for package/module resolution.
            const relativePath = pipe(
              sfPath.startsWith(`${rootDir}/`) ? sfPath.slice(rootDir.length + 1) : sfPath,
              Str.replace(/\\/g, "/"),
              Str.replace(/^\.\//, ""),
              Str.replace(/^\/+/, "")
            );

            const pkg = resolvePackageName(relativePath);

            // Apply package filter if specified
            if (packageFilter !== undefined && pkg !== packageFilter) {
              return;
            }

            const moduleName = resolveModuleName(relativePath);
            const symbols = assembleSymbols(sourceFile, pkg, moduleName);
            MutableHashMap.set(
              fileToSymbolIds,
              sourceFile.getFilePath(),
              A.map(symbols, (symbol) => symbol.id)
            );

            pipe(
              symbols,
              A.forEach((sym) => {
                allSymbols.push(sym);
              })
            );
          })
        );

        const resolvedSymbols = resolveImports(allSymbols, sourceFiles, fileToSymbolIds);
        const layerContractErrors = resolveLayerContractErrors(resolvedSymbols);

        if (A.isReadonlyArrayNonEmpty(layerContractErrors)) {
          pipe(
            layerContractErrors,
            A.forEach((error) => {
              console.warn(`[Pipeline] Layer contract warning: ${error}`);
            })
          );
        }

        return resolvedSymbols;
      },
      catch: (error) =>
        new IndexingError({
          message: `Symbol extraction failed: ${String(error)}`,
          phase: "symbol-extraction",
        }),
    });
  }
);

// ---------------------------------------------------------------------------
// Live Layer
// ---------------------------------------------------------------------------

/**
 * Live layer for `Pipeline` that creates the orchestrator service with
 * real dependencies on `EmbeddingService`, `LanceDbWriter`, and `Bm25Writer`.
 *
 * @since 0.0.0
 * @category layers
 */
export const PipelineLive: Layer.Layer<Pipeline, never, EmbeddingService | LanceDbWriter | Bm25Writer> = Layer.effect(
  Pipeline,
  Effect.gen(function* () {
    const embeddingService = yield* EmbeddingService;
    const lanceDbWriter = yield* LanceDbWriter;
    const bm25Writer = yield* Bm25Writer;

    const run: PipelineShape["run"] = Effect.fn(function* (config) {
      if (config.mode === "full" && config.packageFilter !== undefined) {
        return yield* new IndexingError({
          message:
            "Full reindex with package filter is not supported. Use mode='incremental' with package filter, or omit package for a full rebuild.",
          phase: "pipeline-config",
        });
      }

      const startTime = yield* DateTime.now;

      const fsSvc = yield* FileSystem.FileSystem;
      const pathSvc = yield* Path.Path;

      // ---------------------------------------------------------------
      // 1. Scan files
      // ---------------------------------------------------------------
      const scanResult: ScanResult = yield* scanFiles(config.rootDir, config.mode, { indexPath: config.indexPath });

      const addedInScope = filterFilesByPackage(scanResult.added, config.packageFilter);
      const modifiedInScope = filterFilesByPackage(scanResult.modified, config.packageFilter);
      const deletedInScope = filterFilesByPackage(scanResult.deleted, config.packageFilter);
      const unchangedInScope = filterFilesByPackage(scanResult.unchanged, config.packageFilter);

      const totalFilesScanned =
        A.length(addedInScope) + A.length(modifiedInScope) + A.length(deletedInScope) + A.length(unchangedInScope);

      const filesToProcess = pipe(addedInScope, A.appendAll(modifiedInScope));

      const filesToDelete = pipe(modifiedInScope, A.appendAll(deletedInScope));

      // ---------------------------------------------------------------
      // 2. Extract symbols from added+modified files
      // ---------------------------------------------------------------
      const extractedSymbols = yield* extractSymbolsFromFiles(config.rootDir, filesToProcess, config.packageFilter);

      // ---------------------------------------------------------------
      // 3. Generate embeddings for extracted symbols
      // ---------------------------------------------------------------
      const embeddingTexts = A.map(extractedSymbols, (sym) => sym.embeddingText);
      const vectors = yield* pipe(
        embeddingService.embedBatch(embeddingTexts),
        Effect.mapError(
          (error) =>
            new IndexingError({
              message: `Embedding generation failed: ${String(error)}`,
              phase: "embedding",
            })
        )
      );

      // ---------------------------------------------------------------
      // 4. Pair symbols with vectors
      // ---------------------------------------------------------------
      const symbolsWithVectors: ReadonlyArray<SymbolWithVector> = pipe(
        extractedSymbols,
        A.map(
          (sym, idx): SymbolWithVector => ({
            symbol: sym,
            vector: pipe(
              A.get(vectors, idx),
              O.getOrElse(() => new Float32Array(768))
            ),
          })
        )
      );

      // ---------------------------------------------------------------
      // 5. Upsert into LanceDB (delete modified/deleted, insert new)
      // ---------------------------------------------------------------
      if (config.mode === "full") {
        yield* lanceDbWriter.createTable();
      }

      yield* lanceDbWriter.upsert(filesToDelete, symbolsWithVectors);

      // ---------------------------------------------------------------
      // 6. Update BM25 index
      // ---------------------------------------------------------------
      // In full mode, the BM25 index is rebuilt from scratch so we
      // create a fresh index first and add all extracted symbols.
      // In incremental mode, load current BM25 state, remove symbols
      // for modified/deleted files by deterministic file->module prefix,
      // then add the newly extracted symbols.
      let symbolsRemoved = 0;

      if (config.mode === "full") {
        yield* bm25Writer.createIndex();
      } else {
        yield* bm25Writer.load().pipe(
          Effect.mapError(
            (error) =>
              new IndexingError({
                message: `Failed to load existing BM25 index for incremental mode: ${String(error)}`,
                phase: "bm25-index",
              })
          )
        );

        const affectedFilePaths = filesToDelete;
        if (A.isReadonlyArrayNonEmpty(affectedFilePaths)) {
          const affectedPrefixes = pipe(affectedFilePaths, A.map(resolveSymbolPrefixFromFilePath), A.dedupe);
          const existingSymbolIds = yield* bm25Writer.listSymbolIds();
          const idsToRemove = A.filter(existingSymbolIds, (id) =>
            A.some(affectedPrefixes, (prefix) => id.startsWith(prefix))
          );

          if (A.isReadonlyArrayNonEmpty(idsToRemove)) {
            yield* bm25Writer.removeBySymbolIds(idsToRemove);
            symbolsRemoved = A.length(idsToRemove);
          }
        }
      }

      // Add all newly extracted symbols to BM25
      yield* bm25Writer.addDocuments(extractedSymbols);
      yield* bm25Writer.save();

      // ---------------------------------------------------------------
      // 7. Save file hashes for future incremental scans
      // ---------------------------------------------------------------
      const allCurrentFiles = pipe(
        scanResult.added,
        A.appendAll(scanResult.modified),
        A.appendAll(scanResult.unchanged)
      );

      const hashes = yield* computeFileHashes(config.rootDir, allCurrentFiles);
      yield* saveFileHashes(config.rootDir, hashes, config.indexPath);

      // ---------------------------------------------------------------
      // 8. Write IndexMeta JSON
      // ---------------------------------------------------------------
      const now = DateTime.formatIso(yield* DateTime.now);
      const previousMeta = yield* readExistingIndexMeta(config.indexPath).pipe(
        Effect.orElseSucceed(O.none<typeof IndexMeta.Type>)
      );
      const totalIndexedSymbols = yield* lanceDbWriter
        .countRows()
        .pipe(Effect.orElseSucceed(() => A.length(extractedSymbols)));
      const previous = pipe(previousMeta, O.getOrUndefined);
      const meta: typeof IndexMeta.Type = {
        version: 1,
        lastFullIndex: config.mode === "full" ? now : (previous?.lastFullIndex ?? ""),
        lastIncrementalIndex: config.mode === "incremental" ? now : (previous?.lastIncrementalIndex ?? ""),
        totalSymbols: totalIndexedSymbols,
        totalFiles: totalFilesScanned,
        embeddingModel: "nomic-ai/nomic-embed-text-v1.5",
        embeddingDimensions: 768,
      };

      const metaJson = yield* pipe(
        S.encodeUnknownEffect(IndexMetaFromJson)(meta),
        Effect.mapError(
          (error) =>
            new IndexingError({
              message: `Failed to encode IndexMeta: ${String(error)}`,
              phase: "meta-write",
            })
        )
      );

      // Ensure index directory exists
      yield* pipe(
        fsSvc.makeDirectory(config.indexPath, { recursive: true }),
        Effect.mapError(
          (error) =>
            new IndexingError({
              message: `Failed to create index directory: ${String(error)}`,
              phase: "meta-write",
            })
        )
      );

      const metaFilePath = pathSvc.join(config.indexPath, INDEX_META_FILE);
      yield* pipe(
        fsSvc.writeFileString(metaFilePath, metaJson),
        Effect.mapError(
          (error) =>
            new IndexingError({
              message: `Failed to write IndexMeta file: ${String(error)}`,
              phase: "meta-write",
            })
        )
      );

      // ---------------------------------------------------------------
      // 9. Return stats
      // ---------------------------------------------------------------
      const endTime = yield* DateTime.now;
      const durationMs = DateTime.toEpochMillis(endTime) - DateTime.toEpochMillis(startTime);

      return {
        filesScanned: totalFilesScanned,
        filesChanged: A.length(filesToProcess),
        symbolsIndexed: A.length(extractedSymbols),
        symbolsRemoved,
        durationMs,
      } satisfies PipelineStats;
    });

    return Pipeline.of({ run });
  })
);

// ---------------------------------------------------------------------------
// Mock Layer
// ---------------------------------------------------------------------------

/**
 * Mock layer for `Pipeline` that returns canned statistics without performing
 * any real I/O. Suitable for unit tests that need to verify pipeline
 * consumers without running the full indexing workflow.
 *
 * @since 0.0.0
 * @category layers
 */
export const PipelineMock: Layer.Layer<Pipeline> = Layer.succeed(
  Pipeline,
  Pipeline.of({
    run: (_config) =>
      Effect.succeed({
        filesScanned: 0,
        filesChanged: 0,
        symbolsIndexed: 0,
        symbolsRemoved: 0,
        durationMs: 0,
      } satisfies PipelineStats),
  })
);
