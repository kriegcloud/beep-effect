import { $RepoMemoryModelId } from "@beep/identity/packages";
import { FilePath, LiteralKit, NonNegativeInt } from "@beep/schema";
import { PrimaryKey, pipe, Tuple } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  Citation,
  RepoId,
  RepoRunKind,
  RepoRunStatus,
  RetrievalPacket,
  RunCursor,
  RunEventSequence,
  RunId,
} from "./domain.js";

const $I = $RepoMemoryModelId.create("internal/protocolModels");

/**
 * Request payload used to register a local repository with the sidecar.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RepoRegistrationInput extends S.Class<RepoRegistrationInput>($I`RepoRegistrationInput`)(
  {
    repoPath: FilePath,
    displayName: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("RepoRegistrationInput", {
    description: "Request payload used to register a local repository with the sidecar.",
  })
) {}

/**
 * Registered repository metadata tracked by the runtime.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RepoRegistration extends S.Class<RepoRegistration>($I`RepoRegistration`)(
  {
    id: RepoId,
    repoPath: FilePath,
    displayName: S.String,
    language: S.Literal("typescript"),
    registeredAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("RepoRegistration", {
    description: "Local repository registration known to the repo-memory runtime.",
  })
) {}

/**
 * Projection shape for repository indexing runs.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class IndexRun extends S.Class<IndexRun>($I`IndexRun`)(
  {
    kind: S.tag("index"),
    id: RunId,
    repoId: RepoId,
    status: RepoRunStatus,
    acceptedAt: S.DateTimeUtcFromMillis,
    startedAt: S.OptionFromOptionalKey(S.DateTimeUtcFromMillis),
    completedAt: S.OptionFromOptionalKey(S.DateTimeUtcFromMillis),
    lastEventSequence: RunEventSequence,
    indexedFileCount: S.OptionFromOptionalKey(NonNegativeInt),
    errorMessage: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("IndexRun", {
    description: "Projection shape for a deterministic repository indexing workflow.",
  })
) {}

/**
 * Projection shape for repository query runs.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class QueryRun extends S.Class<QueryRun>($I`QueryRun`)(
  {
    kind: S.tag("query"),
    id: RunId,
    repoId: RepoId,
    question: S.String,
    status: RepoRunStatus,
    acceptedAt: S.DateTimeUtcFromMillis,
    startedAt: S.OptionFromOptionalKey(S.DateTimeUtcFromMillis),
    completedAt: S.OptionFromOptionalKey(S.DateTimeUtcFromMillis),
    lastEventSequence: RunEventSequence,
    answer: S.OptionFromOptionalKey(S.String),
    citations: S.Array(Citation),
    retrievalPacket: S.OptionFromOptionalKey(RetrievalPacket),
    errorMessage: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("QueryRun", {
    description: "Projection shape for a deterministic repository query workflow.",
  })
) {}

/**
 * Union of all run projection shapes tracked by the sidecar.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RepoRun = S.Union([IndexRun, QueryRun])
  .annotate(
    $I.annote("RepoRun", {
      description: "Union of all run projection shapes tracked by the repo-memory sidecar.",
    })
  )
  .pipe(S.toTaggedUnion("kind"));

/**
 * Runtime type for `RepoRun`.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RepoRun = typeof RepoRun.Type;

/**
 * Event emitted when a run is accepted.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RunAcceptedEvent extends S.Class<RunAcceptedEvent>($I`RunAcceptedEvent`)(
  {
    kind: S.tag("accepted"),
    runId: RunId,
    sequence: RunEventSequence,
    emittedAt: S.DateTimeUtcFromMillis,
    run: RepoRun,
  },
  $I.annote("RunAcceptedEvent", {
    description: "Event emitted when a workflow execution has been accepted and projected.",
  })
) {}

/**
 * Event emitted when a run starts.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RunStartedEvent extends S.Class<RunStartedEvent>($I`RunStartedEvent`)(
  {
    kind: S.tag("started"),
    runId: RunId,
    sequence: RunEventSequence,
    emittedAt: S.DateTimeUtcFromMillis,
    run: RepoRun,
  },
  $I.annote("RunStartedEvent", {
    description: "Event emitted when a workflow execution starts running.",
  })
) {}

/**
 * Event emitted while a run reports progress.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RunProgressUpdatedEvent extends S.Class<RunProgressUpdatedEvent>($I`RunProgressUpdatedEvent`)(
  {
    kind: S.tag("progress"),
    runId: RunId,
    sequence: RunEventSequence,
    emittedAt: S.DateTimeUtcFromMillis,
    phase: S.String,
    message: S.String,
    percent: S.OptionFromOptionalKey(NonNegativeInt),
  },
  $I.annote("RunProgressUpdatedEvent", {
    description: "Incremental progress event emitted while a workflow execution is still running.",
  })
) {}

/**
 * Event emitted when a retrieval packet is materialized.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalPacketMaterializedEvent extends S.Class<RetrievalPacketMaterializedEvent>(
  $I`RetrievalPacketMaterializedEvent`
)(
  {
    kind: S.tag("retrieval-packet"),
    runId: RunId,
    sequence: RunEventSequence,
    emittedAt: S.DateTimeUtcFromMillis,
    packet: RetrievalPacket,
  },
  $I.annote("RetrievalPacketMaterializedEvent", {
    description: "Event emitted when the retrieval packet is durable and ready for inspection.",
  })
) {}

/**
 * Event emitted when an answer draft is assembled.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class AnswerDraftedEvent extends S.Class<AnswerDraftedEvent>($I`AnswerDraftedEvent`)(
  {
    kind: S.tag("answer"),
    runId: RunId,
    sequence: RunEventSequence,
    emittedAt: S.DateTimeUtcFromMillis,
    answer: S.String,
    citations: S.Array(Citation),
  },
  $I.annote("AnswerDraftedEvent", {
    description: "Event emitted when the grounded answer has been assembled.",
  })
) {}

/**
 * Event emitted when a run completes successfully.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RunCompletedEvent extends S.Class<RunCompletedEvent>($I`RunCompletedEvent`)(
  {
    kind: S.tag("completed"),
    runId: RunId,
    sequence: RunEventSequence,
    emittedAt: S.DateTimeUtcFromMillis,
    run: RepoRun,
  },
  $I.annote("RunCompletedEvent", {
    description: "Terminal event emitted when a run completes successfully.",
  })
) {}

/**
 * Event emitted when a run fails.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RunFailedEvent extends S.Class<RunFailedEvent>($I`RunFailedEvent`)(
  {
    kind: S.tag("failed"),
    runId: RunId,
    sequence: RunEventSequence,
    emittedAt: S.DateTimeUtcFromMillis,
    message: S.String,
    run: RepoRun,
  },
  $I.annote("RunFailedEvent", {
    description: "Terminal event emitted when a run fails with a public error message.",
  })
) {}

/**
 * Event emitted when a run is interrupted.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RunInterruptedEvent extends S.Class<RunInterruptedEvent>($I`RunInterruptedEvent`)(
  {
    kind: S.tag("interrupted"),
    runId: RunId,
    sequence: RunEventSequence,
    emittedAt: S.DateTimeUtcFromMillis,
    run: RepoRun,
  },
  $I.annote("RunInterruptedEvent", {
    description: "Terminal event emitted when a run is interrupted before completion.",
  })
) {}

/**
 * Event emitted when a durable run resumes.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RunResumedEvent extends S.Class<RunResumedEvent>($I`RunResumedEvent`)(
  {
    kind: S.tag("resumed"),
    runId: RunId,
    sequence: RunEventSequence,
    emittedAt: S.DateTimeUtcFromMillis,
    run: RepoRun,
  },
  $I.annote("RunResumedEvent", {
    description: "Event emitted when a durable run resumes after interruption or restart.",
  })
) {}

const RunStreamEventKind = LiteralKit([
  "accepted",
  "started",
  "progress",
  "retrieval-packet",
  "answer",
  "completed",
  "failed",
  "interrupted",
  "resumed",
] as const);

/**
 * Union of all replayable run stream events.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RunStreamEvent = RunStreamEventKind.mapMembers(
  Tuple.evolve([
    () => RunAcceptedEvent,
    () => RunStartedEvent,
    () => RunProgressUpdatedEvent,
    () => RetrievalPacketMaterializedEvent,
    () => AnswerDraftedEvent,
    () => RunCompletedEvent,
    () => RunFailedEvent,
    () => RunInterruptedEvent,
    () => RunResumedEvent,
  ])
)
  .annotate(
    $I.annote("RunStreamEvent", {
      description: "Durable run event union used for replayable live execution streaming.",
    })
  )
  .pipe(S.toTaggedUnion("kind"));

/**
 * Runtime type for `RunStreamEvent`.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RunStreamEvent = typeof RunStreamEvent.Type;

/**
 * Request payload for replaying and continuing a run event stream.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class StreamRunEventsRequest extends S.Class<StreamRunEventsRequest>($I`StreamRunEventsRequest`)(
  {
    runId: RunId,
    cursor: S.OptionFromOptionalKey(RunCursor),
  },
  $I.annote("StreamRunEventsRequest", {
    description: "Request payload used to replay and continue streaming run events for a workflow execution.",
  })
) {
  [PrimaryKey.symbol](): string {
    return pipe(
      this.cursor,
      O.match({
        onNone: () => `${this.runId}:stream`,
        onSome: (cursor) => `${this.runId}:stream:${cursor}`,
      })
    );
  }
}

/**
 * Immediate acknowledgment returned when a workflow-backed run has been accepted.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RunAcceptedAck extends S.Class<RunAcceptedAck>($I`RunAcceptedAck`)(
  {
    runId: RunId,
    kind: RepoRunKind,
    acceptedAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("RunAcceptedAck", {
    description: "Immediate acknowledgment returned when a repo-memory workflow execution is accepted.",
  })
) {}
