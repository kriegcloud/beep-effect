import { $WebId } from "@beep/identity/packages";
import { type ChatRequest, decodeChatRequestUnknown } from "@beep/web/lib/effect/chat-handler";
import { Cause, Effect, Match } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";

const $I = $WebId.create("lib/effect/chat-route");

class ChatUnauthorizedError extends S.TaggedErrorClass<ChatUnauthorizedError>($I`ChatUnauthorizedError`)(
  "ChatUnauthorizedError",
  {
    message: S.String,
  },
  $I.annote("ChatUnauthorizedError", {
    title: "Chat Unauthorized Error",
    description: "Request requires an authenticated better-auth session.",
  })
) {}

class ChatSessionLookupError extends S.TaggedErrorClass<ChatSessionLookupError>($I`ChatSessionLookupError`)(
  "ChatSessionLookupError",
  {
    message: S.String,
  },
  $I.annote("ChatSessionLookupError", {
    title: "Chat Session Lookup Error",
    description: "Failed to resolve authentication session from request headers.",
  })
) {}

class ChatBodyReadError extends S.TaggedErrorClass<ChatBodyReadError>($I`ChatBodyReadError`)(
  "ChatBodyReadError",
  {
    message: S.String,
  },
  $I.annote("ChatBodyReadError", {
    title: "Chat Body Read Error",
    description: "Failed to parse request JSON body.",
  })
) {}

const makeErrorResponse = (options: {
  readonly status: number;
  readonly code: string;
  readonly message: string;
}): HttpServerResponse.HttpServerResponse =>
  HttpServerResponse.jsonUnsafe(
    {
      error: {
        code: options.code,
        message: options.message,
      },
    },
    {
      status: options.status,
    }
  );

export interface ChatRouteOptions<R = never> {
  readonly getSession: (headers: Headers) => Promise<unknown>;
  readonly createResponse: (request: ChatRequest) => Effect.Effect<HttpServerResponse.HttpServerResponse, never, R>;
}

const readChatRequest = Effect.fn("ChatRoute.readChatRequest")(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest;

  const body = yield* request.json.pipe(
    Effect.mapError(
      (cause) =>
        new ChatBodyReadError({
          message: `Invalid JSON body: ${cause}`,
        })
    )
  );

  return yield* decodeChatRequestUnknown(body);
});

const ensureAuthenticated = Effect.fn("ChatRoute.ensureAuthenticated")(function* (
  getSession: (headers: Headers) => Promise<unknown>
) {
  const request = yield* HttpServerRequest.HttpServerRequest;
  const webRequest = yield* HttpServerRequest.toWeb(request).pipe(
    Effect.mapError(
      (cause) =>
        new ChatSessionLookupError({
          message: `Session request conversion failed: ${cause}`,
        })
    )
  );

  const session = yield* Effect.tryPromise({
    try: () => getSession(webRequest.headers),
    catch: (cause) =>
      new ChatSessionLookupError({
        message: `Session lookup failed: ${cause}`,
      }),
  });

  return yield* O.match(O.fromNullishOr(session), {
    onNone: () =>
      Effect.fail(
        new ChatUnauthorizedError({
          message: "Authentication required",
        })
      ),
    onSome: Effect.succeed,
  });
});

export const makeChatRouteHandler = <R = never>(options: ChatRouteOptions<R>) =>
  Effect.gen(function* () {
    yield* ensureAuthenticated(options.getSession);
    const chatRequest = yield* readChatRequest();

    return yield* options.createResponse(chatRequest);
  }).pipe(
    Effect.catchTag("ChatUnauthorizedError", (error) =>
      Effect.succeed(
        makeErrorResponse({
          status: 401,
          code: error._tag,
          message: error.message,
        })
      )
    ),
    Effect.catchTag("ChatRequestDecodeError", (error) =>
      Effect.succeed(
        makeErrorResponse({
          status: 400,
          code: error._tag,
          message: error.message,
        })
      )
    ),
    Effect.catchTag("ChatBodyReadError", (error) =>
      Effect.succeed(
        makeErrorResponse({
          status: 400,
          code: error._tag,
          message: error.message,
        })
      )
    ),
    Effect.catchTag("ChatSessionLookupError", (error) =>
      Effect.succeed(
        makeErrorResponse({
          status: 500,
          code: error._tag,
          message: error.message,
        })
      )
    ),
    Effect.catchCause((cause) =>
      Match.value(Cause.hasInterruptsOnly(cause)).pipe(
        Match.when(true, () => Effect.failCause(cause)),
        Match.orElse(() =>
          Effect.succeed(
            makeErrorResponse({
              status: 500,
              code: "ChatInternalError",
              message: "Internal chat route error",
            })
          )
        )
      )
    )
  );

export const makeChatRouteLayer = <R = never>(options: ChatRouteOptions<R>) =>
  HttpRouter.add("POST", "/api/chat", makeChatRouteHandler(options));
