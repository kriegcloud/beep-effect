/**
 * Entity RPC Layer composition
 *
 * Wires Entity RPC handlers with authentication middleware.
 *
 * @module knowledge-server/rpc/v1/entity/_rpcs
 * @since 0.1.0
 */
import { Entities } from "@beep/knowledge-domain";
import { Policy } from "@beep/shared-domain";
import * as Count from "./count";
import * as Get from "./get";
import * as List from "./list";

const EntityRpcsWithMiddleware = Entities.Entity.Rpc.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

const implementation = EntityRpcsWithMiddleware.of({
  entity_get: Get.Handler,
  entity_list: List.Handler,
  entity_count: Count.Handler,
  entity_search: () => {
    throw new Error("Not implemented");
  },
  entity_create: () => {
    throw new Error("Not implemented");
  },
  entity_update: () => {
    throw new Error("Not implemented");
  },
  entity_delete: () => {
    throw new Error("Not implemented");
  },
});

export const layer = EntityRpcsWithMiddleware.toLayer(implementation);
