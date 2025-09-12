// import { clientEnv } from "@beep/core-env/client";
// import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
// import * as HttpApiClient from "@effect/platform/HttpApiClient";
// import * as HttpClient from "@effect/platform/HttpClient";
// import { DomainApi } from "@org/domain/DomainApi";
// import * as Effect from "effect/Effect";
// import * as UnsafeHttpApiClient from "./unsafe-http-api-client";
//
// export class ApiClient extends Effect.Service<ApiClient>()("ApiClient", {
//   accessors: true,
//   dependencies: [FetchHttpClient.layer],
//   effect: Effect.gen(function* () {
//     return {
//       client: yield* HttpApiClient.make(DomainApi, {
//         baseUrl: clientEnv.apiUrl.toString(),
//         transformClient: (client) => client.pipe(HttpClient.retryTransient({ times: 3 })),
//       }),
//
//       unsafeClient: yield* UnsafeHttpApiClient.make(DomainApi, {
//         baseUrl: clientEnv.apiUrl.toString(),
//         transformClient: (client) => client.pipe(HttpClient.retryTransient({ times: 3 })),
//       }),
//     };
//   }),
// }) {}
