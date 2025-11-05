import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as A from "effect/Array";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

export const ICONIFY_DEFAULT_BASE_URL = "https://api.iconify.design" as const;

const ICONIFY_BASE_URL_ENV = "ICONIFY_API_BASE_URL" as const;
const ICONIFY_MAX_RETRIES_ENV = "ICONIFY_API_MAX_RETRIES" as const;
const ICONIFY_RETRY_INITIAL_DELAY_MS_ENV = "ICONIFY_API_RETRY_INITIAL_DELAY_MS" as const;
const ICONIFY_RETRY_MAX_DELAY_MS_ENV = "ICONIFY_API_RETRY_MAX_DELAY_MS" as const;

const DEFAULT_MAX_RETRIES = 3 as const;
const DEFAULT_RETRY_INITIAL_DELAY_MS = 200 as const;
const DEFAULT_RETRY_MAX_DELAY_MS = 2_000 as const;

export interface IconifyClientConfig {
  readonly baseUrl: string;
  readonly maxRetries: number;
  readonly initialRetryDelayMillis: number;
  readonly maxRetryDelayMillis: number;
}

export const IconifyClientConfigTag = Context.GenericTag<IconifyClientConfig>(
  "@beep/repo-scripts/iconify/IconifyClientConfig"
);

export const IconifyClientConfigLive = Layer.effect(
  IconifyClientConfigTag,
  Effect.gen(function* () {
    const baseUrl = yield* Config.string(ICONIFY_BASE_URL_ENV).pipe(Config.withDefault(ICONIFY_DEFAULT_BASE_URL));
    const maxRetries = yield* Config.integer(ICONIFY_MAX_RETRIES_ENV).pipe(Config.withDefault(DEFAULT_MAX_RETRIES));
    const initialRetryDelayMillisRaw = yield* Config.integer(ICONIFY_RETRY_INITIAL_DELAY_MS_ENV).pipe(
      Config.withDefault(DEFAULT_RETRY_INITIAL_DELAY_MS)
    );
    const maxRetryDelayMillisRaw = yield* Config.integer(ICONIFY_RETRY_MAX_DELAY_MS_ENV).pipe(
      Config.withDefault(DEFAULT_RETRY_MAX_DELAY_MS)
    );

    const initialRetryDelayMillis = Math.max(50, initialRetryDelayMillisRaw);
    const maxRetryDelayMillis = Math.max(initialRetryDelayMillis, maxRetryDelayMillisRaw);

    return {
      baseUrl,
      maxRetries: Math.max(0, maxRetries),
      initialRetryDelayMillis,
      maxRetryDelayMillis,
    } satisfies IconifyClientConfig;
  }).pipe(Effect.orDie)
);

export class IconifyClientError extends S.TaggedError<IconifyClientError>("IconifyClientError")("IconifyClientError", {
  message: S.String,
  method: S.String,
  url: S.String,
  status: S.optional(S.Number),
  retryAfterMillis: S.optional(S.Number),
  attempt: S.optional(S.Number),
  cause: S.optional(S.Unknown),
}) {}

export interface IconifyRequest {
  readonly path: string;
  readonly method?: string | undefined;
  readonly searchParams?: ReadonlyArray<readonly [string, string]> | undefined;
  readonly headers?: ReadonlyArray<readonly [string, string]> | undefined;
  readonly body?: BodyInit | null | undefined;
  readonly signal?: AbortSignal | null | undefined;
}

export interface IconifyClientService {
  readonly config: IconifyClientConfig;
  readonly request: (request: IconifyRequest) => Effect.Effect<Response, IconifyClientError>;
  readonly requestJson: (request: IconifyRequest) => Effect.Effect<unknown, IconifyClientError>;
  readonly requestText: (request: IconifyRequest) => Effect.Effect<string, IconifyClientError>;
}

export const IconifyClient = Context.GenericTag<IconifyClientService>("@beep/repo-scripts/iconify/IconifyClient");

const ensureHeader = (
  headers: ReadonlyArray<readonly [string, string]>,
  key: string,
  value: string
): ReadonlyArray<readonly [string, string]> => {
  const lowerKey = F.pipe(key, Str.toLowerCase);
  const hasHeader = F.pipe(
    headers,
    A.findFirst(([candidate]) => F.pipe(candidate, Str.toLowerCase, (candidateLower) => candidateLower === lowerKey)),
    O.isSome
  );

  return hasHeader ? headers : A.append(headers, [key, value] as const);
};

const applySearchParams = (url: URL, searchParams: ReadonlyArray<readonly [string, string]> | undefined) => {
  if (searchParams === undefined) {
    return;
  }

  F.pipe(
    searchParams,
    A.forEach(([key, value]) => {
      url.searchParams.append(key, value);
    })
  );
};

const toHeadersInstance = (headers: ReadonlyArray<readonly [string, string]>) => {
  const headerInstance = new Headers();

  F.pipe(
    headers,
    A.forEach(([key, value]) => {
      headerInstance.set(key, value);
    })
  );

  return headerInstance;
};

const parseRetryAfterMillis = (raw: string): O.Option<number> => {
  const trimmed = F.pipe(raw, Str.trim);
  const numeric = Number.parseFloat(trimmed);

  if (Number.isFinite(numeric) && !Number.isNaN(numeric)) {
    return O.some(Math.max(0, Math.floor(numeric * 1_000)));
  }

  const timestamp = Date.parse(trimmed);
  if (!Number.isFinite(timestamp) || Number.isNaN(timestamp)) {
    return O.none();
  }

  const diff = Math.max(0, Math.floor(timestamp - Date.now()));
  return diff === 0 ? O.none() : O.some(diff);
};

const retryAfterFromResponse = (response: Response): O.Option<number> =>
  F.pipe(response.headers.get("Retry-After"), O.fromNullable, O.flatMap(parseRetryAfterMillis));

const backoffDelayMillis = (config: IconifyClientConfig, attempt: number) => {
  const exponent = 2 ** attempt;
  const candidate = config.initialRetryDelayMillis * exponent;
  return Math.min(config.maxRetryDelayMillis, Math.max(config.initialRetryDelayMillis, candidate));
};

const buildRequestInit = (request: IconifyRequest, headers: Headers): RequestInit => {
  const method = request.method ?? "GET";
  const init: RequestInit = {
    method,
    headers,
  };

  if (request.body !== undefined && request.body !== null && method !== "GET") {
    init.body = request.body;
  }

  if (request.signal !== undefined && request.signal !== null) {
    init.signal = request.signal;
  }

  return init;
};

export const IconifyClientLive = Layer.effect(
  IconifyClient,
  Effect.gen(function* () {
    const config = yield* IconifyClientConfigTag;
    const fetch = yield* FetchHttpClient.Fetch;

    const request = (input: IconifyRequest, attempt = 0): Effect.Effect<Response, IconifyClientError> =>
      Effect.gen(function* () {
        const url = new URL(input.path, config.baseUrl);
        applySearchParams(url, input.searchParams);

        const normalizedHeaders = ensureHeader(input.headers ?? [], "Accept", "application/json");
        const headersInstance = toHeadersInstance(normalizedHeaders);
        const init = buildRequestInit(input, headersInstance);

        const urlString = url.toString();
        const method = init.method ?? "GET";

        const response = yield* Effect.tryPromise({
          try: () => fetch(urlString, init),
          catch: (cause) =>
            new IconifyClientError({
              message: F.pipe("Failed to execute Iconify request to " as const, Str.concat(urlString)),
              method,
              url: urlString,
              attempt,
              cause,
            }),
        });

        if (response.status === 429 || response.status >= 500) {
          const retryAfterHeader = retryAfterFromResponse(response);

          if (attempt >= config.maxRetries) {
            return yield* Effect.fail(
              new IconifyClientError({
                message: F.pipe(
                  "Iconify request exhausted retry attempts (status " as const,
                  Str.concat(String(response.status)),
                  Str.concat(")")
                ),
                method,
                url: urlString,
                status: response.status,
                attempt,
                retryAfterMillis: O.getOrUndefined(retryAfterHeader),
              })
            );
          }

          const retryDelay = F.pipe(
            retryAfterHeader,
            O.getOrElse(() => backoffDelayMillis(config, attempt))
          );

          yield* Effect.sleep(Duration.millis(retryDelay));
          return yield* request(input, attempt + 1);
        }

        if (!response.ok) {
          return yield* Effect.fail(
            new IconifyClientError({
              message: F.pipe("Iconify request failed with status " as const, Str.concat(String(response.status))),
              method,
              url: urlString,
              status: response.status,
              attempt,
            })
          );
        }

        return response;
      });

    const requestJson = (input: IconifyRequest): Effect.Effect<unknown, IconifyClientError> =>
      F.pipe(
        request(input),
        Effect.flatMap((response) =>
          Effect.tryPromise({
            try: () => response.json() as Promise<unknown>,
            catch: (cause) =>
              new IconifyClientError({
                message: F.pipe("Failed to parse Iconify JSON response for " as const, Str.concat(response.url)),
                method: input.method ?? "GET",
                url: response.url,
                cause,
              }),
          })
        )
      );

    const requestText = (input: IconifyRequest): Effect.Effect<string, IconifyClientError> =>
      F.pipe(
        request({ ...input, headers: ensureHeader(input.headers ?? [], "Accept", "text/plain") }),
        Effect.flatMap((response) =>
          Effect.tryPromise({
            try: () => response.text(),
            catch: (cause) =>
              new IconifyClientError({
                message: F.pipe("Failed to parse Iconify text response for " as const, Str.concat(response.url)),
                method: input.method ?? "GET",
                url: response.url,
                cause,
              }),
          })
        )
      );

    return {
      config,
      request,
      requestJson,
      requestText,
    } satisfies IconifyClientService;
  })
).pipe(Layer.provide(Layer.provideMerge(IconifyClientConfigLive, FetchHttpClient.layer)));
