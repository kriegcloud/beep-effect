import { $RuntimeProtocolId } from "@beep/identity/packages";
import {
  IndexRepoRunInput,
  InterruptRepoRunRequest,
  QueryRepoRunInput,
  RepoRegistration,
  RepoRegistrationInput,
  RepoRun,
  ResumeRepoRunRequest,
  RunAcceptedAck,
  RunCommandAck,
  RunStreamEvent,
  RunStreamFailure,
  StreamRunEventsRequest,
} from "@beep/repo-memory-model";
import { LiteralKit, NonNegativeInt } from "@beep/schema";
import * as S from "effect/Schema";
import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";
import * as Rpc from "effect/unstable/rpc/Rpc";
import * as RpcGroup from "effect/unstable/rpc/RpcGroup";

const $I = $RuntimeProtocolId.create("index");

/**
 * @since 0.0.0
 * @category Re-exports
 */
export * from "@beep/repo-memory-model";

/**
 * @since 0.0.0
 * @category DomainModel
 */
export const SidecarHealthStatus = LiteralKit(["starting", "healthy", "degraded", "stopping"]).annotate(
  $I.annote("SidecarHealthStatus", {
    description: "Health posture reported by the local sidecar.",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type SidecarHealthStatus = typeof SidecarHealthStatus.Type;

/**
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
 * @since 0.0.0
 * @category HttpApi
 */
export const SidecarBadRequest = SidecarBadRequestPayload.pipe(HttpApiSchema.status(400));
/**
 * @since 0.0.0
 * @category HttpApi
 */
export const SidecarNotFound = SidecarNotFoundPayload.pipe(HttpApiSchema.status(404));
/**
 * @since 0.0.0
 * @category HttpApi
 */
export const SidecarInternalError = SidecarInternalErrorPayload.pipe(HttpApiSchema.status(500));
/**
 * @since 0.0.0
 * @category HttpApi
 */
export const RepoRegistrationCreated = RepoRegistration.pipe(HttpApiSchema.status(201));

/**
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
 * @since 0.0.0
 * @category HttpApi
 */
export class ControlPlaneApi extends HttpApi.make("repo-memory-control-plane")
  .add(SystemGroup, ReposGroup, RunsGroup)
  .prefix("/api/v0") {}

/**
 * @since 0.0.0
 * @category Rpc
 */
export const StreamRunEvents = Rpc.make("StreamRunEvents", {
  payload: StreamRunEventsRequest,
  success: RunStreamEvent,
  error: RunStreamFailure,
  stream: true,
});

/**
 * @since 0.0.0
 * @category Rpc
 */
export const StartIndexRepoRun = Rpc.make("StartIndexRepoRun", {
  payload: IndexRepoRunInput,
  success: RunAcceptedAck,
  error: RunStreamFailure,
});

/**
 * @since 0.0.0
 * @category Rpc
 */
export const StartQueryRepoRun = Rpc.make("StartQueryRepoRun", {
  payload: QueryRepoRunInput,
  success: RunAcceptedAck,
  error: RunStreamFailure,
});

/**
 * @since 0.0.0
 * @category Rpc
 */
export const InterruptRepoRun = Rpc.make("InterruptRepoRun", {
  payload: InterruptRepoRunRequest,
  success: RunCommandAck,
  error: RunStreamFailure,
});

/**
 * @since 0.0.0
 * @category Rpc
 */
export const ResumeRepoRun = Rpc.make("ResumeRepoRun", {
  payload: ResumeRepoRunRequest,
  success: RunCommandAck,
  error: RunStreamFailure,
});

/**
 * @since 0.0.0
 * @category Rpc
 */
export class RepoRunRpcGroup extends RpcGroup.make(
  StartIndexRepoRun,
  StartQueryRepoRun,
  InterruptRepoRun,
  ResumeRepoRun,
  StreamRunEvents
) {}
