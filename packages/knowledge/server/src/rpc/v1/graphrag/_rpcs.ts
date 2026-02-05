import { Rpc as RpcContracts } from "@beep/knowledge-domain";
import { Policy } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as Query from "./query";

const GraphRAGRpcsWithMiddleware = RpcContracts.GraphRag.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

const implementation = GraphRAGRpcsWithMiddleware.of({
  graphrag_query: Query.Handler,
  graphrag_queryFromSeeds: () => Effect.die("Not implemented"),
});

export const layer = GraphRAGRpcsWithMiddleware.toLayer(implementation);
