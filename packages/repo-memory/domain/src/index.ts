import { $RepoMemoryDomainId } from "@beep/identity/packages";
import { FilePath, LiteralKit, NonNegativeInt } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoMemoryDomainId.create("index");

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
 * Canonical run kind for repo-memory workflows.
 *
 * @since 0.0.0
 * @category Status
 */
export const RepoRunKind = LiteralKit(["index", "query"] as const).annotate(
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
 * Canonical run status for repo-memory workflows.
 *
 * @since 0.0.0
 * @category Status
 */
export const RepoRunStatus = LiteralKit([
  "accepted",
  "running",
  "completed",
  "failed",
  "interrupted",
] as const).annotate(
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
export const RunTerminalState = LiteralKit(["completed", "failed", "interrupted"] as const).annotate(
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
    startLine: NonNegativeInt,
    endLine: NonNegativeInt,
    startColumn: S.OptionFromOptionalKey(NonNegativeInt),
    endColumn: S.OptionFromOptionalKey(NonNegativeInt),
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
 * Bounded evidence packet returned alongside a grounded answer.
 *
 * @since 0.0.0
 * @category Models
 */
export class RetrievalPacket extends S.Class<RetrievalPacket>($I`RetrievalPacket`)(
  {
    repoId: RepoId,
    query: S.String,
    retrievedAt: S.DateTimeUtcFromMillis,
    summary: S.String,
    citations: S.Array(Citation),
    notes: S.Array(S.String),
  },
  $I.annote("RetrievalPacket", {
    description: "Bounded answer context returned by the sidecar so grounded answers stay inspectable.",
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
