import { Auth } from "@beep/iam-server";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";

/** Tagged error for Better Auth handler failures. */
class BetterAuthHandlerError extends Data.TaggedError("BetterAuthHandlerError")<{
  readonly message: string;
}> {}

/**
 * Layer that routes Better Auth requests at /api/v1/auth/*.
 *
 * The Better Auth client (`createAuthClient` from `better-auth/react`) makes
 * HTTP requests to Better Auth's internal endpoints. These endpoints are not
 * part of the custom Effect IAM API - they're handled internally by Better Auth.
 *
 * This layer bridges the Effect Platform HTTP server with Better Auth's web handler,
 * enabling the client to communicate directly with the server for:
 * - GET /api/v1/auth/get-session - Session retrieval
 * - POST /api/v1/auth/sign-out - Sign out
 * - And other Better Auth internal endpoints
 *
 * The path /api/v1/auth matches `NEXT_PUBLIC_AUTH_PATH` in the client config.
 */
export const BetterAuthRouterLive = HttpLayerRouter.use((router) =>
  Effect.gen(function* () {
    const auth = yield* Auth.Service;

    // Handler that forwards requests to Better Auth's web handler
    const betterAuthHandler = Effect.fn(function* (request: HttpServerRequest.HttpServerRequest) {
      // Convert Effect Platform request to Web Request
      const webRequest = yield* HttpServerRequest.toWeb(request);

      // Call Better Auth's web handler
      const webResponse = yield* Effect.tryPromise({
        try: () => auth.handler(webRequest),
        catch: (error) =>
          new BetterAuthHandlerError({
            message: `Better Auth handler error: ${error}`,
          }),
      });

      // Convert Web Response back to Effect Platform response (not an Effect)
      return HttpServerResponse.fromWeb(webResponse);
    });

    // Register wildcard route for all Better Auth endpoints
    yield* router.add("*", "/api/v1/auth/*", betterAuthHandler);
  })
);
