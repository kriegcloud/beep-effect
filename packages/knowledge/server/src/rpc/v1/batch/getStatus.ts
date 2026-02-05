import type { Batch } from "@beep/knowledge-domain/rpc/Batch";
import { BatchStateMachine } from "@beep/knowledge-server/Workflow";
import * as Effect from "effect/Effect";

export const Handler = Effect.fn("batch_getStatus")(
  function* (payload: Batch.GetBatchStatus.Payload) {
    const stateMachine = yield* BatchStateMachine;
    return yield* stateMachine.getState(payload.batchId);
  },
  Effect.withSpan("batch_getStatus")
);
