import { Entities, ValueObjects } from "@beep/knowledge-domain";
import { MergeHistory } from "@beep/knowledge-domain/services";
import { EntityRepo, type EntityRepoShape } from "@beep/knowledge-server/db/repos/Entity.repo";
import { MentionRecordRepo, type MentionRecordRepoShape } from "@beep/knowledge-server/db/repos/MentionRecord.repo";
import { EntityRegistry } from "@beep/knowledge-server/EntityResolution/EntityRegistry";
import {
  CrossBatchEntityResolver,
  CrossBatchEntityResolverLive,
} from "@beep/knowledge-server/Service/CrossBatchEntityResolver";
import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";

describe("CrossBatchEntityResolver", () => {
  effect("links to an existing entity when candidates exist, otherwise creates a new entity", () =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;

      const orgId = SharedEntityIds.OrganizationId.create();
      const docId = DocumentsEntityIds.DocumentId.create();
      const extractionId = KnowledgeEntityIds.ExtractionId.create();
      const userId = SharedEntityIds.UserId.make("shared_user__87654321-4321-4321-4321-210987654321");

      const mention1 = Entities.MentionRecord.Model.insert.make({
        id: KnowledgeEntityIds.MentionRecordId.create(),
        organizationId: orgId,
        extractionId,
        documentId: docId,
        chunkIndex: 0,
        rawText: "Alice",
        mentionType: "http://example.org/Person",
        confidence: 0.9,
        responseHash: "hash",
        extractedAt: now,
        source: O.none(),
        deletedAt: O.none(),
        createdBy: O.some(userId),
        updatedBy: O.some(userId),
        deletedBy: O.none(),
        resolvedEntityId: O.none(),
      });

      const mention2 = Entities.MentionRecord.Model.insert.make({
        ...mention1,
        id: KnowledgeEntityIds.MentionRecordId.create(),
        rawText: "Bob",
      });

      const existingEntityId = KnowledgeEntityIds.KnowledgeEntityId.create();
      const existingEntity = S.decodeSync(Entities.Entity.Model)({
        id: existingEntityId,
        _rowId: 1,
        version: 1,
        source: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        createdBy: null,
        updatedBy: null,
        deletedBy: null,
        organizationId: orgId,
        mention: "Alice",
        types: ["http://example.org/Person"],
        attributes: {},
        ontologyId: null,
        documentId: docId,
        sourceUri: null,
        extractionId,
        groundingConfidence: null,
        mentions: null,
      });

      const entityRepoInserts = yield* Ref.make(0);
      const mentionUpdates = yield* Ref.make<
        ReadonlyArray<{
          readonly mentionId: KnowledgeEntityIds.MentionRecordId.Type;
          readonly entityId: KnowledgeEntityIds.KnowledgeEntityId.Type;
        }>
      >([]);

      const registryLayer = Layer.succeed(EntityRegistry, {
        findCandidates: (mention) =>
          mention.rawText === "Alice"
            ? Effect.succeed([
                new ValueObjects.EntityCandidate({
                  entity: existingEntity,
                  similarityScore: 0.95,
                }),
              ])
            : Effect.succeed([]),
        bloomFilterCheck: () => Effect.die("not implemented"),
        fetchTextMatches: () => Effect.die("not implemented"),
        rankBySimilarity: () => Effect.die("not implemented"),
        addToBloomFilter: () => Effect.void,
        bulkAddToBloomFilter: () => Effect.die("not implemented"),
        getBloomFilterStats: () => Effect.die("not implemented"),
      });

      const entityRepoStub: EntityRepoShape = {
        insert: () => Ref.update(entityRepoInserts, (n) => n + 1).pipe(Effect.as(existingEntity)),
        insertVoid: () => Ref.update(entityRepoInserts, (n) => n + 1).pipe(Effect.asVoid),
        insertManyVoid: () => Effect.die("not implemented"),
        update: () => Effect.die("not implemented"),
        updateVoid: () => Effect.die("not implemented"),
        findById: () => Effect.die("not implemented"),
        delete: () => Effect.die("not implemented"),
        findByIds: () => Effect.die("not implemented"),
        findByOntology: () => Effect.die("not implemented"),
        findByType: () => Effect.die("not implemented"),
        countByOrganization: () => Effect.die("not implemented"),
        findByNormalizedText: () => Effect.die("not implemented"),
      };
      const entityRepoLayer = Layer.succeed(EntityRepo, entityRepoStub);

      const mentionRepoStub: MentionRecordRepoShape = {
        insert: () => Effect.die("not implemented"),
        insertVoid: () => Effect.die("not implemented"),
        insertManyVoid: () => Effect.die("not implemented"),
        update: () => Effect.die("not implemented"),
        updateVoid: () => Effect.die("not implemented"),
        findById: () => Effect.die("not implemented"),
        delete: () => Effect.die("not implemented"),
        findByExtractionId: () => Effect.die("not implemented"),
        findByResolvedEntityId: () => Effect.die("not implemented"),
        findUnresolved: () => Effect.die("not implemented"),
        updateResolvedEntityId: (mentionRecordId, entityId) =>
          Ref.update(mentionUpdates, A.append({ mentionId: mentionRecordId, entityId })).pipe(Effect.asVoid),
      };
      const mentionRepoLayer = Layer.succeed(MentionRecordRepo, mentionRepoStub);

      const mergeHistoryLayer = Layer.succeed(MergeHistory, {
        recordMerge: () => Effect.die("not implemented"),
        getMergeHistory: () => Effect.die("not implemented"),
        getMergesByUser: () => Effect.die("not implemented"),
      });

      const layers = Layer.provide(
        CrossBatchEntityResolverLive,
        Layer.mergeAll(registryLayer, entityRepoLayer, mentionRepoLayer, mergeHistoryLayer)
      );

      const result = yield* Effect.gen(function* () {
        const resolver = yield* CrossBatchEntityResolver;
        return yield* resolver.resolveMentions([mention1, mention2]);
      }).pipe(Effect.provide(layers));

      strictEqual(result.stats.total, 2);
      strictEqual(result.stats.linkedExisting, 1);
      strictEqual(result.stats.createdNew, 1);

      const createdCount = yield* Ref.get(entityRepoInserts);
      strictEqual(createdCount, 1);

      const updates = yield* Ref.get(mentionUpdates);
      strictEqual(updates.length, 2);
      assertTrue(A.some(updates, (u) => u.mentionId === mention1.id && u.entityId === existingEntityId));
    })
  );
});
