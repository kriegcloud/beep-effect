import { Ecfr, EcfrConfigInput } from "@beep/ecfr";
import { $EcfrId } from "@beep/identity";
import { describe, expect, layer } from "@effect/vitest";
import { Context, Effect, Layer, pipe, Ref } from "effect";
import * as O from "effect/Option";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import * as RateLimiter from "effect/unstable/persistence/RateLimiter";

const $TestI = $EcfrId.create("Ecfr.service.test");

type CapturedRequest = {
  readonly method: string;
  readonly url: string;
};

type EcfrTestHttpShape = {
  readonly captures: Effect.Effect<ReadonlyArray<CapturedRequest>>;
  readonly handle: (request: HttpClientRequest.HttpClientRequest) => Effect.Effect<Response>;
};

class EcfrTestHttp extends Context.Service<EcfrTestHttp, EcfrTestHttpShape>()($TestI`EcfrTestHttp`) {}

const titlesBody = {
  titles: [
    {
      latest_amended_on: "2022-12-29",
      latest_issue_date: "2024-05-17",
      name: "General Provisions",
      number: 1,
      reserved: false,
      up_to_date_as_of: "2026-06-29",
    },
  ],
};

const EcfrTestHttpLayer = Layer.effect(
  EcfrTestHttp,
  Effect.gen(function* () {
    const capturesRef = yield* Ref.make<ReadonlyArray<CapturedRequest>>([]);
    return EcfrTestHttp.of({
      captures: Ref.get(capturesRef),
      handle: Effect.fn("EcfrTestHttp.handle")(function* (request) {
        const url = pipe(
          HttpClientRequest.toUrl(request),
          O.map((value) => value.toString()),
          O.getOrElse(() => request.url)
        );
        yield* Ref.update(capturesRef, (xs) => [...xs, { method: request.method, url }]);
        return Response.json(titlesBody, { headers: { "content-type": "application/json" }, status: 200 });
      }),
    });
  })
);

const TestHttpClientLayer = Layer.effect(
  HttpClient.HttpClient,
  Effect.gen(function* () {
    const testHttp = yield* EcfrTestHttp;
    return HttpClient.make((request) =>
      Effect.gen(function* () {
        const response = yield* testHttp.handle(request);
        return HttpClientResponse.fromWeb(request, response);
      })
    );
  })
);

const makeEcfrUnitLayer = (config = EcfrConfigInput.make({})) =>
  Ecfr.makeLayer(config).pipe(
    Layer.provide(TestHttpClientLayer),
    Layer.provideMerge(EcfrTestHttpLayer),
    Layer.provide(RateLimiter.layerStoreMemory)
  );

describe("@beep/ecfr", () => {
  layer(makeEcfrUnitLayer())((it) =>
    it.effect(
      "decodes a keyless listTitles response offline via mapRequest base-URL prefixing",
      Effect.fnUntraced(function* () {
        const testHttp = yield* EcfrTestHttp;
        const ecfr = yield* Ecfr;

        const result = yield* ecfr.listTitles;
        const captures = yield* testHttp.captures;

        expect(result.titles).toHaveLength(1);
        expect(result.titles[0]?.number).toBe(1);
        expect(result.titles[0]?.name).toBe("General Provisions");
        expect(captures).toHaveLength(1);
        expect(captures[0]?.url).toBe("https://www.ecfr.gov/api/versioner/v1/titles.json");
        expect(captures[0]?.url ?? "").not.toContain("api_key");
      })
    )
  );
});
