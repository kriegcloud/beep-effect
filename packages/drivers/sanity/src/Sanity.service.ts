/**
 * Effect service for Sanity content API requests.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SanityId } from "@beep/identity";
import { Str } from "@beep/utils";
import { Config, Context, Effect, Layer, pipe, Redacted } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { FetchHttpClient } from "effect/unstable/http";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import { SanityConfigInput } from "./Sanity.config.ts";
import { SanityError } from "./Sanity.errors.ts";
import type { Redacted as RedactedType } from "effect";
import type * as HttpClientError from "effect/unstable/http/HttpClientError";
import type * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";

const $I = $SanityId.create("Sanity.service");

/**
 * Scalar JSON value accepted in Sanity query params.
 *
 * @example
 * ```ts
 * import { SanityQueryParamValue } from "@beep/sanity"
 * import * as S from "effect/Schema"
 *
 * const isQueryParamValue = S.is(SanityQueryParamValue)
 *
 * console.log(isQueryParamValue("home")) // true
 * console.log(isQueryParamValue({ slug: "home" })) // false
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SanityQueryParamValue = S.Union([S.Boolean, S.Finite, S.String]).pipe(
  $I.annoteSchema("SanityQueryParamValue", {
    description: "Scalar JSON value accepted in Sanity query params.",
  })
);

/**
 * Type for {@link SanityQueryParamValue}.
 *
 * @example
 * ```ts
 * import type { SanityQueryParamValue } from "@beep/sanity"
 *
 * const params = {
 *   draft: false,
 *   limit: 10,
 *   slug: "home"
 * } satisfies Record<string, SanityQueryParamValue>
 *
 * console.log(params.slug) // "home"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type SanityQueryParamValue = typeof SanityQueryParamValue.Type;

/**
 * Sanity GROQ query request.
 *
 * @example
 * ```ts
 * import { SanityQueryRequest } from "@beep/sanity"
 *
 * const request = SanityQueryRequest.make({
 *   params: { slug: "home" },
 *   query: "*[_type == 'page' && slug.current == $slug][0]"
 * })
 *
 * console.log(request.params?.slug) // "home"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SanityQueryRequest extends S.Class<SanityQueryRequest>($I`SanityQueryRequest`)(
  {
    params: S.optionalKey(S.Record(S.String, SanityQueryParamValue)),
    query: S.String,
  },
  $I.annote("SanityQueryRequest", {
    description: "Sanity GROQ query request.",
  })
) {}

/**
 * Sanity query response.
 *
 * @example
 * ```ts
 * import { SanityQueryResponse } from "@beep/sanity"
 *
 * const response = SanityQueryResponse.make({
 *   ms: 7,
 *   result: { title: "Home" }
 * })
 *
 * console.log(response.ms) // 7
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SanityQueryResponse extends S.Class<SanityQueryResponse>($I`SanityQueryResponse`)(
  {
    ms: S.optionalKey(S.Finite),
    result: S.Unknown,
  },
  $I.annote("SanityQueryResponse", {
    description: "Sanity query response containing the raw result payload.",
  })
) {}

/**
 * Public Sanity service shape.
 *
 * @example
 * ```ts
 * import { SanityQueryResponse, type SanityShape } from "@beep/sanity"
 * import { Effect } from "effect"
 *
 * const service: SanityShape = {
 *   fetch: () => Effect.succeed(SanityQueryResponse.make({ result: [] }))
 * }
 *
 * const program = service.fetch({ query: "*[]" })
 *
 * console.log(Effect.runSync(program).result) // []
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export type SanityShape = {
  readonly fetch: (request: SanityQueryRequest) => Effect.Effect<SanityQueryResponse, SanityError>;
};

class ResolvedSanityConfig extends S.Class<ResolvedSanityConfig>($I`ResolvedSanityConfig`)(
  {
    apiHost: S.String,
    apiToken: S.String.pipe(S.Redacted, S.Option),
    apiVersion: S.String,
    dataset: S.String,
    headers: S.Record(S.String, S.String),
    projectId: S.String,
  },
  $I.annote("ResolvedSanityConfig", {
    description: "Resolved runtime configuration for the Sanity service.",
  })
) {}

const normalizeBaseUrl = Str.replace(/\/+$/, "");
const decodeQueryRequest = S.decodeUnknownEffect(SanityQueryRequest);
const decodeQueryResponse = S.decodeUnknownEffect(SanityQueryResponse);

const resolveConfig = Effect.fn("Sanity.resolveConfig")(function* (
  input: SanityConfigInput
): Effect.fn.Return<ResolvedSanityConfig, SanityError> {
  const projectId = yield* pipe(
    O.fromNullishOr(input.projectId),
    O.match({
      onNone: () => Effect.fail(SanityError.fromReason("config")),
      onSome: Effect.succeed,
    })
  );
  const dataset = yield* pipe(
    O.fromNullishOr(input.dataset),
    O.match({
      onNone: () => Effect.fail(SanityError.fromReason("config")),
      onSome: Effect.succeed,
    })
  );

  return ResolvedSanityConfig.make({
    apiHost: normalizeBaseUrl(input.apiHost ?? "https://api.sanity.io"),
    apiToken: O.fromUndefinedOr(input.apiToken),
    apiVersion: input.apiVersion,
    dataset,
    headers: input.headers ?? {},
    projectId,
  });
});

const queryUrl = (config: ResolvedSanityConfig): string =>
  `${projectScopedApiHost(config)}/v${config.apiVersion}/data/query/${config.dataset}`;

const projectScopedApiHost = (config: ResolvedSanityConfig): string => {
  if (config.apiHost === "https://api.sanity.io") {
    return `https://${config.projectId}.api.sanity.io`;
  }

  if (config.apiHost === "https://apicdn.sanity.io") {
    return `https://${config.projectId}.apicdn.sanity.io`;
  }

  return config.apiHost;
};

const addHeaders: {
  (request: HttpClientRequest.HttpClientRequest, config: ResolvedSanityConfig): HttpClientRequest.HttpClientRequest;
  (config: ResolvedSanityConfig): (request: HttpClientRequest.HttpClientRequest) => HttpClientRequest.HttpClientRequest;
} = dual(
  2,
  (request: HttpClientRequest.HttpClientRequest, config: ResolvedSanityConfig): HttpClientRequest.HttpClientRequest =>
    pipe(
      request,
      HttpClientRequest.accept("application/json"),
      HttpClientRequest.setHeaders(config.headers),
      (current) =>
        pipe(
          config.apiToken,
          O.match({
            onNone: () => current,
            onSome: (token: RedactedType.Redacted) => HttpClientRequest.bearerToken(current, token),
          })
        )
    )
);

const makeRequest = Effect.fn("Sanity.makeRequest")(function* (
  config: ResolvedSanityConfig,
  request: SanityQueryRequest
) {
  const decoded = yield* pipe(
    decodeQueryRequest(request),
    Effect.mapError((cause) => SanityError.fromReason("request encoding", { cause }))
  );
  const url = queryUrl(config);

  return yield* pipe(
    HttpClientRequest.post(url),
    addHeaders(config),
    (base) =>
      HttpClientRequest.bodyJson(base, {
        query: decoded.query,
        params: decoded.params ?? {},
      }),
    Effect.mapError((cause) =>
      SanityError.fromReason("request encoding", {
        cause,
        url,
      })
    )
  );
});

const ensureSuccess = Effect.fnUntraced(function* (
  url: string,
  response: HttpClientResponse.HttpClientResponse
): Effect.fn.Return<HttpClientResponse.HttpClientResponse, SanityError> {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  return yield* SanityError.fromReason("response status", {
    status: response.status,
    url,
  });
});

const decodeResponse = Effect.fnUntraced(
  function* (
    _url: string,
    response: HttpClientResponse.HttpClientResponse
  ): Effect.fn.Return<SanityQueryResponse, HttpClientError.HttpClientError | S.SchemaError> {
    const body = yield* response.json;

    return yield* decodeQueryResponse(body);
  },
  (effect, url) =>
    effect.pipe(
      Effect.mapError((cause) =>
        SanityError.fromReason("response decoding", {
          cause,
          url,
        })
      )
    )
);

const makeService = (client: HttpClient.HttpClient, config: ResolvedSanityConfig): SanityShape => ({
  fetch: Effect.fn("Sanity.fetch")(function* (request) {
    const httpRequest = yield* makeRequest(config, request);
    const url = queryUrl(config);
    const response = yield* client.execute(httpRequest).pipe(
      Effect.mapError((cause) =>
        SanityError.fromReason("transport", {
          cause,
          url,
        })
      )
    );
    const success = yield* ensureSuccess(url, response);
    return yield* decodeResponse(url, success);
  }),
});

/**
 * Effect service for Sanity content API requests.
 *
 * @example
 * ```ts
 * import { Sanity, SanityConfigInput, SanityQueryRequest } from "@beep/sanity"
 * import { Effect, Layer } from "effect"
 * import { FetchHttpClient } from "effect/unstable/http"
 *
 * const layer = Sanity.makeLayer(
 *   SanityConfigInput.make({
 *     dataset: "production",
 *     projectId: "content-project"
 *   })
 * ).pipe(Layer.provide(FetchHttpClient.layer))
 *
 * const program = Effect.gen(function* () {
 *   const sanity = yield* Sanity
 *   return yield* sanity.fetch(SanityQueryRequest.make({ query: "*[]" }))
 * }).pipe(Effect.provide(layer))
 *
 * console.log(Effect.isEffect(program)) // true
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class Sanity extends Context.Service<Sanity, SanityShape>()($I`Sanity`) {
  /**
   * Build a Sanity layer from explicit runtime configuration.
   *
   * @example
   * ```ts
   * import { Sanity, SanityConfigInput } from "@beep/sanity"
   * import { Layer } from "effect"
   * import { FetchHttpClient } from "effect/unstable/http"
   *
   * const layer = Sanity.makeLayer(
   *   SanityConfigInput.make({
   *     dataset: "production",
   *     projectId: "content-project"
   *   })
   * ).pipe(Layer.provide(FetchHttpClient.layer))
   *
   * console.log(Layer.isLayer(layer)) // true
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeLayer = (config: SanityConfigInput): Layer.Layer<Sanity, SanityError, HttpClient.HttpClient> =>
    Layer.effect(
      Sanity,
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        const resolved = yield* resolveConfig(config);
        return Sanity.of(makeService(client, resolved));
      })
    );

  /**
   * Live Sanity layer backed by ambient Effect Config values.
   *
   * @example
   * ```ts
   * import { Sanity } from "@beep/sanity"
   * import { Layer } from "effect"
   *
   * console.log(Layer.isLayer(Sanity.layer)) // true
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly layer: Layer.Layer<Sanity, SanityError> = Layer.effect(
    Sanity,
    Effect.gen(function* () {
      const projectId = yield* Config.string("SANITY_PROJECT_ID").pipe(Config.option);
      const dataset = yield* Config.string("SANITY_DATASET").pipe(Config.option);
      const apiVersion = yield* Config.string("SANITY_API_VERSION").pipe(Config.option);
      const apiToken = yield* Config.redacted("SANITY_API_TOKEN").pipe(Config.option);
      const apiHost = yield* Config.string("SANITY_API_HOST").pipe(Config.option);

      const client = yield* HttpClient.HttpClient;
      const resolved = yield* resolveConfig(
        SanityConfigInput.make(
          R.getSomes({
            apiHost,
            projectId,
            apiToken: apiToken.pipe(O.map(Redacted.value)),
            apiVersion,
            dataset,
          })
        )
      );

      return Sanity.of(makeService(client, resolved));
    }).pipe(Effect.mapError((cause) => SanityError.fromReason("config", { cause })))
  ).pipe(Layer.provide(FetchHttpClient.layer));
}
