import { $I as $RootId } from "@beep/identity/packages";
import { StatusCauseFields, TaggedErrorClass, UUID } from "@beep/schema";
import { Cause, Context, Effect, Layer, pipe } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import { HttpApiClient } from "effect/unstable/httpapi";
import type { SidecarBootstrap } from "@beep/runtime-protocol";
import { Vt2ControlPlaneApi, Vt2ControlPlaneErrorPayload } from "./protocol.js";
import type {
  CompleteVt2CaptureInput,
  CreateVt2SessionInput,
  ResolveVt2RecoveryCandidateInput,
  RunVt2CompositionInput,
  UpdateVt2DesktopPreferencesInput,
  Vt2DesktopPreferences,
  Vt2Session,
  Vt2SessionResource,
  Vt2WorkspaceSnapshot,
} from "./domain.js";

const $I = $RootId.create("V2T/client");
const controlPlanePrefix = "/api/v0";
const decodeSessionIdOption = S.decodeUnknownOption(UUID);

/**
 * Configuration for connecting to the local V2T sidecar.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2ClientConfig extends S.Class<Vt2ClientConfig>($I`Vt2ClientConfig`)(
  {
    baseUrl: S.String,
    sessionId: S.String,
  },
  $I.annote("Vt2ClientConfig", {
    description: "Client configuration for calling the local V2T control plane.",
  })
) {
  static readonly new: {
    (baseUrl: string, sessionId: string): Vt2ClientConfig;
    (sessionId: string): (baseUrl: string) => Vt2ClientConfig;
  } = dual(
    2,
    (baseUrl: string, sessionId: string) =>
      new Vt2ClientConfig({
        baseUrl,
        sessionId,
      })
  );
}

/**
 * Typed client error for V2T sidecar communication failures.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2ClientError extends TaggedErrorClass<Vt2ClientError>($I`Vt2ClientError`)(
  "Vt2ClientError",
  StatusCauseFields,
  $I.annote("Vt2ClientError", {
    description: "Typed client error for V2T control-plane communication failures.",
  })
) {
  static readonly fromCause: {
    (cause: unknown, fallback: string): Vt2ClientError;
    (fallback: string): (cause: unknown) => Vt2ClientError;
  } = dual(2, (cause: unknown, fallback: string): Vt2ClientError =>
    pipe(
      cause,
      O.liftPredicate(S.is(Vt2ClientError)),
      O.orElse(() =>
        pipe(
          cause,
          O.liftPredicate(S.is(Vt2ControlPlaneErrorPayload)),
          O.map(
            (payload) =>
              new Vt2ClientError({
                message: payload.message,
                status: payload.status,
                cause: O.none(),
              })
          )
        )
      ),
      O.getOrElse(
        () =>
          new Vt2ClientError({
            message: fallback,
            status: transportStatus(cause),
            cause: O.liftPredicate(P.isError)(cause),
          })
      )
    )
  );
}

/**
 * Service contract for the V2T control-plane client.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface Vt2ClientShape {
  readonly bootstrap: Effect.Effect<SidecarBootstrap, Vt2ClientError>;
  readonly completeCapture: (
    sessionId: string,
    input: CompleteVt2CaptureInput
  ) => Effect.Effect<Vt2SessionResource, Vt2ClientError>;
  readonly createSession: (input: CreateVt2SessionInput) => Effect.Effect<Vt2SessionResource, Vt2ClientError>;
  readonly getPreferences: Effect.Effect<Vt2DesktopPreferences, Vt2ClientError>;
  readonly getSession: (sessionId: string) => Effect.Effect<Vt2SessionResource, Vt2ClientError>;
  readonly getWorkspace: Effect.Effect<Vt2WorkspaceSnapshot, Vt2ClientError>;
  readonly listSessions: Effect.Effect<ReadonlyArray<Vt2Session>, Vt2ClientError>;
  readonly resolveRecoveryCandidate: (
    sessionId: string,
    candidateId: string,
    input: ResolveVt2RecoveryCandidateInput
  ) => Effect.Effect<Vt2SessionResource, Vt2ClientError>;
  readonly retryTranscript: (sessionId: string) => Effect.Effect<Vt2SessionResource, Vt2ClientError>;
  readonly runComposition: (
    sessionId: string,
    input: RunVt2CompositionInput
  ) => Effect.Effect<Vt2SessionResource, Vt2ClientError>;
  readonly savePreferences: (
    input: UpdateVt2DesktopPreferencesInput
  ) => Effect.Effect<Vt2DesktopPreferences, Vt2ClientError>;
  readonly startCapture: (sessionId: string) => Effect.Effect<Vt2SessionResource, Vt2ClientError>;
}

/**
 * Service tag for the V2T control-plane client.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class Vt2Client extends Context.Service<Vt2Client, Vt2ClientShape>()($I`Vt2Client`) {}

/**
 * Browser-friendly HTTP client type for the V2T control plane.
 *
 * @since 0.0.0
 * @category Integration
 */
export type Vt2ControlPlaneClient = Effect.Success<ReturnType<typeof makeVt2HttpClient>>;

type Vt2HttpClientServiceShape = {
  readonly client: Vt2ControlPlaneClient;
};

class Vt2HttpClientService extends Context.Service<Vt2HttpClientService, Vt2HttpClientServiceShape>()(
  $I`Vt2HttpClientService`
) {}

/**
 * Normalize a user-provided sidecar URL to the root server URL.
 *
 * @since 0.0.0
 * @category Utility
 */
export const normalizeVt2BaseUrl = (baseUrl: string | URL): string => {
  const trimmed = pipe(Str.trim(`${baseUrl}`), Str.replace(/\/+$/, ""));

  return Str.endsWith(controlPlanePrefix)(trimmed) ? Str.slice(0, -controlPlanePrefix.length)(trimmed) : trimmed;
};

/**
 * Options for creating a V2T HTTP client.
 *
 * @since 0.0.0
 * @category Integration
 */
export type Vt2HttpClientOptions = {
  readonly baseUrl: string | URL;
  readonly transformClient?: undefined | ((client: HttpClient.HttpClient) => HttpClient.HttpClient);
  readonly transformResponse?:
    | undefined
    | ((effect: Effect.Effect<unknown, unknown, unknown>) => Effect.Effect<unknown, unknown, unknown>);
};

/**
 * Construct the V2T control-plane HTTP client effect.
 *
 * @since 0.0.0
 * @category Integration
 */
export const makeVt2HttpClient = (options: Vt2HttpClientOptions) =>
  HttpApiClient.make(Vt2ControlPlaneApi, {
    baseUrl: normalizeVt2BaseUrl(options.baseUrl),
    ...(options.transformClient === undefined ? {} : { transformClient: options.transformClient }),
    ...(options.transformResponse === undefined ? {} : { transformResponse: options.transformResponse }),
  });

const Vt2HttpClientServiceLayer = (
  options: Vt2HttpClientOptions
): Layer.Layer<Vt2HttpClientService, never, HttpClient.HttpClient> =>
  Layer.effect(
    Vt2HttpClientService,
    makeVt2HttpClient(options).pipe(Effect.map((client) => Vt2HttpClientService.of({ client })))
  );

const Vt2HttpClientDefaultLayer = (options: Vt2HttpClientOptions): Layer.Layer<Vt2HttpClientService> =>
  Vt2HttpClientServiceLayer(options).pipe(Layer.provide(FetchHttpClient.layer));

/**
 * Construct the V2T control-plane HTTP client with the default fetch implementation.
 *
 * @since 0.0.0
 * @category Integration
 */
export const makeVt2HttpClientDefault = (options: Vt2HttpClientOptions): Effect.Effect<Vt2ControlPlaneClient> =>
  Effect.scoped(
    Layer.build(Vt2HttpClientDefaultLayer(options)).pipe(
      Effect.map((context) => Context.get(context, Vt2HttpClientService).client)
    )
  );

const transportStatus = (cause: unknown): number =>
  HttpClientError.isHttpClientError(cause) && cause.response !== undefined ? cause.response.status : 500;

const mapClientError = <A, E>(fallback: string, effect: Effect.Effect<A, E>) =>
  effect.pipe(Effect.catchCause((cause) => pipe(Cause.squash(cause), Vt2ClientError.fromCause(fallback), Effect.fail)));

const decodeSessionId = (sessionId: string): Effect.Effect<UUID, Vt2ClientError> =>
  pipe(
    decodeSessionIdOption(sessionId),
    O.match({
      onNone: () =>
        Effect.fail(
          new Vt2ClientError({
            message: `Invalid V2T session id "${sessionId}".`,
            status: 400,
            cause: O.none(),
          })
        ),
      onSome: Effect.succeed,
    })
  );

const decodeSessionAndCandidateIds = (
  sessionId: string,
  candidateId: string
): Effect.Effect<
  {
    readonly sessionId: UUID;
    readonly candidateId: UUID;
  },
  Vt2ClientError
> =>
  Effect.all({
    sessionId: decodeSessionId(sessionId),
    candidateId: decodeSessionId(candidateId),
  });

/**
 * Create the full V2T client boundary over the public control plane.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
export const makeVt2Client = Effect.fn("Vt2Client.make")((config: Vt2ClientConfig) =>
  Effect.scoped(
    Effect.gen(function* () {
      const controlPlane = yield* makeVt2HttpClientDefault({
        baseUrl: config.baseUrl,
      });

      return {
        bootstrap: mapClientError("Failed to load the V2T sidecar bootstrap.", controlPlane.health()),
        completeCapture: (sessionId, input) =>
          Effect.flatMap(decodeSessionId(sessionId), (decodedSessionId) =>
            mapClientError(
              `Failed to complete the V2T capture for session "${sessionId}".`,
              controlPlane.completeCapture({
                params: { sessionId: decodedSessionId },
                payload: input,
              })
            )
          ),
        createSession: (input) =>
          mapClientError(
            `Failed to create the ${input.source} session "${input.title}".`,
            controlPlane.createSession({ payload: input })
          ),
        getPreferences: mapClientError("Failed to load the V2T desktop preferences.", controlPlane.getPreferences()),
        getSession: (sessionId) =>
          Effect.flatMap(decodeSessionId(sessionId), (decodedSessionId) =>
            mapClientError(
              `Failed to load the V2T session "${sessionId}".`,
              controlPlane.getSession({ params: { sessionId: decodedSessionId } })
            )
          ),
        getWorkspace: mapClientError("Failed to load the V2T workspace snapshot.", controlPlane.getWorkspace()),
        listSessions: mapClientError("Failed to list V2T sessions.", controlPlane.listSessions()),
        resolveRecoveryCandidate: (sessionId, candidateId, input) =>
          Effect.flatMap(decodeSessionAndCandidateIds(sessionId, candidateId), (decoded) =>
            mapClientError(
              `Failed to resolve the V2T recovery candidate "${candidateId}" for session "${sessionId}".`,
              controlPlane.resolveRecoveryCandidate({
                params: decoded,
                payload: input,
              })
            )
          ),
        retryTranscript: (sessionId) =>
          Effect.flatMap(decodeSessionId(sessionId), (decodedSessionId) =>
            mapClientError(
              `Failed to retry the V2T transcript flow for session "${sessionId}".`,
              controlPlane.retryTranscript({
                params: { sessionId: decodedSessionId },
              })
            )
          ),
        runComposition: (sessionId, input) =>
          Effect.flatMap(decodeSessionId(sessionId), (decodedSessionId) =>
            mapClientError(
              `Failed to run the V2T composition flow for session "${sessionId}".`,
              controlPlane.runComposition({
                params: { sessionId: decodedSessionId },
                payload: input,
              })
            )
          ),
        savePreferences: (input) =>
          mapClientError("Failed to save the V2T desktop preferences.", controlPlane.savePreferences({ payload: input })),
        startCapture: (sessionId) =>
          Effect.flatMap(decodeSessionId(sessionId), (decodedSessionId) =>
            mapClientError(
              `Failed to start the V2T capture for session "${sessionId}".`,
              controlPlane.startCapture({
                params: { sessionId: decodedSessionId },
              })
            )
          ),
      } satisfies Vt2ClientShape;
    })
  )
);
