import {
  EditorControlPlaneApi,
  EditorControlPlaneErrorPayload,
  type EditorPageResource,
  type EditorWorkspaceSnapshot,
  type ExportFormat,
  type PageDocument,
  type PageExport,
  type PageSummary,
  type SidecarBootstrap,
} from "@beep/editor-protocol";
import { $EditorClientId } from "@beep/identity/packages";
import { Slug, StatusCauseFields, TaggedErrorClass } from "@beep/schema";
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

const $I = $EditorClientId.create("index");
const controlPlanePrefix = "/api/v0";
const decodeSlugOption = S.decodeUnknownOption(Slug);

/**
 * Configuration for connecting to the local editor sidecar.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class EditorClientConfig extends S.Class<EditorClientConfig>($I`EditorClientConfig`)(
  {
    baseUrl: S.String,
    sessionId: S.String,
  },
  $I.annote("EditorClientConfig", {
    description: "Client configuration for calling the local editor sidecar.",
  })
) {
  static readonly new: {
    (baseUrl: string, sessionId: string): EditorClientConfig;
    (sessionId: string): (baseUrl: string) => EditorClientConfig;
  } = dual(
    2,
    (baseUrl: string, sessionId: string) =>
      new EditorClientConfig({
        baseUrl,
        sessionId,
      })
  );
}

/**
 * Typed client error for editor sidecar communication failures.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class EditorClientError extends TaggedErrorClass<EditorClientError>($I`EditorClientError`)(
  "EditorClientError",
  StatusCauseFields,
  $I.annote("EditorClientError", {
    description: "Typed client error for local editor sidecar communication failures.",
  })
) {}

/**
 * Service contract for the editor sidecar client boundary.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface EditorClientShape {
  readonly bootstrap: Effect.Effect<SidecarBootstrap, EditorClientError>;
  readonly exportPage: (slug: string, format: ExportFormat) => Effect.Effect<PageExport, EditorClientError>;
  readonly getPage: (slug: string) => Effect.Effect<EditorPageResource, EditorClientError>;
  readonly getWorkspace: Effect.Effect<EditorWorkspaceSnapshot, EditorClientError>;
  readonly listPages: Effect.Effect<ReadonlyArray<PageSummary>, EditorClientError>;
  readonly savePage: (page: PageDocument) => Effect.Effect<EditorPageResource, EditorClientError>;
  readonly searchPages: (query: string) => Effect.Effect<ReadonlyArray<PageSummary>, EditorClientError>;
}

/**
 * Service tag for the editor sidecar client.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class EditorClient extends Context.Service<EditorClient, EditorClientShape>()($I`EditorClient`) {}

/**
 * Browser-friendly HTTP client type for the editor control plane.
 *
 * @since 0.0.0
 * @category Integration
 */
export type EditorControlPlaneClient = Effect.Success<ReturnType<typeof makeEditorHttpClient>>;

type EditorHttpClientServiceShape = {
  readonly client: EditorControlPlaneClient;
};

class EditorHttpClientService extends Context.Service<EditorHttpClientService, EditorHttpClientServiceShape>()(
  $I`EditorHttpClientService`
) {}

/**
 * Normalize a user-provided sidecar URL to the root server URL.
 *
 * @param baseUrl {string | URL} - The user-provided sidecar URL or API root.
 * @returns {string} - The normalized sidecar server URL without the control-plane prefix.
 *
 * @since 0.0.0
 * @category Utility
 */
export const normalizeSidecarBaseUrl = (baseUrl: string | URL): string => {
  const trimmed = pipe(Str.trim(`${baseUrl}`), Str.replace(/\/+$/, ""));

  if (Str.endsWith(controlPlanePrefix)(trimmed)) {
    return Str.slice(0, -controlPlanePrefix.length)(trimmed);
  }

  return trimmed;
};

/**
 * Options for creating an editor HTTP client.
 *
 * @since 0.0.0
 * @category Integration
 */
export type EditorHttpClientOptions = {
  readonly baseUrl: string | URL;
  readonly transformClient?: undefined | ((client: HttpClient.HttpClient) => HttpClient.HttpClient);
  readonly transformResponse?:
    | ((effect: Effect.Effect<unknown, unknown, unknown>) => Effect.Effect<unknown, unknown, unknown>)
    | undefined;
};

/**
 * Construct the editor control-plane HTTP client effect.
 *
 * @param options {EditorHttpClientOptions} - Client construction options for the editor control plane.
 * @returns {Effect.Effect<EditorControlPlaneClient, never, HttpClient.HttpClient>} - An Effect that resolves with the typed control-plane client.
 *
 * @since 0.0.0
 * @category Integration
 */
export const makeEditorHttpClient = (options: EditorHttpClientOptions) =>
  HttpApiClient.make(EditorControlPlaneApi, {
    baseUrl: normalizeSidecarBaseUrl(options.baseUrl),
    ...(options.transformClient === undefined ? {} : { transformClient: options.transformClient }),
    ...(options.transformResponse === undefined ? {} : { transformResponse: options.transformResponse }),
  });

const EditorHttpClientServiceLayer = (
  options: EditorHttpClientOptions
): Layer.Layer<EditorHttpClientService, never, HttpClient.HttpClient> =>
  Layer.effect(
    EditorHttpClientService,
    makeEditorHttpClient(options).pipe(Effect.map((client) => EditorHttpClientService.of({ client })))
  );

const EditorHttpClientDefaultLayer = (options: EditorHttpClientOptions): Layer.Layer<EditorHttpClientService> =>
  EditorHttpClientServiceLayer(options).pipe(Layer.provide(FetchHttpClient.layer));

/**
 * Construct the editor control-plane HTTP client with the default fetch implementation.
 *
 * @param options {EditorHttpClientOptions} - Client construction options for the editor control plane.
 * @returns {Effect.Effect<EditorControlPlaneClient>} - A scoped Effect that resolves with the typed control-plane client.
 *
 * @since 0.0.0
 * @category Integration
 */
export const makeEditorHttpClientDefault = (
  options: EditorHttpClientOptions
): Effect.Effect<EditorControlPlaneClient> =>
  Effect.scoped(
    Layer.build(EditorHttpClientDefaultLayer(options)).pipe(
      Effect.map((context) => Context.get(context, EditorHttpClientService).client)
    )
  );

const transportStatus = (cause: unknown): number =>
  HttpClientError.isHttpClientError(cause) && cause.response !== undefined ? cause.response.status : 500;

const toClientError = (fallback: string, cause: unknown): EditorClientError =>
  S.is(EditorClientError)(cause)
    ? cause
    : S.is(EditorControlPlaneErrorPayload)(cause)
      ? new EditorClientError({
          message: cause.message,
          status: cause.status,
          cause: O.none(),
        })
      : new EditorClientError({
          message: fallback,
          status: transportStatus(cause),
          cause: O.fromUndefinedOr(P.isError(cause) ? cause : undefined),
        });

const mapClientError = <A, E>(fallback: string, effect: Effect.Effect<A, E>) =>
  effect.pipe(Effect.catchCause((cause) => Effect.fail(toClientError(fallback, Cause.squash(cause)))));

const decodeSlugEffect = (slug: string): Effect.Effect<Slug, EditorClientError> =>
  pipe(
    decodeSlugOption(slug),
    O.match({
      onNone: () =>
        Effect.fail(
          new EditorClientError({
            message: `Invalid page slug "${slug}".`,
            status: 400,
            cause: O.none(),
          })
        ),
      onSome: Effect.succeed,
    })
  );

/**
 * Create the full editor client boundary over the public sidecar protocol.
 *
 * @param config {EditorClientConfig} - Connection details for the local editor sidecar.
 * @returns {Effect.Effect<EditorClientShape, never>} - An Effect that resolves with the typed editor client boundary.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
export const makeEditorClient = Effect.fn("EditorClient.make")((config: EditorClientConfig) =>
  Effect.scoped(
    Effect.gen(function* () {
      const controlPlane = yield* makeEditorHttpClientDefault({
        baseUrl: config.baseUrl,
      });
      const withControlPlane = <A, E>(
        fallback: string,
        run: (controlPlane: EditorControlPlaneClient) => Effect.Effect<A, E, never>
      ) => mapClientError(fallback, run(controlPlane));

      return {
        bootstrap: withControlPlane("Failed to load editor sidecar bootstrap.", (client) => client.health()),
        getWorkspace: withControlPlane("Failed to load workspace snapshot.", (client) => client.getWorkspace()),
        listPages: withControlPlane("Failed to list pages.", (client) => client.listPages()),
        getPage: (slug) =>
          pipe(
            decodeSlugEffect(slug),
            Effect.flatMap((decodedSlug) =>
              withControlPlane(`Failed to load page "${slug}".`, (client) =>
                client.getPage({
                  params: {
                    slug: decodedSlug,
                  },
                })
              )
            )
          ),
        savePage: (page) =>
          withControlPlane(`Failed to save page "${page.slug}".`, (client) =>
            client.savePage({
              params: {
                slug: page.slug,
              },
              payload: page,
            })
          ),
        exportPage: (slug, format) =>
          pipe(
            decodeSlugEffect(slug),
            Effect.flatMap((decodedSlug) =>
              withControlPlane(`Failed to export page "${slug}" as "${format}".`, (client) =>
                client.exportPage({
                  params: {
                    slug: decodedSlug,
                    format,
                  },
                })
              )
            )
          ),
        searchPages: (query) =>
          withControlPlane(`Failed to search pages for "${query}".`, (client) =>
            client.searchPages({
              query: {
                query,
              },
            })
          ),
      } satisfies EditorClientShape;
    })
  )
);

/**
 * Layer providing the editor sidecar client service.
 *
 * @param config {EditorClientConfig} - Connection details for the local editor sidecar.
 * @returns {Layer.Layer<EditorClient, never, never>} - A Layer that provides the editor client service.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const EditorClientLive = (config: EditorClientConfig) =>
  Layer.effect(EditorClient, makeEditorClient(config).pipe(Effect.map(EditorClient.of)));
