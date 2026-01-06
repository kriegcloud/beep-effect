import { IamApi } from "@beep/iam-domain";
import { $IamClientId } from "@beep/identity/packages";
import { clientEnv } from "@beep/shared-env/ClientEnv";
import { FetchHttpClient } from "@effect/platform";
import { AtomHttpApi } from "@effect-atom/atom-react";
import * as Layer from "effect/Layer";

const $I = $IamClientId.create("atom/api-client");

/**
 * HTTP client layer configured with credentials for cross-origin cookie handling.
 * Required for session cookies to be sent with requests to the API server.
 */
const httpClientWithCredentials = FetchHttpClient.layer.pipe(
  Layer.provide(Layer.succeed(FetchHttpClient.RequestInit, { credentials: "include" }))
);

export class ApiClient extends AtomHttpApi.Tag<ApiClient>()($I`ApiClient`, {
  api: IamApi,
  httpClient: httpClientWithCredentials,
  baseUrl: clientEnv.apiUrl,
}) {}
