import { Rpc as RpcContracts } from "@beep/knowledge-domain";
import { Policy } from "@beep/shared-domain";
import * as CancelBatch from "./cancelBatch";
import * as GetStatus from "./getStatus";
import * as StartBatch from "./startBatch";
import * as StreamProgress from "./streamProgress";

const BatchRpcsWithMiddleware = RpcContracts.Batch.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

const implementation = BatchRpcsWithMiddleware.of({
  batch_cancel: CancelBatch.Handler,
  batch_getStatus: GetStatus.Handler,
  batch_start: StartBatch.Handler,
  batch_streamProgress: StreamProgress.Handler,
});

export const layer = BatchRpcsWithMiddleware.toLayer(implementation);
