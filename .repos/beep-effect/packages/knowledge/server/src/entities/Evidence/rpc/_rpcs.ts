import { Rpc as RpcContracts } from "@beep/knowledge-domain";
import { Policy } from "@beep/shared-domain";
import * as List from "./list";

const EvidenceRpcsWithMiddleware = RpcContracts.Evidence.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

const implementation = EvidenceRpcsWithMiddleware.of({
  evidence_list: List.Handler,
});

export const layer = EvidenceRpcsWithMiddleware.toLayer(implementation);
