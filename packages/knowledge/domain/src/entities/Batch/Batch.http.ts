import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { CancelBatch, GetBatchStatus, StartBatch } from "./contracts";

export class Http extends HttpApiGroup.make("batches")
  .add(CancelBatch.Contract.Http)
  .add(GetBatchStatus.Contract.Http)
  .add(StartBatch.Contract.Http)
  .prefix("/batches") {}
