import { $RuntimeProtocolId } from "@beep/identity/packages";
import {
  Citation,
  IndexRepoRunInput,
  QueryRepoRunInput,
  RepoId,
  RepoRunKind,
  RepoRunStatus,
  RetrievalPacket,
  RunCursor,
  RunEventSequence,
  RunId,
  RunStreamFailure,
} from "@beep/repo-memory-domain";
import { FilePath, LiteralKit, NonNegativeInt } from "@beep/schema";
import { PrimaryKey, pipe, Tuple } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";
import * as Rpc from "effect/unstable/rpc/Rpc";
import * as RpcGroup from "effect/unstable/rpc/RpcGroup";

const $I = $RuntimeProtocolId.create("index");

/**
 * Health posture reported by the local sidecar.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const SidecarHealthStatus = LiteralKit(["starting", "healthy", "degraded", "stopping"] as const).annotate(
  $I.annote("SidecarHealthStatus", {
    description: "Health posture reported by the local sidecar.",
  })
);

/**
 * Runtime type for `SidecarHealthStatus`.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SidecarHealthStatus = typeof SidecarHealthStatus.Type;

/**
 * Bootstrap payload emitted by the sidecar for discovery and health checks.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SidecarBootstrap extends S.Class<SidecarBootstrap>($I`SidecarBootstrap`)(
  {
    sessionId: S.String,
    host: S.String,
    port: NonNegativeInt,
    baseUrl: S.String,
    pid: NonNegativeInt,
    version: S.String,
    status: SidecarHealthStatus,
    startedAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("SidecarBootstrap", {
    description: "Bootstrap payload emitted by the sidecar so the shell can discover and health-check it.",
  })
) {}

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

/**
 * Deterministic bad-request payload returned by the control plane.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SidecarBadRequestPayload extends S.Class<SidecarBadRequestPayload>($I`SidecarBadRequestPayload`)(
  {
    message: S.String,
    status: S.Literal(400),
  },
  $I.annote("SidecarBadRequestPayload", {
    description: "Deterministic bad-request payload returned by the sidecar control plane.",
  })
) {}

/**
 * Deterministic not-found payload returned by the control plane.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SidecarNotFoundPayload extends S.Class<SidecarNotFoundPayload>($I`SidecarNotFoundPayload`)(
  {
    message: S.String,
    status: S.Literal(404),
  },
  $I.annote("SidecarNotFoundPayload", {
    description: "Deterministic not-found payload returned by the sidecar control plane.",
  })
) {}

/**
 * Deterministic internal-error payload returned by the control plane.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SidecarInternalErrorPayload extends S.Class<SidecarInternalErrorPayload>($I`SidecarInternalErrorPayload`)(
  {
    message: S.String,
    status: S.Literal(500),
  },
  $I.annote("SidecarInternalErrorPayload", {
    description: "Deterministic internal-error payload returned by the sidecar control plane.",
  })
) {}

/**
 * HTTP 400 response schema for the control plane.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const SidecarBadRequest = SidecarBadRequestPayload.pipe(HttpApiSchema.status(400));
/**
 * HTTP 404 response schema for the control plane.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const SidecarNotFound = SidecarNotFoundPayload.pipe(HttpApiSchema.status(404));
/**
 * HTTP 500 response schema for the control plane.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const SidecarInternalError = SidecarInternalErrorPayload.pipe(HttpApiSchema.status(500));
/**
 * HTTP 201 response schema for successful repo registration.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const RepoRegistrationCreated = RepoRegistration.pipe(HttpApiSchema.status(201));

/**
 * Route params for repo-scoped endpoints.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RepoIdPathParams extends S.Class<RepoIdPathParams>($I`RepoIdPathParams`)(
  {
    repoId: S.String,
  },
  $I.annote("RepoIdPathParams", {
    description: "Route params for repo-specific sidecar endpoints.",
  })
) {}

/**
 * Route params for run-scoped endpoints.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RunIdPathParams extends S.Class<RunIdPathParams>($I`RunIdPathParams`)(
  {
    runId: S.String,
  },
  $I.annote("RunIdPathParams", {
    description: "Route params for run-specific sidecar endpoints.",
  })
) {}

class SystemGroup extends HttpApiGroup.make("system", { topLevel: true }).add(
  HttpApiEndpoint.get("health", "/health", {
    success: SidecarBootstrap,
    error: SidecarInternalError,
  })
) {}

class ReposGroup extends HttpApiGroup.make("repos", { topLevel: true })
  .add(
    HttpApiEndpoint.get("listRepos", "/repos", {
      success: S.Array(RepoRegistration),
      error: SidecarInternalError,
    })
  )
  .add(
    HttpApiEndpoint.post("registerRepo", "/repos", {
      payload: RepoRegistrationInput,
      success: RepoRegistrationCreated,
      error: S.Union([SidecarBadRequest, SidecarNotFound, SidecarInternalError]),
    })
  ) {}

class RunsGroup extends HttpApiGroup.make("runs", { topLevel: true })
  .add(
    HttpApiEndpoint.get("listRuns", "/runs", {
      success: S.Array(RepoRun),
      error: SidecarInternalError,
    })
  )
  .add(
    HttpApiEndpoint.get("getRun", "/runs/:runId", {
      params: RunIdPathParams,
      success: RepoRun,
      error: S.Union([SidecarBadRequest, SidecarNotFound, SidecarInternalError]),
    })
  ) {}

/**
 * HTTP API contract exposed by the repo-memory control plane.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class ControlPlaneApi extends HttpApi.make("repo-memory-control-plane")
  .add(SystemGroup, ReposGroup, RunsGroup)
  .prefix("/api/v0") {}

/**
 * Streaming RPC contract for durable run events.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const StreamRunEvents = Rpc.make("StreamRunEvents", {
  payload: StreamRunEventsRequest,
  success: RunStreamEvent,
  error: RunStreamFailure,
  stream: true,
});

/**
 * RPC used to accept a deterministic repository index run and return its run id immediately.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const StartIndexRepoRun = Rpc.make("StartIndexRepoRun", {
  payload: IndexRepoRunInput,
  success: RunAcceptedAck,
  error: RunStreamFailure,
});

/**
 * RPC used to accept a deterministic repository query run and return its run id immediately.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const StartQueryRepoRun = Rpc.make("StartQueryRepoRun", {
  payload: QueryRepoRunInput,
  success: RunAcceptedAck,
  error: RunStreamFailure,
});

/**
 * App-facing RPC group for repo-memory run execution and streaming.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class RepoRunRpcGroup extends RpcGroup.make(StartIndexRepoRun, StartQueryRepoRun, StreamRunEvents) {}
