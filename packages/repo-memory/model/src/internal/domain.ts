import { $RepoMemoryModelId } from "@beep/identity/packages";
import { ArrayOfStrings, FilePath, LiteralKit, NonNegativeInt, PosInt, Sha256Hex } from "@beep/schema";
import { EvidenceAnchor } from "@beep/semantic-web/evidence";
import { ProvBundle } from "@beep/semantic-web/prov";
import { Dataset } from "@beep/semantic-web/rdf";
import * as S from "effect/Schema";

const $I = $RepoMemoryModelId.create("internal/domain");

/**
 * Stable identifier for a tracked repository target.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
 */
export type RepoId = typeof RepoId.Type;

/**
 * Stable identifier for an index or query workflow execution.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
 */
export type RunId = typeof RunId.Type;

/**
 * Monotonic event sequence for a run journal stream.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
 */
export type RunEventSequence = typeof RunEventSequence.Type;

/**
 * Replay cursor for reconnecting a streamed run event subscription.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
 */
export type RunCursor = typeof RunCursor.Type;

/**
 * Stable identifier for a persisted repository source snapshot.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
 */
export type SourceSnapshotId = typeof SourceSnapshotId.Type;

/**
 * Canonical run kind for repo-memory workflows.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RepoRunKind = LiteralKit(["index", "query"]).annotate(
  $I.annote("RepoRunKind", {
    description: "Canonical run kind for repo-memory indexing and query workflows.",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RepoRunKind = typeof RepoRunKind.Type;

/**
 * Canonical run control commands exposed through the execution plane.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RunCommand = LiteralKit(["interrupt", "resume"]).annotate(
  $I.annote("RunCommand", {
    description: "Canonical run control commands exposed through the execution plane.",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RunCommand = typeof RunCommand.Type;

/**
 * Canonical run status for repo-memory workflows.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RepoRunStatus = LiteralKit(["accepted", "running", "completed", "failed", "interrupted"]).annotate(
  $I.annote("RepoRunStatus", {
    description: "Canonical run status for repo-memory indexing and query workflows.",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RepoRunStatus = typeof RepoRunStatus.Type;

/**
 * Terminal run states exposed to the UI.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RunTerminalState = LiteralKit(["completed", "failed", "interrupted"]).annotate(
  $I.annote("RunTerminalState", {
    description: "Terminal run states exposed to the UI.",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RunTerminalState = typeof RunTerminalState.Type;

/**
 * Source span for a grounded citation.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
 */
export type RepoJSDocCoreTag = typeof RepoJSDocCoreTag.Type;

/**
 * Deterministic symbol-level documentation extracted from a JSDoc block.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * Canonical deterministic query kinds supported by repo-memory grounded retrieval.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RetrievalQueryKind = LiteralKit([
  "countFiles",
  "countSymbols",
  "locateSymbol",
  "describeSymbol",
  "symbolParams",
  "symbolReturns",
  "symbolThrows",
  "symbolDeprecation",
  "listFileExports",
  "listFileImports",
  "listFileImporters",
  "listSymbolImporters",
  "listFileDependencies",
  "listFileDependents",
  "keywordSearch",
  "unsupported",
]).annotate(
  $I.annote("RetrievalQueryKind", {
    description: "Canonical deterministic query kinds supported by repo-memory grounded retrieval.",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RetrievalQueryKind = typeof RetrievalQueryKind.Type;

/**
 * Packet-level retrieval outcome for one grounded query run.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RetrievalOutcome = LiteralKit(["resolved", "none", "ambiguous", "unsupported"]).annotate(
  $I.annote("RetrievalOutcome", {
    description: "Packet-level retrieval outcome for one grounded query run.",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RetrievalOutcome = typeof RetrievalOutcome.Type;

/**
 * Match posture recorded for ambiguous or relaxed packet candidates.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RetrievalMatchKind = LiteralKit(["exact", "normalized", "fuzzy"]).annotate(
  $I.annote("RetrievalMatchKind", {
    description: "Match posture recorded for ambiguous or relaxed packet candidates.",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RetrievalMatchKind = typeof RetrievalMatchKind.Type;

/**
 * Query target requested before grounding resolves it to a concrete subject.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalFileRequestedTarget extends S.Class<RetrievalFileRequestedTarget>(
  $I`RetrievalFileRequestedTarget`
)(
  {
    kind: S.tag("file-query"),
    value: S.String,
  },
  $I.annote("RetrievalFileRequestedTarget", {
    description: "Requested file-oriented query target before grounding resolves it to one concrete file.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalSymbolRequestedTarget extends S.Class<RetrievalSymbolRequestedTarget>(
  $I`RetrievalSymbolRequestedTarget`
)(
  {
    kind: S.tag("symbol-query"),
    value: S.String,
  },
  $I.annote("RetrievalSymbolRequestedTarget", {
    description: "Requested symbol-oriented query target before grounding resolves it to one concrete symbol.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalModuleRequestedTarget extends S.Class<RetrievalModuleRequestedTarget>(
  $I`RetrievalModuleRequestedTarget`
)(
  {
    kind: S.tag("module-query"),
    value: S.String,
  },
  $I.annote("RetrievalModuleRequestedTarget", {
    description:
      "Requested module-oriented query target before grounding resolves it to one module or file-like specifier.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalKeywordRequestedTarget extends S.Class<RetrievalKeywordRequestedTarget>(
  $I`RetrievalKeywordRequestedTarget`
)(
  {
    kind: S.tag("keyword-query"),
    value: S.String,
  },
  $I.annote("RetrievalKeywordRequestedTarget", {
    description: "Requested keyword-search target before retrieval resolves it to matching grounded items.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalQuestionRequestedTarget extends S.Class<RetrievalQuestionRequestedTarget>(
  $I`RetrievalQuestionRequestedTarget`
)(
  {
    kind: S.tag("question"),
    value: S.String,
  },
  $I.annote("RetrievalQuestionRequestedTarget", {
    description: "Original question string preserved for unsupported deterministic query shapes.",
  })
) {}

/**
 * Requested retrieval target preserved before grounding resolves it to a concrete subject.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RetrievalRequestedTarget = S.Union([
  RetrievalFileRequestedTarget,
  RetrievalSymbolRequestedTarget,
  RetrievalModuleRequestedTarget,
  RetrievalKeywordRequestedTarget,
  RetrievalQuestionRequestedTarget,
]).pipe(
  S.toTaggedUnion("kind"),
  S.annotate(
    $I.annote("RetrievalRequestedTarget", {
      description: "Requested retrieval target preserved before grounding resolves it to a concrete subject.",
    })
  )
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RetrievalRequestedTarget = typeof RetrievalRequestedTarget.Type;

/**
 * Grounded file subject carried by a retrieval packet.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalFileSubject extends S.Class<RetrievalFileSubject>($I`RetrievalFileSubject`)(
  {
    kind: S.tag("file"),
    label: S.String,
    filePath: FilePath,
    citationIds: ArrayOfStrings,
  },
  $I.annote("RetrievalFileSubject", {
    description: "Grounded file subject carried by a retrieval packet.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalSymbolSubject extends S.Class<RetrievalSymbolSubject>($I`RetrievalSymbolSubject`)(
  {
    kind: S.tag("symbol"),
    label: S.String,
    symbolId: S.String,
    symbolName: S.String,
    qualifiedName: S.String,
    symbolKind: S.suspend(() => RepoSymbolKind),
    filePath: FilePath,
    citationIds: ArrayOfStrings,
  },
  $I.annote("RetrievalSymbolSubject", {
    description: "Grounded symbol subject carried by a retrieval packet.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalModuleSubject extends S.Class<RetrievalModuleSubject>($I`RetrievalModuleSubject`)(
  {
    kind: S.tag("module"),
    label: S.String,
    moduleSpecifier: S.String,
    citationIds: ArrayOfStrings,
  },
  $I.annote("RetrievalModuleSubject", {
    description: "Grounded module subject carried by a retrieval packet.",
  })
) {}

/**
 * Grounded subject carried by a retrieval packet.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RetrievalSubject = S.Union([RetrievalFileSubject, RetrievalSymbolSubject, RetrievalModuleSubject]).pipe(
  S.toTaggedUnion("kind"),
  S.annotate(
    $I.annote("RetrievalSubject", {
      description: "Grounded subject carried by a retrieval packet.",
    })
  )
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RetrievalSubject = typeof RetrievalSubject.Type;

/**
 * Candidate subject surfaced when retrieval cannot safely resolve to one grounded subject.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalCandidate extends S.Class<RetrievalCandidate>($I`RetrievalCandidate`)(
  {
    subject: RetrievalSubject,
    matchKind: RetrievalMatchKind,
    note: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("RetrievalCandidate", {
    description: "Candidate subject surfaced when retrieval cannot safely resolve to one grounded subject.",
  })
) {}

/**
 * Parameter item carried inside retrieval facets and payloads.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalParameterItem extends S.Class<RetrievalParameterItem>($I`RetrievalParameterItem`)(
  {
    kind: S.tag("parameter"),
    name: S.String,
    type: S.OptionFromOptionalKey(S.String),
    description: S.OptionFromOptionalKey(S.String),
    citationIds: ArrayOfStrings,
  },
  $I.annote("RetrievalParameterItem", {
    description: "Parameter item carried inside retrieval facets and payloads.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalReturnItem extends S.Class<RetrievalReturnItem>($I`RetrievalReturnItem`)(
  {
    kind: S.tag("return"),
    type: S.OptionFromOptionalKey(S.String),
    description: S.OptionFromOptionalKey(S.String),
    citationIds: ArrayOfStrings,
  },
  $I.annote("RetrievalReturnItem", {
    description: "Return item carried inside retrieval facets and payloads.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalThrowItem extends S.Class<RetrievalThrowItem>($I`RetrievalThrowItem`)(
  {
    kind: S.tag("throw"),
    type: S.OptionFromOptionalKey(S.String),
    description: S.OptionFromOptionalKey(S.String),
    citationIds: ArrayOfStrings,
  },
  $I.annote("RetrievalThrowItem", {
    description: "Throw item carried inside retrieval facets and payloads.",
  })
) {}

/**
 * Display-ready retrieval item shown inside packet payloads.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RetrievalItem = S.Union([
  RetrievalFileSubject,
  RetrievalSymbolSubject,
  RetrievalModuleSubject,
  RetrievalParameterItem,
  RetrievalReturnItem,
  RetrievalThrowItem,
]).pipe(
  S.toTaggedUnion("kind"),
  S.annotate(
    $I.annote("RetrievalItem", {
      description: "Display-ready retrieval item shown inside packet payloads.",
    })
  )
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RetrievalItem = typeof RetrievalItem.Type;

/**
 * Subject detail aspect requested by a deterministic subject-detail query.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RetrievalSubjectDetailAspect = LiteralKit([
  "location",
  "description",
  "params",
  "returns",
  "throws",
  "deprecation",
]).annotate(
  $I.annote("RetrievalSubjectDetailAspect", {
    description: "Subject detail aspect requested by a deterministic subject-detail query.",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RetrievalSubjectDetailAspect = typeof RetrievalSubjectDetailAspect.Type;

/**
 * Location facet attached to one grounded subject.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalLocationFacet extends S.Class<RetrievalLocationFacet>($I`RetrievalLocationFacet`)(
  {
    kind: S.tag("location"),
    filePath: FilePath,
    startLine: PosInt,
    endLine: PosInt,
    citationIds: ArrayOfStrings,
  },
  $I.annote("RetrievalLocationFacet", {
    description: "Location facet attached to one grounded subject.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalDeclarationFacet extends S.Class<RetrievalDeclarationFacet>($I`RetrievalDeclarationFacet`)(
  {
    kind: S.tag("declaration"),
    signature: S.String,
    exported: S.OptionFromOptionalKey(S.Boolean),
    citationIds: ArrayOfStrings,
  },
  $I.annote("RetrievalDeclarationFacet", {
    description: "Declaration facet attached to one grounded subject.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalDocumentationFacet extends S.Class<RetrievalDocumentationFacet>($I`RetrievalDocumentationFacet`)(
  {
    kind: S.tag("documentation"),
    summary: S.OptionFromOptionalKey(S.String),
    description: S.OptionFromOptionalKey(S.String),
    remarks: S.OptionFromOptionalKey(S.String),
    citationIds: ArrayOfStrings,
  },
  $I.annote("RetrievalDocumentationFacet", {
    description: "Documentation facet attached to one grounded subject.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalParametersFacet extends S.Class<RetrievalParametersFacet>($I`RetrievalParametersFacet`)(
  {
    kind: S.tag("parameters"),
    items: S.Array(RetrievalParameterItem),
  },
  $I.annote("RetrievalParametersFacet", {
    description: "Parameter facet attached to one grounded subject.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalReturnsFacet extends S.Class<RetrievalReturnsFacet>($I`RetrievalReturnsFacet`)(
  {
    kind: S.tag("returns"),
    item: S.OptionFromOptionalKey(RetrievalReturnItem),
  },
  $I.annote("RetrievalReturnsFacet", {
    description: "Return facet attached to one grounded subject.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalThrowsFacet extends S.Class<RetrievalThrowsFacet>($I`RetrievalThrowsFacet`)(
  {
    kind: S.tag("throws"),
    items: S.Array(RetrievalThrowItem),
  },
  $I.annote("RetrievalThrowsFacet", {
    description: "Throws facet attached to one grounded subject.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalDeprecationFacet extends S.Class<RetrievalDeprecationFacet>($I`RetrievalDeprecationFacet`)(
  {
    kind: S.tag("deprecation"),
    isDeprecated: S.Boolean,
    note: S.OptionFromOptionalKey(S.String),
    citationIds: ArrayOfStrings,
  },
  $I.annote("RetrievalDeprecationFacet", {
    description: "Deprecation facet attached to one grounded subject.",
  })
) {}

/**
 * Grounded subject facet carried by a retrieval packet.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RetrievalFacet = S.Union([
  RetrievalLocationFacet,
  RetrievalDeclarationFacet,
  RetrievalDocumentationFacet,
  RetrievalParametersFacet,
  RetrievalReturnsFacet,
  RetrievalThrowsFacet,
  RetrievalDeprecationFacet,
]).pipe(
  S.toTaggedUnion("kind"),
  S.annotate(
    $I.annote("RetrievalFacet", {
      description: "Grounded subject facet carried by a retrieval packet.",
    })
  )
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RetrievalFacet = typeof RetrievalFacet.Type;

/**
 * Relation family carried by relation-list retrieval payloads.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RetrievalRelation = LiteralKit([
  "exports",
  "imports",
  "imported-by",
  "depends-on",
  "depended-on-by",
]).annotate(
  $I.annote("RetrievalRelation", {
    description: "Relation family carried by relation-list retrieval payloads.",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RetrievalRelation = typeof RetrievalRelation.Type;

/**
 * Count target family carried by count retrieval payloads.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RetrievalCountTarget = LiteralKit(["files", "symbols"]).annotate(
  $I.annote("RetrievalCountTarget", {
    description: "Count target family carried by count retrieval payloads.",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RetrievalCountTarget = typeof RetrievalCountTarget.Type;

/**
 * Resolved count payload carried by a retrieval packet.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalCountPayload extends S.Class<RetrievalCountPayload>($I`RetrievalCountPayload`)(
  {
    family: S.tag("count"),
    target: RetrievalCountTarget,
    count: NonNegativeInt,
  },
  $I.annote("RetrievalCountPayload", {
    description: "Resolved count payload carried by a retrieval packet.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalSubjectDetailPayload extends S.Class<RetrievalSubjectDetailPayload>(
  $I`RetrievalSubjectDetailPayload`
)(
  {
    family: S.tag("subject-detail"),
    aspect: RetrievalSubjectDetailAspect,
    subject: RetrievalSubject,
    facets: S.Array(RetrievalFacet),
  },
  $I.annote("RetrievalSubjectDetailPayload", {
    description: "Resolved subject-detail payload carried by a retrieval packet.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalRelationListPayload extends S.Class<RetrievalRelationListPayload>(
  $I`RetrievalRelationListPayload`
)(
  {
    family: S.tag("relation-list"),
    relation: RetrievalRelation,
    subject: RetrievalSubject,
    items: S.Array(RetrievalItem),
  },
  $I.annote("RetrievalRelationListPayload", {
    description: "Resolved relation-list payload carried by a retrieval packet.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalSearchResultsPayload extends S.Class<RetrievalSearchResultsPayload>(
  $I`RetrievalSearchResultsPayload`
)(
  {
    family: S.tag("search-results"),
    query: S.String,
    items: S.Array(RetrievalItem),
  },
  $I.annote("RetrievalSearchResultsPayload", {
    description: "Resolved search-results payload carried by a retrieval packet.",
  })
) {}

/**
 * Resolved payload carried by a retrieval packet.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RetrievalPayload = S.Union([
  RetrievalCountPayload,
  RetrievalSubjectDetailPayload,
  RetrievalRelationListPayload,
  RetrievalSearchResultsPayload,
]).pipe(
  S.toTaggedUnion("family"),
  S.annotate(
    $I.annote("RetrievalPayload", {
      description: "Resolved payload carried by a retrieval packet.",
    })
  )
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RetrievalPayload = typeof RetrievalPayload.Type;

/**
 * No-match issue carried by a retrieval packet when no grounded subject or item can be resolved.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalNoMatchIssue extends S.Class<RetrievalNoMatchIssue>($I`RetrievalNoMatchIssue`)(
  {
    kind: S.tag("no-match"),
    requested: RetrievalRequestedTarget,
    note: S.String,
  },
  $I.annote("RetrievalNoMatchIssue", {
    description: "No-match issue carried by a retrieval packet when no grounded subject or item can be resolved.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalAmbiguousIssue extends S.Class<RetrievalAmbiguousIssue>($I`RetrievalAmbiguousIssue`)(
  {
    kind: S.tag("ambiguous"),
    requested: RetrievalRequestedTarget,
    candidates: S.Array(RetrievalCandidate),
  },
  $I.annote("RetrievalAmbiguousIssue", {
    description:
      "Ambiguous issue carried by a retrieval packet when retrieval finds multiple viable grounded candidates.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalUnsupportedIssue extends S.Class<RetrievalUnsupportedIssue>($I`RetrievalUnsupportedIssue`)(
  {
    kind: S.tag("unsupported"),
    requested: RetrievalRequestedTarget,
    reason: S.String,
  },
  $I.annote("RetrievalUnsupportedIssue", {
    description:
      "Unsupported issue carried by a retrieval packet when the question does not match a supported deterministic query shape.",
  })
) {}

/**
 * Non-resolved issue carried by a retrieval packet.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RetrievalIssue = S.Union([RetrievalNoMatchIssue, RetrievalAmbiguousIssue, RetrievalUnsupportedIssue]).pipe(
  S.toTaggedUnion("kind"),
  S.annotate(
    $I.annote("RetrievalIssue", {
      description: "Non-resolved issue carried by a retrieval packet.",
    })
  )
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RetrievalIssue = typeof RetrievalIssue.Type;

/**
 * Bounded evidence packet returned alongside a grounded answer.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalPacket extends S.Class<RetrievalPacket>($I`RetrievalPacket`)(
  {
    repoId: RepoId,
    sourceSnapshotId: S.OptionFromOptionalKey(SourceSnapshotId),
    query: S.String,
    normalizedQuery: S.String,
    queryKind: RetrievalQueryKind,
    retrievedAt: S.DateTimeUtcFromMillis,
    outcome: RetrievalOutcome,
    summary: S.String,
    citations: S.Array(Citation),
    notes: ArrayOfStrings,
    issue: S.OptionFromOptionalKey(RetrievalIssue),
    payload: S.OptionFromOptionalKey(RetrievalPayload),
  },
  $I.annote("RetrievalPacket", {
    description:
      "Bounded answer context returned by the sidecar so grounded answers stay inspectable and derivable from packet state alone.",
  })
) {}

/**
 * Persisted repository source snapshot metadata.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
 */
export type RepoSymbolKind = typeof RepoSymbolKind.Type;

/**
 * Persisted repository symbol metadata.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
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
    resolvedTargetFilePath: S.OptionFromOptionalKey(FilePath),
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
 * @category DomainModel
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
 * Snapshot-scoped semantic artifacts derived from deterministic repo indexing.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RepoSemanticArtifacts extends S.Class<RepoSemanticArtifacts>($I`RepoSemanticArtifacts`)(
  {
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    dataset: Dataset,
    provenance: ProvBundle,
    evidenceAnchors: S.Array(EvidenceAnchor),
  },
  $I.annote("RepoSemanticArtifacts", {
    description: "Snapshot-scoped semantic artifacts derived from deterministic repo indexing.",
  })
) {}

/**
 * Atomic index-artifact replacement payload for one repository snapshot refresh.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
 */
export class QueryRepoRunInput extends S.Class<QueryRepoRunInput>($I`QueryRepoRunInput`)(
  {
    repoId: RepoId,
    question: S.NonEmptyString.check(
      S.isMaxLength(2000, {
        identifier: $I`QueryRepoRunInputQuestionMaxLengthCheck`,
        title: "Query Question Max Length",
        description: "Query question must not exceed 2000 characters.",
        message: "Query question must not exceed 2000 characters",
      })
    ),
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
 * @category DomainModel
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
 * @category DomainModel
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
