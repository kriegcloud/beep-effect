import { $KnowledgeServerId } from "@beep/identity/packages";
import { CanonicalSelectionError } from "@beep/knowledge-domain/errors";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import type { AssembledEntity } from "../Extraction/GraphAssembler";

const $I = $KnowledgeServerId.create("EntityResolution/CanonicalSelector");

export class SelectionStrategy extends BS.StringLiteralKit(
  "highest_confidence",
  "most_attributes",
  "most_mentions",
  "hybrid"
).annotations(
  $I.annotations("SelectionStrategy", {
    description: "Strategy for selecting canonical entity",
  })
) {}

export declare namespace SelectionStrategy {
  export type Type = typeof SelectionStrategy.Type;
}

export class CanonicalSelectorConfigWeights extends S.Class<CanonicalSelectorConfigWeights>(
  "CanonicalSelectorConfigWeights"
)(
  {
    confidence: S.optional(S.Number),
    attributeCount: S.optional(S.Number),
    mentionLength: S.optional(S.Number),
  },
  $I.annotations("CanonicalSelectorConfigWeights", {
    description: "Weights for hybrid canonical entity selection",
  })
) {}

export class CanonicalSelectorConfig extends S.Class<CanonicalSelectorConfig>($I`CanonicalSelectorConfig`)(
  {
    strategy: S.optional(SelectionStrategy),
    weights: S.optional(CanonicalSelectorConfigWeights),
  },
  $I.annotations("CanonicalSelectorConfig", {
    description: "Configuration for canonical entity selection",
  })
) {}

const countAttributes = (entity: AssembledEntity): number => A.length(Struct.keys(entity.attributes));

const computeHybridScore = (
  entity: AssembledEntity,
  weights: { readonly confidence: number; readonly attributeCount: number; readonly mentionLength: number }
): number => {
  const confidenceScore = entity.confidence * weights.confidence;
  const attributeScore = Math.min(countAttributes(entity) / 10, 1) * weights.attributeCount;
  const mentionScore = Math.min(Str.length(entity.mention) / 50, 1) * weights.mentionLength;

  return confidenceScore + attributeScore + mentionScore;
};

export interface CanonicalSelectorShape {
  readonly selectCanonical: (
    cluster: readonly AssembledEntity[],
    config?: CanonicalSelectorConfig
  ) => Effect.Effect<AssembledEntity, CanonicalSelectionError, never>;
  readonly mergeAttributes: (
    canonical: AssembledEntity,
    members: readonly AssembledEntity[]
  ) => Effect.Effect<AssembledEntity, never, never>;
  readonly computeQualityScore: (entity: AssembledEntity) => Effect.Effect<number, never, never>;
}

export class CanonicalSelector extends Context.Tag($I`CanonicalSelector`)<
  CanonicalSelector,
  CanonicalSelectorShape
>() {}

const serviceEffect: Effect.Effect<CanonicalSelectorShape, never, never> = Effect.gen(function* () {
  const selectCanonical = Effect.fn(function* (
    cluster: readonly AssembledEntity[],
    config = new CanonicalSelectorConfig({})
  ) {
    if (A.isEmptyReadonlyArray(cluster)) {
      return yield* new CanonicalSelectionError({
        message: "Cannot select canonical from empty cluster",
        reason: "empty_cluster",
        clusterSize: 0,
      });
    }

    if (A.isNonEmptyReadonlyArray(cluster) && A.length(cluster) === 1) {
      return A.headNonEmpty(cluster);
    }

    const strategy = config.strategy ?? SelectionStrategy.Enum.hybrid;

    yield* Effect.logDebug("CanonicalSelector.selectCanonical").pipe(
      Effect.annotateLogs({
        strategy,
        clusterSize: A.length(cluster),
      })
    );

    const selected = Match.value(strategy).pipe(
      Match.when(SelectionStrategy.Enum.highest_confidence, () =>
        F.pipe(
          A.head(cluster),
          O.map((first) =>
            A.reduce(cluster, first, (best, current) => (current.confidence > best.confidence ? current : best))
          ),
          O.getOrUndefined
        )
      ),
      Match.when(SelectionStrategy.Enum.most_attributes, () =>
        F.pipe(
          A.head(cluster),
          O.map((first) =>
            A.reduce(cluster, first, (best, current) =>
              countAttributes(current) > countAttributes(best) ? current : best
            )
          ),
          O.getOrUndefined
        )
      ),
      Match.when(SelectionStrategy.Enum.most_mentions, () =>
        F.pipe(
          A.head(cluster),
          O.map((first) =>
            A.reduce(cluster, first, (best, current) =>
              Str.length(current.mention) > Str.length(best.mention) ? current : best
            )
          ),
          O.getOrUndefined
        )
      ),
      Match.orElse(() => {
        const weights = {
          confidence: config.weights?.confidence ?? 0.5,
          attributeCount: config.weights?.attributeCount ?? 0.3,
          mentionLength: config.weights?.mentionLength ?? 0.2,
        };

        return F.pipe(
          A.head(cluster),
          O.map((first) =>
            A.reduce(cluster, first, (best, current) =>
              computeHybridScore(current, weights) > computeHybridScore(best, weights) ? current : best
            )
          ),
          O.getOrUndefined
        );
      })
    );

    if (!selected) {
      return yield* new CanonicalSelectionError({
        message: "Failed to select canonical entity",
        reason: "selection_failed",
        clusterSize: A.length(cluster),
      });
    }

    yield* Effect.logDebug("CanonicalSelector.selectCanonical: selected").pipe(
      Effect.annotateLogs({
        canonicalId: selected.id,
        canonicalMention: selected.mention,
        confidence: selected.confidence,
      })
    );

    return selected;
  });
  const mergeAttributes = Effect.fn(function* (canonical: AssembledEntity, members: readonly AssembledEntity[]) {
    if (A.isEmptyReadonlyArray(members)) {
      return canonical;
    }

    yield* Effect.logDebug("CanonicalSelector.mergeAttributes").pipe(
      Effect.annotateLogs({
        canonicalId: canonical.id,
        memberCount: A.length(members),
      })
    );

    const mergedAttributes = A.reduce(
      A.flatMap(members, (member) => Struct.entries(member.attributes)),
      { ...canonical.attributes } as Record<string, string | number | boolean>,
      (acc, [key, value]) => {
        if (!(key in acc)) {
          acc[key] = value;
        }
        return acc;
      }
    );

    const allTypes = MutableHashSet.fromIterable(canonical.types);
    A.forEach(
      A.flatMap(members, (member) => member.types),
      (type) => MutableHashSet.add(allTypes, type)
    );

    const maxConfidence = Math.max(canonical.confidence, ...A.map(members, (m) => m.confidence));

    const merged: AssembledEntity = {
      ...canonical,
      types: A.fromIterable(allTypes),
      attributes: mergedAttributes,
      confidence: maxConfidence,
    };

    yield* Effect.logDebug("CanonicalSelector.mergeAttributes: complete").pipe(
      Effect.annotateLogs({
        originalAttributeCount: A.length(Struct.keys(canonical.attributes)),
        mergedAttributeCount: A.length(Struct.keys(mergedAttributes)),
        originalTypeCount: A.length(canonical.types),
        mergedTypeCount: A.length(merged.types),
      })
    );

    return merged;
  });
  const computeQualityScore = Effect.fn(function* (entity: AssembledEntity) {
    const weights = {
      confidence: 0.4,
      attributeCount: 0.3,
      mentionLength: 0.15,
      typeCount: 0.15,
    };

    const confidenceScore = entity.confidence * weights.confidence;
    const attributeScore = Math.min(countAttributes(entity) / 10, 1) * weights.attributeCount;
    const mentionScore = Math.min(Str.length(entity.mention) / 50, 1) * weights.mentionLength;
    const typeScore = Math.min(A.length(entity.types) / 5, 1) * weights.typeCount;

    return confidenceScore + attributeScore + mentionScore + typeScore;
  });

  return CanonicalSelector.of({
    selectCanonical,
    mergeAttributes,
    computeQualityScore,
  });
});

export const CanonicalSelectorLive = Layer.effect(CanonicalSelector, serviceEffect);
