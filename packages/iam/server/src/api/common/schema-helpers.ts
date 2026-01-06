import * as Cookies from "@effect/platform/Cookies";
import type * as HttpBody from "@effect/platform/HttpBody";
import type * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import type * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

/**
 * Standard auth API response shape with headers for cookie forwarding.
 */
export type AuthApiResponse<T> = {
  readonly headers: Headers;
  readonly response: T;
};

/**
 * Forwards all Set-Cookie headers from auth response to HTTP response.
 * Uses headers.getSetCookie() to retrieve all cookies (Better Auth sets multiple).
 * Returns an HttpServerResponse with the JSON body and merged cookies.
 */
export const forwardCookieResponse = <T>(
  headers: Headers,
  response: T
): Effect.Effect<HttpServerResponse.HttpServerResponse, HttpBody.HttpBodyError | Cookies.CookiesError, never> =>
  F.pipe(headers.getSetCookie(), A.fromIterable, (cookies) => {
    console.log("[forwardCookieResponse] Raw cookies from getSetCookie:", cookies);
    console.log("[forwardCookieResponse] Number of cookies:", cookies.length);

    if (A.isEmptyArray(cookies)) {
      console.log("[forwardCookieResponse] No cookies to forward");
      return HttpServerResponse.json(response);
    }

    const parsedCookies = Cookies.fromSetCookie(cookies);
    console.log("[forwardCookieResponse] Parsed cookies:", parsedCookies);

    return F.pipe(
      HttpServerResponse.json(response),
      Effect.tap((res) =>
        Effect.sync(() => {
          console.log("[forwardCookieResponse] Response before merge:", {
            status: res.status,
            hasCookies: "cookies" in res,
          });
        })
      ),
      Effect.flatMap(HttpServerResponse.mergeCookies(parsedCookies)),
      Effect.tap((res) =>
        Effect.sync(() => {
          console.log("[forwardCookieResponse] Response after merge:", {
            status: res.status,
            cookies: res.cookies,
          });
        })
      )
    );
  });

/**
 * Executes an auth endpoint with payload encoding, response decoding, and cookie forwarding.
 *
 * This is a Kleisli composition that:
 * 1. Encodes the payload via Schema.encode (contravariant transformation)
 * 2. Executes the auth handler with encoded body + headers
 * 3. Decodes the response via Schema.decodeUnknown (covariant transformation)
 * 4. Builds HttpServerResponse with set-cookie header forwarding
 *
 * @example
 * ```ts
 * return yield* runAuthEndpoint({
 *   payloadSchema: V1.SignIn.Email.Payload,
 *   successSchema: V1.SignIn.Email.Success,
 *   payload,
 *   headers: request.headers,
 *   authHandler: ({ body, headers }) =>
 *     Effect.tryPromise(() =>
 *       auth.api.signInEmail({ body, headers, returnHeaders: true })
 *     ),
 * });
 * ```
 */
export const runAuthEndpoint = <
  PayloadType,
  PayloadEncoded,
  PayloadContext,
  SuccessType,
  SuccessEncoded,
  SuccessContext,
  AuthResponse,
  AuthError,
  AuthContext,
>(params: {
  readonly payloadSchema: S.Schema<PayloadType, PayloadEncoded, PayloadContext>;
  readonly successSchema: S.Schema<SuccessType, SuccessEncoded, SuccessContext>;
  readonly payload: PayloadType;
  readonly headers: HttpServerRequest.HttpServerRequest["headers"];
  readonly authHandler: (args: {
    readonly body: PayloadEncoded;
    readonly headers: HttpServerRequest.HttpServerRequest["headers"];
  }) => Effect.Effect<AuthApiResponse<AuthResponse>, AuthError, AuthContext>;
}): Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  ParseResult.ParseError | AuthError | HttpBody.HttpBodyError | Cookies.CookiesError,
  PayloadContext | SuccessContext | AuthContext
> =>
  F.pipe(
    S.encode(params.payloadSchema)(params.payload),
    Effect.flatMap((encodedBody) =>
      params.authHandler({
        body: encodedBody,
        headers: params.headers,
      })
    ),
    Effect.flatMap(({ headers, response }) =>
      F.pipe(
        response,
        S.decodeUnknown(params.successSchema),
        Effect.flatMap((decoded) => forwardCookieResponse(headers, decoded))
      )
    )
  );

/**
 * Executes an auth query endpoint (no payload) with response decoding and cookie forwarding.
 *
 * This is a Kleisli composition that:
 * 1. Executes the auth handler with headers only
 * 2. Decodes the response via Schema.decodeUnknown
 * 3. Builds HttpServerResponse with set-cookie header forwarding
 *
 * @example
 * ```ts
 * return yield* runAuthQuery({
 *   successSchema: V1.Core.GetSession.Success,
 *   headers: request.headers,
 *   authHandler: ({ headers }) =>
 *     Effect.tryPromise(() =>
 *       auth.api.getSession({ headers, returnHeaders: true })
 *     ),
 * });
 * ```
 */
export const runAuthQuery = <
  SuccessType,
  SuccessEncoded,
  SuccessContext,
  AuthResponse,
  AuthError,
  AuthContext,
>(params: {
  readonly successSchema: S.Schema<SuccessType, SuccessEncoded, SuccessContext>;
  readonly headers: HttpServerRequest.HttpServerRequest["headers"];
  readonly authHandler: (args: {
    readonly headers: HttpServerRequest.HttpServerRequest["headers"];
  }) => Effect.Effect<AuthApiResponse<AuthResponse>, AuthError, AuthContext>;
}): Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  ParseResult.ParseError | AuthError | HttpBody.HttpBodyError | Cookies.CookiesError,
  SuccessContext | AuthContext
> =>
  F.pipe(
    params.authHandler({ headers: params.headers }),
    Effect.flatMap(({ headers, response }) =>
      F.pipe(
        response,
        S.decodeUnknown(params.successSchema),
        Effect.flatMap((decoded) => forwardCookieResponse(headers, decoded))
      )
    )
  );

/**
 * Executes an auth command endpoint (no payload, fixed success response) with cookie forwarding.
 *
 * Use this for endpoints like signOut where the success response is a fixed value
 * rather than decoded from the API response.
 *
 * @example
 * ```ts
 * return yield* runAuthCommand({
 *   successValue: { success: true },
 *   headers: request.headers,
 *   authHandler: ({ headers }) =>
 *     Effect.tryPromise(() =>
 *       auth.api.signOut({ headers, returnHeaders: true })
 *     ),
 * });
 * ```
 */
export const runAuthCommand = <SuccessType, AuthError, AuthContext>(params: {
  readonly successValue: SuccessType;
  readonly headers: HttpServerRequest.HttpServerRequest["headers"];
  readonly authHandler: (args: {
    readonly headers: HttpServerRequest.HttpServerRequest["headers"];
  }) => Effect.Effect<AuthApiResponse<unknown>, AuthError, AuthContext>;
}): Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  AuthError | HttpBody.HttpBodyError | Cookies.CookiesError,
  AuthContext
> =>
  F.pipe(
    params.authHandler({ headers: params.headers }),
    Effect.flatMap(({ headers }) => forwardCookieResponse(headers, params.successValue))
  );

/**
 * Executes an admin endpoint without header forwarding.
 *
 * Admin endpoints in Better Auth typically don't need cookie forwarding since
 * they're server-side operations. This helper handles payload encoding and
 * response decoding without the headers wrapper.
 *
 * @example
 * ```ts
 * return yield* runAdminEndpoint({
 *   payloadSchema: V1.Admin.BanUser.Payload,
 *   successSchema: V1.Admin.BanUser.Success,
 *   payload,
 *   headers: request.headers,
 *   authHandler: ({ body, headers }) =>
 *     Effect.tryPromise(() =>
 *       auth.api.banUser({ body, headers })
 *     ),
 * });
 * ```
 */
export const runAdminEndpoint = <
  PayloadType,
  PayloadEncoded,
  PayloadContext,
  SuccessType,
  SuccessEncoded,
  SuccessContext,
  AuthResponse,
  AuthError,
  AuthContext,
>(params: {
  readonly payloadSchema: S.Schema<PayloadType, PayloadEncoded, PayloadContext>;
  readonly successSchema: S.Schema<SuccessType, SuccessEncoded, SuccessContext>;
  readonly payload: PayloadType;
  readonly headers: HttpServerRequest.HttpServerRequest["headers"];
  readonly authHandler: (args: {
    readonly body: PayloadEncoded;
    readonly headers: HttpServerRequest.HttpServerRequest["headers"];
  }) => Effect.Effect<AuthResponse, AuthError, AuthContext>;
}): Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  ParseResult.ParseError | AuthError | HttpBody.HttpBodyError,
  PayloadContext | SuccessContext | AuthContext
> =>
  F.pipe(
    S.encode(params.payloadSchema)(params.payload),
    Effect.flatMap((encodedBody) =>
      params.authHandler({
        body: encodedBody,
        headers: params.headers,
      })
    ),
    Effect.flatMap(S.decodeUnknown(params.successSchema)),
    Effect.flatMap(HttpServerResponse.json)
  );

/**
 * Executes an admin query endpoint (with URL params) without header forwarding.
 *
 * For GET endpoints with query parameters where the result is returned directly.
 *
 * @example
 * ```ts
 * return yield* runAdminQuery({
 *   successSchema: V1.Admin.ListUsers.Success,
 *   headers: request.headers,
 *   authHandler: ({ headers }) =>
 *     Effect.tryPromise(() =>
 *       auth.api.listUsers({ query: { ... }, headers })
 *     ),
 * });
 * ```
 */
export const runAdminQuery = <
  SuccessType,
  SuccessEncoded,
  SuccessContext,
  AuthResponse,
  AuthError,
  AuthContext,
>(params: {
  readonly successSchema: S.Schema<SuccessType, SuccessEncoded, SuccessContext>;
  readonly headers: HttpServerRequest.HttpServerRequest["headers"];
  readonly authHandler: (args: {
    readonly headers: HttpServerRequest.HttpServerRequest["headers"];
  }) => Effect.Effect<AuthResponse, AuthError, AuthContext>;
}): Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  ParseResult.ParseError | AuthError | HttpBody.HttpBodyError,
  SuccessContext | AuthContext
> =>
  F.pipe(
    params.authHandler({ headers: params.headers }),
    Effect.flatMap(S.decodeUnknown(params.successSchema)),
    Effect.flatMap(HttpServerResponse.json)
  );

/**
 * Executes an admin command endpoint (no payload) without header forwarding.
 *
 * For POST endpoints without a body that return a result directly.
 *
 * @example
 * ```ts
 * return yield* runAdminCommand({
 *   successSchema: V1.Admin.StopImpersonating.Success,
 *   headers: request.headers,
 *   authHandler: ({ headers }) =>
 *     Effect.tryPromise(() =>
 *       auth.api.stopImpersonating({ headers })
 *     ),
 * });
 * ```
 */
export const runAdminCommand = <
  SuccessType,
  SuccessEncoded,
  SuccessContext,
  AuthResponse,
  AuthError,
  AuthContext,
>(params: {
  readonly successSchema: S.Schema<SuccessType, SuccessEncoded, SuccessContext>;
  readonly headers: HttpServerRequest.HttpServerRequest["headers"];
  readonly authHandler: (args: {
    readonly headers: HttpServerRequest.HttpServerRequest["headers"];
  }) => Effect.Effect<AuthResponse, AuthError, AuthContext>;
}): Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  ParseResult.ParseError | AuthError | HttpBody.HttpBodyError,
  SuccessContext | AuthContext
> =>
  F.pipe(
    params.authHandler({ headers: params.headers }),
    Effect.flatMap(S.decodeUnknown(params.successSchema)),
    Effect.flatMap(HttpServerResponse.json)
  );
