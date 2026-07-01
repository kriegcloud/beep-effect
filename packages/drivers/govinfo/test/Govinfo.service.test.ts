import { RateLimitSnapshot } from "@beep/api-transport";
import { Govinfo, GovinfoConfigInput, Search } from "@beep/govinfo";
import { $GovinfoId } from "@beep/identity";
import { describe, expect, layer } from "@effect/vitest";
import { Context, Effect, Layer, pipe, Redacted, Ref } from "effect";
import * as O from "effect/Option";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import * as RateLimiter from "effect/unstable/persistence/RateLimiter";
import type * as HttpClientError from "effect/unstable/http/HttpClientError";

const $TestI = $GovinfoId.create("Govinfo.service.test");

type CapturedRequest = {
  readonly method: string;
  readonly url: string;
};

type GovinfoTestRespond = (
  request: HttpClientRequest.HttpClientRequest
) => Effect.Effect<Response, HttpClientError.HttpClientError>;

type GovinfoTestHttpShape = {
  readonly captures: Effect.Effect<ReadonlyArray<CapturedRequest>>;
  readonly handle: GovinfoTestRespond;
  readonly reset: Effect.Effect<void>;
  readonly respondWith: (respond: GovinfoTestRespond) => Effect.Effect<void>;
};

class GovinfoTestHttp extends Context.Service<GovinfoTestHttp, GovinfoTestHttpShape>()($TestI`GovinfoTestHttp`) {}

const searchBody = { count: 0, offsetMark: "*", results: [] };

const searchResponse = (headers: Readonly<Record<string, string>> = {}): Response =>
  Response.json(searchBody, { headers: { "content-type": "application/json", ...headers }, status: 200 });

const defaultRespond: GovinfoTestRespond = () => Effect.succeed(searchResponse());

const GovinfoTestHttpLayer = Layer.effect(
  GovinfoTestHttp,
  Effect.gen(function* () {
    const capturesRef = yield* Ref.make<ReadonlyArray<CapturedRequest>>([]);
    const respondRef = yield* Ref.make<GovinfoTestRespond>(defaultRespond);

    return GovinfoTestHttp.of({
      captures: Ref.get(capturesRef),
      handle: Effect.fn("GovinfoTestHttp.handle")(function* (request) {
        const url = pipe(
          HttpClientRequest.toUrl(request),
          O.map((value) => value.toString()),
          O.getOrElse(() => request.url)
        );
        yield* Ref.update(capturesRef, (xs) => [...xs, { method: request.method, url }]);
        const respond = yield* Ref.get(respondRef);
        return yield* respond(request);
      }),
      reset: Effect.all([Ref.set(capturesRef, []), Ref.set(respondRef, defaultRespond)], { discard: true }),
      respondWith: Effect.fn("GovinfoTestHttp.respondWith")(function* (respond) {
        yield* Ref.set(respondRef, respond);
      }),
    });
  })
);

const TestHttpClientLayer = Layer.effect(
  HttpClient.HttpClient,
  Effect.gen(function* () {
    const testHttp = yield* GovinfoTestHttp;
    return HttpClient.make((request) =>
      Effect.gen(function* () {
        const response = yield* testHttp.handle(request);
        return HttpClientResponse.fromWeb(request, response);
      })
    );
  })
);

const makeGovinfoUnitLayer = (config = GovinfoConfigInput.make({})) =>
  Govinfo.makeLayer(config).pipe(
    Layer.provide(TestHttpClientLayer),
    Layer.provideMerge(GovinfoTestHttpLayer),
    Layer.provide(RateLimiter.layerStoreMemory)
  );

const keyedConfig = GovinfoConfigInput.make({
  apiKey: Redacted.make("test-key"),
  apiUrl: "https://api.govinfo.gov",
});

const makePayload = () =>
  Search.Payload.make({
    historical: false,
    offsetMark: "*",
    pageSize: 10,
    query: "climate change",
    resultLevel: "default",
    sorts: [],
  });

describe("@beep/govinfo", () => {
  layer(makeGovinfoUnitLayer(keyedConfig))((it) =>
    it.effect(
      "attaches api.data.gov api_key and parses X-RateLimit-* headers offline",
      Effect.fnUntraced(function* () {
        const testHttp = yield* GovinfoTestHttp;
        const govinfo = yield* Govinfo;
        yield* testHttp.reset;
        yield* testHttp.respondWith(() =>
          Effect.succeed(
            searchResponse({
              "x-ratelimit-limit": "1000",
              "x-ratelimit-remaining": "42",
              "x-ratelimit-reset": "60",
            })
          )
        );

        const result = yield* govinfo.search(makePayload());
        const snapshot = yield* govinfo.rateLimit;
        const captures = yield* testHttp.captures;
        const snap = O.getOrElse(snapshot, () => RateLimitSnapshot.make({}));

        expect(result.count).toBe(0);
        expect(captures).toHaveLength(1);
        expect(captures[0]?.url).toContain("api_key=test-key");
        expect(O.isSome(snapshot)).toBe(true);
        expect(snap.limit).toBe(1000);
        expect(snap.remaining).toBe(42);
        expect(snap.reset).toBe(60);
      })
    )
  );

  layer(makeGovinfoUnitLayer(keyedConfig))((it) =>
    it.effect(
      "serves a repeat identical search from cache (transport call-count == 1)",
      Effect.fnUntraced(function* () {
        const testHttp = yield* GovinfoTestHttp;
        const govinfo = yield* Govinfo;
        yield* testHttp.reset;

        yield* govinfo.search(makePayload());
        yield* govinfo.search(makePayload());

        const captures = yield* testHttp.captures;
        expect(captures).toHaveLength(1);
      })
    )
  );

  layer(makeGovinfoUnitLayer())((it) =>
    it.effect(
      "omits auth gracefully when no API key is configured (keyless-safe)",
      Effect.fnUntraced(function* () {
        const testHttp = yield* GovinfoTestHttp;
        const govinfo = yield* Govinfo;
        yield* testHttp.reset;

        yield* govinfo.search(makePayload());

        const captures = yield* testHttp.captures;
        expect(captures).toHaveLength(1);
        expect(captures[0]?.url ?? "").not.toContain("api_key");
      })
    )
  );
});
