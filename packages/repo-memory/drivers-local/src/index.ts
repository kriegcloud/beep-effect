import { $RepoMemoryDriversLocalId } from "@beep/identity/packages";
import {
  RepoId,
  RepoImportEdge,
  RepoSourceFile,
  RepoSourceSnapshot,
  RepoSymbolKind,
  RepoSymbolRecord,
  RetrievalPacket,
  RunId,
  SourceSnapshotId,
} from "@beep/repo-memory-domain";
import { RepoRegistration, type RepoRegistrationInput, RepoRun } from "@beep/runtime-protocol";
import { FilePath, NonNegativeInt, PosInt, Sha256Hex, Sha256HexFromBytes, TaggedErrorClass } from "@beep/schema";
import { DateTime, Effect, FileSystem, Layer, Path, pipe, ServiceMap, String as Str } from "effect";
import * as A from "effect/Array";

import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import { observeDriverOperation } from "./internal/DriverObservability.js";

const $I = $RepoMemoryDriversLocalId.create("index");
const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeRepoId = S.decodeUnknownSync(RepoId);
const decodeSha256Hex = S.decodeUnknownEffect(Sha256HexFromBytes);
const encodePacketJson = S.encodeUnknownEffect(S.fromJsonString(RetrievalPacket));
const decodePacketJson = S.decodeUnknownEffect(S.fromJsonString(RetrievalPacket));
const encodeRunJson = S.encodeUnknownEffect(S.fromJsonString(RepoRun));
const decodeRunJson = S.decodeUnknownEffect(S.fromJsonString(RepoRun));

/**
 * Configuration for the local repo-memory persistence driver.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class LocalRepoMemoryDriverConfig extends S.Class<LocalRepoMemoryDriverConfig>($I`LocalRepoMemoryDriverConfig`)(
  {
    appDataDir: FilePath,
  },
  $I.annote("LocalRepoMemoryDriverConfig", {
    description: "Configuration for the local repo-memory persistence driver.",
  })
) {}

/**
 * Typed persistence error emitted by the local repo-memory driver.
 *
 * @since 0.0.0
 * @category Errors
 */
export class LocalRepoMemoryDriverError extends TaggedErrorClass<LocalRepoMemoryDriverError>(
  $I`LocalRepoMemoryDriverError`
)(
  "LocalRepoMemoryDriverError",
  {
    message: S.String,
    status: S.Number,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("LocalRepoMemoryDriverError", {
    description: "Typed persistence error for the local repo-memory driver boundary.",
  })
) {}

/**
 * Persisted artifact for a completed repository index run.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RepoIndexArtifact extends S.Class<RepoIndexArtifact>($I`RepoIndexArtifact`)(
  {
    runId: RunId,
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    indexedFileCount: S.Number,
    completedAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("RepoIndexArtifact", {
    description: "Deterministic index artifact persisted for a completed repository index run.",
  })
) {}

class RepoRow extends S.Class<RepoRow>($I`RepoRow`)(
  {
    id: RepoId,
    repo_path: FilePath,
    display_name: S.String,
    language: S.Literal("typescript"),
    registered_at: S.DateTimeUtcFromMillis,
  },
  $I.annote("RepoRow", {
    description: "SQLite row shape for persisted repo registrations.",
  })
) {}

class IndexArtifactRow extends S.Class<IndexArtifactRow>($I`IndexArtifactRow`)(
  {
    run_id: RunId,
    repo_id: RepoId,
    source_snapshot_id: SourceSnapshotId,
    indexed_file_count: NonNegativeInt,
    completed_at: S.DateTimeUtcFromMillis,
  },
  $I.annote("IndexArtifactRow", {
    description: "SQLite row shape for persisted repo index artifacts.",
  })
) {}

class PacketRow extends S.Class<PacketRow>($I`PacketRow`)(
  {
    run_id: RunId,
    packet_json: S.String,
  },
  $I.annote("PacketRow", {
    description: "SQLite row shape for persisted retrieval packets.",
  })
) {}

class SourceSnapshotRow extends S.Class<SourceSnapshotRow>($I`SourceSnapshotRow`)(
  {
    snapshot_id: SourceSnapshotId,
    repo_id: RepoId,
    captured_at: S.DateTimeUtcFromMillis,
    file_count: NonNegativeInt,
  },
  $I.annote("SourceSnapshotRow", {
    description: "SQLite row shape for persisted repository source snapshots.",
  })
) {}

class SourceFileRow extends S.Class<SourceFileRow>($I`SourceFileRow`)(
  {
    repo_id: RepoId,
    source_snapshot_id: SourceSnapshotId,
    file_path: FilePath,
    content_hash: Sha256Hex,
    line_count: NonNegativeInt,
    workspace_name: S.String,
    tsconfig_path: FilePath,
  },
  $I.annote("SourceFileRow", {
    description: "SQLite row shape for persisted repository source files.",
  })
) {}

class SymbolRow extends S.Class<SymbolRow>($I`SymbolRow`)(
  {
    repo_id: RepoId,
    source_snapshot_id: SourceSnapshotId,
    symbol_id: S.String,
    symbol_name: S.String,
    qualified_name: S.String,
    symbol_kind: RepoSymbolKind,
    exported: NonNegativeInt,
    file_path: FilePath,
    start_line: PosInt,
    end_line: PosInt,
    signature: S.String,
    js_doc_summary: S.OptionFromNullOr(S.String),
    declaration_text: S.String,
    search_text: S.String,
  },
  $I.annote("SymbolRow", {
    description: "SQLite row shape for persisted repository symbol records.",
  })
) {}

class ImportEdgeRow extends S.Class<ImportEdgeRow>($I`ImportEdgeRow`)(
  {
    repo_id: RepoId,
    source_snapshot_id: SourceSnapshotId,
    importer_file_path: FilePath,
    start_line: PosInt,
    end_line: PosInt,
    module_specifier: S.String,
    imported_name: S.OptionFromNullOr(S.String),
    type_only: NonNegativeInt,
  },
  $I.annote("ImportEdgeRow", {
    description: "SQLite row shape for persisted repository import edges.",
  })
) {}

class RunRow extends S.Class<RunRow>($I`RunRow`)(
  {
    run_id: RunId,
    run_json: S.String,
    updated_at: S.DateTimeUtcFromMillis,
  },
  $I.annote("RunRow", {
    description: "SQLite row shape for persisted run projections.",
  })
) {}

const decodeRepoRow = S.decodeUnknownEffect(RepoRow);
const decodeIndexArtifactRow = S.decodeUnknownEffect(IndexArtifactRow);
const decodePacketRow = S.decodeUnknownEffect(PacketRow);
const decodeRunRow = S.decodeUnknownEffect(RunRow);
const decodeSourceSnapshotRow = S.decodeUnknownEffect(SourceSnapshotRow);
const decodeSourceFileRow = S.decodeUnknownEffect(SourceFileRow);
const decodeSymbolRow = S.decodeUnknownEffect(SymbolRow);
const decodeImportEdgeRow = S.decodeUnknownEffect(ImportEdgeRow);

export class ReplaceSnapshotArtifactsInput extends S.Class<ReplaceSnapshotArtifactsInput>(
  $I`ReplaceSnapshotArtifactsInput`
)(
  {
    artifact: RepoIndexArtifact,
    snapshot: RepoSourceSnapshot,
    files: S.Array(RepoSourceFile),
    symbols: S.Array(RepoSymbolRecord),
    importEdges: S.Array(RepoImportEdge),
  },
  $I.annote("ReplaceSnapshotArtifactsInput", {
    description: "Atomic payload for replacing the latest repository source snapshot artifacts.",
  })
) {}

/**
 * Service contract for the local repo-memory persistence boundary.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface LocalRepoMemoryDriverShape {
  readonly countSourceFiles: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ) => Effect.Effect<number, LocalRepoMemoryDriverError>;
  readonly findSourceFiles: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    query: string,
    limit: number
  ) => Effect.Effect<ReadonlyArray<RepoSourceFile>, LocalRepoMemoryDriverError>;
  readonly findSymbolsByExactName: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    symbolName: string
  ) => Effect.Effect<ReadonlyArray<RepoSymbolRecord>, LocalRepoMemoryDriverError>;
  readonly getRepo: (repoId: RepoId) => Effect.Effect<RepoRegistration, LocalRepoMemoryDriverError>;
  readonly getRetrievalPacket: (runId: RunId) => Effect.Effect<O.Option<RetrievalPacket>, LocalRepoMemoryDriverError>;
  readonly getRun: (runId: RunId) => Effect.Effect<O.Option<RepoRun>, LocalRepoMemoryDriverError>;
  readonly latestIndexArtifact: (
    repoId: RepoId
  ) => Effect.Effect<O.Option<RepoIndexArtifact>, LocalRepoMemoryDriverError>;
  readonly latestSourceSnapshot: (
    repoId: RepoId
  ) => Effect.Effect<O.Option<RepoSourceSnapshot>, LocalRepoMemoryDriverError>;
  readonly listExportedSymbolsForFile: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    filePath: FilePath
  ) => Effect.Effect<ReadonlyArray<RepoSymbolRecord>, LocalRepoMemoryDriverError>;
  readonly listImportEdges: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ) => Effect.Effect<ReadonlyArray<RepoImportEdge>, LocalRepoMemoryDriverError>;
  readonly listRepos: Effect.Effect<ReadonlyArray<RepoRegistration>, LocalRepoMemoryDriverError>;
  readonly listRuns: Effect.Effect<ReadonlyArray<RepoRun>, LocalRepoMemoryDriverError>;
  readonly listSymbolRecords: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ) => Effect.Effect<ReadonlyArray<RepoSymbolRecord>, LocalRepoMemoryDriverError>;
  readonly registerRepo: (input: RepoRegistrationInput) => Effect.Effect<RepoRegistration, LocalRepoMemoryDriverError>;
  readonly replaceSnapshotArtifacts: (
    input: ReplaceSnapshotArtifactsInput
  ) => Effect.Effect<RepoIndexArtifact, LocalRepoMemoryDriverError>;
  readonly saveIndexArtifact: (
    artifact: RepoIndexArtifact
  ) => Effect.Effect<RepoIndexArtifact, LocalRepoMemoryDriverError>;
  readonly saveRetrievalPacket: (
    runId: RunId,
    packet: RetrievalPacket
  ) => Effect.Effect<RetrievalPacket, LocalRepoMemoryDriverError>;
  readonly saveRun: (run: RepoRun) => Effect.Effect<RepoRun, LocalRepoMemoryDriverError>;
  readonly searchSymbols: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    query: string,
    limit: number
  ) => Effect.Effect<ReadonlyArray<RepoSymbolRecord>, LocalRepoMemoryDriverError>;
}

/**
 * Service tag for the local repo-memory persistence driver.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class LocalRepoMemoryDriver extends ServiceMap.Service<LocalRepoMemoryDriver, LocalRepoMemoryDriverShape>()(
  $I`LocalRepoMemoryDriver`
) {
  static readonly layer = (
    config: LocalRepoMemoryDriverConfig
  ): Layer.Layer<
    LocalRepoMemoryDriver,
    LocalRepoMemoryDriverError,
    FileSystem.FileSystem | Path.Path | SqlClient.SqlClient
  > =>
    Layer.effect(
      LocalRepoMemoryDriver,
      makeLocalRepoMemoryDriver(config).pipe(
        Effect.withSpan("LocalRepoMemoryDriver.make"),
        Effect.annotateLogs({ component: "repo-memory-driver" })
      )
    );
}

const makeLocalRepoMemoryDriver = Effect.fn("LocalRepoMemoryDriver.make")(function* (
  config: LocalRepoMemoryDriverConfig
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const sql = yield* SqlClient.SqlClient;
  const reposTable = sql("repo_memory_repos");
  const indexArtifactsTable = sql("repo_memory_index_artifacts");
  const sourceSnapshotsTable = sql("repo_memory_source_snapshots");
  const sourceFilesTable = sql("repo_memory_source_files");
  const symbolRecordsTable = sql("repo_memory_symbol_records");
  const importEdgesTable = sql("repo_memory_import_edges");
  const retrievalPacketsTable = sql("repo_memory_retrieval_packets");
  const citationsTable = sql("repo_memory_citations");
  const runsTable = sql("repo_memory_runs");

  const toDriverError = (message: string, status: number, cause?: unknown): LocalRepoMemoryDriverError =>
    new LocalRepoMemoryDriverError({
      message,
      status,
      cause: O.isOption(cause) ? cause : O.fromUndefinedOr(cause),
    });

  const annotateDriverSpan = Effect.fn("LocalRepoMemoryDriver.annotateSpan")(function* (
    annotations: Record<string, unknown>
  ) {
    yield* Effect.annotateCurrentSpan(annotations);
  });

  const initializeTables = Effect.fn("LocalRepoMemoryDriver.initializeTables")(function* (): Effect.fn.Return<
    void,
    LocalRepoMemoryDriverError
  > {
    yield* sql`
      CREATE TABLE IF NOT EXISTS ${reposTable} (
        id TEXT PRIMARY KEY,
        repo_path TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        language TEXT NOT NULL,
        registered_at INTEGER NOT NULL
      )
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create repo registration table.", 500, cause)));

    yield* sql`
      CREATE TABLE IF NOT EXISTS ${indexArtifactsTable} (
        run_id TEXT PRIMARY KEY,
        repo_id TEXT NOT NULL,
        source_snapshot_id TEXT NOT NULL,
        indexed_file_count INTEGER NOT NULL,
        completed_at INTEGER NOT NULL
      )
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create index artifact table.", 500, cause)));

    yield* sql`
      CREATE TABLE IF NOT EXISTS ${sourceSnapshotsTable} (
        snapshot_id TEXT PRIMARY KEY,
        repo_id TEXT NOT NULL,
        captured_at INTEGER NOT NULL,
        file_count INTEGER NOT NULL
      )
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create source snapshot table.", 500, cause)));

    yield* sql`
      CREATE TABLE IF NOT EXISTS ${sourceFilesTable} (
        repo_id TEXT NOT NULL,
        source_snapshot_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        content_hash TEXT NOT NULL,
        line_count INTEGER NOT NULL,
        workspace_name TEXT NOT NULL,
        tsconfig_path TEXT NOT NULL,
        PRIMARY KEY (repo_id, source_snapshot_id, file_path)
      )
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create source file table.", 500, cause)));

    yield* sql`
      CREATE TABLE IF NOT EXISTS ${symbolRecordsTable} (
        repo_id TEXT NOT NULL,
        source_snapshot_id TEXT NOT NULL,
        symbol_id TEXT NOT NULL,
        symbol_name TEXT NOT NULL,
        qualified_name TEXT NOT NULL,
        symbol_kind TEXT NOT NULL,
        exported INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        start_line INTEGER NOT NULL,
        end_line INTEGER NOT NULL,
        signature TEXT NOT NULL,
        js_doc_summary TEXT,
        declaration_text TEXT NOT NULL,
        search_text TEXT NOT NULL,
        PRIMARY KEY (repo_id, source_snapshot_id, symbol_id)
      )
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create symbol record table.", 500, cause)));

    yield* sql`
      CREATE TABLE IF NOT EXISTS ${importEdgesTable} (
        repo_id TEXT NOT NULL,
        source_snapshot_id TEXT NOT NULL,
        importer_file_path TEXT NOT NULL,
        start_line INTEGER,
        end_line INTEGER,
        module_specifier TEXT NOT NULL,
        imported_name TEXT,
        type_only INTEGER NOT NULL,
        PRIMARY KEY (repo_id, source_snapshot_id, importer_file_path, module_specifier, imported_name)
      )
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create import edge table.", 500, cause)));

    const importEdgeColumns = yield* sql<{ readonly name: string }>`PRAGMA table_info(${importEdgesTable})`.pipe(
      Effect.mapError((cause) => toDriverError("Failed to inspect import edge table columns.", 500, cause))
    );
    const importEdgeColumnNames = pipe(
      importEdgeColumns,
      A.map((column) => column.name)
    );

    if (!pipe(importEdgeColumnNames, A.contains("start_line"))) {
      yield* sql`ALTER TABLE ${importEdgesTable} ADD COLUMN start_line INTEGER`.pipe(
        Effect.mapError((cause) => toDriverError("Failed to migrate import edge start_line column.", 500, cause))
      );
    }

    if (!pipe(importEdgeColumnNames, A.contains("end_line"))) {
      yield* sql`ALTER TABLE ${importEdgesTable} ADD COLUMN end_line INTEGER`.pipe(
        Effect.mapError((cause) => toDriverError("Failed to migrate import edge end_line column.", 500, cause))
      );
    }

    yield* sql`
      UPDATE ${importEdgesTable}
      SET start_line = COALESCE(start_line, 1),
          end_line = COALESCE(end_line, 1)
      WHERE start_line IS NULL OR end_line IS NULL
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to backfill import edge line columns.", 500, cause)));

    yield* sql`
      CREATE TABLE IF NOT EXISTS ${retrievalPacketsTable} (
        run_id TEXT PRIMARY KEY,
        packet_json TEXT NOT NULL
      )
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create retrieval packet table.", 500, cause)));

    yield* sql`
      CREATE TABLE IF NOT EXISTS ${runsTable} (
        run_id TEXT PRIMARY KEY,
        run_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create run projection table.", 500, cause)));

    yield* sql`
      CREATE TABLE IF NOT EXISTS ${citationsTable} (
        run_id TEXT NOT NULL,
        citation_id TEXT NOT NULL,
        repo_id TEXT NOT NULL,
        label TEXT NOT NULL,
        rationale TEXT NOT NULL,
        file_path TEXT NOT NULL,
        start_line INTEGER NOT NULL,
        end_line INTEGER NOT NULL,
        start_column INTEGER,
        end_column INTEGER,
        symbol_name TEXT,
        PRIMARY KEY (run_id, citation_id)
      )
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create citation backing table.", 500, cause)));
  });

  const repoRowToRegistration = (row: RepoRow): RepoRegistration =>
    new RepoRegistration({
      id: row.id,
      repoPath: row.repo_path,
      displayName: row.display_name,
      language: "typescript",
      registeredAt: row.registered_at,
    });

  const indexArtifactRowToModel = (row: IndexArtifactRow): RepoIndexArtifact =>
    new RepoIndexArtifact({
      runId: row.run_id,
      repoId: row.repo_id,
      sourceSnapshotId: row.source_snapshot_id,
      indexedFileCount: row.indexed_file_count,
      completedAt: row.completed_at,
    });

  const sourceSnapshotRowToModel = (row: SourceSnapshotRow): RepoSourceSnapshot =>
    new RepoSourceSnapshot({
      id: row.snapshot_id,
      repoId: row.repo_id,
      capturedAt: row.captured_at,
      fileCount: row.file_count,
    });

  const sourceFileRowToModel = (row: SourceFileRow): RepoSourceFile =>
    new RepoSourceFile({
      repoId: row.repo_id,
      sourceSnapshotId: row.source_snapshot_id,
      filePath: row.file_path,
      contentHash: row.content_hash,
      lineCount: row.line_count,
      workspaceName: row.workspace_name,
      tsconfigPath: row.tsconfig_path,
    });

  const symbolRowToModel = (row: SymbolRow): RepoSymbolRecord =>
    new RepoSymbolRecord({
      repoId: row.repo_id,
      sourceSnapshotId: row.source_snapshot_id,
      symbolId: row.symbol_id,
      symbolName: row.symbol_name,
      qualifiedName: row.qualified_name,
      symbolKind: row.symbol_kind,
      exported: row.exported === 1,
      filePath: row.file_path,
      startLine: row.start_line,
      endLine: row.end_line,
      signature: row.signature,
      jsDocSummary: row.js_doc_summary,
      declarationText: row.declaration_text,
      searchText: row.search_text,
    });

  const importEdgeRowToModel = (row: ImportEdgeRow): RepoImportEdge =>
    new RepoImportEdge({
      repoId: row.repo_id,
      sourceSnapshotId: row.source_snapshot_id,
      importerFilePath: row.importer_file_path,
      startLine: row.start_line,
      endLine: row.end_line,
      moduleSpecifier: row.module_specifier,
      importedName: row.imported_name,
      typeOnly: row.type_only === 1,
    });

  const packetRowToModel = (row: PacketRow): Effect.Effect<RetrievalPacket, LocalRepoMemoryDriverError> =>
    decodePacketJson(row.packet_json).pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to decode retrieval packet for run "${row.run_id}".`, 500, cause)
      )
    );

  const runRowToModel = (row: RunRow): Effect.Effect<RepoRun, LocalRepoMemoryDriverError> =>
    decodeRunJson(row.run_json).pipe(
      Effect.mapError((cause) => toDriverError(`Failed to decode run projection for "${row.run_id}".`, 500, cause))
    );

  const decodeSymbolModel = (row: SymbolRow): Effect.Effect<RepoSymbolRecord, LocalRepoMemoryDriverError> =>
    decodeSymbolRow(row).pipe(
      Effect.map(symbolRowToModel),
      Effect.mapError((cause) => toDriverError(`Failed to decode symbol row for repo "${row.repo_id}".`, 500, cause))
    );

  const repoIdFromPath = Effect.fn("LocalRepoMemoryDriver.repoIdFromPath")(function* (
    normalizedRepoPath: string
  ): Effect.fn.Return<RepoId, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({ repo_path: normalizedRepoPath });

    return yield* decodeSha256Hex(new TextEncoder().encode(normalizedRepoPath)).pipe(
      Effect.mapError((cause) => toDriverError(`Failed to hash repository path "${normalizedRepoPath}".`, 500, cause)),
      Effect.map((digest) => decodeRepoId(`repo:${digest}`))
    );
  });

  const insertCitationRows = Effect.fn("LocalRepoMemoryDriver.insertCitationRows")(function* (
    runId: RunId,
    packet: RetrievalPacket
  ): Effect.fn.Return<void, LocalRepoMemoryDriverError> {
    yield* sql`DELETE FROM ${citationsTable} WHERE run_id = ${runId}`.pipe(
      Effect.mapError((cause) => toDriverError(`Failed to clear citations for run "${runId}".`, 500, cause))
    );

    if (A.isReadonlyArrayEmpty(packet.citations)) {
      return;
    }

    for (const citation of packet.citations) {
      yield* sql`
        INSERT INTO ${citationsTable} (
          citation_id,
          run_id,
          repo_id,
          label,
          rationale,
          file_path,
          start_line,
          end_line,
          start_column,
          end_column,
          symbol_name
        ) VALUES (
          ${citation.id},
          ${runId},
          ${citation.repoId},
          ${citation.label},
          ${citation.rationale},
          ${citation.span.filePath},
          ${citation.span.startLine},
          ${citation.span.endLine},
          ${pipe(citation.span.startColumn, O.getOrNull)},
          ${pipe(citation.span.endColumn, O.getOrNull)},
          ${pipe(citation.span.symbolName, O.getOrNull)}
        )
      `.pipe(
        Effect.mapError((cause) =>
          toDriverError(`Failed to persist citation backing record "${citation.id}" for run "${runId}".`, 500, cause)
        )
      );
    }
  });

  yield* fs
    .makeDirectory(config.appDataDir, { recursive: true })
    .pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to create repo-memory app data directory at "${config.appDataDir}".`, 500, cause)
      )
    );
  yield* initializeTables();

  const listRepos: LocalRepoMemoryDriverShape["listRepos"] = sql<RepoRow>`
    SELECT id, repo_path, display_name, language, registered_at
    FROM ${reposTable}
    ORDER BY registered_at ASC
  `.pipe(
    Effect.flatMap((rows) => Effect.forEach(rows, (row) => decodeRepoRow(row).pipe(Effect.map(repoRowToRegistration)))),
    Effect.mapError((cause) => toDriverError("Failed to list registered repositories.", 500, cause)),
    Effect.withSpan("LocalRepoMemoryDriver.listRepos"),
    Effect.annotateLogs({ component: "repo-memory-driver" })
  );

  const listRuns: LocalRepoMemoryDriverShape["listRuns"] = sql<RunRow>`
    SELECT run_id, run_json, updated_at
    FROM ${runsTable}
    ORDER BY updated_at DESC
  `.pipe(
    Effect.flatMap((rows) => Effect.forEach(rows, (row) => decodeRunRow(row).pipe(Effect.flatMap(runRowToModel)))),
    Effect.mapError((cause) => toDriverError("Failed to list run projections.", 500, cause)),
    Effect.withSpan("LocalRepoMemoryDriver.listRuns"),
    Effect.annotateLogs({ component: "repo-memory-driver" })
  );

  const getRepo: LocalRepoMemoryDriverShape["getRepo"] = Effect.fn("LocalRepoMemoryDriver.getRepo")(
    function* (repoId): Effect.fn.Return<RepoRegistration, LocalRepoMemoryDriverError> {
      yield* annotateDriverSpan({ repo_id: repoId });

      const rows = yield* sql<RepoRow>`
        SELECT id, repo_path, display_name, language, registered_at
        FROM ${reposTable}
        WHERE id = ${repoId}
        LIMIT 1
      `.pipe(Effect.mapError((cause) => toDriverError(`Failed to load repository "${repoId}".`, 500, cause)));

      return yield* pipe(
        rows,
        A.head,
        O.match({
          onNone: () => toDriverError(`Repository not found: "${repoId}".`, 404),
          onSome: (row) =>
            decodeRepoRow(row).pipe(
              Effect.map(repoRowToRegistration),
              Effect.mapError((cause) => toDriverError(`Failed to decode repository "${repoId}".`, 500, cause))
            ),
        })
      );
    }
  );

  const getRun: LocalRepoMemoryDriverShape["getRun"] = Effect.fn("LocalRepoMemoryDriver.getRun")(
    function* (runId): Effect.fn.Return<O.Option<RepoRun>, LocalRepoMemoryDriverError> {
      yield* annotateDriverSpan({ run_id: runId });

      const rows = yield* sql<RunRow>`
        SELECT run_id, run_json, updated_at
        FROM ${runsTable}
        WHERE run_id = ${runId}
        LIMIT 1
      `.pipe(Effect.mapError((cause) => toDriverError(`Failed to load run "${runId}".`, 500, cause)));

      return yield* pipe(
        rows,
        A.head,
        O.match({
          onNone: () => Effect.succeed(O.none()),
          onSome: (row) =>
            decodeRunRow(row).pipe(
              Effect.flatMap(runRowToModel),
              Effect.map(O.some),
              Effect.mapError((cause) => toDriverError(`Failed to decode run row "${runId}".`, 500, cause))
            ),
        })
      );
    }
  );

  const registerRepo: LocalRepoMemoryDriverShape["registerRepo"] = Effect.fn("LocalRepoMemoryDriver.registerRepo")(
    function* (input): Effect.fn.Return<RepoRegistration, LocalRepoMemoryDriverError> {
      const normalizedRepoPath = path.resolve(input.repoPath);
      yield* annotateDriverSpan({ repo_path: normalizedRepoPath });

      const exists = yield* fs
        .exists(normalizedRepoPath)
        .pipe(
          Effect.mapError((cause) =>
            toDriverError(`Failed to check repository path "${normalizedRepoPath}".`, 500, cause)
          )
        );

      if (!exists) {
        return yield* toDriverError(`Repository path does not exist: "${normalizedRepoPath}".`, 404);
      }

      const stat = yield* fs
        .stat(normalizedRepoPath)
        .pipe(
          Effect.mapError((cause) =>
            toDriverError(`Failed to stat repository path "${normalizedRepoPath}".`, 500, cause)
          )
        );

      if (stat.type !== "Directory") {
        return yield* toDriverError(`Repository path must be a directory: "${normalizedRepoPath}".`, 400);
      }

      const existingRows = yield* sql<RepoRow>`
        SELECT id, repo_path, display_name, language, registered_at
        FROM ${reposTable}
        WHERE repo_path = ${normalizedRepoPath}
        LIMIT 1
      `.pipe(
        Effect.mapError((cause) =>
          toDriverError(
            `Failed to check for an existing repository registration at "${normalizedRepoPath}".`,
            500,
            cause
          )
        )
      );

      const existing = A.head(existingRows);
      if (O.isSome(existing)) {
        return yield* decodeRepoRow(existing.value).pipe(
          Effect.map(repoRowToRegistration),
          Effect.mapError((cause) =>
            toDriverError(`Failed to decode existing repository registration at "${normalizedRepoPath}".`, 500, cause)
          )
        );
      }

      const displayName = pipe(
        input.displayName,
        O.filter(Str.isNonEmpty),
        O.getOrElse(() => path.basename(normalizedRepoPath))
      );
      const registration = new RepoRegistration({
        id: yield* repoIdFromPath(normalizedRepoPath),
        repoPath: decodeFilePath(normalizedRepoPath),
        displayName,
        language: "typescript",
        registeredAt: yield* DateTime.now,
      });

      yield* sql`
        INSERT INTO ${reposTable} (id, repo_path, display_name, language, registered_at)
        VALUES (
          ${registration.id},
          ${registration.repoPath},
          ${registration.displayName},
          ${registration.language},
          ${DateTime.toEpochMillis(registration.registeredAt)}
        )
      `.pipe(
        Effect.mapError((cause) =>
          toDriverError(`Failed to persist repository registration for "${registration.repoPath}".`, 500, cause)
        )
      );

      yield* Effect.logInfo({
        message: "repo registered",
        repo_id: registration.id,
        repo_path: registration.repoPath,
      }).pipe(Effect.annotateLogs({ component: "repo-memory-driver" }));

      return registration;
    }
  );

  const latestIndexArtifact: LocalRepoMemoryDriverShape["latestIndexArtifact"] = Effect.fn(
    "LocalRepoMemoryDriver.latestIndexArtifact"
  )(function* (repoId): Effect.fn.Return<O.Option<RepoIndexArtifact>, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({ repo_id: repoId });

    const rows = yield* sql<IndexArtifactRow>`
      SELECT run_id, repo_id, source_snapshot_id, indexed_file_count, completed_at
      FROM ${indexArtifactsTable}
      WHERE repo_id = ${repoId}
      ORDER BY completed_at DESC
      LIMIT 1
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to load latest index artifact for repo "${repoId}".`, 500, cause)
      )
    );

    return yield* pipe(
      rows,
      A.head,
      O.match({
        onNone: () => Effect.succeed(O.none()),
        onSome: (row) =>
          decodeIndexArtifactRow(row).pipe(
            Effect.map(indexArtifactRowToModel),
            Effect.map(O.some),
            Effect.mapError((cause) =>
              toDriverError(`Failed to decode index artifact for repo "${repoId}".`, 500, cause)
            )
          ),
      })
    );
  });

  const latestSourceSnapshot: LocalRepoMemoryDriverShape["latestSourceSnapshot"] = Effect.fn(
    "LocalRepoMemoryDriver.latestSourceSnapshot"
  )(function* (repoId): Effect.fn.Return<O.Option<RepoSourceSnapshot>, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({ repo_id: repoId });

    const rows = yield* sql<SourceSnapshotRow>`
      SELECT snapshot_id, repo_id, captured_at, file_count
      FROM ${sourceSnapshotsTable}
      WHERE repo_id = ${repoId}
      ORDER BY captured_at DESC
      LIMIT 1
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to load latest source snapshot for repo "${repoId}".`, 500, cause)
      )
    );

    return yield* pipe(
      rows,
      A.head,
      O.match({
        onNone: () => Effect.succeed(O.none()),
        onSome: (row) =>
          decodeSourceSnapshotRow(row).pipe(
            Effect.map(sourceSnapshotRowToModel),
            Effect.map(O.some),
            Effect.mapError((cause) =>
              toDriverError(`Failed to decode latest source snapshot for repo "${repoId}".`, 500, cause)
            )
          ),
      })
    );
  });

  const countSourceFiles: LocalRepoMemoryDriverShape["countSourceFiles"] = Effect.fn(
    "LocalRepoMemoryDriver.countSourceFiles"
  )(function* (repoId, sourceSnapshotId): Effect.fn.Return<number, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({ repo_id: repoId, source_snapshot_id: sourceSnapshotId });

    const rows = yield* sql<{ readonly file_count: number }>`
      SELECT COUNT(*) AS file_count
      FROM ${sourceFilesTable}
      WHERE repo_id = ${repoId} AND source_snapshot_id = ${sourceSnapshotId}
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to count source files for repo "${repoId}" snapshot "${sourceSnapshotId}".`, 500, cause)
      )
    );

    return pipe(
      rows,
      A.head,
      O.map((row) => row.file_count),
      O.getOrElse(() => 0)
    );
  });

  const findSourceFiles: LocalRepoMemoryDriverShape["findSourceFiles"] = Effect.fn(
    "LocalRepoMemoryDriver.findSourceFiles"
  )(function* (repoId, sourceSnapshotId, query, limit): Effect.fn.Return<
    ReadonlyArray<RepoSourceFile>,
    LocalRepoMemoryDriverError
  > {
    yield* annotateDriverSpan({ repo_id: repoId, source_snapshot_id: sourceSnapshotId, query, limit });

    const normalizedQuery = `%${Str.toLowerCase(Str.trim(query))}%`;
    const rows = yield* sql<SourceFileRow>`
      SELECT repo_id, source_snapshot_id, file_path, content_hash, line_count, workspace_name, tsconfig_path
      FROM ${sourceFilesTable}
      WHERE repo_id = ${repoId}
        AND source_snapshot_id = ${sourceSnapshotId}
        AND LOWER(file_path) LIKE ${normalizedQuery}
      ORDER BY file_path ASC
      LIMIT ${Math.max(1, limit)}
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to search source files for repo "${repoId}" snapshot "${sourceSnapshotId}".`, 500, cause)
      )
    );

    return yield* Effect.forEach(rows, (row) =>
      decodeSourceFileRow(row).pipe(
        Effect.map(sourceFileRowToModel),
        Effect.mapError((cause) => toDriverError(`Failed to decode source file row for repo "${repoId}".`, 500, cause))
      )
    );
  });

  const listSymbolRecords: LocalRepoMemoryDriverShape["listSymbolRecords"] = Effect.fn(
    "LocalRepoMemoryDriver.listSymbolRecords"
  )(function* (repoId, sourceSnapshotId): Effect.fn.Return<
    ReadonlyArray<RepoSymbolRecord>,
    LocalRepoMemoryDriverError
  > {
    yield* annotateDriverSpan({ repo_id: repoId, source_snapshot_id: sourceSnapshotId });

    const rows = yield* sql<SymbolRow>`
      SELECT
        repo_id,
        source_snapshot_id,
        symbol_id,
        symbol_name,
        qualified_name,
        symbol_kind,
        exported,
        file_path,
        start_line,
        end_line,
        signature,
        js_doc_summary,
        declaration_text,
        search_text
      FROM ${symbolRecordsTable}
      WHERE repo_id = ${repoId} AND source_snapshot_id = ${sourceSnapshotId}
      ORDER BY symbol_name ASC, file_path ASC
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to list symbol records for repo "${repoId}" snapshot "${sourceSnapshotId}".`, 500, cause)
      )
    );

    return yield* Effect.forEach(rows, decodeSymbolModel);
  });

  const findSymbolsByExactName: LocalRepoMemoryDriverShape["findSymbolsByExactName"] = Effect.fn(
    "LocalRepoMemoryDriver.findSymbolsByExactName"
  )(function* (repoId, sourceSnapshotId, symbolName): Effect.fn.Return<
    ReadonlyArray<RepoSymbolRecord>,
    LocalRepoMemoryDriverError
  > {
    yield* annotateDriverSpan({ repo_id: repoId, source_snapshot_id: sourceSnapshotId, symbol_name: symbolName });

    const normalizedSymbolName = Str.toLowerCase(Str.trim(symbolName));
    const rows = yield* sql<SymbolRow>`
      SELECT
        repo_id,
        source_snapshot_id,
        symbol_id,
        symbol_name,
        qualified_name,
        symbol_kind,
        exported,
        file_path,
        start_line,
        end_line,
        signature,
        js_doc_summary,
        declaration_text,
        search_text
      FROM ${symbolRecordsTable}
      WHERE repo_id = ${repoId}
        AND source_snapshot_id = ${sourceSnapshotId}
        AND LOWER(symbol_name) = ${normalizedSymbolName}
      ORDER BY exported DESC, file_path ASC, start_line ASC
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(
          `Failed to find symbol "${symbolName}" for repo "${repoId}" snapshot "${sourceSnapshotId}".`,
          500,
          cause
        )
      )
    );

    return yield* Effect.forEach(rows, decodeSymbolModel);
  });

  const searchSymbols: LocalRepoMemoryDriverShape["searchSymbols"] = Effect.fn("LocalRepoMemoryDriver.searchSymbols")(
    function* (
      repoId,
      sourceSnapshotId,
      query,
      limit
    ): Effect.fn.Return<ReadonlyArray<RepoSymbolRecord>, LocalRepoMemoryDriverError> {
      yield* annotateDriverSpan({ repo_id: repoId, source_snapshot_id: sourceSnapshotId, query, limit });

      const normalizedQuery = `%${Str.toLowerCase(Str.trim(query))}%`;
      const rows = yield* sql<SymbolRow>`
      SELECT
        repo_id,
        source_snapshot_id,
        symbol_id,
        symbol_name,
        qualified_name,
        symbol_kind,
        exported,
        file_path,
        start_line,
        end_line,
        signature,
        js_doc_summary,
        declaration_text,
        search_text
      FROM ${symbolRecordsTable}
      WHERE repo_id = ${repoId}
        AND source_snapshot_id = ${sourceSnapshotId}
        AND search_text LIKE ${normalizedQuery}
      ORDER BY exported DESC, symbol_name ASC, file_path ASC
      LIMIT ${Math.max(1, limit)}
    `.pipe(
        Effect.mapError((cause) =>
          toDriverError(`Failed to search symbols for repo "${repoId}" snapshot "${sourceSnapshotId}".`, 500, cause)
        )
      );

      return yield* Effect.forEach(rows, decodeSymbolModel);
    }
  );

  const listExportedSymbolsForFile: LocalRepoMemoryDriverShape["listExportedSymbolsForFile"] = Effect.fn(
    "LocalRepoMemoryDriver.listExportedSymbolsForFile"
  )(function* (repoId, sourceSnapshotId, filePath): Effect.fn.Return<
    ReadonlyArray<RepoSymbolRecord>,
    LocalRepoMemoryDriverError
  > {
    yield* annotateDriverSpan({ repo_id: repoId, source_snapshot_id: sourceSnapshotId, file_path: filePath });

    const rows = yield* sql<SymbolRow>`
      SELECT
        repo_id,
        source_snapshot_id,
        symbol_id,
        symbol_name,
        qualified_name,
        symbol_kind,
        exported,
        file_path,
        start_line,
        end_line,
        signature,
        js_doc_summary,
        declaration_text,
        search_text
      FROM ${symbolRecordsTable}
      WHERE repo_id = ${repoId}
        AND source_snapshot_id = ${sourceSnapshotId}
        AND file_path = ${filePath}
        AND exported = 1
      ORDER BY symbol_name ASC, start_line ASC
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to list exported symbols for file "${filePath}" in repo "${repoId}".`, 500, cause)
      )
    );

    return yield* Effect.forEach(rows, decodeSymbolModel);
  });

  const listImportEdges: LocalRepoMemoryDriverShape["listImportEdges"] = Effect.fn(
    "LocalRepoMemoryDriver.listImportEdges"
  )(function* (repoId, sourceSnapshotId): Effect.fn.Return<ReadonlyArray<RepoImportEdge>, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({ repo_id: repoId, source_snapshot_id: sourceSnapshotId });

    const rows = yield* sql<ImportEdgeRow>`
      SELECT repo_id, source_snapshot_id, importer_file_path, start_line, end_line, module_specifier, imported_name, type_only
      FROM ${importEdgesTable}
      WHERE repo_id = ${repoId} AND source_snapshot_id = ${sourceSnapshotId}
      ORDER BY importer_file_path ASC, module_specifier ASC
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to list import edges for repo "${repoId}" snapshot "${sourceSnapshotId}".`, 500, cause)
      )
    );

    return yield* Effect.forEach(rows, (row) =>
      decodeImportEdgeRow(row).pipe(
        Effect.map(importEdgeRowToModel),
        Effect.mapError((cause) => toDriverError(`Failed to decode import edge row for repo "${repoId}".`, 500, cause))
      )
    );
  });

  const saveIndexArtifact: LocalRepoMemoryDriverShape["saveIndexArtifact"] = Effect.fn(
    "LocalRepoMemoryDriver.saveIndexArtifact"
  )(function* (artifact): Effect.fn.Return<RepoIndexArtifact, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({ repo_id: artifact.repoId, run_id: artifact.runId });

    yield* sql`
      INSERT INTO ${indexArtifactsTable} (
        run_id,
        repo_id,
        source_snapshot_id,
        indexed_file_count,
        completed_at
      ) VALUES (
        ${artifact.runId},
        ${artifact.repoId},
        ${artifact.sourceSnapshotId},
        ${artifact.indexedFileCount},
        ${DateTime.toEpochMillis(artifact.completedAt)}
      )
      ON CONFLICT(run_id) DO UPDATE SET
        repo_id = excluded.repo_id,
        source_snapshot_id = excluded.source_snapshot_id,
        indexed_file_count = excluded.indexed_file_count,
        completed_at = excluded.completed_at
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to persist index artifact for run "${artifact.runId}".`, 500, cause)
      )
    );

    return artifact;
  });

  const replaceSnapshotArtifacts: LocalRepoMemoryDriverShape["replaceSnapshotArtifacts"] = Effect.fn(
    "LocalRepoMemoryDriver.replaceSnapshotArtifacts"
  )(function* (input): Effect.fn.Return<RepoIndexArtifact, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({
      repo_id: input.snapshot.repoId,
      run_id: input.artifact.runId,
      source_snapshot_id: input.snapshot.id,
      source_file_count: input.files.length,
      symbol_count: input.symbols.length,
      import_edge_count: input.importEdges.length,
    });

    yield* sql
      .withTransaction(
        Effect.gen(function* () {
          yield* sql`DELETE FROM ${sourceFilesTable} WHERE repo_id = ${input.snapshot.repoId}`;
          yield* sql`DELETE FROM ${symbolRecordsTable} WHERE repo_id = ${input.snapshot.repoId}`;
          yield* sql`DELETE FROM ${importEdgesTable} WHERE repo_id = ${input.snapshot.repoId}`;
          yield* sql`DELETE FROM ${sourceSnapshotsTable} WHERE repo_id = ${input.snapshot.repoId}`;

          yield* sql`
            INSERT INTO ${sourceSnapshotsTable} (snapshot_id, repo_id, captured_at, file_count)
            VALUES (
              ${input.snapshot.id},
              ${input.snapshot.repoId},
              ${DateTime.toEpochMillis(input.snapshot.capturedAt)},
              ${input.snapshot.fileCount}
            )
          `;

          for (const file of input.files) {
            yield* sql`
              INSERT INTO ${sourceFilesTable} (
                repo_id,
                source_snapshot_id,
                file_path,
                content_hash,
                line_count,
                workspace_name,
                tsconfig_path
              ) VALUES (
                ${file.repoId},
                ${file.sourceSnapshotId},
                ${file.filePath},
                ${file.contentHash},
                ${file.lineCount},
                ${file.workspaceName},
                ${file.tsconfigPath}
              )
            `;
          }

          for (const symbol of input.symbols) {
            yield* sql`
              INSERT INTO ${symbolRecordsTable} (
                repo_id,
                source_snapshot_id,
                symbol_id,
                symbol_name,
                qualified_name,
                symbol_kind,
                exported,
                file_path,
                start_line,
                end_line,
                signature,
                js_doc_summary,
                declaration_text,
                search_text
              ) VALUES (
                ${symbol.repoId},
                ${symbol.sourceSnapshotId},
                ${symbol.symbolId},
                ${symbol.symbolName},
                ${symbol.qualifiedName},
                ${symbol.symbolKind},
                ${symbol.exported ? 1 : 0},
                ${symbol.filePath},
                ${symbol.startLine},
                ${symbol.endLine},
                ${symbol.signature},
                ${pipe(symbol.jsDocSummary, O.getOrNull)},
                ${symbol.declarationText},
                ${symbol.searchText}
              )
            `;
          }

          for (const importEdge of input.importEdges) {
            yield* sql`
        INSERT INTO ${importEdgesTable} (
          repo_id,
          source_snapshot_id,
          importer_file_path,
          start_line,
          end_line,
          module_specifier,
          imported_name,
          type_only
        ) VALUES (
          ${importEdge.repoId},
          ${importEdge.sourceSnapshotId},
          ${importEdge.importerFilePath},
          ${importEdge.startLine},
          ${importEdge.endLine},
          ${importEdge.moduleSpecifier},
          ${pipe(importEdge.importedName, O.getOrNull)},
          ${importEdge.typeOnly ? 1 : 0}
              )
            `;
          }

          yield* saveIndexArtifact(input.artifact);
        })
      )
      .pipe(
        Effect.mapError((cause) =>
          toDriverError(
            `Failed to replace snapshot artifacts for repo "${input.snapshot.repoId}" and run "${input.artifact.runId}".`,
            500,
            cause
          )
        )
      );

    return input.artifact;
  });

  const saveRetrievalPacket: LocalRepoMemoryDriverShape["saveRetrievalPacket"] = Effect.fn(
    "LocalRepoMemoryDriver.saveRetrievalPacket"
  )(function* (runId, packet): Effect.fn.Return<RetrievalPacket, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({ repo_id: packet.repoId, run_id: runId });

    const packetJson = yield* encodePacketJson(packet).pipe(
      Effect.mapError((cause) => toDriverError(`Failed to encode retrieval packet for run "${runId}".`, 500, cause))
    );

    yield* sql
      .withTransaction(
        Effect.gen(function* () {
          yield* sql`
          INSERT INTO ${retrievalPacketsTable} (run_id, packet_json)
          VALUES (${runId}, ${packetJson})
          ON CONFLICT(run_id) DO UPDATE SET packet_json = excluded.packet_json
        `;
          yield* insertCitationRows(runId, packet);
        })
      )
      .pipe(
        Effect.mapError((cause) => toDriverError(`Failed to persist retrieval packet for run "${runId}".`, 500, cause))
      );

    return packet;
  });

  const saveRun: LocalRepoMemoryDriverShape["saveRun"] = Effect.fn("LocalRepoMemoryDriver.saveRun")(
    function* (run): Effect.fn.Return<RepoRun, LocalRepoMemoryDriverError> {
      const updatedAt = yield* DateTime.now;
      const runJson = yield* encodeRunJson(run).pipe(
        Effect.mapError((cause) => toDriverError(`Failed to encode run projection "${run.id}".`, 500, cause))
      );

      yield* sql`
      INSERT INTO ${runsTable} (run_id, run_json, updated_at)
      VALUES (${run.id}, ${runJson}, ${DateTime.toEpochMillis(updatedAt)})
      ON CONFLICT(run_id) DO UPDATE SET
        run_json = excluded.run_json,
        updated_at = excluded.updated_at
    `.pipe(Effect.mapError((cause) => toDriverError(`Failed to persist run projection "${run.id}".`, 500, cause)));

      return run;
    }
  );

  const getRetrievalPacket: LocalRepoMemoryDriverShape["getRetrievalPacket"] = Effect.fn(
    "LocalRepoMemoryDriver.getRetrievalPacket"
  )(function* (runId): Effect.fn.Return<O.Option<RetrievalPacket>, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({ run_id: runId });

    const rows = yield* sql<PacketRow>`
      SELECT run_id, packet_json
      FROM ${retrievalPacketsTable}
      WHERE run_id = ${runId}
      LIMIT 1
    `.pipe(
      Effect.mapError((cause) => toDriverError(`Failed to load retrieval packet for run "${runId}".`, 500, cause))
    );

    return yield* pipe(
      rows,
      A.head,
      O.match({
        onNone: () => Effect.succeed(O.none()),
        onSome: (row) =>
          decodePacketRow(row).pipe(
            Effect.flatMap(packetRowToModel),
            Effect.map(O.some),
            Effect.mapError((cause) =>
              toDriverError(`Failed to decode retrieval packet row for run "${runId}".`, 500, cause)
            )
          ),
      })
    );
  });

  return {
    countSourceFiles: (repoId, sourceSnapshotId) =>
      observeDriverOperation("countSourceFiles", countSourceFiles(repoId, sourceSnapshotId)),
    findSourceFiles: (repoId, sourceSnapshotId, query, limit) =>
      observeDriverOperation("findSourceFiles", findSourceFiles(repoId, sourceSnapshotId, query, limit)),
    findSymbolsByExactName: (repoId, sourceSnapshotId, symbolName) =>
      observeDriverOperation("findSymbolsByExactName", findSymbolsByExactName(repoId, sourceSnapshotId, symbolName)),
    getRepo: (repoId) => observeDriverOperation("getRepo", getRepo(repoId)),
    getRun: (runId) => observeDriverOperation("getRun", getRun(runId)),
    getRetrievalPacket: (runId) => observeDriverOperation("getRetrievalPacket", getRetrievalPacket(runId)),
    latestSourceSnapshot: (repoId) => observeDriverOperation("latestSourceSnapshot", latestSourceSnapshot(repoId)),
    listExportedSymbolsForFile: (repoId, sourceSnapshotId, filePath) =>
      observeDriverOperation(
        "listExportedSymbolsForFile",
        listExportedSymbolsForFile(repoId, sourceSnapshotId, filePath)
      ),
    listImportEdges: (repoId, sourceSnapshotId) =>
      observeDriverOperation("listImportEdges", listImportEdges(repoId, sourceSnapshotId)),
    latestIndexArtifact: (repoId) => observeDriverOperation("latestIndexArtifact", latestIndexArtifact(repoId)),
    listSymbolRecords: (repoId, sourceSnapshotId) =>
      observeDriverOperation("listSymbolRecords", listSymbolRecords(repoId, sourceSnapshotId)),
    listRepos: observeDriverOperation("listRepos", listRepos),
    listRuns: observeDriverOperation("listRuns", listRuns),
    replaceSnapshotArtifacts: (input) =>
      observeDriverOperation("replaceSnapshotArtifacts", replaceSnapshotArtifacts(input)),
    registerRepo: (input) => observeDriverOperation("registerRepo", registerRepo(input)),
    saveIndexArtifact: (artifact) => observeDriverOperation("saveIndexArtifact", saveIndexArtifact(artifact)),
    saveRun: (run) => observeDriverOperation("saveRun", saveRun(run)),
    saveRetrievalPacket: (runId, packet) =>
      observeDriverOperation("saveRetrievalPacket", saveRetrievalPacket(runId, packet)),
    searchSymbols: (repoId, sourceSnapshotId, query, limit) =>
      observeDriverOperation("searchSymbols", searchSymbols(repoId, sourceSnapshotId, query, limit)),
  } satisfies LocalRepoMemoryDriverShape;
});
