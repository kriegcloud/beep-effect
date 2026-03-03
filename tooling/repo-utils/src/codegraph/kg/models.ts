// cspell:ignore codegraph
import { $RepoUtilsId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoUtilsId.create("codegraph/kg/models");

/**
 * Current KG schema version.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const KgSchemaVersion = "kg-schema-v1" as const;

/**
 * Canonical envelope tag written into AST KG publish payloads.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const AstKgEnvelopeVersion = "AstKgEpisodeV1" as const;

/**
 * Default AST KG memory group.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const AstKgGroupId = "beep-ast-kg" as const;

/**
 * KG schema-version literal.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const KgSchemaVersionTag = S.Literal(KgSchemaVersion).annotate(
  $I.annote("KgSchemaVersionTag", {
    description: "Canonical schema version tag for AST KG artifacts.",
  })
);

/**
 * Selector for full-rebuild versus changed-files KG indexing.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const IndexMode = LiteralKit(["full", "delta"]).annotate(
  $I.annote("IndexMode", {
    description: "Indexing mode for AST KG extraction.",
  })
);

/**
 * Index mode runtime type.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export type IndexMode = typeof IndexMode.Type;

/**
 * Edge provenance.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const Provenance = LiteralKit(["ast", "type", "JSDoc"]).annotate(
  $I.annote("Provenance", {
    description: "Source provenance for graph relationships.",
  })
);

/**
 * Edge provenance runtime type.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export type Provenance = typeof Provenance.Type;

/**
 * Enumerates the declaration kinds emitted as KG nodes.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const KgNodeKind = LiteralKit([
  "module",
  "function",
  "class",
  "interface",
  "typeAlias",
  "variable",
  "enum",
  "literal",
]).annotate(
  $I.annote("KgNodeKind", {
    description: "Node kinds emitted by the AST KG extractor.",
  })
);

/**
 * KG node kind runtime type.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export type KgNodeKind = typeof KgNodeKind.Type;

/**
 * Chooses whether publish writes go to Falkor, Graphiti, or both sinks.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const PublishTarget = LiteralKit(["falkor", "graphiti", "both"]).annotate(
  $I.annote("PublishTarget", {
    description: "Configured sink target for KG publish operations.",
  })
);

/**
 * Publish target runtime type.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export type PublishTarget = typeof PublishTarget.Type;

/**
 * Identifies an individual sink when emitting per-sink write receipts.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const SinkTarget = LiteralKit(["falkor", "graphiti"]).annotate(
  $I.annote("SinkTarget", {
    description: "A concrete persistence sink for KG publish operations.",
  })
);

/**
 * Sink target runtime type.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export type SinkTarget = typeof SinkTarget.Type;

/**
 * Configures strictness profile used during Falkor parity validation.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const ParityProfile = LiteralKit(["code-graph-functional", "code-graph-strict"]).annotate(
  $I.annote("ParityProfile", {
    description: "Parity profile for Falkor query behavior checks.",
  })
);

/**
 * Parity profile runtime type.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export type ParityProfile = typeof ParityProfile.Type;

/**
 * KG node payload.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export class KgNode extends S.Class<KgNode>($I`KgNode`)(
  {
    schemaVersion: KgSchemaVersionTag,
    nodeId: S.String,
    kind: KgNodeKind,
    symbol: S.String,
    file: S.String,
    signatureCanonical: S.String,
  },
  $I.annote("KgNode", {
    description: "Node emitted by AST KG extraction for a file snapshot.",
  })
) {}

/**
 * KG edge payload.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export class KgEdge extends S.Class<KgEdge>($I`KgEdge`)(
  {
    schemaVersion: KgSchemaVersionTag,
    edgeId: S.String,
    from: S.String,
    to: S.String,
    type: S.String,
    provenance: Provenance,
    confidence: S.Number,
  },
  $I.annote("KgEdge", {
    description: "Relationship emitted by AST KG extraction for a file snapshot.",
  })
) {}

/**
 * Aggregated node and edge counts computed for one extracted artifact.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export class ArtifactStats extends S.Class<ArtifactStats>($I`ArtifactStats`)(
  {
    nodeCount: NonNegativeInt,
    edgeCount: NonNegativeInt,
    semanticEdgeCount: NonNegativeInt,
  },
  $I.annote("ArtifactStats", {
    description: "Node and edge cardinalities for one extracted file artifact.",
  })
) {}

/**
 * File artifact payload.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export class FileArtifact extends S.Class<FileArtifact>($I`FileArtifact`)(
  {
    schemaVersion: KgSchemaVersionTag,
    workspace: S.String,
    file: S.String,
    commitSha: S.String,
    nodes: S.Array(KgNode),
    edges: S.Array(KgEdge),
    stats: ArtifactStats,
    artifactHash: S.String,
  },
  $I.annote("FileArtifact", {
    description: "Normalized per-file KG artifact with deterministic content hash.",
  })
) {}

/**
 * Snapshot record payload.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export class SnapshotRecord extends S.Class<SnapshotRecord>($I`SnapshotRecord`)(
  {
    schemaVersion: KgSchemaVersionTag,
    workspace: S.String,
    commitSha: S.String,
    file: S.String,
    artifactHash: S.String,
    nodeCount: NonNegativeInt,
    edgeCount: NonNegativeInt,
    semanticEdgeCount: NonNegativeInt,
  },
  $I.annote("SnapshotRecord", {
    description: "Compact persisted file-level state for incremental KG indexing.",
  })
) {}

/**
 * Snapshot manifest entry payload.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export class SnapshotManifestEntry extends S.Class<SnapshotManifestEntry>($I`SnapshotManifestEntry`)(
  {
    commitSha: S.String,
    mode: IndexMode,
    createdAtEpochMs: NonNegativeInt,
    schemaVersion: KgSchemaVersionTag,
    extractorVersion: S.String,
    tsconfigHash: S.String,
    scopeHash: S.String,
    recordHash: S.String,
    records: NonNegativeInt,
  },
  $I.annote("SnapshotManifestEntry", {
    description: "Metadata describing one completed KG index snapshot.",
  })
) {}

/**
 * Snapshot manifest payload.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export class SnapshotManifest extends S.Class<SnapshotManifest>($I`SnapshotManifest`)(
  {
    schemaVersion: KgSchemaVersionTag,
    extractorVersion: S.String,
    snapshots: S.Array(SnapshotManifestEntry),
    consecutiveDeltaFailures: NonNegativeInt,
  },
  $I.annote("SnapshotManifest", {
    description: "Top-level snapshot manifest for full and delta KG indexing runs.",
  })
) {}

/**
 * Graphiti dedupe ledger payload.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export class GraphitiLedger extends S.Class<GraphitiLedger>($I`GraphitiLedger`)(
  {
    schemaVersion: KgSchemaVersionTag,
    episodes: S.Record(S.String, S.String),
  },
  $I.annote("GraphitiLedger", {
    description: "Episode UUID -> artifact hash map used for deterministic deduplication.",
  })
) {}

/**
 * Index summary payload.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export class IndexSummary extends S.Class<IndexSummary>($I`IndexSummary`)(
  {
    mode: IndexMode,
    effectiveMode: IndexMode,
    commitSha: S.String,
    changedCount: NonNegativeInt,
    selectedCount: NonNegativeInt,
    fullScopeCount: NonNegativeInt,
    writes: NonNegativeInt,
    replayHits: NonNegativeInt,
    spoolWrites: NonNegativeInt,
    packetNoThrow: S.Boolean,
  },
  $I.annote("IndexSummary", {
    description: "Summary emitted by one KG index execution.",
  })
) {}

/**
 * Node envelope payload for publish sinks.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export class AstKgNodeV2 extends S.Class<AstKgNodeV2>($I`AstKgNodeV2`)(
  {
    nodeId: S.String,
    kind: KgNodeKind,
    symbol: S.String,
    file: S.String,
    commitSha: S.String,
    workspace: S.String,
  },
  $I.annote("AstKgNodeV2", {
    description: "Node payload written to external publish sinks.",
  })
) {}

/**
 * Edge envelope payload for publish sinks.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export class AstKgEdgeV2 extends S.Class<AstKgEdgeV2>($I`AstKgEdgeV2`)(
  {
    edgeId: S.String,
    from: S.String,
    to: S.String,
    type: S.String,
    provenance: Provenance,
    commitSha: S.String,
  },
  $I.annote("AstKgEdgeV2", {
    description: "Edge payload written to external publish sinks.",
  })
) {}

/**
 * Sink write receipt payload.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export class AstKgWriteReceiptV1 extends S.Class<AstKgWriteReceiptV1>($I`AstKgWriteReceiptV1`)(
  {
    target: S.Union([PublishTarget, SinkTarget]),
    attempted: NonNegativeInt,
    written: NonNegativeInt,
    replayed: NonNegativeInt,
    failed: NonNegativeInt,
    durationMs: NonNegativeInt,
    dedupeHits: NonNegativeInt,
    dedupeMisses: NonNegativeInt,
  },
  $I.annote("AstKgWriteReceiptV1", {
    description: "Per-sink write summary for a publish or replay operation.",
  })
) {}

/**
 * Publish summary payload.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export class PublishSummary extends S.Class<PublishSummary>($I`PublishSummary`)(
  {
    mode: IndexMode,
    commitSha: S.String,
    group: S.String,
    target: PublishTarget,
    envelopes: NonNegativeInt,
    receipts: S.Array(AstKgWriteReceiptV1),
  },
  $I.annote("PublishSummary", {
    description: "Top-level publish or replay command summary.",
  })
) {}

/**
 * Sink publish ledger payload.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export class SinkPublishLedger extends S.Class<SinkPublishLedger>($I`SinkPublishLedger`)(
  {
    schemaVersion: KgSchemaVersionTag,
    sinks: S.Record(S.String, S.String),
  },
  $I.annote("SinkPublishLedger", {
    description: "Deterministic sink dedupe ledger keyed by sink + group + file identity.",
  })
) {}

/**
 * Envelope metadata extracted from a published envelope.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export class EnvelopeMetadata extends S.Class<EnvelopeMetadata>($I`EnvelopeMetadata`)(
  {
    file: S.String,
    workspace: S.String,
    groupId: S.String,
    commitSha: S.String,
    parentSha: S.String,
    branch: S.String,
    artifactHash: S.String,
    nodes: S.Array(AstKgNodeV2),
    edges: S.Array(AstKgEdgeV2),
  },
  $I.annote("EnvelopeMetadata", {
    description: "Canonical envelope metadata used for sink publishing and dedupe keys.",
  })
) {}

/**
 * Decoder for arbitrary unknown values to `SnapshotRecord`.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const decodeSnapshotRecord = S.decodeUnknownEffect(SnapshotRecord);

/**
 * Decoder for arbitrary unknown values to `SnapshotManifest`.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const decodeSnapshotManifest = S.decodeUnknownEffect(SnapshotManifest);

/**
 * Decoder for arbitrary unknown values to `GraphitiLedger`.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const decodeGraphitiLedger = S.decodeUnknownEffect(GraphitiLedger);

/**
 * Decoder for arbitrary unknown values to `SinkPublishLedger`.
 *
 * @category Uncategorized
 * @since 0.0.0
 */
export const decodeSinkPublishLedger = S.decodeUnknownEffect(SinkPublishLedger);
