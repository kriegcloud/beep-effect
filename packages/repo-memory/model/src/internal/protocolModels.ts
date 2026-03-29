import { $RepoMemoryModelId } from "@beep/identity/packages";
import { FilePath, LiteralKit, NonNegativeInt } from "@beep/schema";
import { Str } from "@beep/utils";
import { PrimaryKey, pipe, Tuple } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

import {
  Citation,
  RepoId,
  RepoRunKind,
  RepoRunStatus,
  RetrievalPacket,
  RunCommand,
  RunCursor,
  RunEventSequence,
  RunId,
} from "./domain.js";

const $I = $RepoMemoryModelId.create("internal/protocolModels");

const controlCharacterRegExp = /\p{Cc}/u;

const AbsoluteFilePath = FilePath.check(
  S.makeFilter((s: string) => Str.startsWith("/")(s) || /^[A-Za-z]:[\\/]/.test(s) || Str.startsWith("\\\\")(s), {
    identifier: $I`AbsoluteFilePathCheck`,
    title: "Absolute File Path",
    description: "A file path that is rooted (POSIX absolute, Windows drive, or UNC).",
    message: "repoPath must be an absolute path",
  })
).pipe(
  S.annotate(
    $I.annote("AbsoluteFilePath", {
      description: "A file path that is rooted (POSIX absolute, Windows drive, or UNC).",
    })
  )
);

const DisplayNameConstraints = S.makeFilterGroup(
  [
    S.isMaxLength(255, {
      identifier: $I`DisplayNameMaxLengthCheck`,
      title: "Display Name Max Length",
      description: "Display name must not exceed 255 characters.",
      message: "displayName must not exceed 255 characters",
    }),
    S.makeFilter((value: string) => !controlCharacterRegExp.test(value), {
      identifier: $I`DisplayNameNoControlCharsCheck`,
      title: "Display Name No Control Characters",
      description: "Display name must not contain control characters.",
      message: "displayName must not contain control characters",
    }),
  ],
  {
    identifier: $I`DisplayNameConstraints`,
    title: "Display Name Constraints",
    description: "Length and character constraints for repository display names.",
  }
);

/**
 * Request payload used to register a local repository with the sidecar.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RepoRegistrationInput extends S.Class<RepoRegistrationInput>($I`RepoRegistrationInput`)(
  {
    repoPath: AbsoluteFilePath,
    displayName: S.OptionFromOptionalKey(S.String.check(DisplayNameConstraints)),
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
    displayName: S.NonEmptyString.check(DisplayNameConstraints),
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
 * Canonical query stage phases projected for deterministic repo-memory runs.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const QueryStagePhase = LiteralKit(["grounding", "retrieval", "packet", "answer"]).annotate(
  $I.annote("QueryStagePhase", {
    description: "Canonical query stage phases projected for deterministic repo-memory runs.",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type QueryStagePhase = typeof QueryStagePhase.Type;

/**
 * Lifecycle status projected for one query stage.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const QueryStageStatus = LiteralKit(["pending", "running", "completed"]).annotate(
  $I.annote("QueryStageStatus", {
    description: "Lifecycle status projected for one query stage.",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type QueryStageStatus = typeof QueryStageStatus.Type;

const QueryStageStateFields = {
  status: QueryStageStatus,
  startedAt: S.OptionFromOptionalKey(S.DateTimeUtcFromMillis),
  completedAt: S.OptionFromOptionalKey(S.DateTimeUtcFromMillis),
  latestMessage: S.OptionFromOptionalKey(S.String),
  percent: S.OptionFromOptionalKey(NonNegativeInt),
  artifactAvailable: S.OptionFromOptionalKey(S.Boolean),
} as const;

/**
 * Projected state for the grounding stage.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class GroundingQueryStage extends S.Class<GroundingQueryStage>($I`GroundingQueryStage`)(
  {
    phase: S.tag("grounding"),
    ...QueryStageStateFields,
  },
  $I.annote("GroundingQueryStage", {
    description: "Projected state for the grounding stage.",
  })
) {}

/**
 * Projected state for the retrieval stage.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RetrievalQueryStage extends S.Class<RetrievalQueryStage>($I`RetrievalQueryStage`)(
  {
    phase: S.tag("retrieval"),
    ...QueryStageStateFields,
  },
  $I.annote("RetrievalQueryStage", {
    description: "Projected state for the retrieval stage.",
  })
) {}

/**
 * Projected state for the packet stage.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PacketQueryStage extends S.Class<PacketQueryStage>($I`PacketQueryStage`)(
  {
    phase: S.tag("packet"),
    ...QueryStageStateFields,
  },
  $I.annote("PacketQueryStage", {
    description: "Projected state for the packet stage.",
  })
) {}

/**
 * Projected state for the answer stage.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class AnswerQueryStage extends S.Class<AnswerQueryStage>($I`AnswerQueryStage`)(
  {
    phase: S.tag("answer"),
    ...QueryStageStateFields,
  },
  $I.annote("AnswerQueryStage", {
    description: "Projected state for the answer stage.",
  })
) {}

/**
 * Projected state union for one query stage.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const QueryStage = S.Union([GroundingQueryStage, RetrievalQueryStage, PacketQueryStage, AnswerQueryStage])
  .annotate(
    $I.annote("QueryStage", {
      description: "Projected state union for one query stage.",
    })
  )
  .pipe(S.toTaggedUnion("phase"));

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type QueryStage = typeof QueryStage.Type;

/**
 * Fixed four-stage trace projected for one query run.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class QueryStageTrace extends S.Class<QueryStageTrace>($I`QueryStageTrace`)(
  {
    grounding: GroundingQueryStage,
    retrieval: RetrievalQueryStage,
    packet: PacketQueryStage,
    answer: AnswerQueryStage,
  },
  $I.annote("QueryStageTrace", {
    description: "Fixed four-stage trace projected for one query run.",
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
    queryStages: S.OptionFromOptionalKey(QueryStageTrace),
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
    runKind: RepoRunKind,
    repoId: RepoId,
    question: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("RunAcceptedEvent", {
    description: "Event emitted when a workflow execution has been accepted.",
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
    indexedFileCount: S.OptionFromOptionalKey(NonNegativeInt),
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
  [PrimaryKey.symbol]() {
    const prefix = Str.prefix(`${this.runId}:`);
    return pipe(
      this.cursor,
      O.match({
        onNone: () => prefix("stream"),
        onSome: (cursor) => prefix(`stream:${cursor}`),
      })
    );
  }
}

/**
 * Request payload used to interrupt a durable workflow-backed run.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class InterruptRepoRunRequest extends S.Class<InterruptRepoRunRequest>($I`InterruptRepoRunRequest`)(
  {
    runId: RunId,
  },
  $I.annote("InterruptRepoRunRequest", {
    description: "Request payload used to interrupt a durable workflow-backed run.",
  })
) {}

/**
 * Request payload used to resume a previously interrupted durable run.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ResumeRepoRunRequest extends S.Class<ResumeRepoRunRequest>($I`ResumeRepoRunRequest`)(
  {
    runId: RunId,
  },
  $I.annote("ResumeRepoRunRequest", {
    description: "Request payload used to resume a previously interrupted durable run.",
  })
) {}

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

/**
 * Immediate acknowledgment returned when a run-control command has been accepted.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RunCommandAck extends S.Class<RunCommandAck>($I`RunCommandAck`)(
  {
    runId: RunId,
    command: RunCommand,
    requestedAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("RunCommandAck", {
    description: "Immediate acknowledgment returned when a repo-memory run-control command has been accepted.",
  })
) {}
