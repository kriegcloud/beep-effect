import { $SharedClientId } from "@beep/identity/packages";
import { addRpcErrorLogging, RpcConfigLive } from "@beep/shared-client/constructors";
import { SharedRpcs } from "@beep/shared-domain";
import * as Thunk from "@beep/utils/thunk";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as RpcClient from "@effect/rpc/RpcClient";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";

const $I = $SharedClientId.create("atom/services/FilesRpcClient");

export class Service extends Effect.Service<Service>()($I`Service`, {
  dependencies: [RpcConfigLive, FetchHttpClient.layer],
  accessors: true,
  scoped: pipe(
    Effect.Do,
    Effect.bind("rpc", pipe(SharedRpcs.V1.Rpcs, RpcClient.make, addRpcErrorLogging, Thunk.thunkEffect))
  ),
}) {}

export const layer = Service.Default;
