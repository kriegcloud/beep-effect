/**
 * Effect service for the GovInfo REST API (keyed, official public-domain source).
 *
 * Sits on the hand-authored `Search` contract + value models and the assembled
 * {@link GovinfoApi}. Transport (api.data.gov `api_key` auth, rate-limit, retry)
 * is supplied by the shared transformer via `HttpApiClient.make`'s `transformClient`
 * seam; repeated identical searches are served from an operation-level
 * `Cache.make` keyed by the decoded payload (structural equality), so a repeat
 * round-trips zero times.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ApiAuth, makeApiTransport } from "@beep/api-transport";
import { $GovinfoId } from "@beep/identity";
import { O } from "@beep/utils";
import { Cache, Config, Context, Effect, Layer } from "effect";
import * as P from "effect/Predicate";
import { FetchHttpClient } from "effect/unstable/http";
import * as HttpApiClient from "effect/unstable/httpapi/HttpApiClient";
import * as RateLimiter from "effect/unstable/persistence/RateLimiter";
import { GovinfoApi } from "./domain/contracts/Api.ts";
import {
  GOVINFO_API_KEY_ENV,
  GOVINFO_API_KEY_PARAM,
  GOVINFO_API_URL,
  GOVINFO_CACHE_TTL,
  GOVINFO_RATE_LIMIT,
  GOVINFO_RATE_LIMIT_WINDOW,
  GovinfoConfigInput,
} from "./Govinfo.config.ts";
import { GovinfoError, GovinfoErrorOptions } from "./Govinfo.errors.ts";
import type { RateLimitSnapshot } from "@beep/api-transport";
import type * as Redacted from "effect/Redacted";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type * as Search from "./domain/contracts/Search/Search.contract.ts";

const $I = $GovinfoId.create("Govinfo.service");

/**
 * Public service shape for the GovInfo driver.
 *
 * @example
 * ```ts
 * import type { GovinfoShape } from "@beep/govinfo"
 *
 * type Search = GovinfoShape["search"]
 * console.log({} as { search: Search })
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface GovinfoShape {
  readonly rateLimit: Effect.Effect<O.Option<RateLimitSnapshot>>;
  readonly search: (payload: Search.Payload) => Effect.Effect<Search.Success, GovinfoError>;
}

interface ResolvedConfig {
  readonly apiKey: O.Option<Redacted.Redacted<string>>;
  readonly apiUrl: string;
}

const resolveConfig = (input: GovinfoConfigInput): ResolvedConfig => ({
  apiKey: O.fromUndefinedOr(input.apiKey),
  apiUrl: input.apiUrl ?? GOVINFO_API_URL,
});

const authFromKey = (apiKey: O.Option<Redacted.Redacted<string>>): ApiAuth =>
  O.match(apiKey, {
    onNone: () => ApiAuth.NoAuth(),
    onSome: (key) => ApiAuth.ApiKeyQueryAuth({ key, param: GOVINFO_API_KEY_PARAM }),
  });

const readStatus = (cause: unknown): number | undefined => {
  if (!P.isObject(cause)) return undefined;
  const status = (cause as { readonly status?: unknown }).status;
  return P.isNumber(status) ? status : undefined;
};

const mapClientError = (cause: unknown): GovinfoError => {
  const status = readStatus(cause);
  return status === undefined
    ? GovinfoError.of("transport", GovinfoErrorOptions.make({ cause }))
    : GovinfoError.of("response status", GovinfoErrorOptions.make({ cause, status }));
};

const makeFromResolved = Effect.fnUntraced(function* (config: ResolvedConfig) {
  const transport = yield* makeApiTransport({
    auth: authFromKey(config.apiKey),
    key: "govinfo",
    rateLimit: { limit: GOVINFO_RATE_LIMIT, window: GOVINFO_RATE_LIMIT_WINDOW },
  });

  const client = yield* HttpApiClient.make(GovinfoApi, {
    baseUrl: config.apiUrl,
    transformClient: transport.transformClient,
  });

  const cache = yield* Cache.make<Search.Payload, Search.Success, GovinfoError>({
    capacity: 256,
    lookup: (payload) => client.search({ payload }).pipe(Effect.mapError(mapClientError)),
    timeToLive: GOVINFO_CACHE_TTL,
  });

  return Govinfo.of({
    rateLimit: transport.rateLimit,
    search: Effect.fn("Govinfo.search")(function* (payload: Search.Payload) {
      return yield* Cache.get(cache, payload);
    }),
  });
});

const makeFromEnvironment = Effect.fnUntraced(function* () {
  const apiKey = yield* Config.redacted(GOVINFO_API_KEY_ENV).pipe(Config.option);
  const apiUrl = yield* Config.string("GOVINFO_API_URL").pipe(Config.withDefault(GOVINFO_API_URL));
  return yield* makeFromResolved({ apiKey, apiUrl });
});

/**
 * Effect service for the keyed GovInfo REST API search operation.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Govinfo } from "@beep/govinfo"
 *
 * const program = Effect.gen(function* () {
 *   const govinfo = yield* Govinfo
 *   return yield* govinfo.rateLimit
 * })
 *
 * void program
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class Govinfo extends Context.Service<Govinfo, GovinfoShape>()($I`Govinfo`) {
  /**
   * Build a GovInfo layer from explicit runtime configuration.
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeLayer = (
    config = GovinfoConfigInput.make({})
  ): Layer.Layer<Govinfo, never, HttpClient.HttpClient | RateLimiter.RateLimiterStore> =>
    Layer.effect(Govinfo, makeFromResolved(resolveConfig(config)));

  /**
   * Live GovInfo layer backed by `GOVINFO_API_KEY` / `GOVINFO_API_URL`, an
   * in-memory rate-limiter store, and the platform `fetch` client.
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly layer: Layer.Layer<Govinfo, GovinfoError> = Layer.effect(
    Govinfo,
    makeFromEnvironment().pipe(Effect.mapError(GovinfoError.config))
  ).pipe(Layer.provide(FetchHttpClient.layer), Layer.provide(RateLimiter.layerStoreMemory));
}
