import { Rpc as RpcContracts } from "@beep/knowledge-domain";
import { Policy } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as Count from "./count";
import * as Get from "./get";
import * as List from "./list";

const EntityRpcsWithMiddleware = RpcContracts.Entity.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

const notImplemented = Effect.die("Not implemented");

const implementation = EntityRpcsWithMiddleware.of({
  entity_get: Get.Handler,
  entity_list: List.Handler,
  entity_count: Count.Handler,
  entity_search: () => notImplemented,
  entity_create: () => notImplemented,
  entity_update: () => notImplemented,
  entity_delete: () => notImplemented,
});

export const layer = EntityRpcsWithMiddleware.toLayer(implementation);
