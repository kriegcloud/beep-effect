import { Batch } from "@beep/knowledge-domain/rpc/Batch";
import { BatchEventEmitter, BatchStateMachine } from "@beep/knowledge-server/Workflow";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

export const Handler = Effect.fn("batch_start")(
  function* (payload: Batch.StartBatch.Payload) {
    const stateMachine = yield* BatchStateMachine;
    const emitter = yield* BatchEventEmitter;

    const batchId = KnowledgeEntityIds.BatchExecutionId.create();
    const totalDocuments = yield* S.decode(S.NonNegativeInt)(A.length(payload.documentIds));
    const now = yield* DateTime.now;

    yield* stateMachine.create(batchId);

    yield* emitter.emit({
      _tag: "BatchEvent.BatchCreated" as const,
      batchId,
      totalDocuments,
      timestamp: now,
    });

    return new Batch.StartBatch.Success({
      batchId,
      totalDocuments,
    });
  },
  Effect.catchTag("ParseError", Effect.die),
  Effect.withSpan("batch_start")
);
