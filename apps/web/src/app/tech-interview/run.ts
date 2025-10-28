import {
  HttpClient,
  HttpClientResponse,
  HttpClientRequest,
} from "@effect/platform";
import * as Console from "effect/Console";
import * as NodeHttpClient from "@effect/platform-node/NodeHttpClient";
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import {Todo} from "@/app/tech-interview/domain";
import * as Layer from "effect/Layer";


export class CustomClient extends Effect.Service<CustomClient>()("CustomClient", {
  dependencies: [NodeHttpClient.layerUndici],
  effect: Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;

    return {
      httpClient: httpClient.pipe(
        HttpClient.mapRequest((request) =>
          request.pipe(
            HttpClientRequest.appendUrl("https://jsonplaceholder.typicode.com"),
            HttpClientRequest.acceptJson,
            HttpClientRequest.setHeader("API-Version", "1.0"),
          )),
        // HttpClient.retryTransient({
        //   times: 3,
        //   schedule: Schedule.jittered(Schedule.exponential("500 millis", 2))
        // }),
      )
    };
  })
}) {
}

const program = Effect.gen(function* () {
  const {httpClient} = yield* CustomClient;


  const getPosts = httpClient.get("/users/1/todos").pipe(
    Effect.timeout("5 seconds"),
    Effect.retry({
      times: 3,
      schedule: Schedule.jittered(Schedule.exponential("500 millis", 2)),
    }),
    Effect.flatMap(HttpClientResponse.schemaBodyJson(S.Array(Todo))),
  );

  const posts = yield* getPosts;

  yield* Console.log(posts);
});
const layer = CustomClient.Default.pipe(
  Layer.provideMerge(NodeHttpClient.layerUndici)
)


Effect.runPromise(program.pipe(
  Effect.provide(layer)
))