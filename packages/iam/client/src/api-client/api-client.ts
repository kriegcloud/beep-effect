import { IamApi } from "@beep/iam-domain";
import { $IamClientId } from "@beep/identity/packages";
import { clientEnv } from "@beep/shared-env/ClientEnv";
import { FetchHttpClient } from "@effect/platform";
import { AtomHttpApi } from "@effect-atom/atom-react";

const $I = $IamClientId.create("api-client/api-client");

export class ApiClient extends AtomHttpApi.Tag<ApiClient>()($I`ApiClient`, {
  api: IamApi,
  httpClient: FetchHttpClient.layer,
  baseUrl: clientEnv.apiUrl,
}) {}
