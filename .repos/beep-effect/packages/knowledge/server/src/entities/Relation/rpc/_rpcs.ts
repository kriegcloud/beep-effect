import { Rpc as RpcContracts } from "@beep/knowledge-domain";
import { Policy } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

const RelationRpcsWithMiddleware = RpcContracts.Relation.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

const notImplemented = Effect.die("Not implemented");

const implementation = RelationRpcsWithMiddleware.of({
  relation_get: () => notImplemented,
  relation_listByEntity: () => notImplemented,
  relation_listByPredicate: () => notImplemented,
  relation_create: () => notImplemented,
  relation_delete: () => notImplemented,
  relation_count: () => notImplemented,
});

export const layer = RelationRpcsWithMiddleware.toLayer(implementation);
