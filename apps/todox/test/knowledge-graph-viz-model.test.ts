import {
  AssembledEntity,
  AssembledRelation,
  KnowledgeGraph,
  KnowledgeGraphStats,
} from "@beep/knowledge-server/Extraction";
import { assertTrue, deepStrictEqual, describe, it, strictEqual } from "@beep/testkit";
import {
  degree,
  fromKnowledgeGraph,
  neighborsDirected,
  toEffectGraph,
} from "../src/features/knowledge-graph/viz/model";

describe("knowledge-graph/viz/model", () => {
  it("fromKnowledgeGraph creates unique nodes and only objectId relations become links", () => {
    const e1 = new AssembledEntity({
      id: "e1",
      mention: "Alice",
      canonicalName: "Alice",
      primaryType: "https://schema.org/Person",
      types: ["https://schema.org/Person"],
      attributes: { email: "alice@example.com" },
      confidence: 0.93,
    });
    const e2 = new AssembledEntity({
      id: "e2",
      mention: "Acme Corp",
      canonicalName: "Acme Corp",
      primaryType: "https://schema.org/Organization",
      types: ["https://schema.org/Organization"],
      attributes: { location: "NYC" },
      confidence: 0.88,
    });
    const e3 = new AssembledEntity({
      id: "e3",
      mention: "Conference 2026",
      canonicalName: "Conference 2026",
      primaryType: "https://schema.org/Event",
      types: ["https://schema.org/Event"],
      attributes: { startDate: "2026-02-01" },
      confidence: 0.81,
    });

    const r1 = new AssembledRelation({
      id: "r1",
      subjectId: "e1",
      predicate: "https://schema.org/worksFor",
      objectId: "e2",
      confidence: 0.77,
    });

    const r2 = new AssembledRelation({
      id: "r2",
      subjectId: "e1",
      predicate: "https://schema.org/email",
      literalValue: "alice@example.com",
      literalType: "https://schema.org/Text",
      confidence: 0.9,
    });

    const r3 = new AssembledRelation({
      id: "r3",
      subjectId: "e2",
      predicate: "https://schema.org/organizer",
      objectId: "missing",
      confidence: 0.7,
    });

    const graph = new KnowledgeGraph({
      entities: [e1, e2, e3],
      relations: [r1, r2, r3],
      entityIndex: {},
      stats: new KnowledgeGraphStats({
        entityCount: 3,
        relationCount: 3,
        unresolvedSubjects: 0,
        unresolvedObjects: 1,
      }),
    });

    const viz = fromKnowledgeGraph(graph);

    strictEqual(viz.nodes.length, 3);
    strictEqual(new Set(viz.nodes.map((n) => n.id)).size, 3);

    // Only relations with objectId become links.
    strictEqual(viz.links.length, 1);
    strictEqual(viz.links[0]?.id, "r1");

    // Literal relation is captured for subject.
    strictEqual((viz.literalsBySubjectId.e1 ?? []).length, 1);

    // Dropped link due to missing endpoint is counted.
    strictEqual(viz.stats.droppedLinkCount, 1);

    // Endpoints exist for all rendered links.
    const nodeIdSet = new Set(viz.nodes.map((n) => n.id));
    for (const l of viz.links) {
      assertTrue(nodeIdSet.has(l.sourceId));
      assertTrue(nodeIdSet.has(l.targetId));
    }

    // TypeIri preserved.
    const byId = new Map(viz.nodes.map((n) => [n.id, n] as const));
    strictEqual(byId.get("e1")?.typeIri, "https://schema.org/Person");
  });

  it("effect/Graph neighbor and degree helpers behave on a small fixture", () => {
    const graph = new KnowledgeGraph({
      entities: [
        new AssembledEntity({
          id: "a",
          mention: "A",
          primaryType: "https://schema.org/Person",
          types: ["https://schema.org/Person"],
          attributes: {},
          confidence: 0.9,
        }),
        new AssembledEntity({
          id: "b",
          mention: "B",
          primaryType: "https://schema.org/Organization",
          types: ["https://schema.org/Organization"],
          attributes: {},
          confidence: 0.9,
        }),
        new AssembledEntity({
          id: "c",
          mention: "C",
          primaryType: "https://schema.org/Event",
          types: ["https://schema.org/Event"],
          attributes: {},
          confidence: 0.9,
        }),
      ],
      relations: [
        new AssembledRelation({
          id: "ab",
          subjectId: "a",
          predicate: "https://schema.org/memberOf",
          objectId: "b",
          confidence: 0.8,
        }),
        new AssembledRelation({
          id: "bc",
          subjectId: "b",
          predicate: "https://schema.org/organizer",
          objectId: "c",
          confidence: 0.8,
        }),
      ],
      entityIndex: {},
      stats: new KnowledgeGraphStats({
        entityCount: 3,
        relationCount: 2,
        unresolvedSubjects: 0,
        unresolvedObjects: 0,
      }),
    });

    const viz = fromKnowledgeGraph(graph);
    const model = toEffectGraph(viz);

    const nB = neighborsDirected(model, "b");
    strictEqual(nB.incoming.length, 1);
    strictEqual(nB.outgoing.length, 1);
    strictEqual(nB.incoming[0]?.id, "a");
    strictEqual(nB.outgoing[0]?.id, "c");

    strictEqual(degree(model, "a"), 1);
    strictEqual(degree(model, "b"), 2);
    strictEqual(degree(model, "c"), 1);

    // No accidental literal edges created.
    strictEqual(viz.links.length, 2);
    deepStrictEqual(
      viz.links
        .map((l) => l.id)
        .slice()
        .sort(),
      ["ab", "bc"]
    );
  });
});
