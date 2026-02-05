import type { ExtractionResult } from "@beep/knowledge-server/Extraction/ExtractionPipeline";
import type { DocumentResult } from "@beep/knowledge-server/Workflow";
import { BatchAggregator, BatchAggregatorLive } from "@beep/knowledge-server/Workflow";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import type * as S from "effect/Schema";

type NonNegInt = S.Schema.Type<typeof S.NonNegativeInt>;
const asNonNeg = (n: number): NonNegInt => n as NonNegInt;

const makeSuccessResult = (docId: string, entityCount: number, relationCount: number): DocumentResult => ({
  documentId: docId,
  result: Either.right({
    stats: {
      entityCount: asNonNeg(entityCount),
      relationCount: asNonNeg(relationCount),
      chunkCount: asNonNeg(1),
      mentionCount: asNonNeg(5),
      tokensUsed: 100,
      clusteringEnabled: false,
    },
  } as unknown as ExtractionResult),
});

const makeFailureResult = (docId: string, error: string): DocumentResult => ({
  documentId: docId,
  result: Either.left(error),
});

describe("BatchAggregator", () => {
  effect(
    "aggregates all successful results",
    Effect.fn(function* () {
      const agg = yield* BatchAggregator;
      const batchId = KnowledgeEntityIds.BatchExecutionId.create();

      const results: ReadonlyArray<DocumentResult> = [
        makeSuccessResult("doc-1", 3, 2),
        makeSuccessResult("doc-2", 5, 1),
        makeSuccessResult("doc-3", 2, 4),
      ];

      const batch = agg.aggregate(batchId, results);

      strictEqual(batch.batchId, batchId);
      strictEqual(batch.totalDocuments, 3);
      strictEqual(batch.successCount, 3);
      strictEqual(batch.failureCount, 0);
      strictEqual(batch.entityCount, 10);
      strictEqual(batch.relationCount, 7);
    }, Effect.provide(BatchAggregatorLive))
  );

  effect(
    "aggregates mixed success and failure results",
    Effect.fn(function* () {
      const agg = yield* BatchAggregator;
      const batchId = KnowledgeEntityIds.BatchExecutionId.create();

      const results: ReadonlyArray<DocumentResult> = [
        makeSuccessResult("doc-1", 4, 2),
        makeFailureResult("doc-2", "extraction failed"),
        makeSuccessResult("doc-3", 6, 3),
      ];

      const batch = agg.aggregate(batchId, results);

      strictEqual(batch.totalDocuments, 3);
      strictEqual(batch.successCount, 2);
      strictEqual(batch.failureCount, 1);
      strictEqual(batch.entityCount, 10);
      strictEqual(batch.relationCount, 5);
    }, Effect.provide(BatchAggregatorLive))
  );

  effect(
    "handles all failures",
    Effect.fn(function* () {
      const agg = yield* BatchAggregator;
      const batchId = KnowledgeEntityIds.BatchExecutionId.create();

      const results: ReadonlyArray<DocumentResult> = [
        makeFailureResult("doc-1", "timeout"),
        makeFailureResult("doc-2", "parse error"),
        makeFailureResult("doc-3", "model unavailable"),
      ];

      const batch = agg.aggregate(batchId, results);

      strictEqual(batch.totalDocuments, 3);
      strictEqual(batch.successCount, 0);
      strictEqual(batch.failureCount, 3);
      strictEqual(batch.entityCount, 0);
      strictEqual(batch.relationCount, 0);
    }, Effect.provide(BatchAggregatorLive))
  );

  effect(
    "handles empty results",
    Effect.fn(function* () {
      const agg = yield* BatchAggregator;
      const batchId = KnowledgeEntityIds.BatchExecutionId.create();

      const results: ReadonlyArray<DocumentResult> = [];

      const batch = agg.aggregate(batchId, results);

      strictEqual(batch.totalDocuments, 0);
      strictEqual(batch.successCount, 0);
      strictEqual(batch.failureCount, 0);
      strictEqual(batch.entityCount, 0);
      strictEqual(batch.relationCount, 0);
    }, Effect.provide(BatchAggregatorLive))
  );

  effect(
    "preserves original document results",
    Effect.fn(function* () {
      const agg = yield* BatchAggregator;
      const batchId = KnowledgeEntityIds.BatchExecutionId.create();

      const results: ReadonlyArray<DocumentResult> = [
        makeSuccessResult("doc-1", 2, 1),
        makeFailureResult("doc-2", "error"),
      ];

      const batch = agg.aggregate(batchId, results);

      strictEqual(batch.documentResults, results);
    }, Effect.provide(BatchAggregatorLive))
  );

  effect(
    "preserves batchId in output",
    Effect.fn(function* () {
      const agg = yield* BatchAggregator;
      const batchId = KnowledgeEntityIds.BatchExecutionId.create();

      const batch = agg.aggregate(batchId, []);

      strictEqual(batch.batchId, batchId);
    }, Effect.provide(BatchAggregatorLive))
  );
});
