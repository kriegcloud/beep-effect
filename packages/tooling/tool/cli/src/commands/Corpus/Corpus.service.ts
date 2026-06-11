/**
 * Service implementation for corpus curation commands.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { DuckDb, DuckDbConnectionOptions } from "@beep/duckdb";
import { $RepoCliId } from "@beep/identity/packages";
import { NonNegativeInt } from "@beep/schema";
import { A, Str } from "@beep/utils";
import { Console, Context, Effect, FileSystem, Layer, Match, Path } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { printLines } from "../../internal/cli/Printer.js";
import { CorpusCommandError } from "./Corpus.errors.js";
import { classifyRecycleBinName, pairRecycleBinEntries, parseRecycleBinMetadata } from "./Corpus.recyclebin.js";
import {
  CorpusCatalogSummary,
  CorpusDuplicateSetRecord,
  decodeCorpusProvenanceRecordJson,
  encodeCorpusCatalogSummaryJson,
  encodeCorpusDuplicateSetReportJson,
  encodeCorpusRestorationRecordJson,
  MatchedRestorationRecord,
  RecycleBinScanEntry,
  UnmatchedContentRestorationRecord,
  UnmatchedMetadataRestorationRecord,
} from "./Corpus.schemas.js";
import type { CorpusCatalogOptions, CorpusProvenanceRecord, CorpusRestorationRecord } from "./Corpus.schemas.js";

const $I = $RepoCliId.create("commands/Corpus/Corpus.service");

type CorpusCommandServiceRequirements = FileSystem.FileSystem | Path.Path;

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
}

/**
 * Service tag for corpus curation operations.
 *
 * @example
 * ```ts
 * import { CorpusCommandService } from "@beep/repo-cli/commands/Corpus"
 * console.log(CorpusCommandService)
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

const SourceTotalsRow = S.Struct({
  distinctDigests: S.Finite,
  sourceFiles: S.Finite,
  totalBytes: S.Finite,
});

const DuplicateTotalsRow = S.Struct({
  duplicateFiles: S.Finite,
  duplicateSets: S.Finite,
  redundantBytes: S.Finite,
});

const decodeSourceTotalsRows = S.decodeUnknownEffect(S.Array(SourceTotalsRow));
const decodeDuplicateTotalsRows = S.decodeUnknownEffect(S.Array(DuplicateTotalsRow));
const decodeDuplicateSetRecords = S.decodeUnknownEffect(S.Array(CorpusDuplicateSetRecord));

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
  records: ReadonlyArray<CorpusProvenanceRecord>
): Effect.fn.Return<ReadonlyArray<CorpusRestorationRecord>, CorpusCommandError, FileSystem.FileSystem> {
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
    const bytes = yield* fs
      .readFile(destPath)
      .pipe(CorpusCommandError.mapError(`Failed reading recycle-bin metadata file "${destPath}".`));
    return yield* parseRecycleBinMetadata(bytes).pipe(
      Effect.mapError((error) =>
        CorpusCommandError.make({ cause: error, message: `${error.message} (file "${relativePath}")` })
      )
    );
  });

  const groupResults = yield* Effect.forEach([...groups.values()], (group) =>
    Effect.gen(function* () {
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

  const manifestPath = path.join(options.corpusRoot, "raw", "provenance.jsonl");
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

  const restorations = yield* buildRestorationRecords(provenance);
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

  const duckDbLayer = DuckDb.makeNodeLayer(DuckDbConnectionOptions.make({ databasePath }));
  const queried = yield* Effect.scoped(
    Layer.build(duckDbLayer).pipe(Effect.flatMap((context) => duckDbWork.pipe(Effect.provide(context))))
  ).pipe(CorpusCommandError.mapError(`Failed building the DuckDB catalog at "${databasePath}".`));

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
    .writeFileString(
      restorationManifestPath,
      A.length(restorationLines) === 0 ? "" : `${A.join(restorationLines, "\n")}\n`
    )
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

const makeCorpusCommandService = Effect.fn("CorpusCommandService.make")(function* () {
  const runtimeContext = yield* Effect.context<CorpusCommandServiceRequirements>();

  return CorpusCommandService.of({
    catalogCorpus: Effect.fn("CorpusCommandService.catalogCorpus")((options) =>
      catalogCorpusImpl(options).pipe(Effect.provide(runtimeContext))
    ),
  });
});

/**
 * Live service layer for corpus curation operations.
 *
 * @example
 * ```ts
 * import { CorpusCommandServiceLive } from "@beep/repo-cli/commands/Corpus"
 * console.log(CorpusCommandServiceLive)
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
 * import { catalogCorpus } from "@beep/repo-cli/commands/Corpus"
 * console.log(catalogCorpus)
 * ```
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
 * Print the corpus command index.
 *
 * @example
 * ```ts
 * import { printCorpusIndex } from "@beep/repo-cli/commands/Corpus"
 * console.log(printCorpusIndex)
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const printCorpusIndex = printLines([
  "Corpus commands:",
  "- bun run beep corpus catalog --corpus-root /path/to/corpus",
]);
