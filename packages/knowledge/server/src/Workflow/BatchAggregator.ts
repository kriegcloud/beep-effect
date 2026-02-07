import { $KnowledgeServerId } from "@beep/identity/packages";
import type { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import type { ExtractionResult } from "../Extraction/ExtractionPipeline";
import type { BatchResult, DocumentResult } from "./BatchOrchestrator";

const $I = $KnowledgeServerId.create("Workflow/BatchAggregator");

export interface BatchAggregatorShape {
  readonly aggregate: (
    batchId: KnowledgeEntityIds.BatchExecutionId.Type,
    results: ReadonlyArray<DocumentResult>
  ) => BatchResult;
}

export class BatchAggregator extends Context.Tag($I`BatchAggregator`)<BatchAggregator, BatchAggregatorShape>() {}

const serviceEffect = Effect.succeed(
  BatchAggregator.of({
    aggregate: (batchId, results) => {
      const successes = A.filter(results, (r) => Either.isRight(r.result));
      const failures = A.filter(results, (r) => Either.isLeft(r.result));

      const successExtractions: ReadonlyArray<ExtractionResult> = A.filterMap(results, (r) =>
        Either.isRight(r.result) ? O.some(r.result.right) : O.none()
      );

      const entityCount = A.reduce(successExtractions, 0, (acc, r) => acc + r.stats.entityCount);
      const relationCount = A.reduce(successExtractions, 0, (acc, r) => acc + r.stats.relationCount);

      return {
        batchId,
        documentResults: results,
        totalDocuments: A.length(results),
        successCount: A.length(successes),
        failureCount: A.length(failures),
        entityCount,
        relationCount,
      };
    },
  })
);

export const BatchAggregatorLive = Layer.effect(BatchAggregator, serviceEffect);
