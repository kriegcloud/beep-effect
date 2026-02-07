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
import * as S from "effect/Schema";

const toNonNegativeInt = (value: unknown) =>
  S.decodeUnknownSync(S.NonNegativeInt)(typeof value === "number" ? value : 0);

const readNumber = (record: Record<string, unknown> | null, key: string): number => {
  const value = record?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

const toBatchState = (
  batchId: string,
  status: string,
  input: Record<string, unknown> | null,
  output: Record<string, unknown> | null,
  error: string | null
): BatchState => {
  const totalDocuments = toNonNegativeInt(readNumber(output, "totalDocuments") || readNumber(input, "totalDocuments"));
  const successCount = toNonNegativeInt(readNumber(output, "successCount"));
  const failureCount = toNonNegativeInt(readNumber(output, "failureCount"));
  const entityCount = toNonNegativeInt(readNumber(output, "entityCount"));
  const relationCount = toNonNegativeInt(readNumber(output, "relationCount"));

  switch (status) {
    case "pending":
      return Pending.make({ batchId });
    case "running":
      return Extracting.make({
        batchId,
        completedDocuments: successCount,
        totalDocuments,
        progress: totalDocuments === 0 ? 0 : Number(successCount) / Number(totalDocuments),
      });
    case "completed":
      return Completed.make({
        batchId,
        totalDocuments,
        entityCount,
        relationCount,
      });
    case "cancelled":
      return Cancelled.make({
        batchId,
        completedDocuments: successCount,
        totalDocuments,
      });
    default:
      return Failed.make({
        batchId,
        failedDocuments: failureCount,
        error: error ?? "Batch execution failed",
      });
  }
};

export const Handler = Effect.fn("batch_getStatus")(function* (payload: Batch.GetBatchStatus.Payload) {
  const persistence = yield* WorkflowPersistence;
  const execution = yield* persistence
    .requireBatchExecutionByBatchId(payload.batchId)
    .pipe(Effect.catchTag("SqlError", () => new BatchNotFoundError({ batchId: payload.batchId })));

  return toBatchState(payload.batchId, execution.status, execution.input, execution.output, execution.error);
}, Effect.withSpan("batch_getStatus"));
