import { BatchNotFoundError, InvalidStateTransitionError } from "@beep/knowledge-domain/errors";
import { Batch } from "@beep/knowledge-domain/rpc/Batch";
import { BatchEventEmitter, WorkflowPersistence } from "@beep/knowledge-server/Workflow";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const zero = S.decodeSync(S.NonNegativeInt)(0);

export const Handler = Effect.fn("batch_cancel")(function* (payload: Batch.CancelBatch.Payload) {
  const emitter = yield* BatchEventEmitter;
  const persistence = yield* WorkflowPersistence;

  const execution = yield* persistence.requireBatchExecutionByBatchId(payload.batchId).pipe(
    Effect.catchTag("BatchNotFoundError", () => new BatchNotFoundError({ batchId: payload.batchId })),
    Effect.catchTag("SqlError", () => new BatchNotFoundError({ batchId: payload.batchId }))
  );

  if (execution.status === "completed" || execution.status === "failed" || execution.status === "cancelled") {
    return yield* new InvalidStateTransitionError({
      batchId: payload.batchId,
      currentState: execution.status,
      attemptedState: "cancelled",
    });
  }

  yield* persistence.cancelExecution(execution.id, "Batch cancelled by user").pipe(
    Effect.catchTag("WorkflowNotFoundError", () => new BatchNotFoundError({ batchId: payload.batchId })),
    Effect.catchTag("SqlError", () => new BatchNotFoundError({ batchId: payload.batchId }))
  );

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
