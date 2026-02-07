import type { Batch } from "@beep/knowledge-domain/rpc/Batch";
import { BatchActorRegistry, mapActorStateToBatchState } from "@beep/knowledge-server/Workflow";
import * as Effect from "effect/Effect";

export const Handler = Effect.fn("batch_getStatus")(function* (payload: Batch.GetBatchStatus.Payload) {
  const registry = yield* BatchActorRegistry;
  const actor = yield* registry.lookup(payload.batchId);
  const machineState = yield* actor.snapshot;
  return mapActorStateToBatchState(machineState);
}, Effect.withSpan("batch_getStatus"));
