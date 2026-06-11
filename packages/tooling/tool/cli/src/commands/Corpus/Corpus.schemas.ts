/**
 * Schema models for corpus curation commands.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt, Sha256Hex } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Corpus/Corpus.schemas");

/**
 * One salvaged-file row of the corpus provenance manifest.
 *
 * @example
 * ```ts
 * import { CorpusProvenanceRecord } from "@beep/repo-cli/commands/Corpus"
 * console.log(CorpusProvenanceRecord)
 * ```
 * @category models
 * @since 0.0.0
 */
export class CorpusProvenanceRecord extends S.Class<CorpusProvenanceRecord>($I`CorpusProvenanceRecord`)(
  {
    destPath: S.NonEmptyString,
    mtimeEpoch: S.Int,
    mtimeIso: S.NonEmptyString,
    originPath: S.NonEmptyString,
    relativePath: S.NonEmptyString,
    salvagedAt: S.NonEmptyString,
    sha256: Sha256Hex,
    sizeBytes: NonNegativeInt,
    sourceLabel: S.NonEmptyString,
  },
  $I.annote("CorpusProvenanceRecord", {
    description: "JSONL-safe provenance record written for one verified salvaged corpus file.",
  })
) {}

/**
 * JSONL decoder for {@link CorpusProvenanceRecord}.
 *
 * @example
 * ```ts
 * import { decodeCorpusProvenanceRecordJson } from "@beep/repo-cli/commands/Corpus"
 * import { Effect } from "effect"
 *
 * const line = JSON.stringify({
 *   destPath: "/corpus/raw/source-a/a.txt",
 *   mtimeEpoch: 1718000000,
 *   mtimeIso: "2024-06-10T06:13:20Z",
 *   originPath: "/origin/a.txt",
 *   relativePath: "a.txt",
 *   salvagedAt: "2026-06-11T15:00:00Z",
 *   sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
 *   sizeBytes: 0,
 *   sourceLabel: "source-a"
 * })
 *
 * Effect.runPromise(decodeCorpusProvenanceRecordJson(line)).then((record) => console.log(record.sourceLabel)) // "source-a"
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const decodeCorpusProvenanceRecordJson = S.decodeUnknownEffect(S.fromJsonString(CorpusProvenanceRecord));

/**
 * Recycle-bin metadata format version family.
 *
 * @example
 * ```ts
 * import { RecycleBinFormatVersion } from "@beep/repo-cli/commands/Corpus"
 * console.log(RecycleBinFormatVersion)
 * ```
 * @category schemas
 * @since 0.0.0
 */
export const RecycleBinFormatVersion = LiteralKit(["v1", "v2"]).pipe(
  $I.annoteSchema("RecycleBinFormatVersion", {
    description: "Windows Recycle Bin $I metadata format family: v1 (Vista-8.1 fixed path) or v2 (10+ sized path).",
  })
);

/**
 * Type for {@link RecycleBinFormatVersion}.
 *
 * @category models
 * @since 0.0.0
 */
export type RecycleBinFormatVersion = typeof RecycleBinFormatVersion.Type;

/**
 * Original-file facts recovered from one `$I` recycle-bin metadata file.
 *
 * @example
 * ```ts
 * import { RecycleBinOriginal } from "@beep/repo-cli/commands/Corpus"
 * console.log(RecycleBinOriginal)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RecycleBinOriginal extends S.Class<RecycleBinOriginal>($I`RecycleBinOriginal`)(
  {
    deletedAtFiletime: S.NonEmptyString,
    deletedAtIso: S.NonEmptyString,
    originalName: S.NonEmptyString,
    originalPath: S.NonEmptyString,
    originalSizeBytes: NonNegativeInt,
    version: RecycleBinFormatVersion,
  },
  $I.annote("RecycleBinOriginal", {
    description: "Original path, name, size, and deletion time recovered from a $I recycle-bin metadata file.",
  })
) {}

/**
 * Matched `$I`/`$R` restoration row.
 *
 * @example
 * ```ts
 * import { MatchedRestorationRecord } from "@beep/repo-cli/commands/Corpus"
 * console.log(MatchedRestorationRecord)
 * ```
 * @category models
 * @since 0.0.0
 */
export class MatchedRestorationRecord extends S.Class<MatchedRestorationRecord>($I`MatchedRestorationRecord`)(
  {
    contentRelativePath: S.NonEmptyString,
    matchStatus: S.Literal("matched"),
    metadataRelativePath: S.NonEmptyString,
    original: RecycleBinOriginal,
    pairKey: S.NonEmptyString,
    sourceLabel: S.NonEmptyString,
  },
  $I.annote("MatchedRestorationRecord", {
    description: "A $R content file whose original name and path were restored from its paired $I metadata file.",
  })
) {}

/**
 * Restoration row for a `$I` metadata file with no `$R` content partner.
 *
 * @example
 * ```ts
 * import { UnmatchedMetadataRestorationRecord } from "@beep/repo-cli/commands/Corpus"
 * console.log(UnmatchedMetadataRestorationRecord)
 * ```
 * @category models
 * @since 0.0.0
 */
export class UnmatchedMetadataRestorationRecord extends S.Class<UnmatchedMetadataRestorationRecord>(
  $I`UnmatchedMetadataRestorationRecord`
)(
  {
    matchStatus: S.Literal("unmatched-metadata"),
    metadataRelativePath: S.NonEmptyString,
    original: RecycleBinOriginal,
    pairKey: S.NonEmptyString,
    sourceLabel: S.NonEmptyString,
  },
  $I.annote("UnmatchedMetadataRestorationRecord", {
    description: "A $I metadata file whose paired $R content file is absent from the salvaged corpus.",
  })
) {}

/**
 * Restoration row for a `$R` content file with no `$I` metadata partner.
 *
 * @example
 * ```ts
 * import { UnmatchedContentRestorationRecord } from "@beep/repo-cli/commands/Corpus"
 * console.log(UnmatchedContentRestorationRecord)
 * ```
 * @category models
 * @since 0.0.0
 */
export class UnmatchedContentRestorationRecord extends S.Class<UnmatchedContentRestorationRecord>(
  $I`UnmatchedContentRestorationRecord`
)(
  {
    contentRelativePath: S.NonEmptyString,
    matchStatus: S.Literal("unmatched-content"),
    pairKey: S.NonEmptyString,
    sourceLabel: S.NonEmptyString,
  },
  $I.annote("UnmatchedContentRestorationRecord", {
    description: "A $R content file whose $I metadata file is absent, so its original name stays unknown.",
  })
) {}

/**
 * Restoration manifest row for one recycle-bin artifact.
 *
 * @example
 * ```ts
 * import { CorpusRestorationRecord } from "@beep/repo-cli/commands/Corpus"
 * console.log(CorpusRestorationRecord)
 * ```
 * @category models
 * @since 0.0.0
 */
export const CorpusRestorationRecord = S.Union([
  MatchedRestorationRecord,
  UnmatchedMetadataRestorationRecord,
  UnmatchedContentRestorationRecord,
]).pipe(
  S.toTaggedUnion("matchStatus"),
  $I.annoteSchema("CorpusRestorationRecord", {
    description: "JSONL-safe recycle-bin name-restoration record emitted by corpus catalog.",
  })
);

/**
 * Type for {@link CorpusRestorationRecord}.
 *
 * @category models
 * @since 0.0.0
 */
export type CorpusRestorationRecord = typeof CorpusRestorationRecord.Type;

/**
 * JSONL encoder for {@link CorpusRestorationRecord}.
 *
 * @example
 * ```ts
 * import { encodeCorpusRestorationRecordJson, UnmatchedContentRestorationRecord } from "@beep/repo-cli/commands/Corpus"
 * import { Effect } from "effect"
 *
 * const record = UnmatchedContentRestorationRecord.make({
 *   contentRelativePath: "$R123456.docx",
 *   matchStatus: "unmatched-content",
 *   pairKey: "123456.docx",
 *   sourceLabel: "source-a"
 * })
 *
 * Effect.runPromise(encodeCorpusRestorationRecordJson(record)).then((json) => console.log(json.includes("unmatched-content"))) // true
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const encodeCorpusRestorationRecordJson = S.encodeUnknownEffect(S.fromJsonString(CorpusRestorationRecord));

/**
 * One exact-duplicate digest group reported by the corpus catalog.
 *
 * @example
 * ```ts
 * import { CorpusDuplicateSetRecord } from "@beep/repo-cli/commands/Corpus"
 * console.log(CorpusDuplicateSetRecord)
 * ```
 * @category models
 * @since 0.0.0
 */
export class CorpusDuplicateSetRecord extends S.Class<CorpusDuplicateSetRecord>($I`CorpusDuplicateSetRecord`)(
  {
    copies: NonNegativeInt,
    digest: S.NonEmptyString,
    members: S.NonEmptyString,
    sizeBytes: NonNegativeInt,
  },
  $I.annote("CorpusDuplicateSetRecord", {
    description: "A digest shared by multiple salvaged files, with the member paths joined for reporting.",
  })
) {}

/**
 * JSON encoder for the duplicate-set report array.
 *
 * @example
 * ```ts
 * import { encodeCorpusDuplicateSetReportJson } from "@beep/repo-cli/commands/Corpus"
 * import { Effect } from "effect"
 *
 * const rows = [{
 *   copies: 2,
 *   digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
 *   members: "source-a/a.txt | source-b/a.txt",
 *   sizeBytes: 11
 * }]
 *
 * Effect.runPromise(encodeCorpusDuplicateSetReportJson(rows)).then((json) => console.log(json.includes("source-a/a.txt"))) // true
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const encodeCorpusDuplicateSetReportJson = S.encodeUnknownEffect(
  S.fromJsonString(S.Array(CorpusDuplicateSetRecord))
);

/**
 * Recycle-bin artifact kind derived from the `$I`/`$R` filename prefix.
 *
 * @example
 * ```ts
 * import { RecycleBinEntryKind } from "@beep/repo-cli/commands/Corpus"
 * console.log(RecycleBinEntryKind)
 * ```
 * @category schemas
 * @since 0.0.0
 */
export const RecycleBinEntryKind = LiteralKit(["metadata", "content"]).pipe(
  $I.annoteSchema("RecycleBinEntryKind", {
    description: "Whether a recycle-bin artifact is a $I metadata file or a $R content file.",
  })
);

/**
 * Type for {@link RecycleBinEntryKind}.
 *
 * @category models
 * @since 0.0.0
 */
export type RecycleBinEntryKind = typeof RecycleBinEntryKind.Type;

/**
 * One recycle-bin artifact discovered while scanning salvaged sources.
 *
 * @example
 * ```ts
 * import { RecycleBinScanEntry } from "@beep/repo-cli/commands/Corpus"
 *
 * const entry = RecycleBinScanEntry.make({
 *   kind: "metadata",
 *   pairKey: "0CB4M9.docx",
 *   relativePath: "$I0CB4M9.docx"
 * })
 * console.log(entry.kind) // "metadata"
 * ```
 * @category models
 * @since 0.0.0
 */
export class RecycleBinScanEntry extends S.Class<RecycleBinScanEntry>($I`RecycleBinScanEntry`)(
  {
    kind: RecycleBinEntryKind,
    pairKey: S.NonEmptyString,
    relativePath: S.NonEmptyString,
  },
  $I.annote("RecycleBinScanEntry", {
    description: "A $I or $R artifact observed in a salvaged source, keyed for pairing.",
  })
) {}

/**
 * A `$I`/`$R` pair joined on its shared pair key.
 *
 * @example
 * ```ts
 * import { RecycleBinPairedEntry } from "@beep/repo-cli/commands/Corpus"
 *
 * const pair = RecycleBinPairedEntry.make({
 *   contentRelativePath: "$R0CB4M9.docx",
 *   metadataRelativePath: "$I0CB4M9.docx",
 *   pairKey: "0CB4M9.docx"
 * })
 * console.log(pair.pairKey) // "0CB4M9.docx"
 * ```
 * @category models
 * @since 0.0.0
 */
export class RecycleBinPairedEntry extends S.Class<RecycleBinPairedEntry>($I`RecycleBinPairedEntry`)(
  {
    contentRelativePath: S.NonEmptyString,
    metadataRelativePath: S.NonEmptyString,
    pairKey: S.NonEmptyString,
  },
  $I.annote("RecycleBinPairedEntry", {
    description: "A matched $I metadata and $R content pair sharing one pair key.",
  })
) {}

/**
 * Pairing outcome over a set of recycle-bin scan entries.
 *
 * @example
 * ```ts
 * import { RecycleBinPairing } from "@beep/repo-cli/commands/Corpus"
 *
 * const pairing = RecycleBinPairing.make({
 *   matched: [],
 *   unmatchedContent: [],
 *   unmatchedMetadata: []
 * })
 * console.log(pairing.matched.length) // 0
 * ```
 * @category models
 * @since 0.0.0
 */
export class RecycleBinPairing extends S.Class<RecycleBinPairing>($I`RecycleBinPairing`)(
  {
    matched: S.Array(RecycleBinPairedEntry),
    unmatchedContent: S.Array(RecycleBinScanEntry),
    unmatchedMetadata: S.Array(RecycleBinScanEntry),
  },
  $I.annote("RecycleBinPairing", {
    description: "Matched pairs plus unmatched $I and $R leftovers for one pairing pass.",
  })
) {}

/**
 * Validated options used by `corpus catalog`.
 *
 * @example
 * ```ts
 * import { CorpusCatalogOptions } from "@beep/repo-cli/commands/Corpus"
 *
 * const options = CorpusCatalogOptions.make({ corpusRoot: "/data/corpus" })
 * console.log(options.corpusRoot)
 * ```
 * @category models
 * @since 0.0.0
 */
export class CorpusCatalogOptions extends S.Class<CorpusCatalogOptions>($I`CorpusCatalogOptions`)(
  {
    corpusRoot: S.String,
  },
  $I.annote("CorpusCatalogOptions", {
    description: "Validated options used by corpus catalog.",
  })
) {}

/**
 * Validated options used by `corpus extract`.
 *
 * @example
 * ```ts
 * import { CorpusExtractOptions } from "@beep/repo-cli/commands/Corpus"
 *
 * const options = CorpusExtractOptions.make({
 *   corpusRoot: "/data/corpus",
 *   exportChildren: true,
 *   includeDuplicates: false,
 *   overwrite: false,
 *   tikaJarPath: "/opt/tika/tika-app.jar"
 * })
 * console.log(options.exportChildren) // true
 * ```
 * @category models
 * @since 0.0.0
 */
export class CorpusExtractOptions extends S.Class<CorpusExtractOptions>($I`CorpusExtractOptions`)(
  {
    concurrency: S.optionalKey(S.Finite),
    corpusRoot: S.String,
    exportChildren: S.Boolean,
    includeDuplicates: S.Boolean,
    javaPath: S.optionalKey(S.String),
    maxFiles: S.optionalKey(S.Finite),
    overwrite: S.Boolean,
    pffexportPath: S.optionalKey(S.String),
    sourceLabel: S.optionalKey(S.String),
    tikaJarPath: S.String,
  },
  $I.annote("CorpusExtractOptions", {
    description: "Validated options used by corpus extract.",
  })
) {}

/**
 * Summary counts returned by `corpus extract`.
 *
 * @example
 * ```ts
 * import { CorpusExtractSummary } from "@beep/repo-cli/commands/Corpus"
 * console.log(CorpusExtractSummary)
 * ```
 * @category models
 * @since 0.0.0
 */
export class CorpusExtractSummary extends S.Class<CorpusExtractSummary>($I`CorpusExtractSummary`)(
  {
    childArtifactCount: NonNegativeInt,
    duplicatesSkipped: NonNegativeInt,
    failedCount: NonNegativeInt,
    skippedCount: NonNegativeInt,
    sourceCount: NonNegativeInt,
    succeededCount: NonNegativeInt,
    textArtifactCount: NonNegativeInt,
  },
  $I.annote("CorpusExtractSummary", {
    description: "Summary counts returned by corpus extract.",
  })
) {}

/**
 * JSON encoder for {@link CorpusExtractSummary}.
 *
 * @example
 * ```ts
 * import { CorpusExtractSummary, encodeCorpusExtractSummaryJson } from "@beep/repo-cli/commands/Corpus"
 * import { NonNegativeInt } from "@beep/schema"
 * import { Effect } from "effect"
 *
 * const summary = CorpusExtractSummary.make({
 *   childArtifactCount: NonNegativeInt.make(0),
 *   duplicatesSkipped: NonNegativeInt.make(0),
 *   failedCount: NonNegativeInt.make(0),
 *   skippedCount: NonNegativeInt.make(0),
 *   sourceCount: NonNegativeInt.make(1),
 *   succeededCount: NonNegativeInt.make(1),
 *   textArtifactCount: NonNegativeInt.make(1)
 * })
 *
 * Effect.runPromise(encodeCorpusExtractSummaryJson(summary)).then((json) => console.log(json.includes("\"sourceCount\":1"))) // true
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const encodeCorpusExtractSummaryJson = S.encodeUnknownEffect(S.fromJsonString(CorpusExtractSummary));

/**
 * Validated options used by `corpus salvage`.
 *
 * @example
 * ```ts
 * import { CorpusSalvageOptions } from "@beep/repo-cli/commands/Corpus"
 *
 * const options = CorpusSalvageOptions.make({ corpusRoot: "/data/corpus" })
 * console.log(options.corpusRoot)
 * ```
 * @category models
 * @since 0.0.0
 */
export class CorpusSalvageOptions extends S.Class<CorpusSalvageOptions>($I`CorpusSalvageOptions`)(
  {
    corpusRoot: S.String,
    sampleStride: S.optionalKey(S.Finite),
  },
  $I.annote("CorpusSalvageOptions", {
    description: "Validated options used by corpus salvage verification.",
  })
) {}

/**
 * Summary counts returned by `corpus salvage`.
 *
 * @example
 * ```ts
 * import { CorpusSalvageSummary } from "@beep/repo-cli/commands/Corpus"
 * console.log(CorpusSalvageSummary)
 * ```
 * @category models
 * @since 0.0.0
 */
export class CorpusSalvageSummary extends S.Class<CorpusSalvageSummary>($I`CorpusSalvageSummary`)(
  {
    bytesChecked: NonNegativeInt,
    matched: NonNegativeInt,
    mismatched: NonNegativeInt,
    missing: NonNegativeInt,
    recordsChecked: NonNegativeInt,
  },
  $I.annote("CorpusSalvageSummary", {
    description: "Summary counts returned by corpus salvage verification.",
  })
) {}

/**
 * JSON encoder for {@link CorpusSalvageSummary}.
 *
 * @example
 * ```ts
 * import { CorpusSalvageSummary, encodeCorpusSalvageSummaryJson } from "@beep/repo-cli/commands/Corpus"
 * import { NonNegativeInt } from "@beep/schema"
 * import { Effect } from "effect"
 *
 * const summary = CorpusSalvageSummary.make({
 *   bytesChecked: NonNegativeInt.make(0),
 *   matched: NonNegativeInt.make(0),
 *   mismatched: NonNegativeInt.make(0),
 *   missing: NonNegativeInt.make(0),
 *   recordsChecked: NonNegativeInt.make(0)
 * })
 *
 * Effect.runPromise(encodeCorpusSalvageSummaryJson(summary)).then((json) => console.log(json.includes("\"matched\":0"))) // true
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const encodeCorpusSalvageSummaryJson = S.encodeUnknownEffect(S.fromJsonString(CorpusSalvageSummary));

/**
 * Summary counts returned by `corpus catalog`.
 *
 * @example
 * ```ts
 * import { CorpusCatalogSummary } from "@beep/repo-cli/commands/Corpus"
 * console.log(CorpusCatalogSummary)
 * ```
 * @category models
 * @since 0.0.0
 */
export class CorpusCatalogSummary extends S.Class<CorpusCatalogSummary>($I`CorpusCatalogSummary`)(
  {
    distinctDigests: NonNegativeInt,
    duplicateFiles: NonNegativeInt,
    duplicateSets: NonNegativeInt,
    matchedRestorations: NonNegativeInt,
    redundantBytes: NonNegativeInt,
    sourceFiles: NonNegativeInt,
    totalBytes: NonNegativeInt,
    unmatchedContentFiles: NonNegativeInt,
    unmatchedMetadataFiles: NonNegativeInt,
  },
  $I.annote("CorpusCatalogSummary", {
    description: "Summary counts returned by corpus catalog.",
  })
) {}

/**
 * JSON encoder for {@link CorpusCatalogSummary}.
 *
 * @example
 * ```ts
 * import { CorpusCatalogSummary, encodeCorpusCatalogSummaryJson } from "@beep/repo-cli/commands/Corpus"
 * import { NonNegativeInt } from "@beep/schema"
 * import { Effect } from "effect"
 *
 * const summary = CorpusCatalogSummary.make({
 *   distinctDigests: NonNegativeInt.make(1),
 *   duplicateFiles: NonNegativeInt.make(0),
 *   duplicateSets: NonNegativeInt.make(0),
 *   matchedRestorations: NonNegativeInt.make(0),
 *   redundantBytes: NonNegativeInt.make(0),
 *   sourceFiles: NonNegativeInt.make(1),
 *   totalBytes: NonNegativeInt.make(11),
 *   unmatchedContentFiles: NonNegativeInt.make(0),
 *   unmatchedMetadataFiles: NonNegativeInt.make(0)
 * })
 *
 * Effect.runPromise(encodeCorpusCatalogSummaryJson(summary)).then((json) => console.log(json.includes("\"sourceFiles\":1"))) // true
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const encodeCorpusCatalogSummaryJson = S.encodeUnknownEffect(S.fromJsonString(CorpusCatalogSummary));
