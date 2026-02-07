import { Batch } from "@beep/knowledge-domain/rpc/Batch";
import { BatchMachineEvent } from "@beep/knowledge-domain/value-objects";
import { BatchActorRegistry, BatchEventEmitter } from "@beep/knowledge-server/Workflow";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const zero = S.decodeSync(S.NonNegativeInt)(0);

export const Handler = Effect.fn("batch_cancel")(function* (payload: Batch.CancelBatch.Payload) {
  const registry = yield* BatchActorRegistry;
  const emitter = yield* BatchEventEmitter;

  const actor = yield* registry.lookup(payload.batchId);
  yield* actor.send(BatchMachineEvent.Cancel);

  const now = yield* DateTime.now.pipe(Effect.map(DateTime.toUtc));

  yield* emitter.emit({
    _tag: "BatchEvent.BatchFailed" as const,
    batchId: payload.batchId,
    error: "Batch cancelled by user",
    failedDocuments: zero,
    timestamp: now,
  });

  return new Batch.CancelBatch.Success({
    batchId: payload.batchId,
    cancelled: true,
  });
}, Effect.withSpan("batch_cancel"));
