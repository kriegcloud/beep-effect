/**
 * Relation RPC Layer composition
 *
 * Wires Relation RPC handlers with authentication middleware.
 * All handlers are currently stubs pending implementation.
 *
 * @module knowledge-server/rpc/v1/relation/_rpcs
 * @since 0.1.0
 */
import { Entities } from "@beep/knowledge-domain";
import { Policy } from "@beep/shared-domain";

const RelationRpcsWithMiddleware = Entities.Relation.Rpc.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

const implementation = RelationRpcsWithMiddleware.of({
  relation_get: () => {
    throw new Error("Not implemented");
  },
  relation_listByEntity: () => {
    throw new Error("Not implemented");
  },
  relation_listByPredicate: () => {
    throw new Error("Not implemented");
  },
  relation_create: () => {
    throw new Error("Not implemented");
  },
  relation_delete: () => {
    throw new Error("Not implemented");
  },
  relation_count: () => {
    throw new Error("Not implemented");
  },
});

export const layer = RelationRpcsWithMiddleware.toLayer(implementation);
