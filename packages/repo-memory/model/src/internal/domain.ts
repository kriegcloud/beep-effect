import { $RepoMemoryModelId } from "@beep/identity/packages";
import { ArrayOfStrings, FilePath, LiteralKit, NonNegativeInt, PosInt, Sha256Hex } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoMemoryModelId.create("internal/domain");

/**
 * Stable identifier for a tracked repository target.
 *
 * @since 0.0.0
 * @category Identity
 */
export const RepoId = S.String.pipe(
  S.brand("RepoId"),
  S.annotate(
    $I.annote("RepoId", {
      description: "Stable identifier for a tracked repository target.",
    })
  )
);

/**
 * @since 0.0.0
 * @category Identity
 */
export type RepoId = typeof RepoId.Type;

/**
 * Stable identifier for an index or query workflow execution.
 *
 * @since 0.0.0
 * @category Identity
 */
export const RunId = S.String.pipe(
  S.brand("RunId"),
  S.annotate(
    $I.annote("RunId", {
      description: "Stable identifier for an index or query workflow execution.",
    })
  )
);

/**
 * @since 0.0.0
 * @category Identity
 */
export type RunId = typeof RunId.Type;

/**
 * Monotonic event sequence for a run journal stream.
 *
 * @since 0.0.0
 * @category Identity
 */
export const RunEventSequence = NonNegativeInt.pipe(
  S.brand("RunEventSequence"),
  S.annotate(
    $I.annote("RunEventSequence", {
      description: "Monotonic event sequence for a run journal stream.",
    })
  )
);

/**
 * @since 0.0.0
 * @category Identity
 */
export type RunEventSequence = typeof RunEventSequence.Type;

/**
 * Replay cursor for reconnecting a streamed run event subscription.
 *
 * @since 0.0.0
 * @category Identity
 */
export const RunCursor = NonNegativeInt.pipe(
  S.brand("RunCursor"),
  S.annotate(
    $I.annote("RunCursor", {
      description: "Replay cursor for reconnecting a streamed run event subscription.",
    })
  )
);

/**
 * @since 0.0.0
 * @category Identity
 */
export type RunCursor = typeof RunCursor.Type;

/**
 * Stable identifier for a persisted repository source snapshot.
 *
 * @since 0.0.0
 * @category Identity
 */
export const SourceSnapshotId = S.String.pipe(
  S.brand("SourceSnapshotId"),
  S.annotate(
    $I.annote("SourceSnapshotId", {
      description: "Stable identifier for a persisted repository source snapshot.",
    })
  )
);

/**
 * @since 0.0.0
 * @category Identity
 */
export type SourceSnapshotId = typeof SourceSnapshotId.Type;

/**
 * Canonical run kind for repo-memory workflows.
 *
 * @since 0.0.0
 * @category Status
 */
export const RepoRunKind = LiteralKit(["index", "query"]).annotate(
  $I.annote("RepoRunKind", {
    description: "Canonical run kind for repo-memory indexing and query workflows.",
  })
);

/**
 * @since 0.0.0
 * @category Status
 */
export type RepoRunKind = typeof RepoRunKind.Type;

/**
 * Canonical run control commands exposed through the execution plane.
 *
 * @since 0.0.0
 * @category Status
 */
export const RunCommand = LiteralKit(["interrupt", "resume"]).annotate(
  $I.annote("RunCommand", {
    description: "Canonical run control commands exposed through the execution plane.",
  })
);

/**
 * @since 0.0.0
 * @category Status
 */
export type RunCommand = typeof RunCommand.Type;

/**
 * Canonical run status for repo-memory workflows.
 *
 * @since 0.0.0
 * @category Status
 */
export const RepoRunStatus = LiteralKit(["accepted", "running", "completed", "failed", "interrupted"]).annotate(
  $I.annote("RepoRunStatus", {
    description: "Canonical run status for repo-memory indexing and query workflows.",
  })
);

/**
 * @since 0.0.0
 * @category Status
 */
export type RepoRunStatus = typeof RepoRunStatus.Type;

/**
 * Terminal run states exposed to the UI.
 *
 * @since 0.0.0
 * @category Status
 */
export const RunTerminalState = LiteralKit(["completed", "failed", "interrupted"]).annotate(
  $I.annote("RunTerminalState", {
    description: "Terminal run states exposed to the UI.",
  })
);

/**
 * @since 0.0.0
 * @category Status
 */
export type RunTerminalState = typeof RunTerminalState.Type;

/**
 * Source span for a grounded citation.
 *
 * @since 0.0.0
 * @category Models
 */
export class CitationSpan extends S.Class<CitationSpan>($I`CitationSpan`)(
  {
    filePath: FilePath,
    startLine: PosInt,
    endLine: PosInt,
    startColumn: S.OptionFromOptionalKey(PosInt),
    endColumn: S.OptionFromOptionalKey(PosInt),
    symbolName: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("CitationSpan", {
    description: "A concrete source span that lets the UI point back to grounded evidence.",
  })
) {}

/**
 * Grounding record attached to an answer.
 *
 * @since 0.0.0
 * @category Models
 */
export class Citation extends S.Class<Citation>($I`Citation`)(
  {
    id: S.String,
    repoId: RepoId,
    label: S.String,
    rationale: S.String,
    span: CitationSpan,
  },
  $I.annote("Citation", {
    description: "Grounding record that ties a natural-language answer back to a file and source span.",
  })
) {}

/**
 * Documented function or method parameter extracted from a JSDoc block.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoDocumentedParameter extends S.Class<RepoDocumentedParameter>($I`RepoDocumentedParameter`)(
  {
    name: S.String,
    type: S.OptionFromOptionalKey(S.String),
    description: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("RepoDocumentedParameter", {
    description: "Normalized parameter documentation extracted from JSDoc.",
  })
) {}

/**
 * Documented return contract extracted from a JSDoc block.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoDocumentedReturn extends S.Class<RepoDocumentedReturn>($I`RepoDocumentedReturn`)(
  {
    type: S.OptionFromOptionalKey(S.String),
    description: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("RepoDocumentedReturn", {
    description: "Normalized return documentation extracted from JSDoc.",
  })
) {}

/**
 * Documented throw contract extracted from a JSDoc block.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoDocumentedThrow extends S.Class<RepoDocumentedThrow>($I`RepoDocumentedThrow`)(
  {
    type: S.OptionFromOptionalKey(S.String),
    description: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("RepoDocumentedThrow", {
    description: "Normalized throw documentation extracted from JSDoc.",
  })
) {}

/**
 * Normalized `@summary` occurrence attached to one symbol.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoJSDocSummaryTag extends S.TaggedClass<RepoJSDocSummaryTag>($I`RepoJSDocSummaryTag`)(
  "summary",
  {
    description: S.String,
  },
  $I.annote("RepoJSDocSummaryTag", {
    description: "Core repo-memory JSDoc summary tag occurrence.",
  })
) {}

/**
 * Normalized `@description` occurrence attached to one symbol.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoJSDocDescriptionTag extends S.TaggedClass<RepoJSDocDescriptionTag>($I`RepoJSDocDescriptionTag`)(
  "description",
  {
    description: S.String,
  },
  $I.annote("RepoJSDocDescriptionTag", {
    description: "Core repo-memory JSDoc description tag occurrence.",
  })
) {}

/**
 * Normalized `@remarks` occurrence attached to one symbol.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoJSDocRemarksTag extends S.TaggedClass<RepoJSDocRemarksTag>($I`RepoJSDocRemarksTag`)(
  "remarks",
  {
    description: S.String,
  },
  $I.annote("RepoJSDocRemarksTag", {
    description: "Core repo-memory JSDoc remarks tag occurrence.",
  })
) {}

/**
 * Normalized `@param` occurrence attached to one symbol.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoJSDocParamTag extends S.TaggedClass<RepoJSDocParamTag>($I`RepoJSDocParamTag`)(
  "param",
  {
    name: S.String,
    type: S.OptionFromOptionalKey(S.String),
    description: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("RepoJSDocParamTag", {
    description: "Core repo-memory JSDoc parameter tag occurrence.",
  })
) {}

/**
 * Normalized `@returns` occurrence attached to one symbol.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoJSDocReturnsTag extends S.TaggedClass<RepoJSDocReturnsTag>($I`RepoJSDocReturnsTag`)(
  "returns",
  {
    type: S.OptionFromOptionalKey(S.String),
    description: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("RepoJSDocReturnsTag", {
    description: "Core repo-memory JSDoc returns tag occurrence.",
  })
) {}

/**
 * Normalized `@throws` occurrence attached to one symbol.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoJSDocThrowsTag extends S.TaggedClass<RepoJSDocThrowsTag>($I`RepoJSDocThrowsTag`)(
  "throws",
  {
    type: S.OptionFromOptionalKey(S.String),
    description: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("RepoJSDocThrowsTag", {
    description: "Core repo-memory JSDoc throws tag occurrence.",
  })
) {}

/**
 * Normalized `@deprecated` occurrence attached to one symbol.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoJSDocDeprecatedTag extends S.TaggedClass<RepoJSDocDeprecatedTag>($I`RepoJSDocDeprecatedTag`)(
  "deprecated",
  {
    description: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("RepoJSDocDeprecatedTag", {
    description: "Core repo-memory JSDoc deprecated tag occurrence.",
  })
) {}

/**
 * Normalized `@see` occurrence attached to one symbol.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoJSDocSeeTag extends S.TaggedClass<RepoJSDocSeeTag>($I`RepoJSDocSeeTag`)(
  "see",
  {
    reference: S.String,
  },
  $I.annote("RepoJSDocSeeTag", {
    description: "Core repo-memory JSDoc see tag occurrence.",
  })
) {}

/**
 * Bounded tagged-union of repo-facing JSDoc semantics preserved in repo-memory.
 *
 * @since 0.0.0
 * @category Models
 */
export const RepoJSDocCoreTag = S.Union([
  RepoJSDocSummaryTag,
  RepoJSDocDescriptionTag,
  RepoJSDocRemarksTag,
  RepoJSDocParamTag,
  RepoJSDocReturnsTag,
  RepoJSDocThrowsTag,
  RepoJSDocDeprecatedTag,
  RepoJSDocSeeTag,
]).pipe(
  S.toTaggedUnion("_tag"),
  S.annotate(
    $I.annote("RepoJSDocCoreTag", {
      description: "Bounded tagged-union of core JSDoc semantics preserved for grounded repo answers.",
    })
  )
);

/**
 * @since 0.0.0
 * @category Models
 */
export type RepoJSDocCoreTag = typeof RepoJSDocCoreTag.Type;

/**
 * Deterministic symbol-level documentation extracted from a JSDoc block.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoSymbolDocumentation extends S.Class<RepoSymbolDocumentation>($I`RepoSymbolDocumentation`)(
  {
    span: CitationSpan,
    description: S.OptionFromOptionalKey(S.String),
    summary: S.OptionFromOptionalKey(S.String),
    remarks: S.OptionFromOptionalKey(S.String),
    isDeprecated: S.Boolean,
    deprecationNote: S.OptionFromOptionalKey(S.String),
    params: S.Array(RepoDocumentedParameter),
    returns: S.OptionFromOptionalKey(RepoDocumentedReturn),
    throws: S.Array(RepoDocumentedThrow),
    see: ArrayOfStrings,
    tags: S.Array(RepoJSDocCoreTag),
  },
  $I.annote("RepoSymbolDocumentation", {
    description: "Bounded symbol-level JSDoc read model used for deterministic grounded retrieval.",
  })
) {}

/**
 * Bounded evidence packet returned alongside a grounded answer.
 *
 * @since 0.0.0
 * @category Models
 */
export class RetrievalPacket extends S.Class<RetrievalPacket>($I`RetrievalPacket`)(
  {
    repoId: RepoId,
    sourceSnapshotId: S.OptionFromOptionalKey(SourceSnapshotId),
    query: S.String,
    retrievedAt: S.DateTimeUtcFromMillis,
    summary: S.String,
    citations: S.Array(Citation),
    notes: ArrayOfStrings,
  },
  $I.annote("RetrievalPacket", {
    description: "Bounded answer context returned by the sidecar so grounded answers stay inspectable.",
  })
) {}

/**
 * Persisted repository source snapshot metadata.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoSourceSnapshot extends S.Class<RepoSourceSnapshot>($I`RepoSourceSnapshot`)(
  {
    id: SourceSnapshotId,
    repoId: RepoId,
    capturedAt: S.DateTimeUtcFromMillis,
    fileCount: NonNegativeInt,
  },
  $I.annote("RepoSourceSnapshot", {
    description: "Persisted repository source snapshot metadata for deterministic retrieval.",
  })
) {}

/**
 * Persisted repository source file metadata.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoSourceFile extends S.Class<RepoSourceFile>($I`RepoSourceFile`)(
  {
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    filePath: FilePath,
    contentHash: Sha256Hex,
    lineCount: NonNegativeInt,
    workspaceName: S.String,
    tsconfigPath: FilePath,
  },
  $I.annote("RepoSourceFile", {
    description: "Persisted repository source file metadata for a deterministic snapshot.",
  })
) {}

/**
 * Canonical TypeScript symbol kinds captured during deterministic indexing.
 *
 * @since 0.0.0
 * @category Models
 */
export const RepoSymbolKind = LiteralKit([
  "function",
  "class",
  "interface",
  "typeAlias",
  "const",
  "enum",
  "namespace",
]).annotate(
  $I.annote("RepoSymbolKind", {
    description: "Canonical TypeScript symbol kinds captured during deterministic indexing.",
  })
);

/**
 * @since 0.0.0
 * @category Models
 */
export type RepoSymbolKind = typeof RepoSymbolKind.Type;

/**
 * Persisted repository symbol metadata.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoSymbolRecord extends S.Class<RepoSymbolRecord>($I`RepoSymbolRecord`)(
  {
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    symbolId: S.String,
    symbolName: S.String,
    qualifiedName: S.String,
    symbolKind: RepoSymbolKind,
    exported: S.Boolean,
    filePath: FilePath,
    startLine: PosInt,
    endLine: PosInt,
    signature: S.String,
    documentation: S.OptionFromOptionalKey(RepoSymbolDocumentation),
    jsDocSummary: S.OptionFromOptionalKey(S.String),
    declarationText: S.String,
    searchText: S.String,
  },
  $I.annote("RepoSymbolRecord", {
    description: "Persisted repository symbol metadata used for deterministic grounded retrieval.",
  })
) {}

/**
 * Persisted import edge metadata for future dependency-aware retrieval.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoImportEdge extends S.Class<RepoImportEdge>($I`RepoImportEdge`)(
  {
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    importerFilePath: FilePath,
    startLine: PosInt,
    endLine: PosInt,
    moduleSpecifier: S.String,
    importedName: S.OptionFromOptionalKey(S.String),
    typeOnly: S.Boolean,
  },
  $I.annote("RepoImportEdge", {
    description: "Persisted import edge metadata for future dependency-aware retrieval.",
  })
) {}

/**
 * Persisted artifact for a completed repository index run.
 *
 * @since 0.0.0
 * @category Models
 */
export class RepoIndexArtifact extends S.Class<RepoIndexArtifact>($I`RepoIndexArtifact`)(
  {
    runId: RunId,
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    indexedFileCount: NonNegativeInt,
    completedAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("RepoIndexArtifact", {
    description: "Deterministic index artifact persisted for a completed repository index run.",
  })
) {}

/**
 * Atomic index-artifact replacement payload for one repository snapshot refresh.
 *
 * @since 0.0.0
 * @category Models
 */
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
 * Deterministic payload used to start an index workflow.
 *
 * @since 0.0.0
 * @category Models
 */
export class IndexRepoRunInput extends S.Class<IndexRepoRunInput>($I`IndexRepoRunInput`)(
  {
    repoId: RepoId,
    sourceFingerprint: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("IndexRepoRunInput", {
    description: "Deterministic payload used to start a repository index workflow.",
  })
) {}

/**
 * Deterministic payload used to start a query workflow.
 *
 * @since 0.0.0
 * @category Models
 */
export class QueryRepoRunInput extends S.Class<QueryRepoRunInput>($I`QueryRepoRunInput`)(
  {
    repoId: RepoId,
    question: S.String,
    questionFingerprint: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("QueryRepoRunInput", {
    description: "Deterministic payload used to start a repository query workflow.",
  })
) {}

/**
 * Summary view for a run projection.
 *
 * @since 0.0.0
 * @category Models
 */
export class RunSummary extends S.Class<RunSummary>($I`RunSummary`)(
  {
    id: RunId,
    repoId: RepoId,
    kind: RepoRunKind,
    status: RepoRunStatus,
    acceptedAt: S.DateTimeUtcFromMillis,
    startedAt: S.OptionFromOptionalKey(S.DateTimeUtcFromMillis),
    completedAt: S.OptionFromOptionalKey(S.DateTimeUtcFromMillis),
    lastEventSequence: RunEventSequence,
  },
  $I.annote("RunSummary", {
    description: "Summary view for a repo-memory run projection.",
  })
) {}

/**
 * Typed public stream failure returned by the execution plane.
 *
 * @since 0.0.0
 * @category Models
 */
export class RunStreamFailure extends S.Class<RunStreamFailure>($I`RunStreamFailure`)(
  {
    message: S.String,
    status: S.Number,
  },
  $I.annote("RunStreamFailure", {
    description: "Typed public failure emitted by the run execution stream boundary.",
  })
) {}
