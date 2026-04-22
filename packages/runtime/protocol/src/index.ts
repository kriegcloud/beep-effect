/**
 * Shared protocol contracts for the repo-memory sidecar and desktop shell.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

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
 * Re-export repo-memory protocol models used by the sidecar API.
 *
 * @example
 * ```ts
 * import type { RepoRun } from "@beep/runtime-protocol"
 *
 * const getRunId = (run: RepoRun) => run.id
 *
 * void getRunId
 * ```
 *
 * @since 0.0.0
 * @category re-exports
 */
export * from "@beep/repo-memory-model";

/**
 * Sidecar health states reported by the control plane.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SidecarHealthStatus } from "@beep/runtime-protocol"
 *
 * const isHealthStatus = S.is(SidecarHealthStatus)
 * const healthy = isHealthStatus("healthy")
 *
 * void healthy
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export const SidecarHealthStatus = LiteralKit(["starting", "healthy", "degraded", "stopping"]).annotate(
  $I.annote("SidecarHealthStatus", {
    description: "Health posture reported by the local sidecar.",
  })
);

/**
 * Type for {@link SidecarHealthStatus}.
 *
 * @example
 * ```ts
 * import type { SidecarHealthStatus } from "@beep/runtime-protocol"
 *
 * const status: SidecarHealthStatus = "healthy"
 *
 * void status
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export type SidecarHealthStatus = typeof SidecarHealthStatus.Type;

/**
 * Bootstrap payload returned by the sidecar health endpoint.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SidecarBootstrap } from "@beep/runtime-protocol"
 *
 * const isBootstrap = S.is(SidecarBootstrap)
 *
 * void isBootstrap
 * ```
 *
 * @since 0.0.0
 * @category domain model
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
 * Bootstrap event shape emitted on sidecar stdout.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SidecarBootstrapStdoutEvent } from "@beep/runtime-protocol"
 *
 * const isBootstrapEvent = S.is(SidecarBootstrapStdoutEvent)
 *
 * void isBootstrapEvent
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export class SidecarBootstrapStdoutEvent extends S.Class<SidecarBootstrapStdoutEvent>($I`SidecarBootstrapStdoutEvent`)(
  {
    type: S.tag("bootstrap"),
    sessionId: S.String,
    host: S.String,
    port: NonNegativeInt,
    baseUrl: S.String,
    pid: NonNegativeInt,
    version: S.String,
    status: SidecarHealthStatus,
    startedAt: S.Number,
  },
  $I.annote("SidecarBootstrapStdoutEvent", {
    description: "Machine-readable bootstrap event written to stdout by the sidecar process.",
  })
) {}

/**
 * Bad-request payload returned by the sidecar control plane.
 *
 * @example
 * ```ts
 * import { SidecarBadRequestPayload } from "@beep/runtime-protocol"
 *
 * const payload = new SidecarBadRequestPayload({
 *   message: "Request body required",
 *   status: 400
 * })
 *
 * void payload
 * ```
 *
 * @since 0.0.0
 * @category domain model
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
 * Not-found payload returned by the sidecar control plane.
 *
 * @example
 * ```ts
 * import { SidecarNotFoundPayload } from "@beep/runtime-protocol"
 *
 * const payload = new SidecarNotFoundPayload({
 *   message: "Run not found",
 *   status: 404
 * })
 *
 * void payload
 * ```
 *
 * @since 0.0.0
 * @category domain model
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
 * Internal-error payload returned by the sidecar control plane.
 *
 * @example
 * ```ts
 * import { SidecarInternalErrorPayload } from "@beep/runtime-protocol"
 *
 * const payload = new SidecarInternalErrorPayload({
 *   message: "Sidecar request failed",
 *   status: 500
 * })
 *
 * void payload
 * ```
 *
 * @since 0.0.0
 * @category domain model
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
 * Bad-request schema annotated with HTTP status 400.
 *
 * @example
 * ```ts
 * import { SidecarBadRequest } from "@beep/runtime-protocol"
 *
 * const schema = SidecarBadRequest
 *
 * void schema
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export const SidecarBadRequest = SidecarBadRequestPayload.pipe(HttpApiSchema.status(400));
/**
 * Not-found schema annotated with HTTP status 404.
 *
 * @example
 * ```ts
 * import { SidecarNotFound } from "@beep/runtime-protocol"
 *
 * const schema = SidecarNotFound
 *
 * void schema
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export const SidecarNotFound = SidecarNotFoundPayload.pipe(HttpApiSchema.status(404));
/**
 * Internal-error schema annotated with HTTP status 500.
 *
 * @example
 * ```ts
 * import { SidecarInternalError } from "@beep/runtime-protocol"
 *
 * const schema = SidecarInternalError
 *
 * void schema
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export const SidecarInternalError = SidecarInternalErrorPayload.pipe(HttpApiSchema.status(500));
/**
 * Repo registration schema annotated with HTTP status 201.
 *
 * @example
 * ```ts
 * import { RepoRegistrationCreated } from "@beep/runtime-protocol"
 *
 * const schema = RepoRegistrationCreated
 *
 * void schema
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export const RepoRegistrationCreated = RepoRegistration.pipe(HttpApiSchema.status(201));

/**
 * Route params for run-specific sidecar endpoints.
 *
 * @example
 * ```ts
 * import { RunIdPathParams } from "@beep/runtime-protocol"
 *
 * const params = new RunIdPathParams({ runId: "run-1" })
 *
 * void params
 * ```
 *
 * @since 0.0.0
 * @category domain model
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
 * HTTP API descriptor for the sidecar control plane.
 *
 * @example
 * ```ts
 * import { ControlPlaneApi } from "@beep/runtime-protocol"
 *
 * const api = ControlPlaneApi
 *
 * void api
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export class ControlPlaneApi extends HttpApi.make("repo-memory-control-plane")
  .add(SystemGroup, ReposGroup, RunsGroup)
  .prefix("/api/v0") {}

/**
 * RPC descriptor for streaming run events.
 *
 * @example
 * ```ts
 * import { StreamRunEvents } from "@beep/runtime-protocol"
 *
 * const rpc = StreamRunEvents
 *
 * void rpc
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export const StreamRunEvents = Rpc.make("StreamRunEvents", {
  payload: StreamRunEventsRequest,
  success: RunStreamEvent,
  error: RunStreamFailure,
  stream: true,
});

/**
 * RPC descriptor for starting an index run.
 *
 * @example
 * ```ts
 * import { StartIndexRepoRun } from "@beep/runtime-protocol"
 *
 * const rpc = StartIndexRepoRun
 *
 * void rpc
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export const StartIndexRepoRun = Rpc.make("StartIndexRepoRun", {
  payload: IndexRepoRunInput,
  success: RunAcceptedAck,
  error: RunStreamFailure,
});

/**
 * RPC descriptor for starting a query run.
 *
 * @example
 * ```ts
 * import { StartQueryRepoRun } from "@beep/runtime-protocol"
 *
 * const rpc = StartQueryRepoRun
 *
 * void rpc
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export const StartQueryRepoRun = Rpc.make("StartQueryRepoRun", {
  payload: QueryRepoRunInput,
  success: RunAcceptedAck,
  error: RunStreamFailure,
});

/**
 * RPC descriptor for interrupting a run.
 *
 * @example
 * ```ts
 * import { InterruptRepoRun } from "@beep/runtime-protocol"
 *
 * const rpc = InterruptRepoRun
 *
 * void rpc
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export const InterruptRepoRun = Rpc.make("InterruptRepoRun", {
  payload: InterruptRepoRunRequest,
  success: RunCommandAck,
  error: RunStreamFailure,
});

/**
 * RPC descriptor for resuming a run.
 *
 * @example
 * ```ts
 * import { ResumeRepoRun } from "@beep/runtime-protocol"
 *
 * const rpc = ResumeRepoRun
 *
 * void rpc
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export const ResumeRepoRun = Rpc.make("ResumeRepoRun", {
  payload: ResumeRepoRunRequest,
  success: RunCommandAck,
  error: RunStreamFailure,
});

/**
 * RPC group descriptor for repo run commands and event streams.
 *
 * @example
 * ```ts
 * import { RepoRunRpcGroup } from "@beep/runtime-protocol"
 *
 * const group = RepoRunRpcGroup
 *
 * void group
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export class RepoRunRpcGroup extends RpcGroup.make(
  StartIndexRepoRun,
  StartQueryRepoRun,
  InterruptRepoRun,
  ResumeRepoRun,
  StreamRunEvents
) {}
