import { AuthService } from "@beep/runtime-server/rpcs/AuthLive";
import { BS } from "@beep/schema";
import * as Headers from "@effect/platform/Headers";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import type * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

export const make: (
  req: HttpServerRequest.HttpServerRequest
) => Effect.Effect<HttpServerResponse.HttpServerResponse, never, AuthService> = Effect.fn("BetterAuthHandler.make")(
  function* (req: HttpServerRequest.HttpServerRequest) {
    const { auth } = yield* AuthService;

    // req.headers is already Effect Headers - use type-safe accessors
    const host = F.pipe(req.headers, Headers.get("host"), O.getOrElse(F.constant("localhost:8080")));

    const protocol = F.pipe(req.headers, Headers.get("x-forwarded-proto"), O.getOrElse(F.constant("http")));

    // Convert Effect Headers to Web Headers for outgoing Request
    const webHeaders = new globalThis.Headers(req.headers);

    const url = P.or(Str.startsWith("http://"), Str.startsWith("https://"))(req.url)
      ? req.url
      : `${protocol}://${host}${req.url.startsWith("/") ? req.url : `/${req.url}`}`;
    let bodyInit: BodyInit | null = null;
    if (P.and(P.not(BS.HttpMethod.is.GET), P.not(BS.HttpMethod.is.HEAD))(req.method)) {
      const arrayBuffer = yield* req.arrayBuffer;
      if (arrayBuffer.byteLength > 0) {
        bodyInit = new Uint8Array(arrayBuffer);
      } else {
        bodyInit = new Uint8Array(0);
      }
    }

    const request = new Request(url, {
      method: req.method,
      headers: webHeaders,
      redirect: "manual",
      body: bodyInit,
    });

    const webResponse = yield* Effect.promise(F.constant(auth.handler(request)));

    // Convert Web Headers to Effect Headers (immutable, no mutation needed)
    const responseHeaders = Headers.fromInput(webResponse.headers);

    return HttpServerResponse.raw(webResponse.body, {
      status: webResponse.status,
      headers: responseHeaders,
    });
  },
  Effect.catchAll((error) =>
    Effect.logError(error).pipe(Effect.zipRight(HttpServerResponse.text("Auth handler error", { status: 500 })))
  )
);

export const Router = HttpLayerRouter.addAll([HttpLayerRouter.route("*", "/api/auth/*", make)]);

export const RouterLive = Router.pipe(Layer.provide(AuthService.layer));
