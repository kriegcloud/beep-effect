import { Batch } from "@beep/knowledge-domain/rpc/Batch";
import { BatchConfig } from "@beep/knowledge-domain/value-objects";
import { BatchOrchestrator } from "@beep/knowledge-server/Workflow";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

export const Handler = Effect.fn("batch_start")(
  function* (payload: Batch.StartBatch.Payload) {
    const orchestrator = yield* BatchOrchestrator;

    const batchId = KnowledgeEntityIds.BatchExecutionId.create();
    const totalDocuments = yield* S.decode(S.NonNegativeInt)(A.length(payload.documents));

    const config = payload.config ?? new BatchConfig({});

    yield* orchestrator
      .run({
        batchId,
        organizationId: payload.organizationId,
        ontologyId: payload.ontologyId,
        documents: A.map(payload.documents, (doc) => ({
          documentId: doc.documentId,
          text: doc.text,
          ontologyContent: payload.ontologyContent,
        })),
        config,
      })
      .pipe(
        Effect.catchAllCause((cause) =>
          Effect.logError("batch_start: orchestrator failed").pipe(
            Effect.annotateLogs({ batchId, cause: String(cause) })
          )
        ),
        Effect.forkDaemon
      );

    return new Batch.StartBatch.Success({
      batchId,
      totalDocuments,
    });
  },
  Effect.catchTag("ParseError", Effect.die),
  Effect.withSpan("batch_start")
);
