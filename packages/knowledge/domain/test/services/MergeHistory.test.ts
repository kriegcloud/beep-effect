import { MergeHistory } from "@beep/knowledge-domain/services";
import { MergeParams } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import { MergeHistoryTestLayer } from "../_shared/TestLayers";

describe("MergeHistory service", () => {
  effect("stub recordMerge fails with not implemented error", () =>
    Effect.gen(function* () {
      const mergeHistory = yield* MergeHistory;

      const params = new MergeParams({
        sourceEntityId: KnowledgeEntityIds.KnowledgeEntityId.create(),
        targetEntityId: KnowledgeEntityIds.KnowledgeEntityId.create(),
        mergeReason: "embedding_similarity",
        confidence: 0.92,
        mergedBy: undefined,
      });

      const exit = yield* Effect.exit(mergeHistory.recordMerge(params));

      strictEqual(Exit.isFailure(exit), true);
    }).pipe(Effect.provide(MergeHistoryTestLayer))
  );

  effect("stub getMergeHistory fails with not implemented error", () =>
    Effect.gen(function* () {
      const mergeHistory = yield* MergeHistory;

      const entityId = KnowledgeEntityIds.KnowledgeEntityId.create();
      const exit = yield* Effect.exit(mergeHistory.getMergeHistory(entityId));

      strictEqual(Exit.isFailure(exit), true);
    }).pipe(Effect.provide(MergeHistoryTestLayer))
  );

  effect("stub getMergesByUser fails with not implemented error", () =>
    Effect.gen(function* () {
      const mergeHistory = yield* MergeHistory;

      const userId = SharedEntityIds.UserId.create();
      const exit = yield* Effect.exit(mergeHistory.getMergesByUser(userId));

      strictEqual(Exit.isFailure(exit), true);
    }).pipe(Effect.provide(MergeHistoryTestLayer))
  );

  effect("MergeParams validates confidence between 0 and 1", () =>
    Effect.gen(function* () {
      const validParams = new MergeParams({
        sourceEntityId: KnowledgeEntityIds.KnowledgeEntityId.create(),
        targetEntityId: KnowledgeEntityIds.KnowledgeEntityId.create(),
        mergeReason: "manual_override",
        confidence: 1.0,
        mergedBy: SharedEntityIds.UserId.create(),
      });

      strictEqual(validParams.confidence, 1.0);
      strictEqual(validParams.mergeReason, "manual_override");
      strictEqual(validParams.mergedBy !== undefined, true);
    })
  );

  effect("MergeParams supports all merge reasons", () =>
    Effect.gen(function* () {
      const embeddingParams = new MergeParams({
        sourceEntityId: KnowledgeEntityIds.KnowledgeEntityId.create(),
        targetEntityId: KnowledgeEntityIds.KnowledgeEntityId.create(),
        mergeReason: "embedding_similarity",
        confidence: 0.85,
        mergedBy: undefined,
      });

      const manualParams = new MergeParams({
        sourceEntityId: KnowledgeEntityIds.KnowledgeEntityId.create(),
        targetEntityId: KnowledgeEntityIds.KnowledgeEntityId.create(),
        mergeReason: "manual_override",
        confidence: 1.0,
        mergedBy: SharedEntityIds.UserId.create(),
      });

      const textMatchParams = new MergeParams({
        sourceEntityId: KnowledgeEntityIds.KnowledgeEntityId.create(),
        targetEntityId: KnowledgeEntityIds.KnowledgeEntityId.create(),
        mergeReason: "text_exact_match",
        confidence: 0.99,
        mergedBy: undefined,
      });

      strictEqual(embeddingParams.mergeReason, "embedding_similarity");
      strictEqual(manualParams.mergeReason, "manual_override");
      strictEqual(textMatchParams.mergeReason, "text_exact_match");
    })
  );
});
