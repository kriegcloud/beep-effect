import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import * as NodeHttpClient from "@effect/platform-node/NodeHttpClient";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as Random from "effect/Random";
import * as Schedule from "effect/Schedule";
import * as S from "effect/Schema";
import { Todo } from "./domain";

class SimulatedFailure extends Data.TaggedError("SimulatedFailure")<{
  readonly reason: string;
}> {}

export class CustomClient extends Effect.Service<CustomClient>()("CustomClient", {
  dependencies: [NodeHttpClient.layerUndici],
  effect: Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;

    return {
      httpClient: httpClient.pipe(
        HttpClient.mapRequest((request) =>
          request.pipe(
            HttpClientRequest.prependUrl("https://jsonplaceholder.typicode.com"),
            HttpClientRequest.acceptJson,
            HttpClientRequest.setHeader("API-Version", "1.0")
          )
        )
        // HttpClient.retryTransient({
        //   times: 3,
        //   schedule: Schedule.jittered(Schedule.exponential("500 millis", 2))
        // }),
      ),
    };
  }),
}) {}

const program = Effect.gen(function* () {
  const { httpClient } = yield* CustomClient;

  const getPosts = httpClient.get("/users/1/todos").pipe(
    Effect.flatMap((e) =>
      Effect.gen(function* () {
        const shouldFail = yield* Random.nextBoolean;
        if (shouldFail) {
          yield* Console.log("Simulating retryable failure");
          return yield* new SimulatedFailure({ reason: "forced 500" });
        }
        return e;
      })
    ),
    Effect.timeout("5 seconds"),
    Effect.retry({
      times: 3,
      while: (e) =>
        Match.value(e).pipe(
          Match.tags({
            TimeoutException: () => true,
            SimulatedFailure: () => true,
          }),
          Match.when(
            (e) => e._tag === "ResponseError" && e.response.status === 500,
            () => true
          ),
          Match.orElse(() => false)
        ),
      schedule: Schedule.jittered(Schedule.exponential("500 millis", 2)),
    }),
    Effect.flatMap(HttpClientResponse.schemaBodyJson(S.Array(Todo)))
  );

  const posts = yield* getPosts;

  yield* Console.log(posts);
});
const layer = CustomClient.Default.pipe(Layer.provideMerge(NodeHttpClient.layerUndici));

Effect.runPromise(program.pipe(Effect.provide(layer)));
