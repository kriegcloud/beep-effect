import { Batch } from "@beep/knowledge-domain/rpc/Batch";
import type { BatchState } from "@beep/knowledge-domain/value-objects";
import { BatchEventEmitter, BatchStateMachine } from "@beep/knowledge-server/Workflow";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as S from "effect/Schema";

const zero = S.decodeSync(S.NonNegativeInt)(0);

const toCancelledState = (batchId: BatchState["batchId"], currentState: BatchState): BatchState =>
  Match.value(currentState).pipe(
    Match.tag("BatchState.Extracting", (s) => ({
      _tag: "BatchState.Cancelled" as const,
      batchId,
      completedDocuments: s.completedDocuments,
      totalDocuments: s.totalDocuments,
    })),
    Match.orElse(() => ({
      _tag: "BatchState.Cancelled" as const,
      batchId,
      completedDocuments: zero,
      totalDocuments: zero,
    }))
  );

export const Handler = Effect.fn("batch_cancel")(function* (payload: Batch.CancelBatch.Payload) {
  const stateMachine = yield* BatchStateMachine;
  const emitter = yield* BatchEventEmitter;

  const currentState = yield* stateMachine.getState(payload.batchId);
  const cancelledState = toCancelledState(payload.batchId, currentState);

  yield* stateMachine.transition(payload.batchId, cancelledState);

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
