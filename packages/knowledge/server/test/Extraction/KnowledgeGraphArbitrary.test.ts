import { KnowledgeGraph } from "@beep/knowledge-server/Extraction";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Arbitrary from "effect/Arbitrary";
import * as Effect from "effect/Effect";
import * as FC from "effect/FastCheck";

const AllowedTypeIris = new Set([
  "https://schema.org/Event",
  "https://schema.org/Organization",
  "https://schema.org/Person",
  "https://schema.org/Place",
  "https://schema.org/LocalBusiness",
  "https://schema.org/Product",
  "https://schema.org/Offer",
  "https://schema.org/Action",
]);

describe("KnowledgeGraph arbitrary", () => {
  effect(
    "samples realistic graphs with consistent ids, stats, and indices",
    () =>
      Effect.sync(() => {
        const graphs = FC.sample(Arbitrary.make(KnowledgeGraph), { seed: 42, numRuns: 20 });

        for (const graph of graphs) {
          strictEqual(graph.stats.entityCount, graph.entities.length);
          strictEqual(graph.stats.relationCount, graph.relations.length);

          const entityIds = new Set(graph.entities.map((e) => e.id));

          for (const entity of graph.entities) {
            assertTrue(AllowedTypeIris.has(entity.primaryType));
            assertTrue(entity.types.length >= 1);
          }

          for (const [key, value] of Object.entries(graph.entityIndex)) {
            assertTrue(key.length > 0);
            assertTrue(entityIds.has(value));
          }

          for (const rel of graph.relations) {
            assertTrue(entityIds.has(rel.subjectId));

            const hasObjectId = rel.objectId !== undefined;
            const hasLiteral = rel.literalValue !== undefined;
            // One or the other is expected for our generator.
            assertTrue(hasObjectId || hasLiteral);
            assertTrue(!(hasObjectId && hasLiteral));

            if (rel.objectId !== undefined) {
              assertTrue(entityIds.has(rel.objectId));
            }

            assertTrue(rel.predicate.startsWith("https://schema.org/"));
            assertTrue(rel.confidence >= 0 && rel.confidence <= 1);

            if (rel.evidence !== undefined) {
              assertTrue(rel.evidence.length > 0);
            }
          }
        }
      }),
    10000
  );
});
