import { Sanity, SanityConfigInput, SanityError, SanityQueryRequest } from "@beep/sanity";
import { A } from "@beep/utils";
import { describe, expect, layer } from "@effect/vitest";
import { Cause, Context, Effect, Exit, Layer, Redacted, Ref } from "effect";
import * as O from "effect/Option";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import type * as HttpClientError from "effect/unstable/http/HttpClientError";

type CapturedRequest = {
  readonly headers: Readonly<Record<string, string>>;
  readonly method: string;
  readonly url: string;
};

type TestRespond = (
  request: HttpClientRequest.HttpClientRequest
) => Effect.Effect<Response, HttpClientError.HttpClientError>;

type SanityTestHttpShape = {
  readonly captures: Effect.Effect<ReadonlyArray<CapturedRequest>>;
  readonly handle: TestRespond;
  readonly respondWith: (respond: TestRespond) => Effect.Effect<void>;
};

class SanityTestHttp extends Context.Service<SanityTestHttp, SanityTestHttpShape>()(
  "@beep/sanity/test/Sanity.service.test/SanityTestHttp"
) {}

const makeJsonResponse = (body: unknown, status = 200) =>
  Response.json(body, {
    headers: {
      "content-type": "application/json",
    },
    status,
  });

const defaultRespond: TestRespond = () => Effect.succeed(makeJsonResponse({ result: { ok: true }, ms: 3 }));

const SanityTestHttpLayer = Layer.effect(
  SanityTestHttp,
  Effect.gen(function* () {
    const capturesRef = yield* Ref.make<ReadonlyArray<CapturedRequest>>([]);
    const respondRef = yield* Ref.make<TestRespond>(defaultRespond);

    return SanityTestHttp.of({
      captures: Ref.get(capturesRef),
      handle: Effect.fn("SanityTestHttp.handle")(function* (request) {
        const url = HttpClientRequest.toUrl(request).pipe(
          O.map((value) => value.toString()),
          O.getOrElse(() => request.url)
        );

        yield* Ref.update(
          capturesRef,
          A.append({
            headers: request.headers,
            method: request.method,
            url,
          })
        );

        const respond = yield* Ref.get(respondRef);
        return yield* respond(request);
      }),
      respondWith: Effect.fn("SanityTestHttp.respondWith")(function* (respond) {
        yield* Ref.set(respondRef, respond);
      }),
    });
  })
);

const TestHttpClientLayer = Layer.effect(
  HttpClient.HttpClient,
  Effect.gen(function* () {
    const testHttp = yield* SanityTestHttp;

    return HttpClient.make((request) =>
      Effect.gen(function* () {
        const response = yield* testHttp.handle(request);
        return HttpClientResponse.fromWeb(request, response);
      })
    );
  })
);

const TestLayer = Sanity.makeLayer(
  SanityConfigInput.make({
    apiToken: Redacted.make("sanity-token"),
    dataset: "production",
    projectId: "oip",
  })
).pipe(Layer.provide(TestHttpClientLayer), Layer.provideMerge(SanityTestHttpLayer));

describe("@beep/sanity", () => {
  layer(TestLayer)((it) => {
    it.effect(
      "submits a GROQ query and decodes the result envelope",
      Effect.fnUntraced(function* () {
        const sanity = yield* Sanity;
        const response = yield* sanity.fetch(SanityQueryRequest.make({ query: "*[_type == 'oipSiteContent'][0]" }));
        const testHttp = yield* SanityTestHttp;
        const captures = yield* testHttp.captures;

        expect(response.result).toEqual({ ok: true });
        expect(captures[0]?.method).toBe("POST");
        expect(captures[0]?.url).toBe("https://oip.api.sanity.io/v2025-05-14/data/query/production");
        expect(captures[0]?.headers.authorization).toBe("Bearer sanity-token");
      })
    );

    it.effect(
      "maps non-success responses to typed driver errors",
      Effect.fnUntraced(function* () {
        const testHttp = yield* SanityTestHttp;
        yield* testHttp.respondWith(() => Effect.succeed(makeJsonResponse({ message: "nope" }, 500)));

        const sanity = yield* Sanity;
        const exit = yield* Effect.exit(sanity.fetch(SanityQueryRequest.make({ query: "*[]" })));

        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const error = Cause.findErrorOption(exit.cause);
          expect(O.isSome(error)).toBe(true);
          if (O.isSome(error)) {
            expect(error.value).toBeInstanceOf(SanityError);
            expect(error.value.reason).toBe("response status");
            expect(error.value.status).toBe(500);
          }
        }
      })
    );
  });
});
