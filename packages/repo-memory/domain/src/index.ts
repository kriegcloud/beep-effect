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
 * Stable identifier for an index or query run.
 *
 * @since 0.0.0
 * @category Identity
 */
export const RunId = S.String.pipe(
  S.brand("RunId"),
  S.annotate(
    $I.annote("RunId", {
      description: "Stable identifier for an index or query run.",
    })
  )
);

/**
 * @since 0.0.0
 * @category Identity
 */
export type RunId = typeof RunId.Type;

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
export const RepoRunStatus = LiteralKit(["queued", "running", "completed", "failed"] as const).annotate(
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
    description: "A concrete source span that lets the UI point back to the grounded evidence.",
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
    retrievedAt: S.Number,
    summary: S.String,
    citations: S.Array(Citation),
    notes: S.Array(S.String),
  },
  $I.annote("RetrievalPacket", {
    description: "Bounded answer context returned by the sidecar so grounded answers stay inspectable.",
  })
) {}
