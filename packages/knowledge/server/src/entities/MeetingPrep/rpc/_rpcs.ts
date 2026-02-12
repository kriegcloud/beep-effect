import { Rpc as RpcContracts } from "@beep/knowledge-domain";
import { Policy } from "@beep/shared-domain";
import * as Generate from "./generate";

const MeetingPrepRpcsWithMiddleware = RpcContracts.MeetingPrep.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

const implementation = MeetingPrepRpcsWithMiddleware.of({
  meetingprep_generate: Generate.Handler,
});

export const layer = MeetingPrepRpcsWithMiddleware.toLayer(implementation);
