/**
 * Proofs for the generic IR handoff contract: encode/decode round-trips for the
 * AnnotatedDocument envelope, span validity, provenance completeness, and the
 * effectful makeProvenance constructor.
 */

import { Contract } from "@beep/nlp/Handoff";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { FastCheck as fc } from "effect/testing";

const sampleProvenance = Contract.Provenance.make({
  generatedBy: "wink-nlp",
  source: "doc-1",
  timestamp: 1_000,
});

const sampleDocument = Contract.AnnotatedDocument.make({
  chunks: [
    Contract.TextChunk.make({
      id: Contract.ChunkId.make("chunk-1"),
      kind: "sentence",
      provenance: sampleProvenance,
      span: Contract.Span.make({ end: 11, start: 0 }),
      text: "Hello world",
    }),
  ],
  entities: [
    Contract.Entity.make({
      canonicalName: "World",
      id: Contract.EntityId.make("entity-1"),
      mentions: [Contract.MentionId.make("mention-1")],
      provenance: sampleProvenance,
      type: "PLACE",
    }),
  ],
  provenance: sampleProvenance,
  relations: [
    Contract.Relation.make({
      id: Contract.RelationId.make("relation-1"),
      object: Contract.EntityId.make("entity-2"),
      provenance: sampleProvenance,
      subject: Contract.EntityId.make("entity-1"),
      type: "MENTIONS",
    }),
  ],
  version: "nlp-ir/1.0",
});

describe("AnnotatedDocument round-trip", () => {
  it.effect(
    "encode then decode preserves the document",
    Effect.fn(function* () {
      const encoded = yield* S.encodeUnknownEffect(Contract.AnnotatedDocument)(sampleDocument);
      const decoded = yield* S.decodeUnknownEffect(Contract.AnnotatedDocument)(encoded);
      expect(decoded.version).toBe("nlp-ir/1.0");
      expect(decoded.chunks.length).toBe(1);
      expect(decoded.entities.length).toBe(1);
      expect(decoded.relations.length).toBe(1);
      expect(decoded.chunks[0]?.text).toBe("Hello world");
    })
  );

  it.effect(
    "every chunk, entity, and relation carries provenance",
    Effect.fn(function* () {
      const encoded = yield* S.encodeUnknownEffect(Contract.AnnotatedDocument)(sampleDocument);
      const decoded = yield* S.decodeUnknownEffect(Contract.AnnotatedDocument)(encoded);
      expect(decoded.chunks.every((c) => typeof c.provenance.source === "string")).toBe(true);
      expect(decoded.entities.every((e) => typeof e.provenance.generatedBy === "string")).toBe(true);
      expect(decoded.relations.every((r) => typeof r.provenance.timestamp === "number")).toBe(true);
    })
  );
});

describe("Span", () => {
  it("round-trips integer spans with start <= end", () => {
    fc.assert(
      fc.property(fc.nat(1000), fc.nat(1000), (a, b) => {
        const start = Math.min(a, b);
        const end = Math.max(a, b);
        const span = Contract.Span.make({ end, start });
        return span.start <= span.end && span.start === start && span.end === end;
      })
    );
  });
});

describe("makeProvenance", () => {
  it.effect(
    "stamps timestamp from the clock and omits absent confidence",
    Effect.fn(function* () {
      const prov = yield* Contract.makeProvenance("doc-9", "wink-nlp");
      expect(prov.source).toBe("doc-9");
      expect(prov.generatedBy).toBe("wink-nlp");
      expect(typeof prov.timestamp).toBe("number");
      expect(prov.confidence).toBeUndefined();
    })
  );

  it.effect(
    "carries confidence when provided",
    Effect.fn(function* () {
      const prov = yield* Contract.makeProvenance("doc-9", "wink-nlp", 0.9);
      expect(prov.confidence).toBe(0.9);
    })
  );
});
