import type { Batch } from "@beep/knowledge-domain/rpc/Batch";
import { BatchEventEmitter, BatchStateMachine } from "@beep/knowledge-server/Workflow";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

export const Handler = Effect.fnUntraced(function* (payload: Batch.StreamProgress.Payload) {
  const emitter = yield* BatchEventEmitter;
  const stateMachine = yield* BatchStateMachine;

  yield* stateMachine.getState(payload.batchId);

  return emitter.subscribe(payload.batchId);
}, Stream.unwrap);
