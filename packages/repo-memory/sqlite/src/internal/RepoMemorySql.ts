import { $RepoMemorySqliteId } from "@beep/identity/packages";
import {
  type ReplaceSnapshotArtifactsInput,
  RepoId,
  RepoImportEdge,
  RepoIndexArtifact,
  RepoRegistration,
  type RepoRegistrationInput,
  RepoRun,
  RepoSemanticArtifacts,
  RepoSourceFile,
  RepoSourceSnapshot,
  RepoSymbolDocumentation,
  RepoSymbolKind,
  RepoSymbolRecord,
  RetrievalPacket,
  RunId,
  SourceSnapshotId,
} from "@beep/repo-memory-model";
import { RepoStoreError } from "@beep/repo-memory-store";
import { FilePath, NonNegativeInt, PosInt, Sha256Hex, Sha256HexFromBytes } from "@beep/schema";
import { thunk0, thunkEffectSucceedNone, thunkEffectSucceedNull } from "@beep/utils";
import { Context, DateTime, Effect, FileSystem, Layer, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import { observeDriverOperation } from "./Telemetry.js";

const $I = $RepoMemorySqliteId.create("internal/RepoMemorySql");
const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeRepoId = S.decodeUnknownSync(RepoId);
const decodeSha256Hex = S.decodeUnknownEffect(Sha256HexFromBytes);
const encodeDocumentationJson = S.encodeUnknownEffect(S.fromJsonString(RepoSymbolDocumentation));
const decodeDocumentationJson = S.decodeUnknownEffect(S.fromJsonString(RepoSymbolDocumentation));
const encodePacketJson = S.encodeUnknownEffect(S.fromJsonString(RetrievalPacket));
const decodePacketJson = S.decodeUnknownEffect(S.fromJsonString(RetrievalPacket));
const encodeRunJson = S.encodeUnknownEffect(S.fromJsonString(RepoRun));
const decodeRunJson = S.decodeUnknownEffect(S.fromJsonString(RepoRun));
const encodeSemanticArtifactsJson = S.encodeUnknownEffect(S.fromJsonString(RepoSemanticArtifacts));
const decodeSemanticArtifactsJson = S.decodeUnknownEffect(S.fromJsonString(RepoSemanticArtifacts));

/**
 * Configuration for the local repo-memory persistence driver.
 *
 * @since 0.0.0
 * @category Configuration
 */
export class RepoMemorySqlConfig extends S.Class<RepoMemorySqlConfig>($I`RepoMemorySqlConfig`)(
  {
    appDataDir: FilePath,
  },
  $I.annote("RepoMemorySqlConfig", {
    description: "Configuration for the local repo-memory persistence driver.",
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
    js_doc_json: S.OptionFromNullOr(S.String),
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
    resolved_target_file_path: S.OptionFromNullOr(FilePath),
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

class SemanticArtifactsRow extends S.Class<SemanticArtifactsRow>($I`SemanticArtifactsRow`)(
  {
    repo_id: RepoId,
    source_snapshot_id: SourceSnapshotId,
    artifacts_json: S.String,
    updated_at: S.DateTimeUtcFromMillis,
  },
  $I.annote("SemanticArtifactsRow", {
    description: "SQLite row shape for persisted semantic artifacts.",
  })
) {}

const decodeRepoRow = S.decodeUnknownEffect(RepoRow);
const decodeIndexArtifactRow = S.decodeUnknownEffect(IndexArtifactRow);
const decodePacketRow = S.decodeUnknownEffect(PacketRow);
const decodeRunRow = S.decodeUnknownEffect(RunRow);
const decodeSemanticArtifactsRow = S.decodeUnknownEffect(SemanticArtifactsRow);
const decodeSourceSnapshotRow = S.decodeUnknownEffect(SourceSnapshotRow);
const decodeSourceFileRow = S.decodeUnknownEffect(SourceFileRow);
const decodeSymbolRow = S.decodeUnknownEffect(SymbolRow);
const decodeImportEdgeRow = S.decodeUnknownEffect(ImportEdgeRow);

/**
 * Service contract for the local repo-memory persistence boundary.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface RepoMemorySqlShape {
  readonly countSourceFiles: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ) => Effect.Effect<number, RepoStoreError>;
  readonly findSourceFiles: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    query: string,
    limit: number
  ) => Effect.Effect<ReadonlyArray<RepoSourceFile>, RepoStoreError>;
  readonly findSymbolsByExactName: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    symbolName: string
  ) => Effect.Effect<ReadonlyArray<RepoSymbolRecord>, RepoStoreError>;
  readonly getRepo: (repoId: RepoId) => Effect.Effect<RepoRegistration, RepoStoreError>;
  readonly getRetrievalPacket: (runId: RunId) => Effect.Effect<O.Option<RetrievalPacket>, RepoStoreError>;
  readonly getRun: (runId: RunId) => Effect.Effect<O.Option<RepoRun>, RepoStoreError>;
  readonly getSemanticArtifacts: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ) => Effect.Effect<O.Option<RepoSemanticArtifacts>, RepoStoreError>;
  readonly latestIndexArtifact: (repoId: RepoId) => Effect.Effect<O.Option<RepoIndexArtifact>, RepoStoreError>;
  readonly latestSemanticArtifacts: (repoId: RepoId) => Effect.Effect<O.Option<RepoSemanticArtifacts>, RepoStoreError>;
  readonly latestSourceSnapshot: (repoId: RepoId) => Effect.Effect<O.Option<RepoSourceSnapshot>, RepoStoreError>;
  readonly listExportedSymbolsForFile: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    filePath: FilePath
  ) => Effect.Effect<ReadonlyArray<RepoSymbolRecord>, RepoStoreError>;
  readonly listImportEdges: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ) => Effect.Effect<ReadonlyArray<RepoImportEdge>, RepoStoreError>;
  readonly listImportEdgesForImporterFile: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    importerFilePath: FilePath
  ) => Effect.Effect<ReadonlyArray<RepoImportEdge>, RepoStoreError>;
  readonly listImportEdgesForResolvedTargetFile: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    resolvedTargetFilePath: FilePath
  ) => Effect.Effect<ReadonlyArray<RepoImportEdge>, RepoStoreError>;
  readonly listRepos: Effect.Effect<ReadonlyArray<RepoRegistration>, RepoStoreError>;
  readonly listRuns: Effect.Effect<ReadonlyArray<RepoRun>, RepoStoreError>;
  readonly listSymbolRecords: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ) => Effect.Effect<ReadonlyArray<RepoSymbolRecord>, RepoStoreError>;
  readonly registerRepo: (input: RepoRegistrationInput) => Effect.Effect<RepoRegistration, RepoStoreError>;
  readonly replaceSnapshotArtifacts: (
    input: ReplaceSnapshotArtifactsInput
  ) => Effect.Effect<RepoIndexArtifact, RepoStoreError>;
  readonly saveIndexArtifact: (artifact: RepoIndexArtifact) => Effect.Effect<RepoIndexArtifact, RepoStoreError>;
  readonly saveRetrievalPacket: (
    runId: RunId,
    packet: RetrievalPacket
  ) => Effect.Effect<RetrievalPacket, RepoStoreError>;
  readonly saveRun: (run: RepoRun) => Effect.Effect<RepoRun, RepoStoreError>;
  readonly saveSemanticArtifacts: (
    artifacts: RepoSemanticArtifacts
  ) => Effect.Effect<RepoSemanticArtifacts, RepoStoreError>;
  readonly searchSymbols: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    query: string,
    limit: number
  ) => Effect.Effect<ReadonlyArray<RepoSymbolRecord>, RepoStoreError>;
}

/**
 * Service tag for the local repo-memory persistence driver.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class RepoMemorySql extends Context.Service<RepoMemorySql, RepoMemorySqlShape>()($I`RepoMemorySql`) {
  static readonly layer = (
    config: RepoMemorySqlConfig
  ): Layer.Layer<RepoMemorySql, RepoStoreError, FileSystem.FileSystem | Path.Path | SqlClient.SqlClient> =>
    Layer.effect(
      RepoMemorySql,
      makeRepoMemorySql(config).pipe(
        Effect.withSpan("RepoMemorySql.make"),
        Effect.annotateLogs({ component: "repo-memory-driver" })
      )
    );
}

const makeRepoMemorySql = Effect.fn("RepoMemorySql.make")(function* (config: RepoMemorySqlConfig) {
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
  const semanticArtifactsTable = sql("repo_memory_semantic_artifacts");

  const toDriverError = (message: string, status: number, cause?: unknown): RepoStoreError =>
    RepoStoreError.new(cause, message, status);

  const annotateDriverSpan = Effect.fn("RepoMemorySql.annotateSpan")(function* (annotations: Record<string, unknown>) {
    yield* Effect.annotateCurrentSpan(annotations);
  });

  const initializeTables = Effect.fn("RepoMemorySql.initializeTables")(function* (): Effect.fn.Return<
    void,
    RepoStoreError
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
        js_doc_json TEXT,
        js_doc_summary TEXT,
        declaration_text TEXT NOT NULL,
        search_text TEXT NOT NULL,
        PRIMARY KEY (repo_id, source_snapshot_id, symbol_id)
      )
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create symbol record table.", 500, cause)));

    const symbolColumns = yield* sql<{ readonly name: string }>`PRAGMA table_info(${symbolRecordsTable})`.pipe(
      Effect.mapError((cause) => toDriverError("Failed to inspect symbol record table columns.", 500, cause))
    );
    const symbolColumnNames = pipe(
      symbolColumns,
      A.map((column) => column.name)
    );

    if (!pipe(symbolColumnNames, A.contains("js_doc_json"))) {
      yield* sql`ALTER TABLE ${symbolRecordsTable} ADD COLUMN js_doc_json TEXT`.pipe(
        Effect.mapError((cause) => toDriverError("Failed to migrate symbol record js_doc_json column.", 500, cause))
      );
    }

    yield* sql`
      CREATE TABLE IF NOT EXISTS ${importEdgesTable} (
        repo_id TEXT NOT NULL,
        source_snapshot_id TEXT NOT NULL,
        importer_file_path TEXT NOT NULL,
        start_line INTEGER,
        end_line INTEGER,
        module_specifier TEXT NOT NULL,
        imported_name TEXT,
        resolved_target_file_path TEXT,
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

    if (!pipe(importEdgeColumnNames, A.contains("resolved_target_file_path"))) {
      yield* sql`ALTER TABLE ${importEdgesTable} ADD COLUMN resolved_target_file_path TEXT`.pipe(
        Effect.mapError((cause) =>
          toDriverError("Failed to migrate import edge resolved_target_file_path column.", 500, cause)
        )
      );
    }

    yield* sql`
      CREATE INDEX IF NOT EXISTS repo_memory_import_edges_by_importer_file
      ON ${importEdgesTable} (repo_id, source_snapshot_id, importer_file_path)
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create import edge importer index.", 500, cause)));

    yield* sql`
      CREATE INDEX IF NOT EXISTS repo_memory_import_edges_by_resolved_target
      ON ${importEdgesTable} (repo_id, source_snapshot_id, resolved_target_file_path)
    `.pipe(
      Effect.mapError((cause) => toDriverError("Failed to create import edge resolved target index.", 500, cause))
    );

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
      CREATE TABLE IF NOT EXISTS ${semanticArtifactsTable} (
        repo_id TEXT NOT NULL,
        source_snapshot_id TEXT NOT NULL,
        artifacts_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (repo_id, source_snapshot_id)
      )
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create semantic artifact table.", 500, cause)));

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

  const symbolRowToModel = (row: SymbolRow, documentation: O.Option<RepoSymbolDocumentation>): RepoSymbolRecord =>
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
      documentation,
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
      resolvedTargetFilePath: row.resolved_target_file_path,
      typeOnly: row.type_only === 1,
    });

  const decodeImportEdges = (
    rows: ReadonlyArray<ImportEdgeRow>,
    repoId: RepoId
  ): Effect.Effect<ReadonlyArray<RepoImportEdge>, RepoStoreError> =>
    Effect.forEach(rows, (row) =>
      decodeImportEdgeRow(row).pipe(
        Effect.map(importEdgeRowToModel),
        Effect.mapError((cause) => toDriverError(`Failed to decode import edge row for repo "${repoId}".`, 500, cause))
      )
    );

  const packetRowToModel = (row: PacketRow): Effect.Effect<RetrievalPacket, RepoStoreError> =>
    decodePacketJson(row.packet_json).pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to decode retrieval packet for run "${row.run_id}".`, 500, cause)
      )
    );

  const runRowToModel = (row: RunRow): Effect.Effect<RepoRun, RepoStoreError> =>
    decodeRunJson(row.run_json).pipe(
      Effect.mapError((cause) => toDriverError(`Failed to decode run projection for "${row.run_id}".`, 500, cause))
    );

  const decodeSymbolDocumentation = (
    row: SymbolRow
  ): Effect.Effect<O.Option<RepoSymbolDocumentation>, RepoStoreError> =>
    pipe(
      row.js_doc_json,
      O.match({
        onNone: thunkEffectSucceedNone<RepoSymbolDocumentation>,
        onSome: (json) =>
          decodeDocumentationJson(json).pipe(
            Effect.map(O.some),
            Effect.mapError((cause) =>
              toDriverError(`Failed to decode JSDoc payload for symbol "${row.symbol_id}".`, 500, cause)
            )
          ),
      })
    );

  const decodeSymbolModel = (row: SymbolRow): Effect.Effect<RepoSymbolRecord, RepoStoreError> =>
    decodeSymbolRow(row).pipe(
      Effect.mapError((cause) => toDriverError(`Failed to decode symbol row for repo "${row.repo_id}".`, 500, cause)),
      Effect.flatMap((decodedRow) =>
        decodeSymbolDocumentation(decodedRow).pipe(
          Effect.map((documentation) => symbolRowToModel(decodedRow, documentation))
        )
      )
    );

  const repoIdFromPath = Effect.fn("RepoMemorySql.repoIdFromPath")(function* (
    normalizedRepoPath: string
  ): Effect.fn.Return<RepoId, RepoStoreError> {
    yield* annotateDriverSpan({ repo_path: normalizedRepoPath });

    return yield* decodeSha256Hex(new TextEncoder().encode(normalizedRepoPath)).pipe(
      Effect.mapError((cause) => toDriverError(`Failed to hash repository path "${normalizedRepoPath}".`, 500, cause)),
      Effect.map((digest) => decodeRepoId(`repo:${digest}`))
    );
  });

  const insertCitationRows = Effect.fn("RepoMemorySql.insertCitationRows")(function* (
    runId: RunId,
    packet: RetrievalPacket
  ): Effect.fn.Return<void, RepoStoreError> {
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

  const listRepos: RepoMemorySqlShape["listRepos"] = sql<RepoRow>`
    SELECT id, repo_path, display_name, language, registered_at
    FROM ${reposTable}
    ORDER BY registered_at ASC
  `.pipe(
    Effect.flatMap((rows) => Effect.forEach(rows, (row) => decodeRepoRow(row).pipe(Effect.map(repoRowToRegistration)))),
    Effect.mapError((cause) => toDriverError("Failed to list registered repositories.", 500, cause)),
    Effect.withSpan("RepoMemorySql.listRepos"),
    Effect.annotateLogs({ component: "repo-memory-driver" })
  );

  const listRuns: RepoMemorySqlShape["listRuns"] = sql<RunRow>`
    SELECT run_id, run_json, updated_at
    FROM ${runsTable}
    ORDER BY updated_at DESC
  `.pipe(
    Effect.flatMap((rows) => Effect.forEach(rows, (row) => decodeRunRow(row).pipe(Effect.flatMap(runRowToModel)))),
    Effect.mapError((cause) => toDriverError("Failed to list run projections.", 500, cause)),
    Effect.withSpan("RepoMemorySql.listRuns"),
    Effect.annotateLogs({ component: "repo-memory-driver" })
  );

  const getRepo: RepoMemorySqlShape["getRepo"] = Effect.fn("RepoMemorySql.getRepo")(
    function* (repoId): Effect.fn.Return<RepoRegistration, RepoStoreError> {
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
          onNone: () => toDriverError(`Repository not found: "${repoId}".`, 404, undefined),
          onSome: (row) =>
            decodeRepoRow(row).pipe(
              Effect.map(repoRowToRegistration),
              Effect.mapError((cause) => toDriverError(`Failed to decode repository "${repoId}".`, 500, cause))
            ),
        })
      );
    }
  );

  const getRun: RepoMemorySqlShape["getRun"] = Effect.fn("RepoMemorySql.getRun")(function* (runId): Effect.fn.Return<
    O.Option<RepoRun>,
    RepoStoreError
  > {
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
        onNone: thunkEffectSucceedNone<RepoRun>,
        onSome: (row) =>
          decodeRunRow(row).pipe(
            Effect.flatMap(runRowToModel),
            Effect.map(O.some),
            Effect.mapError((cause) => toDriverError(`Failed to decode run row "${runId}".`, 500, cause))
          ),
      })
    );
  });

  const registerRepo: RepoMemorySqlShape["registerRepo"] = Effect.fn("RepoMemorySql.registerRepo")(
    function* (input): Effect.fn.Return<RepoRegistration, RepoStoreError> {
      const resolvedRepoPath = path.resolve(input.repoPath);
      yield* annotateDriverSpan({ repo_path: resolvedRepoPath });

      const exists = yield* fs
        .exists(resolvedRepoPath)
        .pipe(
          Effect.mapError((cause) =>
            toDriverError(`Failed to check repository path "${resolvedRepoPath}".`, 500, cause)
          )
        );

      if (!exists) {
        return yield* toDriverError(`Repository path does not exist: "${resolvedRepoPath}".`, 404, undefined);
      }

      const canonicalRepoPath = yield* fs
        .realPath(resolvedRepoPath)
        .pipe(
          Effect.mapError((cause) =>
            toDriverError(`Failed to resolve canonical repository path "${resolvedRepoPath}".`, 500, cause)
          )
        );

      const canonicalStat = yield* fs
        .stat(canonicalRepoPath)
        .pipe(
          Effect.mapError((cause) =>
            toDriverError(`Failed to stat canonical repository path "${canonicalRepoPath}".`, 500, cause)
          )
        );

      if (canonicalStat.type !== "Directory") {
        return yield* toDriverError(`Repository path must be a directory: "${canonicalRepoPath}".`, 400, undefined);
      }

      yield* annotateDriverSpan({ repo_canonical_path: canonicalRepoPath });

      const existingRows = yield* sql<RepoRow>`
        SELECT id, repo_path, display_name, language, registered_at
        FROM ${reposTable}
        WHERE repo_path = ${canonicalRepoPath}
        LIMIT 1
      `.pipe(
        Effect.mapError((cause) =>
          toDriverError(
            `Failed to check for an existing repository registration at "${canonicalRepoPath}".`,
            500,
            cause
          )
        )
      );

      const existing = A.head(existingRows);
      if (O.isSome(existing)) {
        const existingRegistration = yield* decodeRepoRow(existing.value).pipe(
          Effect.map(repoRowToRegistration),
          Effect.mapError((cause) =>
            toDriverError(`Failed to decode existing repository registration at "${canonicalRepoPath}".`, 500, cause)
          )
        );

        const incomingDisplayName = pipe(input.displayName, O.filter(Str.isNonEmpty));

        if (O.isSome(incomingDisplayName) && incomingDisplayName.value !== existingRegistration.displayName) {
          yield* sql`
            UPDATE ${reposTable}
            SET display_name = ${incomingDisplayName.value}
            WHERE id = ${existingRegistration.id}
          `.pipe(
            Effect.mapError((cause) =>
              toDriverError(
                `Failed to update display name for existing repository "${existingRegistration.id}".`,
                500,
                cause
              )
            )
          );

          return new RepoRegistration({
            ...existingRegistration,
            displayName: incomingDisplayName.value,
          });
        }

        return existingRegistration;
      }

      const displayName = pipe(
        input.displayName,
        O.filter(Str.isNonEmpty),
        O.getOrElse(() => path.basename(canonicalRepoPath))
      );
      const registration = new RepoRegistration({
        id: yield* repoIdFromPath(canonicalRepoPath),
        repoPath: decodeFilePath(canonicalRepoPath),
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

  const latestIndexArtifact: RepoMemorySqlShape["latestIndexArtifact"] = Effect.fn("RepoMemorySql.latestIndexArtifact")(
    function* (repoId): Effect.fn.Return<O.Option<RepoIndexArtifact>, RepoStoreError> {
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
          onNone: thunkEffectSucceedNone<RepoIndexArtifact>,
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
    }
  );

  const latestSourceSnapshot: RepoMemorySqlShape["latestSourceSnapshot"] = Effect.fn(
    "RepoMemorySql.latestSourceSnapshot"
  )(function* (repoId): Effect.fn.Return<O.Option<RepoSourceSnapshot>, RepoStoreError> {
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
        onNone: thunkEffectSucceedNone<RepoSourceSnapshot>,
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

  const latestSemanticArtifacts: RepoMemorySqlShape["latestSemanticArtifacts"] = Effect.fn(
    "RepoMemorySql.latestSemanticArtifacts"
  )(function* (repoId): Effect.fn.Return<O.Option<RepoSemanticArtifacts>, RepoStoreError> {
    yield* annotateDriverSpan({ repo_id: repoId });

    const rows = yield* sql<SemanticArtifactsRow>`
      SELECT repo_id, source_snapshot_id, artifacts_json, updated_at
      FROM ${semanticArtifactsTable}
      WHERE repo_id = ${repoId}
      ORDER BY updated_at DESC, rowid DESC
      LIMIT 1
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to load latest semantic artifacts for repo "${repoId}".`, 500, cause)
      )
    );

    return yield* pipe(
      rows,
      A.head,
      O.match({
        onNone: thunkEffectSucceedNone<RepoSemanticArtifacts>,
        onSome: (row) =>
          decodeSemanticArtifactsRow(row).pipe(
            Effect.flatMap((decodedRow) =>
              decodeSemanticArtifactsJson(decodedRow.artifacts_json).pipe(Effect.map(O.some))
            ),
            Effect.mapError((cause) =>
              toDriverError(`Failed to decode latest semantic artifacts for repo "${repoId}".`, 500, cause)
            )
          ),
      })
    );
  });

  const countSourceFiles: RepoMemorySqlShape["countSourceFiles"] = Effect.fn("RepoMemorySql.countSourceFiles")(
    function* (repoId, sourceSnapshotId): Effect.fn.Return<number, RepoStoreError> {
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
        O.getOrElse(thunk0)
      );
    }
  );

  const findSourceFiles: RepoMemorySqlShape["findSourceFiles"] = Effect.fn("RepoMemorySql.findSourceFiles")(
    function* (
      repoId,
      sourceSnapshotId,
      query,
      limit
    ): Effect.fn.Return<ReadonlyArray<RepoSourceFile>, RepoStoreError> {
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
          toDriverError(
            `Failed to search source files for repo "${repoId}" snapshot "${sourceSnapshotId}".`,
            500,
            cause
          )
        )
      );

      return yield* Effect.forEach(rows, (row) =>
        decodeSourceFileRow(row).pipe(
          Effect.map(sourceFileRowToModel),
          Effect.mapError((cause) =>
            toDriverError(`Failed to decode source file row for repo "${repoId}".`, 500, cause)
          )
        )
      );
    }
  );

  const listSymbolRecords: RepoMemorySqlShape["listSymbolRecords"] = Effect.fn("RepoMemorySql.listSymbolRecords")(
    function* (repoId, sourceSnapshotId): Effect.fn.Return<ReadonlyArray<RepoSymbolRecord>, RepoStoreError> {
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
        js_doc_json,
        js_doc_summary,
        declaration_text,
        search_text
      FROM ${symbolRecordsTable}
      WHERE repo_id = ${repoId} AND source_snapshot_id = ${sourceSnapshotId}
      ORDER BY symbol_name ASC, file_path ASC
    `.pipe(
        Effect.mapError((cause) =>
          toDriverError(
            `Failed to list symbol records for repo "${repoId}" snapshot "${sourceSnapshotId}".`,
            500,
            cause
          )
        )
      );

      return yield* Effect.forEach(rows, decodeSymbolModel);
    }
  );

  const findSymbolsByExactName: RepoMemorySqlShape["findSymbolsByExactName"] = Effect.fn(
    "RepoMemorySql.findSymbolsByExactName"
  )(function* (repoId, sourceSnapshotId, symbolName): Effect.fn.Return<
    ReadonlyArray<RepoSymbolRecord>,
    RepoStoreError
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
        js_doc_json,
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

  const searchSymbols: RepoMemorySqlShape["searchSymbols"] = Effect.fn("RepoMemorySql.searchSymbols")(
    function* (
      repoId,
      sourceSnapshotId,
      query,
      limit
    ): Effect.fn.Return<ReadonlyArray<RepoSymbolRecord>, RepoStoreError> {
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
        js_doc_json,
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

  const listExportedSymbolsForFile: RepoMemorySqlShape["listExportedSymbolsForFile"] = Effect.fn(
    "RepoMemorySql.listExportedSymbolsForFile"
  )(function* (repoId, sourceSnapshotId, filePath): Effect.fn.Return<ReadonlyArray<RepoSymbolRecord>, RepoStoreError> {
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
        js_doc_json,
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

  const listImportEdges: RepoMemorySqlShape["listImportEdges"] = Effect.fn("RepoMemorySql.listImportEdges")(
    function* (repoId, sourceSnapshotId): Effect.fn.Return<ReadonlyArray<RepoImportEdge>, RepoStoreError> {
      yield* annotateDriverSpan({ repo_id: repoId, source_snapshot_id: sourceSnapshotId });

      const rows = yield* sql<ImportEdgeRow>`
      SELECT repo_id, source_snapshot_id, importer_file_path, start_line, end_line, module_specifier, imported_name, resolved_target_file_path, type_only
      FROM ${importEdgesTable}
      WHERE repo_id = ${repoId} AND source_snapshot_id = ${sourceSnapshotId}
      ORDER BY importer_file_path ASC, module_specifier ASC
    `.pipe(
        Effect.mapError((cause) =>
          toDriverError(`Failed to list import edges for repo "${repoId}" snapshot "${sourceSnapshotId}".`, 500, cause)
        )
      );

      return yield* decodeImportEdges(rows, repoId);
    }
  );

  const listImportEdgesForImporterFile: RepoMemorySqlShape["listImportEdgesForImporterFile"] = Effect.fn(
    "RepoMemorySql.listImportEdgesForImporterFile"
  )(function* (repoId, sourceSnapshotId, importerFilePath): Effect.fn.Return<
    ReadonlyArray<RepoImportEdge>,
    RepoStoreError
  > {
    yield* annotateDriverSpan({
      repo_id: repoId,
      source_snapshot_id: sourceSnapshotId,
      importer_file_path: importerFilePath,
    });

    const rows = yield* sql<ImportEdgeRow>`
      SELECT repo_id, source_snapshot_id, importer_file_path, start_line, end_line, module_specifier, imported_name, resolved_target_file_path, type_only
      FROM ${importEdgesTable}
      WHERE repo_id = ${repoId}
        AND source_snapshot_id = ${sourceSnapshotId}
        AND importer_file_path = ${importerFilePath}
      ORDER BY module_specifier ASC
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(
          `Failed to list import edges for importer file "${importerFilePath}" in repo "${repoId}".`,
          500,
          cause
        )
      )
    );

    return yield* decodeImportEdges(rows, repoId);
  });

  const listImportEdgesForResolvedTargetFile: RepoMemorySqlShape["listImportEdgesForResolvedTargetFile"] = Effect.fn(
    "RepoMemorySql.listImportEdgesForResolvedTargetFile"
  )(function* (repoId, sourceSnapshotId, resolvedTargetFilePath): Effect.fn.Return<
    ReadonlyArray<RepoImportEdge>,
    RepoStoreError
  > {
    yield* annotateDriverSpan({
      repo_id: repoId,
      source_snapshot_id: sourceSnapshotId,
      resolved_target_file_path: resolvedTargetFilePath,
    });

    const rows = yield* sql<ImportEdgeRow>`
      SELECT repo_id, source_snapshot_id, importer_file_path, start_line, end_line, module_specifier, imported_name, resolved_target_file_path, type_only
      FROM ${importEdgesTable}
      WHERE repo_id = ${repoId}
        AND source_snapshot_id = ${sourceSnapshotId}
        AND resolved_target_file_path = ${resolvedTargetFilePath}
      ORDER BY importer_file_path ASC, module_specifier ASC
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(
          `Failed to list import edges for resolved target file "${resolvedTargetFilePath}" in repo "${repoId}".`,
          500,
          cause
        )
      )
    );

    return yield* decodeImportEdges(rows, repoId);
  });

  const saveIndexArtifact: RepoMemorySqlShape["saveIndexArtifact"] = Effect.fn("RepoMemorySql.saveIndexArtifact")(
    function* (artifact): Effect.fn.Return<RepoIndexArtifact, RepoStoreError> {
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
    }
  );

  const replaceSnapshotArtifacts: RepoMemorySqlShape["replaceSnapshotArtifacts"] = Effect.fn(
    "RepoMemorySql.replaceSnapshotArtifacts"
  )(function* (input): Effect.fn.Return<RepoIndexArtifact, RepoStoreError> {
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
            const jsDocJson = yield* pipe(
              symbol.documentation,
              O.match({
                onNone: thunkEffectSucceedNull,
                onSome: (documentation) =>
                  encodeDocumentationJson(documentation).pipe(
                    Effect.mapError((cause) =>
                      toDriverError(`Failed to encode JSDoc payload for symbol "${symbol.symbolId}".`, 500, cause)
                    )
                  ),
              })
            );

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
                js_doc_json,
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
                ${jsDocJson},
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
          resolved_target_file_path,
          type_only
        ) VALUES (
          ${importEdge.repoId},
          ${importEdge.sourceSnapshotId},
          ${importEdge.importerFilePath},
          ${importEdge.startLine},
          ${importEdge.endLine},
          ${importEdge.moduleSpecifier},
          ${pipe(importEdge.importedName, O.getOrNull)},
          ${pipe(importEdge.resolvedTargetFilePath, O.getOrNull)},
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

  const saveSemanticArtifacts: RepoMemorySqlShape["saveSemanticArtifacts"] = Effect.fn(
    "RepoMemorySql.saveSemanticArtifacts"
  )(function* (artifacts): Effect.fn.Return<RepoSemanticArtifacts, RepoStoreError> {
    yield* annotateDriverSpan({
      repo_id: artifacts.repoId,
      source_snapshot_id: artifacts.sourceSnapshotId,
      semantic_dataset_quads: artifacts.dataset.quads.length,
      semantic_evidence_anchor_count: artifacts.evidenceAnchors.length,
      semantic_provenance_record_count: artifacts.provenance.records.length,
    });

    const artifactsJson = yield* encodeSemanticArtifactsJson(artifacts).pipe(
      Effect.mapError((cause) =>
        toDriverError(
          `Failed to encode semantic artifacts for repo "${artifacts.repoId}" and snapshot "${artifacts.sourceSnapshotId}".`,
          500,
          cause
        )
      )
    );
    const updatedAt = yield* DateTime.now;

    yield* sql`
      INSERT INTO ${semanticArtifactsTable} (repo_id, source_snapshot_id, artifacts_json, updated_at)
      VALUES (
        ${artifacts.repoId},
        ${artifacts.sourceSnapshotId},
        ${artifactsJson},
        ${DateTime.toEpochMillis(updatedAt)}
      )
      ON CONFLICT(repo_id, source_snapshot_id) DO UPDATE SET
        artifacts_json = excluded.artifacts_json,
        updated_at = excluded.updated_at
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(
          `Failed to persist semantic artifacts for repo "${artifacts.repoId}" and snapshot "${artifacts.sourceSnapshotId}".`,
          500,
          cause
        )
      )
    );

    return artifacts;
  });

  const saveRetrievalPacket: RepoMemorySqlShape["saveRetrievalPacket"] = Effect.fn("RepoMemorySql.saveRetrievalPacket")(
    function* (runId, packet): Effect.fn.Return<RetrievalPacket, RepoStoreError> {
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
          Effect.mapError((cause) =>
            toDriverError(`Failed to persist retrieval packet for run "${runId}".`, 500, cause)
          )
        );

      return packet;
    }
  );

  const saveRun: RepoMemorySqlShape["saveRun"] = Effect.fn("RepoMemorySql.saveRun")(function* (run): Effect.fn.Return<
    RepoRun,
    RepoStoreError
  > {
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
  });

  const getRetrievalPacket: RepoMemorySqlShape["getRetrievalPacket"] = Effect.fn("RepoMemorySql.getRetrievalPacket")(
    function* (runId): Effect.fn.Return<O.Option<RetrievalPacket>, RepoStoreError> {
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
          onNone: thunkEffectSucceedNone<RetrievalPacket>,
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
    }
  );

  const getSemanticArtifacts: RepoMemorySqlShape["getSemanticArtifacts"] = Effect.fn(
    "RepoMemorySql.getSemanticArtifacts"
  )(function* (repoId, sourceSnapshotId): Effect.fn.Return<O.Option<RepoSemanticArtifacts>, RepoStoreError> {
    yield* annotateDriverSpan({ repo_id: repoId, source_snapshot_id: sourceSnapshotId });

    const rows = yield* sql<SemanticArtifactsRow>`
      SELECT repo_id, source_snapshot_id, artifacts_json, updated_at
      FROM ${semanticArtifactsTable}
      WHERE repo_id = ${repoId}
        AND source_snapshot_id = ${sourceSnapshotId}
      LIMIT 1
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(
          `Failed to load semantic artifacts for repo "${repoId}" and snapshot "${sourceSnapshotId}".`,
          500,
          cause
        )
      )
    );

    return yield* pipe(
      rows,
      A.head,
      O.match({
        onNone: thunkEffectSucceedNone<RepoSemanticArtifacts>,
        onSome: (row) =>
          decodeSemanticArtifactsRow(row).pipe(
            Effect.flatMap((decodedRow) =>
              decodeSemanticArtifactsJson(decodedRow.artifacts_json).pipe(Effect.map(O.some))
            ),
            Effect.mapError((cause) =>
              toDriverError(
                `Failed to decode semantic artifacts for repo "${repoId}" and snapshot "${sourceSnapshotId}".`,
                500,
                cause
              )
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
    getSemanticArtifacts: (repoId, sourceSnapshotId) =>
      observeDriverOperation("getSemanticArtifacts", getSemanticArtifacts(repoId, sourceSnapshotId)),
    latestSourceSnapshot: (repoId) => observeDriverOperation("latestSourceSnapshot", latestSourceSnapshot(repoId)),
    latestSemanticArtifacts: (repoId) =>
      observeDriverOperation("latestSemanticArtifacts", latestSemanticArtifacts(repoId)),
    listExportedSymbolsForFile: (repoId, sourceSnapshotId, filePath) =>
      observeDriverOperation(
        "listExportedSymbolsForFile",
        listExportedSymbolsForFile(repoId, sourceSnapshotId, filePath)
      ),
    listImportEdges: (repoId, sourceSnapshotId) =>
      observeDriverOperation("listImportEdges", listImportEdges(repoId, sourceSnapshotId)),
    listImportEdgesForImporterFile: (repoId, sourceSnapshotId, importerFilePath) =>
      observeDriverOperation(
        "listImportEdgesForImporterFile",
        listImportEdgesForImporterFile(repoId, sourceSnapshotId, importerFilePath)
      ),
    listImportEdgesForResolvedTargetFile: (repoId, sourceSnapshotId, resolvedTargetFilePath) =>
      observeDriverOperation(
        "listImportEdgesForResolvedTargetFile",
        listImportEdgesForResolvedTargetFile(repoId, sourceSnapshotId, resolvedTargetFilePath)
      ),
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
    saveSemanticArtifacts: (artifacts) =>
      observeDriverOperation("saveSemanticArtifacts", saveSemanticArtifacts(artifacts)),
    saveRetrievalPacket: (runId, packet) =>
      observeDriverOperation("saveRetrievalPacket", saveRetrievalPacket(runId, packet)),
    searchSymbols: (repoId, sourceSnapshotId, query, limit) =>
      observeDriverOperation("searchSymbols", searchSymbols(repoId, sourceSnapshotId, query, limit)),
  } satisfies RepoMemorySqlShape;
});
