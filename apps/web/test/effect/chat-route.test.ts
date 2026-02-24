import { type ChatRouteOptions, makeChatRouteLayer } from "@beep/web/lib/effect/chat-route";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Match } from "effect";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";

const makeHandler = (options: ChatRouteOptions<never>) => {
  const appLayer = Layer.mergeAll(HttpRouter.layer, makeChatRouteLayer(options));
  return HttpRouter.toWebHandler(appLayer).handler;
};

describe("chat route", () => {
  it.effect("returns 401 for unauthenticated requests", () =>
    Effect.gen(function* () {
      let createResponseCalls = 0;

      const handler = makeHandler({
        getSession: () => Promise.resolve(null),
        createResponse: () =>
          Effect.sync(() => {
            createResponseCalls += 1;
            return HttpServerResponse.text("should-not-run");
          }),
      });

      const response = yield* Effect.promise(() =>
        handler(
          new Request("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify({
              messages: [
                {
                  role: "user",
                  content: "hello",
                },
              ],
            }),
            headers: {
              "content-type": "application/json",
            },
          })
        )
      );

      const payload = yield* Effect.promise(() => response.json());

      expect(response.status).toBe(401);
      expect(createResponseCalls).toBe(0);

      Match.value(payload).pipe(
        Match.when(
          {
            error: {
              code: "ChatUnauthorizedError",
            },
          },
          () => {
            expect(true).toBe(true);
          }
        ),
        Match.orElse(() => {
          expect(false).toBe(true);
        })
      );
    })
  );

  it.effect("returns 400 for invalid request payload", () =>
    Effect.gen(function* () {
      let createResponseCalls = 0;

      const handler = makeHandler({
        getSession: () => Promise.resolve({ session: { id: "session-1" } }),
        createResponse: () =>
          Effect.sync(() => {
            createResponseCalls += 1;
            return HttpServerResponse.text("should-not-run");
          }),
      });

      const response = yield* Effect.promise(() =>
        handler(
          new Request("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify({
              messages: [],
            }),
            headers: {
              "content-type": "application/json",
            },
          })
        )
      );

      const payload = yield* Effect.promise(() => response.json());

      expect(response.status).toBe(400);
      expect(createResponseCalls).toBe(0);

      Match.value(payload).pipe(
        Match.when(
          {
            error: {
              code: "ChatRequestDecodeError",
            },
          },
          () => {
            expect(true).toBe(true);
          }
        ),
        Match.orElse(() => {
          expect(false).toBe(true);
        })
      );
    })
  );

  it.effect("returns streaming response for authenticated valid request", () =>
    Effect.gen(function* () {
      let capturedMessage = "";

      const handler = makeHandler({
        getSession: () => Promise.resolve({ session: { id: "session-1" } }),
        createResponse: (request) =>
          Effect.sync(() => {
            capturedMessage = request.messages[0]?.content ?? "";
            return HttpServerResponse.text("ok");
          }),
      });

      const response = yield* Effect.promise(() =>
        handler(
          new Request("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify({
              messages: [
                {
                  role: "user",
                  content: "How do I create a tagged service?",
                },
              ],
            }),
            headers: {
              "content-type": "application/json",
            },
          })
        )
      );

      const body = yield* Effect.promise(() => response.text());

      expect(response.status).toBe(200);
      expect(body).toBe("ok");
      expect(capturedMessage).toContain("tagged service");
    })
  );
});
