/**
 * Client boundary for the local repo-memory sidecar protocol.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoMemoryClientId } from "@beep/identity/packages";
import {
  ControlPlaneApi,
  type IndexRepoRunInput,
  type InterruptRepoRunRequest,
  type QueryRepoRunInput,
  type RepoRegistration,
  type RepoRegistrationInput,
  type RepoRun,
  RepoRunRpcGroup,
  type ResumeRepoRunRequest,
  type RunAcceptedAck,
  type RunCommandAck,
  type RunId,
  type RunStreamEvent,
  type SidecarBootstrap,
  type StreamRunEventsRequest,
} from "@beep/runtime-protocol";
import { StatusCauseTaggedErrorClass } from "@beep/schema";
import { Cause, Context, Effect, Layer, pipe, Stream } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import { HttpApiClient } from "effect/unstable/httpapi";
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";

const $I = $RepoMemoryClientId.create("index");
const controlPlanePrefix = "/api/v0";
const rpcSuffix = `${controlPlanePrefix}/rpc`;

/**
 * Configuration for connecting to the local repo-memory sidecar.
 *
 * @example
 * ```ts
 * import { RepoMemoryClientConfig } from "@beep/repo-memory-client"
 *
 * const config = new RepoMemoryClientConfig({
 *   baseUrl: "http://127.0.0.1:3000",
 *   sessionId: "session-1"
 * })
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export class RepoMemoryClientConfig extends S.Class<RepoMemoryClientConfig>($I`RepoMemoryClientConfig`)(
  {
    baseUrl: S.String,
    sessionId: S.String,
  },
  $I.annote("RepoMemoryClientConfig", {
    description: "Client configuration for calling the local repo-memory sidecar.",
  })
) {}

/**
 * Typed client error for repo-memory sidecar communication failures.
 *
 * @example
 * ```ts
 * import { RepoMemoryClientError } from "@beep/repo-memory-client"
 *
 * const error = RepoMemoryClientError.noCause("Sidecar unavailable.", 503)
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export class RepoMemoryClientError extends StatusCauseTaggedErrorClass<RepoMemoryClientError>(
  $I`RepoMemoryClientError`
)(
  "RepoMemoryClientError",
  $I.annote("RepoMemoryClientError", {
    description: "Typed client error for local sidecar communication failures.",
  })
) {}

/**
 * Service contract for interacting with the local repo-memory sidecar.
 *
 * @example
 * ```ts
 * import type { RepoMemoryClientShape } from "@beep/repo-memory-client"
 *
 * const methods = [
 *   "bootstrap",
 *   "registerRepo",
 *   "streamRunEvents"
 * ] satisfies ReadonlyArray<keyof RepoMemoryClientShape>
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export interface RepoMemoryClientShape {
  readonly bootstrap: Effect.Effect<SidecarBootstrap, RepoMemoryClientError>;
  readonly getRun: (runId: RunId) => Effect.Effect<RepoRun, RepoMemoryClientError>;
  readonly interruptRun: (request: InterruptRepoRunRequest) => Effect.Effect<RunCommandAck, RepoMemoryClientError>;
  readonly listRepos: Effect.Effect<ReadonlyArray<RepoRegistration>, RepoMemoryClientError>;
  readonly listRuns: Effect.Effect<ReadonlyArray<RepoRun>, RepoMemoryClientError>;
  readonly registerRepo: (input: RepoRegistrationInput) => Effect.Effect<RepoRegistration, RepoMemoryClientError>;
  readonly resumeRun: (request: ResumeRepoRunRequest) => Effect.Effect<RunCommandAck, RepoMemoryClientError>;
  readonly startIndexRun: (payload: IndexRepoRunInput) => Effect.Effect<RunAcceptedAck, RepoMemoryClientError>;
  readonly startQueryRun: (payload: QueryRepoRunInput) => Effect.Effect<RunAcceptedAck, RepoMemoryClientError>;
  readonly streamRunEvents: (request: StreamRunEventsRequest) => Stream.Stream<RunStreamEvent, RepoMemoryClientError>;
}

/**
 * Service tag for the repo-memory sidecar client.
 *
 * @example
 * ```ts
 * import { RepoMemoryClient } from "@beep/repo-memory-client"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const client = yield* RepoMemoryClient
 *   return client.listRuns
 * })
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export class RepoMemoryClient extends Context.Service<RepoMemoryClient, RepoMemoryClientShape>()(
  $I`RepoMemoryClient`
) {}

/**
 * Browser-friendly RPC client type for the repo-memory run surface.
 *
 * @example
 * ```ts
 * import type { RepoMemoryRunRpcClient } from "@beep/repo-memory-client"
 *
 * type RunRpcClient = RepoMemoryRunRpcClient
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export type RepoMemoryRunRpcClient = Effect.Success<ReturnType<typeof makeRepoMemoryRpcClient>>;

/**
 * Browser-friendly HTTP client type for the repo-memory control-plane surface.
 *
 * @example
 * ```ts
 * import type { RepoMemoryControlPlaneClient } from "@beep/repo-memory-client"
 *
 * type ControlPlaneClient = RepoMemoryControlPlaneClient
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export type RepoMemoryControlPlaneClient = Effect.Success<ReturnType<typeof makeRepoMemoryHttpClientDefault>>;

/**
 * Runtime boundary payload returned by the sidecar for structured failures.
 *
 * @example
 * ```ts
 * import { RuntimeBoundaryPayload } from "@beep/repo-memory-client"
 *
 * const payload = new RuntimeBoundaryPayload({
 *   message: "Sidecar unavailable.",
 *   status: 503
 * })
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export class RuntimeBoundaryPayload extends S.Class<RuntimeBoundaryPayload>($I`RuntimeBoundaryPayload`)({
  message: S.String,
  status: S.Number,
}) {}

/**
 * Normalize a user-provided sidecar URL to the root server URL.
 *
 * Accepts either the root URL or a control-plane URL ending in `/api/v0`.
 *
 * @example
 * ```ts
 * import { normalizeSidecarBaseUrl } from "@beep/repo-memory-client"
 *
 * const baseUrl = normalizeSidecarBaseUrl("http://127.0.0.1:3000/api/v0")
 * ```
 *
 * @since 0.0.0
 * @category utility
 */
export const normalizeSidecarBaseUrl = (baseUrl: string | URL): string => {
  const trimmed = pipe(Str.trim(`${baseUrl}`), Str.replace(/\/+$/, ""));

  if (Str.endsWith(controlPlanePrefix)(trimmed)) {
    return Str.slice(0, -controlPlanePrefix.length)(trimmed);
  }

  return trimmed;
};

/**
 * Build the public RPC URL for the sidecar run surface.
 *
 * @example
 * ```ts
 * import { makeRepoMemoryRpcUrl } from "@beep/repo-memory-client"
 *
 * const rpcUrl = makeRepoMemoryRpcUrl("http://127.0.0.1:3000")
 * ```
 *
 * @since 0.0.0
 * @category utility
 */
export const makeRepoMemoryRpcUrl = (baseUrl: string | URL): string =>
  `${normalizeSidecarBaseUrl(baseUrl)}${rpcSuffix}`;

/**
 * Options for creating a repo-memory HTTP client.
 *
 * @example
 * ```ts
 * import type { RepoMemoryHttpClientOptions } from "@beep/repo-memory-client"
 *
 * const options: RepoMemoryHttpClientOptions = {
 *   baseUrl: "http://127.0.0.1:3000"
 * }
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export type RepoMemoryHttpClientOptions = {
  readonly baseUrl: string | URL;
  readonly transformClient?: undefined | ((client: HttpClient.HttpClient) => HttpClient.HttpClient);
  readonly transformResponse?:
    | ((effect: Effect.Effect<unknown, unknown, unknown>) => Effect.Effect<unknown, unknown, unknown>)
    | undefined;
};

/**
 * Construct the control-plane HTTP client effect.
 *
 * @example
 * ```ts
 * import { makeRepoMemoryHttpClient } from "@beep/repo-memory-client"
 *
 * const client = makeRepoMemoryHttpClient({
 *   baseUrl: "http://127.0.0.1:3000"
 * })
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export const makeRepoMemoryHttpClient = (options: RepoMemoryHttpClientOptions) =>
  HttpApiClient.make(ControlPlaneApi, {
    baseUrl: normalizeSidecarBaseUrl(options.baseUrl),
    ...(options.transformClient === undefined ? {} : { transformClient: options.transformClient }),
    ...(options.transformResponse === undefined ? {} : { transformResponse: options.transformResponse }),
  });

/**
 * Construct the control-plane HTTP client with the default fetch implementation.
 *
 * @example
 * ```ts
 * import { makeRepoMemoryHttpClientDefault } from "@beep/repo-memory-client"
 *
 * const client = makeRepoMemoryHttpClientDefault({
 *   baseUrl: "http://127.0.0.1:3000"
 * })
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export const makeRepoMemoryHttpClientDefault = (options: RepoMemoryHttpClientOptions) =>
  Effect.scoped(
    Layer.build(FetchHttpClient.layer).pipe(
      Effect.flatMap((context) => makeRepoMemoryHttpClient(options).pipe(Effect.provide(context)))
    )
  );

/**
 * Options for creating a repo-memory RPC client.
 *
 * @example
 * ```ts
 * import type { RepoMemoryRpcClientOptions } from "@beep/repo-memory-client"
 *
 * const options: RepoMemoryRpcClientOptions = {
 *   baseUrl: "http://127.0.0.1:3000"
 * }
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export type RepoMemoryRpcClientOptions = {
  readonly baseUrl: string | URL;
  readonly transformClient?:
    | undefined
    | (<E, R>(client: HttpClient.HttpClient.With<E, R>) => HttpClient.HttpClient.With<E, R>);
};

/**
 * Layer providing the public repo-memory RPC protocol over HTTP.
 *
 * @example
 * ```ts
 * import { repoMemoryRpcLayer } from "@beep/repo-memory-client"
 *
 * const layer = repoMemoryRpcLayer({
 *   baseUrl: "http://127.0.0.1:3000"
 * })
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export const repoMemoryRpcLayer = (options: RepoMemoryRpcClientOptions) =>
  RpcClient.layerProtocolHttp({
    url: makeRepoMemoryRpcUrl(options.baseUrl),
    ...(options.transformClient === undefined ? {} : { transformClient: options.transformClient }),
  }).pipe(Layer.provide(FetchHttpClient.layer), Layer.provide(RpcSerialization.layerNdjson));

/**
 * Construct the public repo-memory RPC client effect.
 *
 * @example
 * ```ts
 * import { makeRepoMemoryRpcClient } from "@beep/repo-memory-client"
 *
 * const client = makeRepoMemoryRpcClient({
 *   baseUrl: "http://127.0.0.1:3000"
 * })
 * ```
 *
 * @since 0.0.0
 * @category integration
 */
export const makeRepoMemoryRpcClient = (options: RepoMemoryRpcClientOptions) =>
  Effect.scoped(
    Layer.build(repoMemoryRpcLayer(options)).pipe(
      Effect.flatMap((context) => RpcClient.make(RepoRunRpcGroup).pipe(Effect.provide(context)))
    )
  );

const hasMessage = (input: unknown): input is { readonly message: string } =>
  P.isObject(input) && P.hasProperty(input, "message") && P.isString(input.message);

const hasStatus = (input: unknown): input is { readonly status: number } =>
  P.isObject(input) && P.hasProperty(input, "status") && P.isNumber(input.status);

const isRuntimeBoundaryPayload = (input: unknown): input is RuntimeBoundaryPayload =>
  hasMessage(input) && hasStatus(input);

const transportStatus = (cause: unknown): number =>
  HttpClientError.isHttpClientError(cause) && cause.response !== undefined ? cause.response.status : 500;

const toClientError = (fallback: string, cause: unknown): RepoMemoryClientError =>
  S.is(RepoMemoryClientError)(cause)
    ? cause
    : isRuntimeBoundaryPayload(cause)
      ? RepoMemoryClientError.noCause(cause.message, cause.status)
      : RepoMemoryClientError.new(P.isError(cause) ? cause : undefined, fallback, transportStatus(cause));

const mapClientError = <A, E>(fallback: string, effect: Effect.Effect<A, E>) =>
  effect.pipe(Effect.catchCause((cause) => Effect.fail(toClientError(fallback, Cause.squash(cause)))));

const mapStreamClientError = <A, E>(fallback: string, stream: Stream.Stream<A, E>) =>
  stream.pipe(Stream.catchCause((cause) => Stream.fail(toClientError(fallback, Cause.squash(cause)))));

/**
 * Create the full repo-memory client boundary over the public sidecar protocol.
 *
 * @example
 * ```ts
 * import { makeRepoMemoryClient, RepoMemoryClientConfig } from "@beep/repo-memory-client"
 *
 * const client = makeRepoMemoryClient(
 *   new RepoMemoryClientConfig({
 *     baseUrl: "http://127.0.0.1:3000",
 *     sessionId: "session-1"
 *   })
 * )
 * ```
 *
 * @since 0.0.0
 * @category domain logic
 */
export const makeRepoMemoryClient = Effect.fn("RepoMemoryClient.make")((config: RepoMemoryClientConfig) =>
  Effect.succeed({
    bootstrap: mapClientError(
      "Failed to load sidecar bootstrap.",
      Effect.scoped(
        makeRepoMemoryHttpClientDefault({
          baseUrl: config.baseUrl,
        }).pipe(Effect.flatMap((controlPlane) => controlPlane.health()))
      )
    ),
    getRun: (runId) =>
      mapClientError(
        `Failed to load run "${runId}".`,
        Effect.scoped(
          makeRepoMemoryHttpClientDefault({
            baseUrl: config.baseUrl,
          }).pipe(
            Effect.flatMap((controlPlane) =>
              controlPlane.getRun({
                params: {
                  runId,
                },
              })
            )
          )
        )
      ),
    interruptRun: (request) =>
      mapClientError(
        `Failed to interrupt run "${request.runId}".`,
        Effect.scoped(
          makeRepoMemoryRpcClient({
            baseUrl: config.baseUrl,
          }).pipe(Effect.flatMap((rpc) => rpc.InterruptRepoRun(request)))
        )
      ),
    listRepos: mapClientError(
      "Failed to list repos.",
      Effect.scoped(
        makeRepoMemoryHttpClientDefault({
          baseUrl: config.baseUrl,
        }).pipe(Effect.flatMap((controlPlane) => controlPlane.listRepos()))
      )
    ),
    listRuns: mapClientError(
      "Failed to list runs.",
      Effect.scoped(
        makeRepoMemoryHttpClientDefault({
          baseUrl: config.baseUrl,
        }).pipe(Effect.flatMap((controlPlane) => controlPlane.listRuns()))
      )
    ),
    registerRepo: (input) =>
      mapClientError(
        `Failed to register repo "${input.repoPath}".`,
        Effect.scoped(
          makeRepoMemoryHttpClientDefault({
            baseUrl: config.baseUrl,
          }).pipe(
            Effect.flatMap((controlPlane) =>
              controlPlane.registerRepo({
                payload: input,
              })
            )
          )
        )
      ),
    resumeRun: (request) =>
      mapClientError(
        `Failed to resume run "${request.runId}".`,
        Effect.scoped(
          makeRepoMemoryRpcClient({
            baseUrl: config.baseUrl,
          }).pipe(Effect.flatMap((rpc) => rpc.ResumeRepoRun(request)))
        )
      ),
    startIndexRun: (payload) =>
      mapClientError(
        `Failed to start index run for repo "${payload.repoId}".`,
        Effect.scoped(
          makeRepoMemoryRpcClient({
            baseUrl: config.baseUrl,
          }).pipe(Effect.flatMap((rpc) => rpc.StartIndexRepoRun(payload)))
        )
      ),
    startQueryRun: (payload) =>
      mapClientError(
        `Failed to start query run for repo "${payload.repoId}".`,
        Effect.scoped(
          makeRepoMemoryRpcClient({
            baseUrl: config.baseUrl,
          }).pipe(Effect.flatMap((rpc) => rpc.StartQueryRepoRun(payload)))
        )
      ),
    streamRunEvents: (request) =>
      Stream.scoped(
        Stream.unwrap(
          makeRepoMemoryRpcClient({
            baseUrl: config.baseUrl,
          }).pipe(
            Effect.map((rpc) =>
              mapStreamClientError(`Failed to stream run events for "${request.runId}".`, rpc.StreamRunEvents(request))
            )
          )
        )
      ),
  } satisfies RepoMemoryClientShape)
);

/**
 * Layer providing the repo-memory client service.
 *
 * @example
 * ```ts
 * import { RepoMemoryClientConfig, RepoMemoryClientLive } from "@beep/repo-memory-client"
 *
 * const layer = RepoMemoryClientLive(
 *   new RepoMemoryClientConfig({
 *     baseUrl: "http://127.0.0.1:3000",
 *     sessionId: "session-1"
 *   })
 * )
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const RepoMemoryClientLive = (config: RepoMemoryClientConfig) =>
  Layer.effect(RepoMemoryClient, makeRepoMemoryClient(config).pipe(Effect.map(RepoMemoryClient.of)));
