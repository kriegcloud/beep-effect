import { clientEnv } from "@beep/core-env/client";
import { DomainApi } from "@beep/iam-domain/DomainApi";
import * as HttpApiClient from "@effect/platform/HttpApiClient";
import * as HttpClient from "@effect/platform/HttpClient";
import * as BrowserHttpClient from "@effect/platform-browser/BrowserHttpClient";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as UnsafeHttpApiClient from "./unsafe-http-api-client";
export class ApiClient extends Effect.Service<ApiClient>()("ApiClient", {
  accessors: true,
  dependencies: [BrowserHttpClient.layerXMLHttpRequest],
  effect: Effect.gen(function* () {
    return {
      client: yield* HttpApiClient.make(DomainApi, {
        baseUrl: `${clientEnv.apiUrl.toString()}/iam`,
        transformClient: (client) => client.pipe(HttpClient.retryTransient({ times: 3 })),
      }),

      unsafeClient: yield* UnsafeHttpApiClient.make(DomainApi, {
        baseUrl: `${clientEnv.apiUrl.toString()}/iam`,
        transformClient: (client) => client.pipe(HttpClient.retryTransient({ times: 3 })),
      }),
    };
  }),
}) {
  static readonly Live = ApiClient.Default.pipe(Layer.provideMerge(BrowserHttpClient.layerXMLHttpRequest));
}
