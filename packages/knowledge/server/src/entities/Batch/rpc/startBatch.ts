import { Batch } from "@beep/knowledge-domain/rpc/Batch";
import { BatchConfig } from "@beep/knowledge-domain/values";
import { BatchOrchestrator } from "@beep/knowledge-server/Workflow";
import { KnowledgeEntityIds, Policy } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";

export const Handler = Effect.fn("batch_start")(function* (payload: Batch.StartBatch.Payload) {
  const { session } = yield* Policy.AuthContext;
  const orchestrator = yield* BatchOrchestrator;

  const batchId = KnowledgeEntityIds.BatchExecutionId.create();
  const config = payload.config ?? BatchConfig.new();
  const accepted = yield* orchestrator.start({
    batchId,
    organizationId: payload.organizationId,
    ontologyId: payload.ontologyId,
    documents: A.map(payload.documents, (doc) => ({
      documentId: doc.documentId,
      text: doc.text,
      ontologyContent: payload.ontologyContent,
    })),
    currentUserId: session.userId,
    config,
  });

  return new Batch.StartBatch.Success({
    batchId: accepted.batchId,
    totalDocuments: accepted.totalDocuments,
  });
}, Effect.withSpan("batch_start"));
