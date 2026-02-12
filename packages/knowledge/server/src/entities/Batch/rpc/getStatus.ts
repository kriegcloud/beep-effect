import { BatchNotFoundError } from "@beep/knowledge-domain/errors";
import type { Batch } from "@beep/knowledge-domain/rpc/Batch";
import {
  type BatchState,
  Cancelled,
  Completed,
  Extracting,
  Failed,
  Pending,
} from "@beep/knowledge-domain/value-objects";
import { WorkflowPersistence } from "@beep/knowledge-server/Workflow";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";

const readNumber = (record: Record<string, unknown> | null, key: string): number => {
  const value = record?.[key];
  return P.isNumber(value) && Number.isFinite(value) ? value : 0;
};

const toBatchState = (
  batchId: string,
  status: string,
  input: Record<string, unknown> | null,
  output: Record<string, unknown> | null,
  error: string | null
): BatchState => {
  const totalDocuments = readNumber(output, "totalDocuments") || readNumber(input, "totalDocuments");
  const successCount = readNumber(output, "successCount");
  const failureCount = readNumber(output, "failureCount");
  const entityCount = readNumber(output, "entityCount");
  const relationCount = readNumber(output, "relationCount");

  return Match.value(status).pipe(
    Match.when("pending", () => Pending.make({ batchId })),
    Match.when("running", () =>
      Extracting.make({
        batchId,
        completedDocuments: successCount,
        totalDocuments,
        progress: totalDocuments === 0 ? 0 : Number(successCount) / Number(totalDocuments),
      })
    ),
    Match.when("completed", () => Completed.make({ batchId, totalDocuments, entityCount, relationCount })),
    Match.when("cancelled", () => Cancelled.make({ batchId, completedDocuments: successCount, totalDocuments })),
    Match.orElse(() =>
      Failed.make({ batchId, failedDocuments: failureCount, error: error ?? "Batch execution failed" })
    )
  );
};

export const Handler = Effect.fn("batch_getStatus")(function* (payload: Batch.GetBatchStatus.Payload) {
  const persistence = yield* WorkflowPersistence;
  const execution = yield* persistence
    .requireBatchExecutionByBatchId(payload.batchId)
    .pipe(Effect.catchTag("SqlError", () => new BatchNotFoundError({ batchId: payload.batchId })));

  return toBatchState(payload.batchId, execution.status, execution.input, execution.output, execution.error);
}, Effect.withSpan("batch_getStatus"));
