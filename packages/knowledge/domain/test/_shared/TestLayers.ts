import { MergeError } from "@beep/knowledge-domain/errors/merge.errors";
import { EntityRegistry, MergeHistory } from "@beep/knowledge-domain/services";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export const EntityRegistryTestLayer = Layer.succeed(EntityRegistry, {
  findCandidates: () => Effect.succeed([]),
  bloomFilterCheck: () => Effect.succeed(true),
  fetchTextMatches: () => Effect.succeed([]),
  rankBySimilarity: () => Effect.succeed([]),
});

export const MergeHistoryTestLayer = Layer.succeed(MergeHistory, {
  recordMerge: (params) =>
    Effect.fail(
      new MergeError({
        message: "MergeHistory.recordMerge not implemented - provide implementation via Layer",
        sourceEntityId: params.sourceEntityId,
        targetEntityId: params.targetEntityId,
      })
    ),
  getMergeHistory: (entityId) =>
    Effect.fail(
      new MergeError({
        message: "MergeHistory.getMergeHistory not implemented - provide implementation via Layer",
        targetEntityId: entityId,
      })
    ),
  getMergesByUser: () =>
    Effect.fail(
      new MergeError({
        message: "MergeHistory.getMergesByUser not implemented - provide implementation via Layer",
      })
    ),
});

export const EntityResolutionTestLayer = Layer.merge(EntityRegistryTestLayer, MergeHistoryTestLayer);
