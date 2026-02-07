import type { Batch } from "@beep/knowledge-domain/rpc/Batch";
import { BatchActorRegistry, BatchEventEmitter } from "@beep/knowledge-server/Workflow";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

export const Handler = Effect.fnUntraced(function* (payload: Batch.StreamProgress.Payload) {
  const emitter = yield* BatchEventEmitter;
  const registry = yield* BatchActorRegistry;

  yield* registry.lookup(payload.batchId);

  return emitter.subscribe(payload.batchId);
}, Stream.unwrap);
