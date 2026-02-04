/**
 * GraphRAG RPC Layer composition
 *
 * Wires GraphRAG RPC handlers with authentication middleware.
 *
 * @module knowledge-server/rpc/v1/graphrag/_rpcs
 * @since 0.1.0
 */
import { Rpc as RpcContracts } from "@beep/knowledge-domain";
import { Policy } from "@beep/shared-domain";
import * as Query from "./query";

const GraphRAGRpcsWithMiddleware = RpcContracts.GraphRAG.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

const implementation = GraphRAGRpcsWithMiddleware.of({
  graphrag_query: Query.Handler,
  graphrag_queryFromSeeds: () => {
    throw new Error("Not implemented");
  },
});

export const layer = GraphRAGRpcsWithMiddleware.toLayer(implementation);
