/**
 * Proofs for the AnnotatedTextGraph: annotated construction over a stub
 * NLPBackend, the idempotence of each annotation pass, the node-kind type
 * guards, and the count/filter queries.
 *
 * Ported from the `adjunct` repo's AnnotatedTextGraph tests to Effect v4 +
 * `@effect/vitest`. A deterministic stub backend stands in for wink so the proofs
 * assert structure, not linguistic accuracy.
 */

import { NLPBackend } from "@beep/nlp/Backend/NLPBackend";
import * as ATG from "@beep/nlp/Graph/AnnotatedTextGraph";
import { EntityNode, LemmaNode, POSNode } from "@beep/nlp/Graph/Schema";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const words = (text: string): ReadonlyArray<string> => text.split(/\s+/).filter((w) => w.length > 0);

const StubBackend = Layer.succeed(
  NLPBackend,
  NLPBackend.of({
    name: "stub",
    capabilities: {
      tokenization: true,
      sentencization: true,
      posTagging: true,
      lemmatization: true,
      ner: true,
      dependencyParsing: true,
      relationExtraction: false,
      coreferenceResolution: false,
      constituencyParsing: false,
    },
    tokenize: (text) => Effect.succeed(words(text)),
    sentencize: (text) =>
      Effect.succeed(
        text
          .split(/(?<=[.!?])\s+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      ),
    posTag: (text) =>
      Effect.succeed(words(text).map((w, i) => POSNode.make({ text: w, tag: "NN", position: i, timestamp: 0 }))),
    lemmatize: (text) =>
      Effect.succeed(
        words(text).map((w, i) => LemmaNode.make({ token: w, lemma: w.toLowerCase(), position: i, timestamp: 0 }))
      ),
    extractEntities: (text) =>
      Effect.succeed(
        words(text)
          .filter((w) => w.length > 0 && w[0] === w[0]?.toUpperCase())
          .map((w) => EntityNode.make({ text: w, entityType: "MISC", span: { start: 0, end: w.length }, timestamp: 0 }))
      ),
    parseDependencies: () => Effect.succeed([]),
    extractRelations: () => Effect.succeed([]),
  })
);

describe("AnnotatedTextGraph construction", () => {
  it.effect("empty has no nodes", () =>
    Effect.gen(function* () {
      expect(ATG.nodeCount(ATG.empty())).toBe(0);
    })
  );

  it.effect("fromDocumentAnnotated builds doc + sentences + annotations", () =>
    Effect.gen(function* () {
      const g = yield* ATG.fromDocumentAnnotated("Apple makes phones. Steve founded it.").pipe(
        Effect.provide(StubBackend)
      );
      const textNodes = ATG.getTextNodes(g);
      // 1 document + 2 sentences
      expect(textNodes.length).toBe(3);
      expect(ATG.getPOSNodes(g).length).toBeGreaterThan(0);
      expect(ATG.getLemmaNodes(g).length).toBeGreaterThan(0);
      expect(ATG.getEntityNodes(g).length).toBeGreaterThan(0);
    })
  );
});

describe("AnnotatedTextGraph annotation passes are idempotent", () => {
  it.effect("re-running addPOSAnnotations does not duplicate", () =>
    Effect.gen(function* () {
      const g0 = yield* ATG.fromDocumentAnnotated("One two three.", {
        includePOS: true,
        includeLemmas: false,
        includeEntities: false,
      }).pipe(Effect.provide(StubBackend));
      const posAfterFirst = ATG.getPOSNodes(g0).length;
      const g1 = yield* ATG.addPOSAnnotations(g0).pipe(Effect.provide(StubBackend));
      expect(ATG.getPOSNodes(g1).length).toBe(posAfterFirst);
    })
  );

  it.effect("re-running addEntityAnnotations does not duplicate", () =>
    Effect.gen(function* () {
      const g0 = yield* ATG.fromDocumentAnnotated("Apple Steve Jobs.", {
        includePOS: false,
        includeLemmas: false,
        includeEntities: true,
      }).pipe(Effect.provide(StubBackend));
      const entitiesAfterFirst = ATG.getEntityNodes(g0).length;
      expect(entitiesAfterFirst).toBeGreaterThan(0);
      const g1 = yield* ATG.addEntityAnnotations(g0).pipe(Effect.provide(StubBackend));
      expect(ATG.getEntityNodes(g1).length).toBe(entitiesAfterFirst);
    })
  );
});

describe("AnnotatedTextGraph queries", () => {
  it.effect("countNodesByType sums to total node count", () =>
    Effect.gen(function* () {
      const g = yield* ATG.fromDocumentAnnotated("Hello world.").pipe(Effect.provide(StubBackend));
      const counts = ATG.countNodesByType(g);
      const sum = counts.text + counts.pos + counts.entity + counts.lemma + counts.dependency + counts.relation;
      expect(sum).toBe(ATG.nodeCount(g));
    })
  );

  it.effect("filterByPOSTag returns only matching nodes", () =>
    Effect.gen(function* () {
      const g = yield* ATG.fromDocumentAnnotated("Alpha beta gamma.", {
        includePOS: true,
        includeLemmas: false,
        includeEntities: false,
      }).pipe(Effect.provide(StubBackend));
      const nn = ATG.filterByPOSTag(g, "NN");
      expect(nn.length).toBeGreaterThan(0);
      expect(nn.every((p) => p.tag === "NN")).toBe(true);
      expect(ATG.filterByPOSTag(g, "VB").length).toBe(0);
    })
  );

  it.effect("type guards discriminate the node union", () =>
    Effect.gen(function* () {
      const g = yield* ATG.fromDocumentAnnotated("Hi.", {
        includePOS: true,
        includeLemmas: false,
        includeEntities: false,
      }).pipe(Effect.provide(StubBackend));
      const nodes = ATG.toArray(g);
      expect(nodes.some(ATG.isTextNode)).toBe(true);
      expect(nodes.some(ATG.isPOSNode)).toBe(true);
      expect(nodes.some(ATG.isRelationNode)).toBe(false);
    })
  );
});
