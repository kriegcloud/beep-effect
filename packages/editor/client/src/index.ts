/**
 * Typed client boundary for the local editor sidecar runtime.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

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
import { Slug, StatusCauseTaggedErrorClass } from "@beep/schema";
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
 * @example
 * ```ts
 * import { EditorClientConfig } from "@beep/editor-client"
 *
 * const config = new EditorClientConfig({
 *   baseUrl: "http://127.0.0.1:8789",
 *   sessionId: "editor-session",
 * })
 * void config
 * ```
 *
 * @category models
 * @since 0.0.0
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
 * @example
 * ```ts
 * import { EditorClientError } from "@beep/editor-client"
 *
 * const error = EditorClientError.noCause("Editor sidecar unavailable.", 500)
 * void error
 * ```
 *
 * @category error handling
 * @since 0.0.0
 */
export class EditorClientError extends StatusCauseTaggedErrorClass<EditorClientError>($I`EditorClientError`)(
  "EditorClientError",
  $I.annote("EditorClientError", {
    description: "Typed client error for local editor sidecar communication failures.",
  })
) {}

/**
 * Service contract for the editor sidecar client boundary.
 *
 * @example
 * ```ts
 * import type { EditorClientShape } from "@beep/editor-client"
 *
 * const useClient = (client: EditorClientShape) => client.listPages
 * void useClient
 * ```
 *
 * @category models
 * @since 0.0.0
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
 * @example
 * ```ts
 * import { EditorClient } from "@beep/editor-client"
 *
 * const tag = EditorClient
 * void tag
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class EditorClient extends Context.Service<EditorClient, EditorClientShape>()($I`EditorClient`) {}

/**
 * Browser-friendly HTTP client type for the editor control plane.
 *
 * @example
 * ```ts
 * import type { EditorControlPlaneClient } from "@beep/editor-client"
 *
 * const useClient = (client: EditorControlPlaneClient) => client.health()
 * void useClient
 * ```
 *
 * @category models
 * @since 0.0.0
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
 * @param baseUrl - The user-provided sidecar URL or API root.
 * @returns The normalized sidecar server URL without the control-plane prefix.
 *
 * @example
 * ```ts
 * import { normalizeSidecarBaseUrl } from "@beep/editor-client"
 *
 * const url = normalizeSidecarBaseUrl("http://127.0.0.1:8789/api/v0")
 * void url
 * ```
 *
 * @category utilities
 * @since 0.0.0
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
 * @example
 * ```ts
 * import type { EditorHttpClientOptions } from "@beep/editor-client"
 *
 * const options: EditorHttpClientOptions = {
 *   baseUrl: "http://127.0.0.1:8789",
 * }
 * void options
 * ```
 *
 * @category models
 * @since 0.0.0
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
 * @param options - Client construction options for the editor control plane.
 * @returns An Effect that resolves with the typed control-plane client.
 *
 * @example
 * ```ts
 * import { makeEditorHttpClient } from "@beep/editor-client"
 *
 * const client = makeEditorHttpClient({
 *   baseUrl: "http://127.0.0.1:8789",
 * })
 * void client
 * ```
 *
 * @category constructors
 * @since 0.0.0
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
 * @param options - Client construction options for the editor control plane.
 * @returns A scoped Effect that resolves with the typed control-plane client.
 *
 * @example
 * ```ts
 * import { makeEditorHttpClientDefault } from "@beep/editor-client"
 *
 * const client = makeEditorHttpClientDefault({
 *   baseUrl: "http://127.0.0.1:8789",
 * })
 * void client
 * ```
 *
 * @category constructors
 * @since 0.0.0
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
      ? EditorClientError.noCause(cause.message, cause.status)
      : EditorClientError.new(P.isError(cause) ? cause : undefined, fallback, transportStatus(cause));

const mapClientError = <A, E>(fallback: string, effect: Effect.Effect<A, E>) =>
  effect.pipe(Effect.catchCause((cause) => Effect.fail(toClientError(fallback, Cause.squash(cause)))));

const decodeSlugEffect = (slug: string): Effect.Effect<Slug, EditorClientError> =>
  pipe(
    decodeSlugOption(slug),
    O.match({
      onNone: () => Effect.fail(EditorClientError.noCause(`Invalid page slug "${slug}".`, 400)),
      onSome: Effect.succeed,
    })
  );

/**
 * Create the full editor client boundary over the public sidecar protocol.
 *
 * @param config - Connection details for the local editor sidecar.
 * @returns An Effect that resolves with the typed editor client boundary.
 *
 * @example
 * ```ts
 * import { EditorClientConfig, makeEditorClient } from "@beep/editor-client"
 *
 * const client = makeEditorClient(
 *   new EditorClientConfig({
 *     baseUrl: "http://127.0.0.1:8789",
 *     sessionId: "editor-session",
 *   })
 * )
 * void client
 * ```
 *
 * @category constructors
 * @since 0.0.0
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
            Effect.flatMap(
              Effect.fnUntraced(function* (decodedSlug) {
                return yield* withControlPlane(`Failed to load page "${slug}".`, (client) =>
                  client.getPage({
                    params: {
                      slug: decodedSlug,
                    },
                  })
                );
              })
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
            Effect.flatMap(
              Effect.fnUntraced(function* (decodedSlug) {
                return yield* withControlPlane(`Failed to export page "${slug}" as "${format}".`, (client) =>
                  client.exportPage({
                    params: {
                      slug: decodedSlug,
                      format,
                    },
                  })
                );
              })
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
 * @param config - Connection details for the local editor sidecar.
 * @returns A Layer that provides the editor client service.
 *
 * @example
 * ```ts
 * import { EditorClientConfig, EditorClientLive } from "@beep/editor-client"
 *
 * const layer = EditorClientLive(
 *   new EditorClientConfig({
 *     baseUrl: "http://127.0.0.1:8789",
 *     sessionId: "editor-session",
 *   })
 * )
 * void layer
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const EditorClientLive = (config: EditorClientConfig) =>
  Layer.effect(EditorClient, makeEditorClient(config).pipe(Effect.map(EditorClient.of)));
