import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as CancelBatch from "./CancelBatch";
import * as GetBatchStatus from "./GetBatchStatus";
import * as StartBatch from "./StartBatch";
import * as StreamProgress from "./StreamProgress";

export class Rpcs extends RpcGroup.make(
  CancelBatch.Contract,
  GetBatchStatus.Contract,
  StartBatch.Contract,
  StreamProgress.Contract
).prefix("batch_") {}

export { CancelBatch, GetBatchStatus, RpcGroup, StartBatch, StreamProgress };
