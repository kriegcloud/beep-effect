import { BatchNotFoundError } from "@beep/knowledge-domain/errors";
import type { Batch } from "@beep/knowledge-domain/rpc/Batch";
import { BatchEventEmitter, WorkflowPersistence } from "@beep/knowledge-server/Workflow";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

export const Handler = Effect.fnUntraced(function* (payload: Batch.StreamProgress.Payload) {
  const emitter = yield* BatchEventEmitter;
  const persistence = yield* WorkflowPersistence;

  yield* persistence
    .requireBatchExecutionByBatchId(payload.batchId)
    .pipe(Effect.catchTag("SqlError", () => new BatchNotFoundError({ batchId: payload.batchId })));

  return emitter.subscribe(payload.batchId);
}, Stream.unwrap);
