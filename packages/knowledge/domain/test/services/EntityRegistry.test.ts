import { MentionRecord } from "@beep/knowledge-domain/entities";
import { EntityRegistry } from "@beep/knowledge-domain/services";
import { WorkspacesEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { EntityRegistryTestLayer } from "../_shared/TestLayers";

let mentionRowIdCounter = 0;

const makeMentionRecord = (
  overrides?:
    | undefined
    | Partial<{
        rawText: string;
        mentionType: string;
        confidence: number;
        chunkIndex: number;
        resolvedEntityId: KnowledgeEntityIds.KnowledgeEntityId.Type | undefined;
      }>
) => {
  const now = DateTime.unsafeNow();
  mentionRowIdCounter += 1;
  return MentionRecord.Model.make({
    id: KnowledgeEntityIds.MentionRecordId.create(),
    _rowId: KnowledgeEntityIds.MentionRecordId.privateSchema.make(mentionRowIdCounter),
    version: 1,
    organizationId: SharedEntityIds.OrganizationId.create(),
    extractionId: KnowledgeEntityIds.ExtractionId.create(),
    documentId: WorkspacesEntityIds.DocumentId.create(),
    chunkIndex: overrides?.chunkIndex ?? 0,
    rawText: overrides?.rawText ?? "Cristiano Ronaldo",
    mentionType: overrides?.mentionType ?? "http://schema.org/Person",
    confidence: overrides?.confidence ?? 0.95,
    responseHash: "sha256:abc123def456",
    extractedAt: now,
    createdAt: now,
    updatedAt: now,
    source: O.none(),
    deletedAt: O.none(),
    createdBy: O.none(),
    updatedBy: O.none(),
    deletedBy: O.none(),
    resolvedEntityId: overrides?.resolvedEntityId !== undefined ? O.some(overrides.resolvedEntityId) : O.none(),
  });
};

describe("EntityRegistry service", () => {
  effect("findCandidates returns empty array (stub)", () =>
    Effect.gen(function* () {
      const registry = yield* EntityRegistry;

      const mention = makeMentionRecord();
      const candidates = yield* registry.findCandidates(mention);

      strictEqual(A.length(candidates), 0);
    }).pipe(Effect.provide(EntityRegistryTestLayer))
  );

  effect("bloomFilterCheck returns true (stub assumes may exist)", () =>
    Effect.gen(function* () {
      const registry = yield* EntityRegistry;

      const result = yield* registry.bloomFilterCheck("cristiano ronaldo");

      strictEqual(result, true);
    }).pipe(Effect.provide(EntityRegistryTestLayer))
  );

  effect("fetchTextMatches returns empty array (stub)", () =>
    Effect.gen(function* () {
      const registry = yield* EntityRegistry;

      const matches = yield* registry.fetchTextMatches("cristiano ronaldo");

      strictEqual(A.length(matches), 0);
    }).pipe(Effect.provide(EntityRegistryTestLayer))
  );

  effect("rankBySimilarity returns empty array (stub)", () =>
    Effect.gen(function* () {
      const registry = yield* EntityRegistry;

      const mention = makeMentionRecord({
        rawText: "Al-Nassr FC",
        mentionType: "http://schema.org/SportsTeam",
        confidence: 0.9,
        chunkIndex: 1,
      });

      const ranked = yield* registry.rankBySimilarity(mention, []);

      strictEqual(A.length(ranked), 0);
    }).pipe(Effect.provide(EntityRegistryTestLayer))
  );

  effect("MentionRecord resolvedEntityId is Option.none when not provided", () =>
    Effect.gen(function* () {
      const mention = makeMentionRecord();

      strictEqual(O.isNone(mention.resolvedEntityId), true);
    })
  );

  effect("MentionRecord resolvedEntityId is Option.some when provided", () =>
    Effect.gen(function* () {
      const mention = makeMentionRecord({
        resolvedEntityId: KnowledgeEntityIds.KnowledgeEntityId.create(),
      });

      strictEqual(O.isSome(mention.resolvedEntityId), true);
    })
  );
});
