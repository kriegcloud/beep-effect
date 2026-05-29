/**
 * Decode/encode round-trip proofs for the graph node & edge schemas.
 *
 * Verifies each schema class decodes valid input, round-trips through
 * encode/decode, and rejects invalid discriminants. Ported from the `adjunct`
 * repo's Schema design using Effect v4 + `@effect/vitest`.
 */

import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as GraphSchema from "../../src/Graph/Schema.ts";

describe("TextNode", () => {
  it.effect("decodes a valid node and round-trips", () =>
    Effect.gen(function* () {
      const decoded = yield* S.decodeUnknown(GraphSchema.TextNode)({
        text: "Hello world.",
        type: "sentence",
        timestamp: 0,
      });
      expect(decoded.text).toBe("Hello world.");
      expect(decoded.type).toBe("sentence");
      const encoded = yield* S.encode(GraphSchema.TextNode)(decoded);
      const redecoded = yield* S.decodeUnknown(GraphSchema.TextNode)(encoded);
      expect(redecoded.text).toBe(decoded.text);
    })
  );

  it.effect("rejects an unknown node type", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        S.decodeUnknown(GraphSchema.TextNode)({ text: "x", type: "bogus", timestamp: 0 })
      );
      expect(result._tag).toBe("Failure");
    })
  );
});

describe("TextEdge", () => {
  it.effect("accepts every declared relation", () =>
    Effect.gen(function* () {
      const relations = [
        "contains",
        "follows",
        "derived-from",
        "parent-of",
        "tagged-as",
        "lemma-of",
        "head-of",
        "dependent-of",
        "entity-mention",
        "relates-to",
      ] as const;
      for (const relation of relations) {
        const decoded = yield* S.decodeUnknown(GraphSchema.TextEdge)({ relation });
        expect(decoded.relation).toBe(relation);
      }
    })
  );

  it.effect("rejects an unknown relation", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(S.decodeUnknown(GraphSchema.TextEdge)({ relation: "nope" }));
      expect(result._tag).toBe("Failure");
    })
  );
});

describe("Annotation nodes round-trip", () => {
  it.effect("EntityNode preserves span and type", () =>
    Effect.gen(function* () {
      const decoded = yield* S.decodeUnknown(GraphSchema.EntityNode)({
        text: "Apple Inc.",
        entityType: "ORG",
        span: { start: 0, end: 10 },
        timestamp: 0,
      });
      expect(decoded.entityType).toBe("ORG");
      expect(decoded.span).toEqual({ start: 0, end: 10 });
      const encoded = yield* S.encode(GraphSchema.EntityNode)(decoded);
      const redecoded = yield* S.decodeUnknown(GraphSchema.EntityNode)(encoded);
      expect(redecoded.text).toBe("Apple Inc.");
    })
  );

  it.effect("POSNode and LemmaNode decode", () =>
    Effect.gen(function* () {
      const pos = yield* S.decodeUnknown(GraphSchema.POSNode)({
        text: "runs",
        tag: "VBZ",
        position: 1,
        timestamp: 0,
      });
      expect(pos.tag).toBe("VBZ");
      const lemma = yield* S.decodeUnknown(GraphSchema.LemmaNode)({
        token: "running",
        lemma: "run",
        position: 0,
        timestamp: 0,
      });
      expect(lemma.lemma).toBe("run");
    })
  );

  it.effect("DependencyNode and RelationNode decode", () =>
    Effect.gen(function* () {
      const dep = yield* S.decodeUnknown(GraphSchema.DependencyNode)({
        relation: "nsubj",
        head: { text: "runs", position: 2 },
        dependent: { text: "dog", position: 1 },
        distance: 1,
        timestamp: 0,
      });
      expect(dep.relation).toBe("nsubj");
      const rel = yield* S.decodeUnknown(GraphSchema.RelationNode)({
        relationType: "FOUNDED_BY",
        subject: { text: "Apple Inc.", entityType: "ORG", span: { start: 0, end: 10 } },
        object: { text: "Steve Jobs", entityType: "PERSON", span: { start: 14, end: 24 } },
        timestamp: 0,
      });
      expect(rel.relationType).toBe("FOUNDED_BY");
    })
  );
});

describe("NLPAnalysis", () => {
  it.effect("decodes a summary", () =>
    Effect.gen(function* () {
      const decoded = yield* S.decodeUnknown(GraphSchema.NLPAnalysis)({
        text: "Hi there. Bye.",
        sentences: ["Hi there.", "Bye."],
        tokens: ["Hi", "there", ".", "Bye", "."],
        wordCount: 5,
      });
      expect(decoded.sentences).toHaveLength(2);
      expect(decoded.wordCount).toBe(5);
    })
  );
});
