import * as RpcGroup from "@effect/rpc/RpcGroup";
import { CancelBatch, GetBatchStatus, StartBatch, StreamProgress } from "./contracts";

export class Rpcs extends RpcGroup.make(
  CancelBatch.Contract.Rpc,
  GetBatchStatus.Contract.Rpc,
  StartBatch.Contract.Rpc,
  StreamProgress.Contract.Rpc
).prefix("batch_") {}

export { CancelBatch, GetBatchStatus, StartBatch, StreamProgress };
