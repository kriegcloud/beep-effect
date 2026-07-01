/**
 * Service implementation for corpus curation commands.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { createHash } from "node:crypto";
import { DuckDb, DuckDbConnectionOptions } from "@beep/duckdb";
import { ArtifactId, ContentDigest, OperationId, SourceArtifact } from "@beep/file-processing/Artifact";
import {
  ChildArtifactRecord,
  encodeChildArtifactRecordJson,
  encodeFileProcessingCoverageSummaryJson,
  encodeFileProcessingFailureRecordJson,
  encodeProcessRunManifestJson,
  encodeSourceProcessingRecordJson,
  FailedFileProcessingFailureRecord,
  FailedSourceProcessingRecord,
  FileProcessingCoverageSummary,
  ProcessRunManifest,
  SkippedFileProcessingFailureRecord,
  SkippedSourceProcessingRecord,
  SourceProcessingRecord,
  SucceededSourceProcessingRecord,
} from "@beep/file-processing/Extraction";
import { ProcessFileOperation } from "@beep/file-processing/Operation";
import { resolvePathWithinRoot } from "@beep/file-processing/PathSafety";
import {
  collectSourceOutcomeRecords,
  makeFileProcessingServiceLayer,
  processFile,
} from "@beep/file-processing/Service";
import {
  DeferredSelectedStrategy,
  SupportedSelectedStrategy,
  UnsupportedSelectedStrategy,
} from "@beep/file-processing/Strategy";
import { $RepoCliId } from "@beep/identity/packages";
import { makePffexportFileProcessingEngine, PffexportEngineConfig } from "@beep/libpff";
import { NonNegativeInt, Sha256HexFromBytes } from "@beep/schema";
import { PosixPath } from "@beep/schema/PosixPath";
import { makeTikaAppFileProcessingEngine, TikaAppEngineConfig } from "@beep/tika";
import { makeUsptoError, normalizeUsptoApplicationNumber, normalizeUsptoPatentNumber, Uspto } from "@beep/uspto";
import { A, Str } from "@beep/utils";
import {
  Console,
  Context,
  Effect,
  FileSystem,
  Layer,
  Match,
  MutableHashSet,
  Order,
  Path,
  Ref,
  Result,
  Stream,
} from "effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { printLines } from "../../internal/cli/Printer.js";
import { CorpusCommandError } from "./Corpus.errors.js";
import { classifyRecycleBinName, pairRecycleBinEntries, parseRecycleBinMetadata } from "./Corpus.recyclebin.js";
import {
  CorpusCatalogSummary,
  CorpusDuplicateSetRecord,
  CorpusEnrichmentRecord,
  CorpusEnrichSummary,
  CorpusExtractSummary,
  CorpusOrganizeRecord,
  CorpusOrganizeSummary,
  CorpusRestorationRecord,
  CorpusSalvageSummary,
  decodeCorpusProvenanceRecordJson,
  encodeCorpusCatalogSummaryJson,
  encodeCorpusDuplicateSetReportJson,
  encodeCorpusEnrichmentRecordJson,
  encodeCorpusEnrichSummaryJson,
  encodeCorpusExtractSummaryJson,
  encodeCorpusOrganizeRecordJson,
  encodeCorpusOrganizeSummaryJson,
  encodeCorpusRestorationRecordJson,
  encodeCorpusSalvageSummaryJson,
  MatchedRestorationRecord,
  RecycleBinScanEntry,
  UnmatchedContentRestorationRecord,
  UnmatchedMetadataRestorationRecord,
} from "./Corpus.schemas.js";
import type { DuckDbError, DuckDbShape } from "@beep/duckdb";
import type {
  ArchiveExportProcessFileResult,
  ExtractedProcessFileResult,
  FileProcessingFailureRecord,
} from "@beep/file-processing/Extraction";
import type { FileProcessingEngineShape, FileProcessingService } from "@beep/file-processing/Service";
import type { FileFormatFamily, FileProcessingEngineFamily, SelectedStrategy } from "@beep/file-processing/Strategy";
import type * as Crypto from "effect/Crypto";
import type { ChildProcessSpawner } from "effect/unstable/process";
import type {
  CorpusCatalogOptions,
  CorpusEnrichOptions,
  CorpusExtractOptions,
  CorpusOrganizeCategory,
  CorpusOrganizeOptions,
  CorpusProvenanceRecord,
  CorpusSalvageOptions,
} from "./Corpus.schemas.js";

const $I = $RepoCliId.create("commands/Corpus/Corpus.service");

type CorpusCommandServiceRequirements =
  | Crypto.Crypto
  | FileSystem.FileSystem
  | Path.Path
  | ChildProcessSpawner.ChildProcessSpawner;

/**
 * Service contract for corpus curation operations.
 *
 * @example
 * ```ts
 * import type { CorpusCommandServiceShape } from "@beep/repo-cli/commands/Corpus"
 *
 * const service = {} as CorpusCommandServiceShape
 * console.log(service)
 * ```
 * @category services
 * @since 0.0.0
 */
export interface CorpusCommandServiceShape {
  /**
   * Build the corpus DuckDB catalog, duplicate-set report, and recycle-bin
   * name-restoration manifest from a salvaged corpus root.
   *
   * @since 0.0.0
   */
  readonly catalogCorpus: (options: CorpusCatalogOptions) => Effect.Effect<CorpusCatalogSummary, CorpusCommandError>;

  /**
   * Resolve corpus-derived patent and application numbers against USPTO.
   *
   * @since 0.0.0
   */
  readonly enrichCorpus: (options: CorpusEnrichOptions) => Effect.Effect<CorpusEnrichSummary, CorpusCommandError>;

  /**
   * Run libpff and Tika extraction over salvaged raw/ files into staging/.
   *
   * @since 0.0.0
   */
  readonly extractCorpus: (options: CorpusExtractOptions) => Effect.Effect<CorpusExtractSummary, CorpusCommandError>;

  /**
   * Build the organized/ client, docket, and email-archive taxonomy.
   *
   * @since 0.0.0
   */
  readonly organizeCorpus: (options: CorpusOrganizeOptions) => Effect.Effect<CorpusOrganizeSummary, CorpusCommandError>;

  /**
   * Re-hash salvaged raw/ files against the provenance manifest.
   *
   * @since 0.0.0
   */
  readonly verifySalvage: (options: CorpusSalvageOptions) => Effect.Effect<CorpusSalvageSummary, CorpusCommandError>;
}

/**
 * Service tag for corpus curation operations.
 *
 * @example
 * ```ts
 * import { CorpusCommandService, CorpusCatalogOptions } from "@beep/repo-cli/commands/Corpus"
 * import { Effect } from "effect"
 *
 * const program = Effect.map(CorpusCommandService, (service) =>
 *   service.catalogCorpus(CorpusCatalogOptions.make({ corpusRoot: "/data/corpus" }))
 * )
 * console.log(program.pipe !== undefined) // true
 * ```
 * @category services
 * @since 0.0.0
 */
export class CorpusCommandService extends Context.Service<CorpusCommandService, CorpusCommandServiceShape>()(
  $I`CorpusCommandService`
) {}

const sqlStringLiteral = (value: string): string => `'${value.replaceAll("'", "''")}'`;

const createSourceFilesTable = (manifestPath: string): string => `
CREATE OR REPLACE TABLE corpus_source_files AS
SELECT
  sourceLabel AS source_label,
  originPath AS origin_path,
  relativePath AS relative_path,
  destPath AS dest_path,
  sizeBytes AS size_bytes,
  mtimeEpoch AS mtime_epoch,
  mtimeIso AS mtime_iso,
  sha256,
  salvagedAt AS salvaged_at,
  'sha256:' || sha256 AS digest,
  'artifact:' || sha256 AS artifact_id
FROM read_json(${sqlStringLiteral(manifestPath)}, format='newline_delimited', columns={
  sourceLabel: 'VARCHAR',
  originPath: 'VARCHAR',
  relativePath: 'VARCHAR',
  destPath: 'VARCHAR',
  sizeBytes: 'BIGINT',
  mtimeEpoch: 'BIGINT',
  mtimeIso: 'VARCHAR',
  sha256: 'VARCHAR',
  salvagedAt: 'VARCHAR'
})`;

const createDuplicateSetsView = `
CREATE OR REPLACE VIEW corpus_duplicate_sets AS
SELECT
  digest,
  COUNT(*)::INTEGER AS copies,
  MIN(size_bytes) AS size_bytes,
  STRING_AGG(source_label || '/' || relative_path, ' | ' ORDER BY source_label, relative_path) AS members
FROM corpus_source_files
GROUP BY digest
HAVING COUNT(*) > 1`;

const createRestorationsTable = `
CREATE OR REPLACE TABLE corpus_restorations (
  match_status VARCHAR NOT NULL,
  source_label VARCHAR NOT NULL,
  pair_key VARCHAR NOT NULL,
  metadata_relative_path VARCHAR,
  content_relative_path VARCHAR,
  original_path VARCHAR,
  original_name VARCHAR,
  original_size_bytes BIGINT,
  deleted_at_iso VARCHAR,
  deleted_at_filetime VARCHAR,
  format_version VARCHAR
)`;

const insertRestorationStatement = `
INSERT INTO corpus_restorations VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;

const sourceTotalsStatement = `
SELECT
  CAST(COUNT(*) AS DOUBLE) AS "sourceFiles",
  CAST(COALESCE(SUM(size_bytes), 0) AS DOUBLE) AS "totalBytes",
  CAST(COUNT(DISTINCT digest) AS DOUBLE) AS "distinctDigests"
FROM corpus_source_files`;

const duplicateTotalsStatement = `
SELECT
  CAST(COUNT(*) AS DOUBLE) AS "duplicateSets",
  CAST(COALESCE(SUM(copies - 1), 0) AS DOUBLE) AS "duplicateFiles",
  CAST(COALESCE(SUM((copies - 1) * size_bytes), 0) AS DOUBLE) AS "redundantBytes"
FROM corpus_duplicate_sets`;

const duplicateSetRowsStatement = `
SELECT
  digest,
  copies,
  CAST(size_bytes AS DOUBLE) AS "sizeBytes",
  members
FROM corpus_duplicate_sets
ORDER BY (copies - 1) * size_bytes DESC, digest`;

class SourceTotalsRow extends S.Class<SourceTotalsRow>($I`SourceTotalsRow`)(
  {
    distinctDigests: S.Finite,
    sourceFiles: S.Finite,
    totalBytes: S.Finite,
  },
  $I.annote("SourceTotalsRow", {
    description: "Aggregate file, byte, and digest totals queried from the corpus catalog.",
  })
) {}

class DuplicateTotalsRow extends S.Class<DuplicateTotalsRow>($I`DuplicateTotalsRow`)(
  {
    duplicateFiles: S.Finite,
    duplicateSets: S.Finite,
    redundantBytes: S.Finite,
  },
  $I.annote("DuplicateTotalsRow", {
    description: "Aggregate duplicate-set totals queried from the corpus catalog.",
  })
) {}

const decodeSourceTotalsRows = S.decodeUnknownEffect(S.Array(SourceTotalsRow));
const decodeDuplicateTotalsRows = S.decodeUnknownEffect(S.Array(DuplicateTotalsRow));
const decodeDuplicateSetRecords = S.decodeUnknownEffect(S.Array(CorpusDuplicateSetRecord));

const runWithCorpusDb = <A, E>(
  databasePath: string,
  message: string,
  work: Effect.Effect<A, E, DuckDb>
): Effect.Effect<A, CorpusCommandError> =>
  Effect.scoped(
    Layer.build(DuckDb.makeNodeLayer(DuckDbConnectionOptions.make({ databasePath }))).pipe(
      Effect.flatMap((context) => work.pipe(Effect.provide(context)))
    )
  ).pipe(CorpusCommandError.mapError(message));

const insertRows = <Row>(
  db: DuckDbShape,
  statement: string,
  rows: ReadonlyArray<Row>,
  toParameters: (row: Row) => Array<string | number | boolean | null>
): Effect.Effect<void, DuckDbError> =>
  Effect.forEach(rows, (row) => db.run(statement, toParameters(row)), { discard: true });

const singleRow = <Row>(rows: ReadonlyArray<Row>, label: string): Effect.Effect<Row, CorpusCommandError> =>
  A.head(rows).pipe(
    O.match({
      onNone: () => Effect.fail(CorpusCommandError.make({ message: `DuckDB returned no rows for ${label}.` })),
      onSome: Effect.succeed,
    })
  );

const basenameOf = (relativePath: string): string =>
  A.last(Str.split(relativePath, "/")).pipe(O.getOrElse(() => relativePath));

const parentDirOf = (relativePath: string): string => {
  const lastSlash = relativePath.lastIndexOf("/");
  return lastSlash === -1 ? "" : relativePath.slice(0, lastSlash);
};

const restorationToRow = (record: CorpusRestorationRecord): Array<string | number | null> =>
  Match.value(record).pipe(
    Match.discriminatorsExhaustive("matchStatus")({
      matched: (matched) => [
        matched.matchStatus,
        matched.sourceLabel,
        matched.pairKey,
        matched.metadataRelativePath,
        matched.contentRelativePath,
        matched.original.originalPath,
        matched.original.originalName,
        matched.original.originalSizeBytes,
        matched.original.deletedAtIso,
        matched.original.deletedAtFiletime,
        matched.original.version,
      ],
      "unmatched-content": (content) => [
        content.matchStatus,
        content.sourceLabel,
        content.pairKey,
        null,
        content.contentRelativePath,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      "unmatched-metadata": (metadata) => [
        metadata.matchStatus,
        metadata.sourceLabel,
        metadata.pairKey,
        metadata.metadataRelativePath,
        null,
        metadata.original.originalPath,
        metadata.original.originalName,
        metadata.original.originalSizeBytes,
        metadata.original.deletedAtIso,
        metadata.original.deletedAtFiletime,
        metadata.original.version,
      ],
    })
  );

const decodeProvenanceLines = Effect.fn("CorpusCommandService.decodeProvenanceLines")(function* (
  manifestText: string
): Effect.fn.Return<ReadonlyArray<CorpusProvenanceRecord>, CorpusCommandError> {
  const lines = A.filter(Str.split(manifestText, "\n"), Str.isNonEmpty);
  return yield* Effect.forEach(lines, (line, index) =>
    decodeCorpusProvenanceRecordJson(line).pipe(
      CorpusCommandError.mapError(`Provenance manifest line ${index + 1} failed schema validation.`)
    )
  );
});

const buildRestorationRecords = Effect.fn("CorpusCommandService.buildRestorationRecords")(function* (
  rawRoot: string,
  records: ReadonlyArray<CorpusProvenanceRecord>
): Effect.fn.Return<ReadonlyArray<CorpusRestorationRecord>, CorpusCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const destByLabelAndPath = new Map<string, string>();
  const groups = new Map<string, { sourceLabel: string; entries: Array<RecycleBinScanEntry> }>();

  for (const record of records) {
    destByLabelAndPath.set(`${record.sourceLabel}\u0000${record.relativePath}`, record.destPath);
    const classified = classifyRecycleBinName(basenameOf(record.relativePath));
    if (O.isNone(classified)) {
      continue;
    }
    const groupKey = `${record.sourceLabel}\u0000${parentDirOf(record.relativePath)}`;
    const group = groups.get(groupKey) ?? { entries: [], sourceLabel: record.sourceLabel };
    group.entries.push(
      RecycleBinScanEntry.make({
        kind: classified.value.kind,
        pairKey: classified.value.pairKey,
        relativePath: record.relativePath,
      })
    );
    groups.set(groupKey, group);
  }

  const parseMetadataAt = Effect.fn("CorpusCommandService.parseMetadataAt")(function* (
    sourceLabel: string,
    relativePath: string
  ) {
    const destPath = destByLabelAndPath.get(`${sourceLabel}\u0000${relativePath}`);
    if (destPath === undefined) {
      return yield* CorpusCommandError.make({
        message: `Recycle-bin metadata file "${relativePath}" is missing from the provenance manifest.`,
      });
    }
    // Fail closed: the manifest is untrusted, so only read metadata files that
    // canonicalize inside <corpusRoot>/raw, never an attacker-chosen path.
    const safeDestPath = yield* resolveWithinRoot(
      rawRoot,
      destPath,
      "Provenance metadata path escapes the corpus raw directory"
    );
    const bytes = yield* fs
      .readFile(safeDestPath)
      .pipe(CorpusCommandError.mapError(`Failed reading recycle-bin metadata file "${safeDestPath}".`));
    return yield* parseRecycleBinMetadata(bytes).pipe(
      Effect.mapError((error) =>
        CorpusCommandError.make({ cause: error, message: `${error.message} (file "${relativePath}")` })
      )
    );
  });

  const groupResults = yield* Effect.forEach(
    [...groups.values()],
    Effect.fnUntraced(function* (group) {
      const pairing = pairRecycleBinEntries(group.entries);
      const matched = yield* Effect.forEach(pairing.matched, (pair) =>
        parseMetadataAt(group.sourceLabel, pair.metadataRelativePath).pipe(
          Effect.map((original) =>
            MatchedRestorationRecord.make({
              contentRelativePath: pair.contentRelativePath,
              matchStatus: "matched",
              metadataRelativePath: pair.metadataRelativePath,
              original,
              pairKey: pair.pairKey,
              sourceLabel: group.sourceLabel,
            })
          )
        )
      );
      const unmatchedMetadata = yield* Effect.forEach(pairing.unmatchedMetadata, (entry) =>
        parseMetadataAt(group.sourceLabel, entry.relativePath).pipe(
          Effect.map((original) =>
            UnmatchedMetadataRestorationRecord.make({
              matchStatus: "unmatched-metadata",
              metadataRelativePath: entry.relativePath,
              original,
              pairKey: entry.pairKey,
              sourceLabel: group.sourceLabel,
            })
          )
        )
      );
      const unmatchedContent = A.map(pairing.unmatchedContent, (entry) =>
        UnmatchedContentRestorationRecord.make({
          contentRelativePath: entry.relativePath,
          matchStatus: "unmatched-content",
          pairKey: entry.pairKey,
          sourceLabel: group.sourceLabel,
        })
      );
      return [...matched, ...unmatchedMetadata, ...unmatchedContent];
    })
  );

  return A.flatten(groupResults);
});

const catalogCorpusImpl = Effect.fn("CorpusCommandService.catalogCorpus")(function* (
  options: CorpusCatalogOptions
): Effect.fn.Return<CorpusCatalogSummary, CorpusCommandError, CorpusCommandServiceRequirements> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const rawRoot = path.join(options.corpusRoot, "raw");
  const manifestPath = path.join(rawRoot, "provenance.jsonl");
  const catalogDir = path.join(options.corpusRoot, "catalog");
  const reportsDir = path.join(catalogDir, "reports");
  const databasePath = path.join(catalogDir, "corpus.duckdb");
  const restorationManifestPath = path.join(catalogDir, "restoration-manifest.jsonl");
  const duplicateReportPath = path.join(reportsDir, "duplicate-sets.json");
  const summaryReportPath = path.join(reportsDir, "catalog-summary.json");

  const manifestExists = yield* fs
    .exists(manifestPath)
    .pipe(CorpusCommandError.mapError(`Failed checking provenance manifest at "${manifestPath}".`));
  if (!manifestExists) {
    return yield* CorpusCommandError.make({
      message: `Provenance manifest not found at "${manifestPath}". Run salvage before catalog.`,
    });
  }

  yield* fs
    .makeDirectory(reportsDir, { recursive: true })
    .pipe(CorpusCommandError.mapError(`Failed creating catalog reports directory "${reportsDir}".`));

  const manifestText = yield* fs
    .readFileString(manifestPath)
    .pipe(CorpusCommandError.mapError(`Failed reading provenance manifest "${manifestPath}".`));
  const provenance = yield* decodeProvenanceLines(manifestText);
  yield* Console.log(`corpus catalog: ${provenance.length} provenance records validated`);

  const restorations = yield* buildRestorationRecords(rawRoot, provenance);
  const matchedCount = A.length(A.filter(restorations, (record) => record.matchStatus === "matched"));
  const unmatchedMetadataCount = A.length(
    A.filter(restorations, (record) => record.matchStatus === "unmatched-metadata")
  );
  const unmatchedContentCount = A.length(
    A.filter(restorations, (record) => record.matchStatus === "unmatched-content")
  );
  yield* Console.log(
    `corpus catalog: recycle-bin pairing matched=${matchedCount} unmatched-metadata=${unmatchedMetadataCount} unmatched-content=${unmatchedContentCount}`
  );

  const duckDbWork = Effect.gen(function* () {
    const db = yield* DuckDb;
    yield* db.run(createSourceFilesTable(manifestPath));
    yield* db.run(createDuplicateSetsView);
    yield* db.run(createRestorationsTable);
    yield* Effect.forEach(restorations, (record) => db.run(insertRestorationStatement, restorationToRow(record)), {
      discard: true,
    });
    const sourceTotalsRows = yield* db.query(sourceTotalsStatement);
    const duplicateTotalsRows = yield* db.query(duplicateTotalsStatement);
    const duplicateSetRows = yield* db.query(duplicateSetRowsStatement);
    return { duplicateSetRows, duplicateTotalsRows, sourceTotalsRows };
  });

  const queried = yield* runWithCorpusDb(
    databasePath,
    `Failed building the DuckDB catalog at "${databasePath}".`,
    duckDbWork
  );

  const sourceTotals = yield* decodeSourceTotalsRows(queried.sourceTotalsRows).pipe(
    CorpusCommandError.mapError("DuckDB source totals row failed schema validation."),
    Effect.flatMap((rows) => singleRow(rows, "source totals"))
  );
  const duplicateTotals = yield* decodeDuplicateTotalsRows(queried.duplicateTotalsRows).pipe(
    CorpusCommandError.mapError("DuckDB duplicate totals row failed schema validation."),
    Effect.flatMap((rows) => singleRow(rows, "duplicate totals"))
  );

  const duplicateReportJson = yield* decodeDuplicateSetRecords(queried.duplicateSetRows).pipe(
    Effect.flatMap(encodeCorpusDuplicateSetReportJson),
    CorpusCommandError.mapError("Duplicate-set report rows failed schema validation.")
  );
  yield* fs
    .writeFileString(duplicateReportPath, `${duplicateReportJson}\n`)
    .pipe(CorpusCommandError.mapError(`Failed writing duplicate-set report "${duplicateReportPath}".`));

  const restorationLines = yield* Effect.forEach(restorations, (record) =>
    encodeCorpusRestorationRecordJson(record).pipe(
      CorpusCommandError.mapError("Restoration record failed JSONL encoding.")
    )
  );
  yield* fs
    .writeFileString(restorationManifestPath, jsonlContent(restorationLines))
    .pipe(CorpusCommandError.mapError(`Failed writing restoration manifest "${restorationManifestPath}".`));

  const summary = CorpusCatalogSummary.make({
    distinctDigests: NonNegativeInt.make(sourceTotals.distinctDigests),
    duplicateFiles: NonNegativeInt.make(duplicateTotals.duplicateFiles),
    duplicateSets: NonNegativeInt.make(duplicateTotals.duplicateSets),
    matchedRestorations: NonNegativeInt.make(matchedCount),
    redundantBytes: NonNegativeInt.make(duplicateTotals.redundantBytes),
    sourceFiles: NonNegativeInt.make(sourceTotals.sourceFiles),
    totalBytes: NonNegativeInt.make(sourceTotals.totalBytes),
    unmatchedContentFiles: NonNegativeInt.make(unmatchedContentCount),
    unmatchedMetadataFiles: NonNegativeInt.make(unmatchedMetadataCount),
  });

  const summaryJson = yield* encodeCorpusCatalogSummaryJson(summary).pipe(
    CorpusCommandError.mapError("Catalog summary failed JSON encoding.")
  );
  yield* fs
    .writeFileString(summaryReportPath, `${summaryJson}\n`)
    .pipe(CorpusCommandError.mapError(`Failed writing catalog summary "${summaryReportPath}".`));

  yield* Console.log(
    `corpus catalog: files=${summary.sourceFiles} bytes=${summary.totalBytes} distinctDigests=${summary.distinctDigests} duplicateSets=${summary.duplicateSets} duplicateFiles=${summary.duplicateFiles} redundantBytes=${summary.redundantBytes}`
  );
  yield* Console.log(`corpus catalog: database "${databasePath}"`);
  yield* Console.log(`corpus catalog: restoration manifest "${restorationManifestPath}"`);
  yield* Console.log(`corpus catalog: reports "${reportsDir}"`);

  return summary;
});

const extractCoverageFormats: ReadonlyArray<FileFormatFamily> = [
  "doc",
  "docx",
  "docm",
  "rtf",
  "html",
  "xhtml",
  "pdf-text-layer",
  "pst",
  "plain-text",
  "markdown",
  "image-metadata",
  "xls",
  "xlsx",
  "unknown",
];

const engineFamilyFromName = (engineName: string): FileProcessingEngineFamily =>
  Match.value(engineName).pipe(
    Match.when("libpff", () => "libpff" as const),
    Match.when("apache-tika", () => "tika" as const),
    Match.orElse(() => "auto" as const)
  );

const decodePosixPath = S.decodeUnknownEffect(PosixPath);
const decodeArtifactId = S.decodeUnknownEffect(ArtifactId);
const decodeContentDigest = S.decodeUnknownEffect(ContentDigest);
const decodeOperationId = S.decodeUnknownEffect(OperationId);
const decodeSha256FromBytes = S.decodeUnknownEffect(Sha256HexFromBytes);
const decodeSourceArtifact = S.decodeUnknownEffect(SourceArtifact);
const encodeMetadataRecordJson = S.encodeUnknownEffect(S.fromJsonString(S.Record(S.String, S.String)));
const operationTextEncoder = new TextEncoder();

const deriveCorpusOperationId = Effect.fn("CorpusCommandService.deriveCorpusOperationId")(function* (
  text: string
): Effect.fn.Return<OperationId, CorpusCommandError, Crypto.Crypto> {
  const digest = yield* decodeSha256FromBytes(operationTextEncoder.encode(text)).pipe(
    CorpusCommandError.mapError("Operation id digest derivation failed.")
  );
  return yield* decodeOperationId(`operation:${digest}`).pipe(
    CorpusCommandError.mapError("Operation id decoding failed.")
  );
});

const extensionOf = (name: string): string | undefined => {
  const dot = name.lastIndexOf(".");
  return dot <= 0 || dot === name.length - 1 ? undefined : name.slice(dot + 1).toLowerCase();
};

// Fail-closed resolver for manifest-supplied paths: the provenance manifest is
// untrusted input, so a `destPath` (or organize target) must canonicalize to a
// real path inside the allowed root before it is read, hashed, copied, or
// passed to an extraction engine. `resolvePathWithinRoot` follows symlinks and
// rejects absolute escapes and `..` traversal, returning the in-root canonical
// path callers should use for the actual filesystem operation.
const resolveWithinRoot = Effect.fn("CorpusCommandService.resolveWithinRoot")(function* (
  root: string,
  candidate: string,
  label: string
): Effect.fn.Return<string, CorpusCommandError, FileSystem.FileSystem | Path.Path> {
  return yield* resolvePathWithinRoot({ candidate, root }).pipe(
    Effect.mapError((error) =>
      CorpusCommandError.make({ cause: error, message: `${label} "${candidate}": ${error.message}` })
    )
  );
});

const writeCorpusStringFile = Effect.fn("CorpusCommandService.writeCorpusStringFile")(function* (
  outputPath: string,
  content: string
): Effect.fn.Return<void, CorpusCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fs
    .makeDirectory(path.dirname(outputPath), { recursive: true })
    .pipe(
      Effect.andThen(fs.writeFileString(outputPath, content)),
      CorpusCommandError.mapError(`Failed writing corpus output "${outputPath}".`)
    );
});

interface CorpusExtractOutcome {
  readonly childArtifactCount: number;
  readonly failure: O.Option<FileProcessingFailureRecord>;
  readonly sourceRecord: SourceProcessingRecord;
  readonly strategy: SelectedStrategy;
}

const failedOutcome = (
  record: CorpusProvenanceRecord,
  ids: {
    readonly artifactId: ArtifactId;
    readonly digest: ContentDigest;
    readonly operationId: OperationId;
    readonly relativePath: PosixPath;
  },
  reason: "file-detection-failed" | "engine-unavailable" | "unsupported-file-format",
  message: string
): CorpusExtractOutcome => ({
  childArtifactCount: 0,
  failure: O.some(
    FailedFileProcessingFailureRecord.make({
      artifactId: ids.artifactId,
      format: "unknown",
      message,
      operationId: ids.operationId,
      reason,
      relativePath: ids.relativePath,
      status: "failed",
    })
  ),
  sourceRecord: FailedSourceProcessingRecord.make({
    artifactId: ids.artifactId,
    digest: ids.digest,
    format: "unknown",
    operationId: ids.operationId,
    relativePath: ids.relativePath,
    sizeBytes: record.sizeBytes,
    status: "failed",
  }),
  strategy: UnsupportedSelectedStrategy.make({
    disposition: "unsupported",
    engine: "auto",
    format: "unknown",
    operationKind: "process",
    skipReason: reason === "engine-unavailable" ? "engine-unavailable" : "unsupported-format",
  }),
});

const jsonlContent = (lines: ReadonlyArray<string>): string =>
  A.length(lines) === 0 ? "" : `${A.join(lines, "\n")}\n`;

const prepareExtractOutputDir = Effect.fn("CorpusCommandService.prepareExtractOutputDir")(function* (
  outDir: string,
  childrenRoot: string,
  overwrite: boolean
): Effect.fn.Return<void, CorpusCommandError, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  const outDirExists = yield* fs
    .exists(outDir)
    .pipe(CorpusCommandError.mapError(`Failed checking extract output directory "${outDir}".`));
  if (outDirExists && !overwrite) {
    return yield* CorpusCommandError.make({
      message: `Extract output "${outDir}" already exists; pass --overwrite to replace it.`,
    });
  }
  if (outDirExists) {
    yield* fs
      .remove(outDir, { recursive: true })
      .pipe(CorpusCommandError.mapError(`Failed removing previous extract output "${outDir}".`));
  }
  yield* fs
    .makeDirectory(childrenRoot, { recursive: true })
    .pipe(CorpusCommandError.mapError(`Failed creating extract output "${childrenRoot}".`));
});

const dedupeBySha256 = <A extends { readonly sha256: string }>(
  records: ReadonlyArray<A>
): { readonly duplicatesSkipped: number; readonly kept: ReadonlyArray<A> } => {
  const seen = MutableHashSet.empty<string>();
  const kept = A.filter(records, (record) => {
    if (MutableHashSet.has(seen, record.sha256)) {
      return false;
    }
    MutableHashSet.add(seen, record.sha256);
    return true;
  });
  return { duplicatesSkipped: A.length(records) - A.length(kept), kept };
};

const selectExtractRecords = (
  allRecords: ReadonlyArray<CorpusProvenanceRecord>,
  options: CorpusExtractOptions
): { readonly duplicatesSkipped: number; readonly selected: ReadonlyArray<CorpusProvenanceRecord> } => {
  const labeled =
    options.sourceLabel === undefined
      ? allRecords
      : A.filter(allRecords, (record) => record.sourceLabel === options.sourceLabel);

  const { duplicatesSkipped, kept } = options.includeDuplicates
    ? { duplicatesSkipped: 0, kept: labeled }
    : dedupeBySha256(labeled);
  const selected = options.maxFiles === undefined ? kept : A.take(kept, Math.max(0, Math.floor(options.maxFiles)));
  return { duplicatesSkipped, selected };
};

const buildExtractCoverage = (
  sourceRecords: ReadonlyArray<SourceProcessingRecord>
): Effect.Effect<FileProcessingCoverageSummary, CorpusCommandError> => {
  const byFormat: Record<string, Record<string, number>> = {};
  for (const format of extractCoverageFormats) {
    byFormat[format] = { failed: 0, skipped: 0, succeeded: 0 };
  }
  for (const record of sourceRecords) {
    const counts = byFormat[record.format] ?? { failed: 0, skipped: 0, succeeded: 0 };
    counts[record.status] = (counts[record.status] ?? 0) + 1;
    byFormat[record.format] = counts;
  }
  return S.decodeUnknownEffect(FileProcessingCoverageSummary)({
    byFormat,
    failedCount: A.length(A.filter(sourceRecords, (record) => record.status === "failed")),
    skippedCount: A.length(A.filter(sourceRecords, (record) => record.status === "skipped")),
    sourceCount: A.length(sourceRecords),
    succeededCount: A.length(A.filter(sourceRecords, (record) => record.status === "succeeded")),
    textArtifactCount: A.length(
      A.filter(sourceRecords, (record) => record.status === "succeeded" && record.textPath !== undefined)
    ),
  }).pipe(CorpusCommandError.mapError("Coverage summary failed schema validation."));
};

const extractCorpusImpl = Effect.fn("CorpusCommandService.extractCorpus")(function* (
  options: CorpusExtractOptions
): Effect.fn.Return<CorpusExtractSummary, CorpusCommandError, CorpusCommandServiceRequirements> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const rawRoot = path.join(options.corpusRoot, "raw");
  const manifestPath = path.join(rawRoot, "provenance.jsonl");
  const outDir = path.join(options.corpusRoot, "staging", "extract");
  const childrenRoot = path.join(outDir, "children");
  const concurrency = Math.max(1, Math.floor(options.concurrency ?? 4));

  yield* prepareExtractOutputDir(outDir, childrenRoot, options.overwrite);

  const manifestText = yield* fs
    .readFileString(manifestPath)
    .pipe(CorpusCommandError.mapError(`Failed reading provenance manifest "${manifestPath}".`));
  const allRecords = yield* decodeProvenanceLines(manifestText);
  const { duplicatesSkipped, selected } = selectExtractRecords(allRecords, options);
  yield* Console.log(
    `corpus extract: ${A.length(selected)} sources selected (${duplicatesSkipped} duplicate copies skipped, ${A.length(allRecords)} manifest records)`
  );

  const libpffEngine = yield* makePffexportFileProcessingEngine(
    PffexportEngineConfig.make({
      exportRoot: childrenRoot,
      ...R.getSomes({ pffexportPath: O.fromUndefinedOr(options.pffexportPath) }),
    })
  );
  const tikaEngine = yield* makeTikaAppFileProcessingEngine(
    TikaAppEngineConfig.make({
      jarPath: options.tikaJarPath,
      ...R.getSomes({ javaPath: O.fromUndefinedOr(options.javaPath) }),
    })
  );
  const engines: ReadonlyArray<FileProcessingEngineShape> = [libpffEngine, tikaEngine];

  const completedRef = yield* Ref.make(0);
  const total = A.length(selected);

  const processOneSource = Effect.fn("CorpusCommandService.processOneSource")(function* (
    record: CorpusProvenanceRecord
  ): Effect.fn.Return<
    CorpusExtractOutcome,
    CorpusCommandError,
    Crypto.Crypto | FileProcessingService | FileSystem.FileSystem | Path.Path
  > {
    const sanitizedRelative = `${record.sourceLabel}/${record.relativePath}`.replaceAll("\\", "/");
    const artifactId = yield* decodeArtifactId(`artifact:${record.sha256}`).pipe(
      CorpusCommandError.mapError("Provenance sha256 failed artifact id decoding.")
    );
    const digest = yield* decodeContentDigest(`sha256:${record.sha256}`).pipe(
      CorpusCommandError.mapError("Provenance sha256 failed digest decoding.")
    );
    const operationId = yield* deriveCorpusOperationId(`corpus-extract:${record.sha256}`);
    const fallbackRelative = yield* decodePosixPath(sanitizedRelative).pipe(
      CorpusCommandError.mapError("Sanitized relative path failed decoding.")
    );
    const ids = { artifactId, digest, operationId, relativePath: fallbackRelative };

    // Fail closed before extraction: the manifest is untrusted, so the source
    // file must canonicalize to a real path inside <corpusRoot>/raw rather than
    // an attacker-chosen absolute path or `..`/symlink escape.
    const safeSourcePath = yield* resolveWithinRoot(
      rawRoot,
      record.destPath,
      "Provenance source path escapes the corpus raw directory"
    );

    const source = yield* decodeSourceArtifact({
      digest,
      id: artifactId,
      locator: { kind: "file", value: safeSourcePath },
      name: basenameOf(record.relativePath),
      relativePath: `${record.sourceLabel}/${record.relativePath}`,
      sizeBytes: record.sizeBytes,
      ...R.getSomes({ extension: O.fromUndefinedOr(extensionOf(basenameOf(record.relativePath))) }),
    }).pipe(Effect.option);

    if (O.isNone(source)) {
      return failedOutcome(
        record,
        ids,
        "file-detection-failed",
        "Source path or name is not portable (likely contains a backslash); skipped by corpus extract."
      );
    }

    const outcome = yield* processFile(
      ProcessFileOperation.make({
        exportChildren: options.exportChildren,
        operationId,
        operationKind: "process",
        preference: { engine: "auto" },
        source: source.value,
      })
    ).pipe(
      Effect.matchEffect({
        onFailure: (error) =>
          Effect.succeed(
            failedOutcome(
              record,
              ids,
              error.reason === "engine-unavailable" ? "engine-unavailable" : "unsupported-file-format",
              error.message
            )
          ),
        onSuccess: (result) =>
          Match.value(result).pipe(
            Match.discriminatorsExhaustive("resultKind")({
              "archive-exported": Effect.fn("CorpusCommandService.archiveExportedOutcome")(function* (
                archive: ArchiveExportProcessFileResult
              ) {
                const childLines = yield* Effect.forEach(archive.archiveExport.children, (child) =>
                  encodeChildArtifactRecordJson(
                    ChildArtifactRecord.make({ child, sourceArtifactId: archive.sourceArtifactId })
                  ).pipe(CorpusCommandError.mapError("Child artifact record failed JSONL encoding."))
                );
                yield* writeCorpusStringFile(
                  path.join(outDir, "children", archive.sourceArtifactId, "artifacts.jsonl"),
                  jsonlContent(childLines)
                );
                return {
                  childArtifactCount: A.length(archive.archiveExport.children),
                  failure: O.none<FileProcessingFailureRecord>(),
                  sourceRecord: SucceededSourceProcessingRecord.make({
                    artifactId: ids.artifactId,
                    digest: ids.digest,
                    engine: archive.engine,
                    format: archive.format,
                    operationId: ids.operationId,
                    relativePath: ids.relativePath,
                    sizeBytes: record.sizeBytes,
                    status: "succeeded",
                  }),
                  strategy: SupportedSelectedStrategy.make({
                    disposition: "supported",
                    engine: engineFamilyFromName(archive.engine),
                    format: archive.format,
                    operationKind: "export-archive",
                  }),
                } satisfies CorpusExtractOutcome;
              }),
              extracted: Effect.fn("CorpusCommandService.extractedOutcome")(function* (
                extracted: ExtractedProcessFileResult
              ) {
                const textRelative =
                  extracted.extraction.text === undefined ? O.none() : O.some(`text/${ids.operationId}.txt`);
                if (O.isSome(textRelative) && extracted.extraction.text !== undefined) {
                  yield* writeCorpusStringFile(path.join(outDir, textRelative.value), extracted.extraction.text);
                }
                const metadataJson = yield* encodeMetadataRecordJson(extracted.extraction.metadata).pipe(
                  CorpusCommandError.mapError("Extraction metadata failed JSON encoding.")
                );
                yield* writeCorpusStringFile(
                  path.join(outDir, "metadata", `${ids.operationId}.json`),
                  `${metadataJson}\n`
                );
                const textPath = O.isNone(textRelative)
                  ? O.none()
                  : O.some(
                      yield* decodePosixPath(textRelative.value).pipe(
                        CorpusCommandError.mapError("Text artifact path failed decoding.")
                      )
                    );
                return {
                  childArtifactCount: 0,
                  failure: O.none<FileProcessingFailureRecord>(),
                  sourceRecord: SucceededSourceProcessingRecord.make({
                    artifactId: ids.artifactId,
                    digest: ids.digest,
                    engine: extracted.engine,
                    format: extracted.format,
                    operationId: ids.operationId,
                    relativePath: ids.relativePath,
                    sizeBytes: record.sizeBytes,
                    status: "succeeded",
                    ...(O.isNone(textPath) ? {} : { textPath: textPath.value }),
                  }),
                  strategy: SupportedSelectedStrategy.make({
                    disposition: "supported",
                    engine: engineFamilyFromName(extracted.engine),
                    format: extracted.format,
                    operationKind: "extract",
                  }),
                } satisfies CorpusExtractOutcome;
              }),
              skipped: (skipped) =>
                Effect.succeed({
                  childArtifactCount: 0,
                  failure: O.some(
                    SkippedFileProcessingFailureRecord.make({
                      artifactId: ids.artifactId,
                      engine: skipped.engine,
                      format: skipped.format,
                      message: A.join(skipped.warnings, " ") || `Skipped: ${skipped.skipReason}.`,
                      operationId: ids.operationId,
                      reason: skipped.skipReason,
                      relativePath: ids.relativePath,
                      status: "skipped",
                    })
                  ),
                  sourceRecord: SkippedSourceProcessingRecord.make({
                    artifactId: ids.artifactId,
                    digest: ids.digest,
                    engine: skipped.engine,
                    format: skipped.format,
                    operationId: ids.operationId,
                    relativePath: ids.relativePath,
                    sizeBytes: record.sizeBytes,
                    skipReason: skipped.skipReason,
                    status: "skipped",
                  }),
                  strategy: DeferredSelectedStrategy.make({
                    disposition: "deferred",
                    engine: engineFamilyFromName(skipped.engine),
                    format: skipped.format,
                    operationKind: "process",
                    skipReason: skipped.skipReason,
                  }),
                } satisfies CorpusExtractOutcome),
            })
          ),
      })
    );

    const completed = yield* Ref.updateAndGet(completedRef, (value) => value + 1);
    if (completed % 250 === 0 || completed === total) {
      yield* Console.log(`corpus extract: ${completed}/${total} sources processed`);
    }
    return outcome;
  });

  const fileProcessingLayer = makeFileProcessingServiceLayer(engines);
  const outcomes = yield* Effect.scoped(
    Layer.build(fileProcessingLayer).pipe(
      Effect.flatMap((context) =>
        Effect.forEach(selected, (record) => processOneSource(record).pipe(Effect.provide(context)), {
          concurrency,
        })
      )
    )
  );

  const { failureRecords, sourceRecords } = collectSourceOutcomeRecords(outcomes);
  const childArtifactCount = A.reduce(outcomes, 0, (total_, outcome) => total_ + outcome.childArtifactCount);
  const coverage = yield* buildExtractCoverage(sourceRecords);

  const runId = yield* deriveCorpusOperationId(
    `corpus-extract-run:${A.join(
      A.map(selected, (record) => record.sha256),
      "|"
    )}`
  );
  const runManifest = ProcessRunManifest.make({
    coverage,
    engine: "auto",
    manifestVersion: "beep.file-processing.run.v1",
    outputRoot: ".",
    runId,
    sourceRootLabel: "corpus-raw",
    strategies: A.map(outcomes, (outcome) => outcome.strategy),
  });

  const runJson = yield* encodeProcessRunManifestJson(runManifest).pipe(
    CorpusCommandError.mapError("Run manifest failed JSON encoding.")
  );
  const coverageJson = yield* encodeFileProcessingCoverageSummaryJson(coverage).pipe(
    CorpusCommandError.mapError("Coverage summary failed JSON encoding.")
  );
  const sourceLines = yield* Effect.forEach(sourceRecords, (record) =>
    encodeSourceProcessingRecordJson(record).pipe(
      CorpusCommandError.mapError("Source processing record failed JSONL encoding.")
    )
  );
  const failureLines = yield* Effect.forEach(failureRecords, (record) =>
    encodeFileProcessingFailureRecordJson(record).pipe(
      CorpusCommandError.mapError("Failure record failed JSONL encoding.")
    )
  );

  yield* writeCorpusStringFile(path.join(outDir, "run.json"), `${runJson}\n`);
  yield* writeCorpusStringFile(path.join(outDir, "coverage.json"), `${coverageJson}\n`);
  yield* writeCorpusStringFile(path.join(outDir, "sources.jsonl"), jsonlContent(sourceLines));
  yield* writeCorpusStringFile(path.join(outDir, "failures.jsonl"), jsonlContent(failureLines));

  const summary = CorpusExtractSummary.make({
    childArtifactCount: NonNegativeInt.make(childArtifactCount),
    duplicatesSkipped: NonNegativeInt.make(duplicatesSkipped),
    failedCount: coverage.failedCount,
    skippedCount: coverage.skippedCount,
    sourceCount: coverage.sourceCount,
    succeededCount: coverage.succeededCount,
    textArtifactCount: coverage.textArtifactCount,
  });
  const summaryJson = yield* encodeCorpusExtractSummaryJson(summary).pipe(
    CorpusCommandError.mapError("Extract summary failed JSON encoding.")
  );
  yield* writeCorpusStringFile(path.join(outDir, "extract-summary.json"), `${summaryJson}\n`);

  yield* Console.log(
    `corpus extract: sources=${summary.sourceCount} succeeded=${summary.succeededCount} skipped=${summary.skippedCount} failed=${summary.failedCount} textArtifacts=${summary.textArtifactCount} children=${summary.childArtifactCount}`
  );
  yield* Console.log(`corpus extract: output "${outDir}"`);

  return summary;
});

const verifySalvageImpl = Effect.fn("CorpusCommandService.verifySalvage")(function* (
  options: CorpusSalvageOptions
): Effect.fn.Return<CorpusSalvageSummary, CorpusCommandError, CorpusCommandServiceRequirements> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const rawRoot = path.join(options.corpusRoot, "raw");
  const manifestPath = path.join(rawRoot, "provenance.jsonl");
  const reportPath = path.join(options.corpusRoot, "catalog", "reports", "salvage-verify.json");
  const stride = Math.max(1, Math.floor(options.sampleStride ?? 1));

  const manifestText = yield* fs
    .readFileString(manifestPath)
    .pipe(CorpusCommandError.mapError(`Failed reading provenance manifest "${manifestPath}".`));
  const allRecords = yield* decodeProvenanceLines(manifestText);
  const sampled = A.filter(allRecords, (_, index) => index % stride === 0);
  yield* Console.log(
    `corpus salvage: verifying ${A.length(sampled)}/${A.length(allRecords)} records (stride ${stride})`
  );

  const hashFile = Effect.fn("CorpusCommandService.hashFile")(function* (filePath: string) {
    const hash = createHash("sha256");
    yield* fs.stream(filePath).pipe(
      Stream.runForEach((chunk) => Effect.sync(() => hash.update(chunk))),
      CorpusCommandError.mapError(`Failed hashing salvaged file "${filePath}".`)
    );
    return hash.digest("hex");
  });

  const results = yield* Effect.forEach(
    sampled,
    Effect.fnUntraced(function* (record) {
      // Fail closed before reading: never `exists`/`hashFile` a manifest path
      // that escapes <corpusRoot>/raw, which would leak an existence/hash
      // oracle for arbitrary victim-readable files.
      const safeDestPath = yield* resolveWithinRoot(
        rawRoot,
        record.destPath,
        "Provenance salvage path escapes the corpus raw directory"
      );
      const exists = yield* fs
        .exists(safeDestPath)
        .pipe(CorpusCommandError.mapError(`Failed checking salvaged file "${safeDestPath}".`));
      if (!exists) {
        yield* Console.log(`corpus salvage: MISSING ${record.sourceLabel}/${record.relativePath}`);
        return { kind: "missing" as const, sizeBytes: 0 };
      }
      const actual = yield* hashFile(safeDestPath);
      if (actual !== record.sha256) {
        yield* Console.log(`corpus salvage: MISMATCH ${record.sourceLabel}/${record.relativePath}`);
        return { kind: "mismatched" as const, sizeBytes: record.sizeBytes };
      }
      return { kind: "matched" as const, sizeBytes: record.sizeBytes };
    }),
    { concurrency: 4 }
  );

  const matched = A.length(A.filter(results, (result) => result.kind === "matched"));
  const mismatched = A.length(A.filter(results, (result) => result.kind === "mismatched"));
  const missing = A.length(A.filter(results, (result) => result.kind === "missing"));
  const bytesChecked = A.reduce(results, 0, (total, result) => total + result.sizeBytes);

  const summary = CorpusSalvageSummary.make({
    bytesChecked: NonNegativeInt.make(bytesChecked),
    matched: NonNegativeInt.make(matched),
    mismatched: NonNegativeInt.make(mismatched),
    missing: NonNegativeInt.make(missing),
    recordsChecked: NonNegativeInt.make(A.length(results)),
  });
  const summaryJson = yield* encodeCorpusSalvageSummaryJson(summary).pipe(
    CorpusCommandError.mapError("Salvage verification summary failed JSON encoding.")
  );
  yield* writeCorpusStringFile(reportPath, `${summaryJson}\n`);
  yield* Console.log(
    `corpus salvage: checked=${summary.recordsChecked} matched=${summary.matched} mismatched=${summary.mismatched} missing=${summary.missing} bytes=${summary.bytesChecked}`
  );

  if (mismatched > 0 || missing > 0) {
    return yield* CorpusCommandError.make({
      message: `Salvage verification failed: ${mismatched} mismatched and ${missing} missing records (report at "${reportPath}").`,
    });
  }

  return summary;
});

const labelPathKey = (sourceLabel: string, relativePath: string): string => `${sourceLabel}\u0000${relativePath}`;

const docketPattern = /\b(\d{5,6}(?:US|WO|EP|CA|AU|CN|JP|PCT)\d{0,2}(?:-US\d+)?)\b/iu;
const docketFamilyPattern = /^\d{5,6}/;

/**
 * Extract an attorney-docket token and its family prefix from free text.
 *
 * Matches tokens such as `10109WO02-US1` or `101117US01`; the family is the
 * leading numeric prefix shared by all country-stage filings of one matter.
 *
 * @param text - File name or path text to scan.
 * @returns The normalized docket and family, or none.
 * @example
 * ```ts
 * import { extractCorpusDocket } from "@beep/repo-cli/commands/Corpus"
 * import * as O from "effect/Option"
 *
 * const docket = extractCorpusDocket("Response OA 2025-11-07 (10109WO02-US1).docx")
 * console.log(O.isSome(docket)) // true
 * ```
 * @category parsers
 * @since 0.0.0
 */
export const extractCorpusDocket = (text: string): O.Option<{ readonly docket: string; readonly family: string }> =>
  pipeDocket(text);

const pipeDocket = (text: string): O.Option<{ readonly docket: string; readonly family: string }> =>
  O.fromNullishOr(docketPattern.exec(text)).pipe(
    O.flatMap((match) => O.fromNullishOr(match[1])),
    O.map((raw) => {
      const docket = raw.toUpperCase();
      const family = docketFamilyPattern.exec(docket)?.[0] ?? docket;
      return { docket, family };
    })
  );

const sanitizeSegment = (value: string): string => {
  const cleaned = value.replaceAll(/[\\/\u0000]/gu, "_").trim();
  return Str.isEmpty(cleaned) ? "_" : cleaned;
};

const windowsPathDirectories = (originalPath: string): Array<string> => {
  const segments = A.filter(Str.split(originalPath, /[\\/]/u), Str.isNonEmpty);
  const withoutDrive = A.filter(segments, (segment, index) => !(index === 0 && /^[A-Za-z]:$/.test(segment)));
  return A.map(A.dropRight(withoutDrive, 1), sanitizeSegment);
};

const versionStem = (name: string): string => {
  const dot = name.lastIndexOf(".");
  const stem = dot <= 0 ? name : name.slice(0, dot);
  return stem.toLowerCase().replaceAll(/\s+/gu, " ").trim();
};

const decodeRestorationRecordJson = S.decodeUnknownEffect(S.fromJsonString(CorpusRestorationRecord));
const decodeClientMapJson = S.decodeUnknownEffect(S.fromJsonString(S.Record(S.String, S.String)));

const createOrganizedTable = `
CREATE OR REPLACE TABLE corpus_organized (
  digest VARCHAR NOT NULL,
  source_label VARCHAR NOT NULL,
  source_relative_path VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  client VARCHAR,
  docket VARCHAR,
  docket_family VARCHAR,
  version_index BIGINT,
  organized_relative_path VARCHAR,
  effective_name VARCHAR NOT NULL,
  restored BOOLEAN NOT NULL,
  materialized BOOLEAN NOT NULL
)`;

const insertOrganizedStatement = `
INSERT INTO corpus_organized VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;

interface OrganizePlanRow {
  readonly category: CorpusOrganizeCategory;
  readonly client: string | undefined;
  readonly destPath: string;
  readonly digest: string;
  readonly directories: ReadonlyArray<string>;
  readonly docket: string | undefined;
  readonly docketFamily: string | undefined;
  readonly effectiveName: string;
  readonly mtimeEpoch: number;
  readonly restored: boolean;
  readonly sourceLabel: string;
  readonly sourceRelativePath: string;
}

const prepareOrganizedRoot = Effect.fn("CorpusCommandService.prepareOrganizedRoot")(function* (
  organizedRoot: string,
  overwrite: boolean
): Effect.fn.Return<void, CorpusCommandError, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  const organizedExists = yield* fs
    .exists(organizedRoot)
    .pipe(CorpusCommandError.mapError(`Failed checking organized root "${organizedRoot}".`));
  if (organizedExists) {
    const entries = yield* fs
      .readDirectory(organizedRoot)
      .pipe(CorpusCommandError.mapError(`Failed reading organized root "${organizedRoot}".`));
    if (A.length(entries) > 0 && !overwrite) {
      return yield* CorpusCommandError.make({
        message: `Organized root "${organizedRoot}" is not empty; pass --overwrite to rebuild it.`,
      });
    }
    if (A.length(entries) > 0) {
      yield* fs
        .remove(organizedRoot, { recursive: true })
        .pipe(CorpusCommandError.mapError(`Failed clearing organized root "${organizedRoot}".`));
    }
  }
  yield* fs
    .makeDirectory(organizedRoot, { recursive: true })
    .pipe(CorpusCommandError.mapError(`Failed creating organized root "${organizedRoot}".`));
});

const loadMatchedRestorations = Effect.fn("CorpusCommandService.loadMatchedRestorations")(function* (
  restorationPath: string
): Effect.fn.Return<Map<string, MatchedRestorationRecord>, CorpusCommandError, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  const restorationText = yield* fs
    .readFileString(restorationPath)
    .pipe(CorpusCommandError.mapError(`Failed reading restoration manifest "${restorationPath}"; run catalog first.`));
  const restorations = yield* Effect.forEach(A.filter(Str.split(restorationText, "\n"), Str.isNonEmpty), (line) =>
    decodeRestorationRecordJson(line).pipe(
      CorpusCommandError.mapError("Restoration manifest line failed schema validation.")
    )
  );
  const restoredByLabelPath = new Map<string, MatchedRestorationRecord>();
  for (const record of restorations) {
    if (record.matchStatus === "matched") {
      restoredByLabelPath.set(labelPathKey(record.sourceLabel, record.contentRelativePath), record);
    }
  }
  return restoredByLabelPath;
});

const loadClientMap = Effect.fn("CorpusCommandService.loadClientMap")(function* (
  clientMapPath: string | undefined
): Effect.fn.Return<Map<string, string>, CorpusCommandError, FileSystem.FileSystem> {
  const clientByLabel = new Map<string, string>();
  if (clientMapPath === undefined) {
    return clientByLabel;
  }
  const fs = yield* FileSystem.FileSystem;
  const clientMapText = yield* fs
    .readFileString(clientMapPath)
    .pipe(CorpusCommandError.mapError(`Failed reading client map "${clientMapPath}".`));
  const clientMap = yield* decodeClientMapJson(clientMapText).pipe(
    CorpusCommandError.mapError("Client map failed schema validation.")
  );
  for (const [label, client] of Object.entries(clientMap)) {
    clientByLabel.set(label, sanitizeSegment(client));
  }
  return clientByLabel;
});

const organizeCategoryFor = (input: {
  readonly client: string | undefined;
  readonly extension: string | undefined;
  readonly hasDocket: boolean;
  readonly isEmailExport: boolean;
  readonly isRecycleMetadata: boolean;
}): CorpusOrganizeCategory =>
  input.isRecycleMetadata
    ? "recycle-metadata"
    : input.extension === "pst"
      ? "email-archive"
      : input.hasDocket
        ? "docket"
        : input.isEmailExport
          ? "email-export"
          : input.client === undefined
            ? "unsorted"
            : "client";

const planOrganizeRow = (
  record: CorpusProvenanceRecord,
  restoration: MatchedRestorationRecord | undefined,
  client: string | undefined
): OrganizePlanRow => {
  const effectiveName = sanitizeSegment(restoration?.original.originalName ?? basenameOf(record.relativePath));
  const directories =
    restoration === undefined
      ? A.map(A.filter(Str.split(parentDirOf(record.relativePath), "/"), Str.isNonEmpty), sanitizeSegment)
      : windowsPathDirectories(restoration.original.originalPath);
  const docket = pipeDocket(`${effectiveName} ${record.relativePath}`);
  const isRecycleMetadata = O.match(classifyRecycleBinName(basenameOf(record.relativePath)), {
    onNone: () => false,
    onSome: (entry) => entry.kind === "metadata",
  });

  return {
    category: organizeCategoryFor({
      client,
      extension: extensionOf(effectiveName),
      hasDocket: O.isSome(docket),
      isEmailExport: record.relativePath.startsWith("Sent_Emails.export/"),
      isRecycleMetadata,
    }),
    client,
    destPath: record.destPath,
    digest: `sha256:${record.sha256}`,
    directories,
    docket: O.isSome(docket) ? docket.value.docket : undefined,
    docketFamily: O.isSome(docket) ? docket.value.family : undefined,
    effectiveName,
    mtimeEpoch: record.mtimeEpoch,
    restored: restoration !== undefined,
    sourceLabel: record.sourceLabel,
    sourceRelativePath: record.relativePath,
  };
};

const buildOrganizePlan = (
  allRecords: ReadonlyArray<CorpusProvenanceRecord>,
  restoredByLabelPath: ReadonlyMap<string, MatchedRestorationRecord>,
  clientByLabel: ReadonlyMap<string, string>
): { readonly duplicatesSkipped: number; readonly plan: ReadonlyArray<OrganizePlanRow> } => {
  const { duplicatesSkipped, kept } = dedupeBySha256(allRecords);
  const plan = A.map(kept, (record) =>
    planOrganizeRow(
      record,
      restoredByLabelPath.get(labelPathKey(record.sourceLabel, record.relativePath)),
      clientByLabel.get(record.sourceLabel)
    )
  );

  return { duplicatesSkipped, plan };
};

const assignVersionIndexes = (
  plan: ReadonlyArray<OrganizePlanRow>
): { readonly multiVersionGroups: number; readonly versionIndexByRow: ReadonlyMap<OrganizePlanRow, number> } => {
  const versionIndexByRow = new Map<OrganizePlanRow, number>();
  const versionGroups = new Map<string, Array<OrganizePlanRow>>();
  for (const row of plan) {
    if (row.category !== "docket" || row.docket === undefined) {
      continue;
    }
    const groupKey = `${row.docket}\u0000${versionStem(row.effectiveName)}`;
    const group = versionGroups.get(groupKey) ?? [];
    group.push(row);
    versionGroups.set(groupKey, group);
  }
  let multiVersionGroups = 0;
  for (const group of versionGroups.values()) {
    if (A.length(group) < 2) {
      continue;
    }
    multiVersionGroups += 1;
    const ordered = A.sort(
      group,
      Order.mapInput(Order.Number, (row: OrganizePlanRow) => row.mtimeEpoch)
    );
    ordered.forEach((row, index) => {
      versionIndexByRow.set(row, index + 1);
    });
  }
  return { multiVersionGroups, versionIndexByRow };
};

const joinOrganizedSegments = (segments: ReadonlyArray<string>): string => A.join(segments, "/");

const organizedRelativeFor = (row: OrganizePlanRow, versionedName: string): string | undefined =>
  Match.value(row.category).pipe(
    Match.when("email-archive", () =>
      joinOrganizedSegments(["email-archives", `${row.sourceLabel}--${row.effectiveName}`])
    ),
    Match.when("docket", () =>
      joinOrganizedSegments(["dockets", row.docketFamily ?? "_", row.docket ?? "_", versionedName])
    ),
    Match.when("client", () =>
      joinOrganizedSegments(["clients", row.client ?? "_", ...row.directories, row.effectiveName])
    ),
    Match.when("unsorted", () =>
      joinOrganizedSegments(["_unsorted", row.sourceLabel, ...row.directories, row.effectiveName])
    ),
    Match.orElse(() => undefined)
  );

const dedupeOrganizedTarget = (candidate: string, usedTargets: ReadonlySet<string>, digest: string): string => {
  if (!usedTargets.has(candidate)) {
    return candidate;
  }
  const digestSuffix = digest.slice("sha256:".length, "sha256:".length + 8);
  const dot = candidate.lastIndexOf(".");
  return dot <= candidate.lastIndexOf("/")
    ? `${candidate}--${digestSuffix}`
    : `${candidate.slice(0, dot)}--${digestSuffix}${candidate.slice(dot)}`;
};

const materializeOrganizedRow = Effect.fn("CorpusCommandService.materializeOrganizedRow")(function* (
  rawRoot: string,
  organizedRoot: string,
  row: OrganizePlanRow,
  organizedRelative: string
): Effect.fn.Return<void, CorpusCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  // Fail closed on both ends: the manifest source must canonicalize inside
  // <corpusRoot>/raw, and the taxonomy-derived target must canonicalize inside
  // organizedRoot, so neither a `..`/symlink escape in sourceLabel/relativePath
  // nor an attacker `destPath` can read or overwrite files outside the corpus.
  const safeSourcePath = yield* resolveWithinRoot(
    rawRoot,
    row.destPath,
    "Provenance source path escapes the corpus raw directory"
  );
  const targetPath = yield* resolveWithinRoot(
    organizedRoot,
    path.join(organizedRoot, organizedRelative),
    "Organized target path escapes the organized root"
  );
  yield* fs
    .makeDirectory(path.dirname(targetPath), { recursive: true })
    .pipe(CorpusCommandError.mapError(`Failed creating organized directory for "${organizedRelative}".`));
  yield* (
    row.category === "email-archive" ? fs.symlink(safeSourcePath, targetPath) : fs.copyFile(safeSourcePath, targetPath)
  ).pipe(CorpusCommandError.mapError(`Failed materializing organized artifact "${organizedRelative}".`));
});

const organizeRecordFor = (
  row: OrganizePlanRow,
  organizedRelative: string | undefined,
  versionIndex: number | undefined,
  materialized: boolean
): CorpusOrganizeRecord =>
  CorpusOrganizeRecord.make({
    category: row.category,
    digest: row.digest,
    effectiveName: row.effectiveName,
    materialized,
    restoredFromRecycleBin: row.restored,
    sourceLabel: row.sourceLabel,
    sourceRelativePath: row.sourceRelativePath,
    ...R.getSomes({
      client: O.fromUndefinedOr(row.client),
      docket: O.fromUndefinedOr(row.docket),
      docketFamily: O.fromUndefinedOr(row.docketFamily),
      organizedRelativePath: O.fromUndefinedOr(organizedRelative),
    }),
    ...R.getSomes({ versionIndex: O.map(O.fromUndefinedOr(versionIndex), NonNegativeInt.make) }),
  });

const writeOrganizedTable = Effect.fn("CorpusCommandService.writeOrganizedTable")(function* (
  databasePath: string,
  records: ReadonlyArray<CorpusOrganizeRecord>
): Effect.fn.Return<void, CorpusCommandError> {
  yield* runWithCorpusDb(
    databasePath,
    `Failed writing the organized catalog table at "${databasePath}".`,
    Effect.gen(function* () {
      const db = yield* DuckDb;
      yield* db.run(createOrganizedTable);
      yield* insertRows(db, insertOrganizedStatement, records, (record) => [
        record.digest,
        record.sourceLabel,
        record.sourceRelativePath,
        record.category,
        record.client ?? null,
        record.docket ?? null,
        record.docketFamily ?? null,
        record.versionIndex ?? null,
        record.organizedRelativePath ?? null,
        record.effectiveName,
        record.restoredFromRecycleBin,
        record.materialized,
      ]);
    })
  );
});

const buildOrganizeSummary = (input: {
  readonly counts: Record<CorpusOrganizeCategory, number>;
  readonly duplicatesSkipped: number;
  readonly multiVersionGroups: number;
  readonly plan: ReadonlyArray<OrganizePlanRow>;
  readonly records: ReadonlyArray<CorpusOrganizeRecord>;
}): CorpusOrganizeSummary => {
  const docketFamilies = new Set(
    A.flatMap(input.plan, (row) => (row.docketFamily === undefined ? [] : [row.docketFamily]))
  );
  return CorpusOrganizeSummary.make({
    canonicalArtifacts: NonNegativeInt.make(A.length(input.plan)),
    clientFiles: NonNegativeInt.make(input.counts.client),
    docketFamilies: NonNegativeInt.make(docketFamilies.size),
    docketFiles: NonNegativeInt.make(input.counts.docket),
    duplicatesSkipped: NonNegativeInt.make(input.duplicatesSkipped),
    emailArchives: NonNegativeInt.make(input.counts["email-archive"]),
    emailExportFiles: NonNegativeInt.make(input.counts["email-export"]),
    restoredNames: NonNegativeInt.make(A.length(A.filter(input.records, (record) => record.restoredFromRecycleBin))),
    unsortedFiles: NonNegativeInt.make(input.counts.unsorted),
    versionGroups: NonNegativeInt.make(input.multiVersionGroups),
  });
};

const organizeCorpusImpl = Effect.fn("CorpusCommandService.organizeCorpus")(function* (
  options: CorpusOrganizeOptions
): Effect.fn.Return<CorpusOrganizeSummary, CorpusCommandError, CorpusCommandServiceRequirements> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const rawRoot = path.join(options.corpusRoot, "raw");
  const manifestPath = path.join(rawRoot, "provenance.jsonl");
  const restorationPath = path.join(options.corpusRoot, "catalog", "restoration-manifest.jsonl");
  const organizedRoot = path.join(options.corpusRoot, "organized");
  const organizeManifestPath = path.join(options.corpusRoot, "catalog", "organize-manifest.jsonl");
  const summaryReportPath = path.join(options.corpusRoot, "catalog", "reports", "organize-summary.json");
  const databasePath = path.join(options.corpusRoot, "catalog", "corpus.duckdb");

  yield* prepareOrganizedRoot(organizedRoot, options.overwrite);

  const manifestText = yield* fs
    .readFileString(manifestPath)
    .pipe(CorpusCommandError.mapError(`Failed reading provenance manifest "${manifestPath}".`));
  const allRecords = yield* decodeProvenanceLines(manifestText);
  const restoredByLabelPath = yield* loadMatchedRestorations(restorationPath);
  const clientByLabel = yield* loadClientMap(options.clientMapPath);

  const { duplicatesSkipped, plan } = buildOrganizePlan(allRecords, restoredByLabelPath, clientByLabel);
  const { multiVersionGroups, versionIndexByRow } = assignVersionIndexes(plan);

  const usedTargets = new Set<string>();
  const records: Array<CorpusOrganizeRecord> = [];
  const counts: Record<CorpusOrganizeCategory, number> = {
    client: 0,
    docket: 0,
    "email-archive": 0,
    "email-export": 0,
    "recycle-metadata": 0,
    unsorted: 0,
  };

  for (const row of plan) {
    counts[row.category] += 1;
    const versionIndex = versionIndexByRow.get(row);
    const versionedName =
      versionIndex === undefined ? row.effectiveName : `v${`${versionIndex}`.padStart(2, "0")}--${row.effectiveName}`;
    const candidate = organizedRelativeFor(row, versionedName);
    const organizedRelative =
      candidate === undefined ? undefined : dedupeOrganizedTarget(candidate, usedTargets, row.digest);

    if (organizedRelative !== undefined) {
      usedTargets.add(organizedRelative);
      yield* materializeOrganizedRow(rawRoot, organizedRoot, row, organizedRelative);
    }

    records.push(organizeRecordFor(row, organizedRelative, versionIndex, organizedRelative !== undefined));
  }

  const manifestLines = yield* Effect.forEach(records, (record) =>
    encodeCorpusOrganizeRecordJson(record).pipe(
      CorpusCommandError.mapError("Organize manifest record failed JSONL encoding.")
    )
  );
  yield* writeCorpusStringFile(organizeManifestPath, jsonlContent(manifestLines));
  yield* writeOrganizedTable(databasePath, records);

  const summary = buildOrganizeSummary({ counts, duplicatesSkipped, multiVersionGroups, plan, records });
  const summaryJson = yield* encodeCorpusOrganizeSummaryJson(summary).pipe(
    CorpusCommandError.mapError("Organize summary failed JSON encoding.")
  );
  yield* writeCorpusStringFile(summaryReportPath, `${summaryJson}\n`);

  yield* Console.log(
    `corpus organize: canonical=${summary.canonicalArtifacts} docketFiles=${summary.docketFiles} (families=${summary.docketFamilies}, versionGroups=${summary.versionGroups}) client=${summary.clientFiles} emailArchives=${summary.emailArchives} emailExport=${summary.emailExportFiles} unsorted=${summary.unsortedFiles} restoredNames=${summary.restoredNames}`
  );
  yield* Console.log(`corpus organize: tree "${organizedRoot}"`);

  return summary;
});

const patentTextPattern = /\b(?:US[\s-]?)?(\d{1,2},\d{3},\d{3}|\d{7,8})(?:\s?[ABU]\d)?\b/gu;
const applicationTextPattern = /\b(\d{2}\/\d{3},?\d{3})\b/gu;

interface EnrichCandidate {
  readonly docketFamilies: Set<string>;
  readonly kind: "application" | "patent";
  occurrenceCount: number;
}

const createEnrichmentTable = `
CREATE OR REPLACE TABLE corpus_enrichment (
  candidate VARCHAR NOT NULL,
  candidate_kind VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  application_number VARCHAR,
  patent_number VARCHAR,
  invention_title VARCHAR,
  first_applicant_name VARCHAR,
  first_inventor_name VARCHAR,
  occurrence_count BIGINT NOT NULL,
  docket_families VARCHAR,
  parent_application_numbers VARCHAR
)`;

const insertEnrichmentStatement = `
INSERT INTO corpus_enrichment VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;

interface EnrichCandidateCollector {
  readonly candidates: Map<string, EnrichCandidate>;
  readonly scanText: (text: string, docketFamily: string | undefined) => void;
}

const makeEnrichCandidateCollector = (): EnrichCandidateCollector => {
  const candidates = new Map<string, EnrichCandidate>();
  const noteCandidate = (
    kind: "application" | "patent",
    normalized: string,
    docketFamily: string | undefined
  ): void => {
    const key = `${kind}:${normalized}`;
    const existing = candidates.get(key) ?? { docketFamilies: new Set<string>(), kind, occurrenceCount: 0 };
    existing.occurrenceCount += 1;
    if (docketFamily !== undefined) {
      existing.docketFamilies.add(docketFamily);
    }
    candidates.set(key, existing);
  };
  const scanText = (text: string, docketFamily: string | undefined): void => {
    for (const match of text.matchAll(patentTextPattern)) {
      const normalized = normalizeUsptoPatentNumber(match[1] ?? "");
      if (O.isSome(normalized) && normalized.value.length >= 7) {
        noteCandidate("patent", normalized.value, docketFamily);
      }
    }
    for (const match of text.matchAll(applicationTextPattern)) {
      const normalized = normalizeUsptoApplicationNumber(match[1] ?? "");
      if (O.isSome(normalized)) {
        noteCandidate("application", normalized.value, docketFamily);
      }
    }
  };
  return { candidates, scanText };
};

const loadEnrichOrganizeRecords = Effect.fn("CorpusCommandService.loadEnrichOrganizeRecords")(function* (
  organizeManifestPath: string
): Effect.fn.Return<ReadonlyArray<CorpusOrganizeRecord>, CorpusCommandError, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  const organizeText = yield* fs
    .readFileString(organizeManifestPath)
    .pipe(
      CorpusCommandError.mapError(`Failed reading organize manifest "${organizeManifestPath}"; run organize first.`)
    );
  return yield* Effect.forEach(A.filter(Str.split(organizeText, "\n"), Str.isNonEmpty), (line) =>
    S.decodeUnknownEffect(S.fromJsonString(CorpusOrganizeRecord))(line).pipe(
      CorpusCommandError.mapError("Organize manifest line failed schema validation.")
    )
  );
});

const buildFamilyByTextName = Effect.fn("CorpusCommandService.buildFamilyByTextName")(function* (
  corpusRoot: string,
  organizeRecords: ReadonlyArray<CorpusOrganizeRecord>
): Effect.fn.Return<ReadonlyMap<string, string>, CorpusCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const familyByDigest = new Map<string, string>();
  for (const record of organizeRecords) {
    if (record.docketFamily !== undefined) {
      familyByDigest.set(record.digest, record.docketFamily);
    }
  }
  const familyByTextName = new Map<string, string>();
  const sourcesPath = path.join(corpusRoot, "staging", "extract", "sources.jsonl");
  const sourcesExists = yield* fs
    .exists(sourcesPath)
    .pipe(CorpusCommandError.mapError(`Failed checking extraction sources "${sourcesPath}".`));
  if (!sourcesExists) {
    return familyByTextName;
  }
  const sourcesText = yield* fs
    .readFileString(sourcesPath)
    .pipe(CorpusCommandError.mapError(`Failed reading extraction sources "${sourcesPath}".`));
  const sourceRows = yield* Effect.forEach(A.filter(Str.split(sourcesText, "\n"), Str.isNonEmpty), (line) =>
    S.decodeUnknownEffect(S.fromJsonString(SourceProcessingRecord))(line).pipe(
      CorpusCommandError.mapError("Extraction sources line failed schema validation.")
    )
  );
  for (const row of sourceRows) {
    if (row.status !== "succeeded" || row.textPath === undefined) {
      continue;
    }
    const family = familyByDigest.get(row.digest);
    if (family !== undefined) {
      familyByTextName.set(basenameOf(row.textPath), family);
    }
  }
  return familyByTextName;
});

const buildEnrichSummary = (records: ReadonlyArray<CorpusEnrichmentRecord>): CorpusEnrichSummary => {
  const resolvedRecords = A.filter(records, (record) => record.status === "resolved");
  return CorpusEnrichSummary.make({
    applicationCandidates: NonNegativeInt.make(
      A.length(A.filter(records, (record) => record.candidateKind === "application"))
    ),
    failedLookups: NonNegativeInt.make(A.length(A.filter(records, (record) => record.status === "failed"))),
    familyAnchors: NonNegativeInt.make(
      A.length(A.filter(resolvedRecords, (record) => A.length(record.docketFamilies) > 0))
    ),
    notFound: NonNegativeInt.make(A.length(A.filter(records, (record) => record.status === "not-found"))),
    patentCandidates: NonNegativeInt.make(A.length(A.filter(records, (record) => record.candidateKind === "patent"))),
    resolved: NonNegativeInt.make(A.length(resolvedRecords)),
  });
};

const enrichCorpusImpl = Effect.fn("CorpusCommandService.enrichCorpus")(function* (
  options: CorpusEnrichOptions
): Effect.fn.Return<CorpusEnrichSummary, CorpusCommandError, CorpusCommandServiceRequirements> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const organizeManifestPath = path.join(options.corpusRoot, "catalog", "organize-manifest.jsonl");
  const textDir = path.join(options.corpusRoot, "staging", "extract", "text");
  const enrichmentManifestPath = path.join(options.corpusRoot, "catalog", "enrichment-manifest.jsonl");
  const summaryReportPath = path.join(options.corpusRoot, "catalog", "reports", "enrich-summary.json");
  const databasePath = path.join(options.corpusRoot, "catalog", "corpus.duckdb");
  const lookupDelayMillis = Math.max(0, Math.floor(options.lookupDelayMillis ?? 400));

  const organizeRecords = yield* loadEnrichOrganizeRecords(organizeManifestPath);
  const { candidates, scanText } = makeEnrichCandidateCollector();
  for (const record of organizeRecords) {
    scanText(`${record.effectiveName} ${record.sourceRelativePath}`, record.docketFamily);
  }
  const familyByTextName = yield* buildFamilyByTextName(options.corpusRoot, organizeRecords);

  const textDirExists = yield* fs
    .exists(textDir)
    .pipe(CorpusCommandError.mapError(`Failed checking extracted text directory "${textDir}".`));
  if (textDirExists) {
    const textFiles = yield* fs
      .readDirectory(textDir)
      .pipe(CorpusCommandError.mapError(`Failed reading extracted text directory "${textDir}".`));
    yield* Effect.forEach(
      textFiles,
      (name) =>
        fs.readFileString(path.join(textDir, name)).pipe(
          Effect.map((text) => scanText(text, familyByTextName.get(name))),
          CorpusCommandError.mapError(`Failed reading extracted text "${name}".`)
        ),
      { concurrency: 8 }
    );
  }

  const orderedCandidates = A.sort(
    [...candidates.entries()],
    Order.mapInput(
      Order.Number,
      (entry: readonly [string, EnrichCandidate]) =>
        // Docket-family-associated candidates first (filename-grounded, high
        // precision), then by corpus occurrence.
        (entry[1].docketFamilies.size > 0 ? -1_000_000 : 0) - entry[1].occurrenceCount
    )
  );
  const limited =
    options.maxLookups === undefined
      ? orderedCandidates
      : A.take(orderedCandidates, Math.max(0, Math.floor(options.maxLookups)));
  yield* Console.log(
    `corpus enrich: ${A.length(limited)}/${candidates.size} identifier candidates selected for USPTO lookup`
  );

  const lookups = Effect.gen(function* () {
    const uspto = yield* Uspto;
    return yield* Effect.forEach(
      limited,
      Effect.fnUntraced(function* ([key, candidate]) {
        const normalized = key.slice(key.indexOf(":") + 1);
        yield* Effect.sleep(`${lookupDelayMillis} millis`);
        const resolved =
          candidate.kind === "application"
            ? yield* uspto.getApplication(normalized).pipe(Effect.result)
            : yield* uspto.searchApplications(`applicationMetaData.patentNumber:"${normalized}"`).pipe(
                Effect.flatMap((results) =>
                  A.head(results).pipe(
                    O.match({
                      onNone: () => Effect.fail(makeUsptoError("not-found")),
                      onSome: Effect.succeed,
                    })
                  )
                ),
                Effect.result
              );

        if (Result.isFailure(resolved)) {
          const status = resolved.failure.reason === "not-found" ? ("not-found" as const) : ("failed" as const);
          return CorpusEnrichmentRecord.make({
            candidate: normalized,
            candidateKind: candidate.kind,
            docketFamilies: [...candidate.docketFamilies].sort(),
            occurrenceCount: NonNegativeInt.make(candidate.occurrenceCount),
            parentApplicationNumbers: [],
            status,
          });
        }

        const continuity = yield* uspto
          .getContinuity(resolved.success.applicationNumberText)
          .pipe(Effect.orElseSucceed(() => ({ childApplicationNumbers: [], parentApplicationNumbers: [] })));

        return CorpusEnrichmentRecord.make({
          applicationNumber: resolved.success.applicationNumberText,
          candidate: normalized,
          candidateKind: candidate.kind,
          docketFamilies: [...candidate.docketFamilies].sort(),
          occurrenceCount: NonNegativeInt.make(candidate.occurrenceCount),
          parentApplicationNumbers: continuity.parentApplicationNumbers,
          status: "resolved",
          ...R.getSomes({
            firstApplicantName: O.fromUndefinedOr(resolved.success.firstApplicantName),
            firstInventorName: O.fromUndefinedOr(resolved.success.firstInventorName),
            inventionTitle: O.fromUndefinedOr(resolved.success.inventionTitle),
            patentNumber: O.fromUndefinedOr(resolved.success.patentNumber),
          }),
        });
      }),
      { concurrency: 1 }
    );
  });

  const records = yield* Effect.scoped(
    Layer.build(Uspto.layer).pipe(Effect.flatMap((context) => lookups.pipe(Effect.provide(context))))
  ).pipe(CorpusCommandError.mapError("USPTO enrichment lookups failed."));

  const manifestLines = yield* Effect.forEach(records, (record) =>
    encodeCorpusEnrichmentRecordJson(record).pipe(
      CorpusCommandError.mapError("Enrichment record failed JSONL encoding.")
    )
  );
  yield* writeCorpusStringFile(enrichmentManifestPath, jsonlContent(manifestLines));

  yield* runWithCorpusDb(
    databasePath,
    `Failed writing the enrichment catalog table at "${databasePath}".`,
    Effect.gen(function* () {
      const db = yield* DuckDb;
      yield* db.run(createEnrichmentTable);
      yield* insertRows(db, insertEnrichmentStatement, records, (record) => [
        record.candidate,
        record.candidateKind,
        record.status,
        record.applicationNumber ?? null,
        record.patentNumber ?? null,
        record.inventionTitle ?? null,
        record.firstApplicantName ?? null,
        record.firstInventorName ?? null,
        record.occurrenceCount,
        A.join(record.docketFamilies, " | "),
        A.join(record.parentApplicationNumbers, " | "),
      ]);
    })
  );

  const summary = buildEnrichSummary(records);
  const summaryJson = yield* encodeCorpusEnrichSummaryJson(summary).pipe(
    CorpusCommandError.mapError("Enrich summary failed JSON encoding.")
  );
  yield* writeCorpusStringFile(summaryReportPath, `${summaryJson}\n`);

  yield* Console.log(
    `corpus enrich: resolved=${summary.resolved} notFound=${summary.notFound} failed=${summary.failedLookups} familyAnchors=${summary.familyAnchors} (applications=${summary.applicationCandidates}, patents=${summary.patentCandidates})`
  );
  yield* Console.log(`corpus enrich: manifest "${enrichmentManifestPath}"`);

  return summary;
});

const makeCorpusCommandService = Effect.fn("CorpusCommandService.make")(function* () {
  const runtimeContext = yield* Effect.context<CorpusCommandServiceRequirements>();

  return CorpusCommandService.of({
    catalogCorpus: Effect.fn("CorpusCommandService.catalogCorpus")((options) =>
      catalogCorpusImpl(options).pipe(Effect.provide(runtimeContext))
    ),
    enrichCorpus: Effect.fn("CorpusCommandService.enrichCorpus")((options) =>
      enrichCorpusImpl(options).pipe(Effect.provide(runtimeContext))
    ),
    extractCorpus: Effect.fn("CorpusCommandService.extractCorpus")((options) =>
      extractCorpusImpl(options).pipe(Effect.provide(runtimeContext))
    ),
    organizeCorpus: Effect.fn("CorpusCommandService.organizeCorpus")((options) =>
      organizeCorpusImpl(options).pipe(Effect.provide(runtimeContext))
    ),
    verifySalvage: Effect.fn("CorpusCommandService.verifySalvage")((options) =>
      verifySalvageImpl(options).pipe(Effect.provide(runtimeContext))
    ),
  });
});

/**
 * Live service layer for corpus curation operations.
 *
 * @example
 * ```ts
 * import { CorpusCommandServiceLive } from "@beep/repo-cli/commands/Corpus"
 *
 * const layers = { corpus: CorpusCommandServiceLive }
 * console.log(Object.keys(layers)) // ["corpus"]
 * ```
 * @category layers
 * @since 0.0.0
 */
export const CorpusCommandServiceLive: Layer.Layer<CorpusCommandService, never, CorpusCommandServiceRequirements> =
  Layer.effect(CorpusCommandService, makeCorpusCommandService());

/**
 * Build the corpus catalog, duplicate-set report, and restoration manifest.
 *
 * @param options - Catalog options naming the salvaged corpus root.
 * @returns Summary counts for the catalog run.
 * @example
 * ```ts
 * import { catalogCorpus, CorpusCatalogOptions } from "@beep/repo-cli/commands/Corpus"
 * import { Effect } from "effect"
 *
 * const options = CorpusCatalogOptions.make({ corpusRoot: "/data/corpus" })
 * const sourceFileCount = catalogCorpus(options).pipe(Effect.map((summary) => summary.sourceFiles))
 * console.log(sourceFileCount.pipe !== undefined) // true
 * ```
 * @effects Delegates to `CorpusCommandService`; the live service reads provenance JSONL, scans recycle-bin metadata, writes DuckDB/report artifacts, and logs a summary.
 * @category use-cases
 * @since 0.0.0
 */
export const catalogCorpus = Effect.fn("Corpus.catalogCorpus")(function* (
  options: CorpusCatalogOptions
): Effect.fn.Return<CorpusCatalogSummary, CorpusCommandError, CorpusCommandService> {
  const corpus = yield* CorpusCommandService;
  return yield* corpus.catalogCorpus(options);
});

/**
 * Run libpff and Tika extraction over salvaged raw/ files into staging/.
 *
 * @param options - Extraction options naming the corpus root and Tika jar.
 * @returns Summary counts for the extraction run.
 * @example
 * ```ts
 * import { extractCorpus, CorpusExtractOptions } from "@beep/repo-cli/commands/Corpus"
 * import { Effect } from "effect"
 *
 * const options = CorpusExtractOptions.make({
 *   corpusRoot: "/data/corpus",
 *   exportChildren: true,
 *   includeDuplicates: false,
 *   overwrite: false,
 *   tikaJarPath: "/opt/tika/tika-app.jar"
 * })
 * const sourceCount = extractCorpus(options).pipe(Effect.map((summary) => summary.sourceCount))
 * console.log(sourceCount.pipe !== undefined) // true
 * ```
 * @effects Delegates to `CorpusCommandService`; the live service reads manifests, invokes libpff/Tika processing engines, writes staging artifacts, and logs extraction counts.
 * @category use-cases
 * @since 0.0.0
 */
export const extractCorpus = Effect.fn("Corpus.extractCorpus")(function* (
  options: CorpusExtractOptions
): Effect.fn.Return<CorpusExtractSummary, CorpusCommandError, CorpusCommandService> {
  const corpus = yield* CorpusCommandService;
  return yield* corpus.extractCorpus(options);
});

/**
 * Resolve corpus-derived patent and application numbers against USPTO.
 *
 * @param options - Enrichment options naming the corpus root.
 * @returns Summary counts for the enrichment run.
 * @example
 * ```ts
 * import { enrichCorpus, CorpusEnrichOptions } from "@beep/repo-cli/commands/Corpus"
 * import { Effect } from "effect"
 *
 * const options = CorpusEnrichOptions.make({ corpusRoot: "/data/corpus", maxLookups: 25 })
 * const resolvedCount = enrichCorpus(options).pipe(Effect.map((summary) => summary.resolved))
 * console.log(resolvedCount.pipe !== undefined) // true
 * ```
 * @effects Delegates to `CorpusCommandService`; the live service reads organized/extracted text artifacts, calls USPTO APIs, writes enrichment manifests and DuckDB tables, and logs lookup counts.
 * @category use-cases
 * @since 0.0.0
 */
export const enrichCorpus = Effect.fn("Corpus.enrichCorpus")(function* (
  options: CorpusEnrichOptions
): Effect.fn.Return<CorpusEnrichSummary, CorpusCommandError, CorpusCommandService> {
  const corpus = yield* CorpusCommandService;
  return yield* corpus.enrichCorpus(options);
});

/**
 * Build the organized/ client, docket, and email-archive taxonomy.
 *
 * @param options - Organize options naming the corpus root.
 * @returns Summary counts for the organize run.
 * @example
 * ```ts
 * import { organizeCorpus, CorpusOrganizeOptions } from "@beep/repo-cli/commands/Corpus"
 * import { Effect } from "effect"
 *
 * const options = CorpusOrganizeOptions.make({ corpusRoot: "/data/corpus", overwrite: false })
 * const docketFiles = organizeCorpus(options).pipe(Effect.map((summary) => summary.docketFiles))
 * console.log(docketFiles.pipe !== undefined) // true
 * ```
 * @effects Delegates to `CorpusCommandService`; the live service reads catalog manifests, creates or clears organized output directories, copies or symlinks artifacts, writes manifests/tables, and logs taxonomy counts.
 * @category use-cases
 * @since 0.0.0
 */
export const organizeCorpus = Effect.fn("Corpus.organizeCorpus")(function* (
  options: CorpusOrganizeOptions
): Effect.fn.Return<CorpusOrganizeSummary, CorpusCommandError, CorpusCommandService> {
  const corpus = yield* CorpusCommandService;
  return yield* corpus.organizeCorpus(options);
});

/**
 * Re-hash salvaged raw/ files against the provenance manifest.
 *
 * @param options - Verification options naming the corpus root.
 * @returns Summary counts for the verification run.
 * @example
 * ```ts
 * import { verifySalvage, CorpusSalvageOptions } from "@beep/repo-cli/commands/Corpus"
 * import { Effect } from "effect"
 *
 * const options = CorpusSalvageOptions.make({ corpusRoot: "/data/corpus", sampleStride: 10 })
 * const matchedCount = verifySalvage(options).pipe(Effect.map((summary) => summary.matched))
 * console.log(matchedCount.pipe !== undefined) // true
 * ```
 * @effects Delegates to `CorpusCommandService`; the live service reads provenance records, hashes raw files, writes verification reports, and logs mismatch/missing counts.
 * @category use-cases
 * @since 0.0.0
 */
export const verifySalvage = Effect.fn("Corpus.verifySalvage")(function* (
  options: CorpusSalvageOptions
): Effect.fn.Return<CorpusSalvageSummary, CorpusCommandError, CorpusCommandService> {
  const corpus = yield* CorpusCommandService;
  return yield* corpus.verifySalvage(options);
});

/**
 * Print the corpus command index.
 *
 * @example
 * ```ts
 * import { printCorpusIndex } from "@beep/repo-cli/commands/Corpus"
 *
 * console.log(printCorpusIndex.pipe !== undefined) // true
 * ```
 * @effects Writes the corpus command index to the configured console when the returned Effect is executed.
 * @category cli-commands
 * @since 0.0.0
 */
export const printCorpusIndex = printLines([
  "Corpus commands:",
  "- bun run beep corpus salvage --corpus-root /path/to/corpus",
  "- bun run beep corpus catalog --corpus-root /path/to/corpus",
  "- bun run beep corpus extract --corpus-root /path/to/corpus --tika-jar /path/to/tika-app.jar --export-children",
  "- bun run beep corpus organize --corpus-root /path/to/corpus",
  "- bun run beep corpus enrich --corpus-root /path/to/corpus",
]);
