import { IamApi } from "@beep/iam-domain";
import { $SharedClientId } from "@beep/identity/packages";
import { addRpcErrorLogging, RpcConfigLive } from "@beep/shared-client/constructors";
import { SharedRpcs } from "@beep/shared-domain";
import { clientEnv } from "@beep/shared-env/ClientEnv";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpApiClient from "@effect/platform/HttpApiClient";
import * as HttpClient from "@effect/platform/HttpClient";
import * as RpcClient from "@effect/rpc/RpcClient";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";

const $I = $SharedClientId.create("atoms/shared-rpc-client");

export class ApiClient extends Effect.Service<ApiClient>()($I`SharedRpcClient`, {
  dependencies: [RpcConfigLive, FetchHttpClient.layer],
  scoped: Effect.gen(function* () {
    const rpcClient = yield* RpcClient.make(SharedRpcs.V1.Rpcs);

    const iamHttpClient = yield* HttpApiClient.make(IamApi, {
      baseUrl: clientEnv.apiUrl.toString(),
      transformClient: (client) =>
        client.pipe(
          HttpClient.filterStatusOk,
          HttpClient.retryTransient({
            times: 3,
            schedule: Schedule.exponential("1 second"),
          })
        ),
    });

    return {
      rpc: addRpcErrorLogging(rpcClient),
      iam: iamHttpClient,
    };
  }),
}) {}
