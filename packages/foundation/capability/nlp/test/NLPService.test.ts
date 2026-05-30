/**
 * Proofs for the NLPService facade: processText builds an annotated text graph,
 * and the entity/POS accessors delegate to the backend.
 *
 * Wired to the wink-nlp backend via NLPService.layer(WinkBackendLive) + WinkEngineLive.
 */

import { WinkBackendLive } from "@beep/nlp/Backend/WinkBackend";
import * as Graph from "@beep/nlp/Graph/AnnotatedTextGraph";
import * as NLPService from "@beep/nlp/NLPService";
import * as WinkEngine from "@beep/nlp/Wink/WinkEngine";
import { provideScopedLayer } from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as EffectGraph from "effect/Graph";
import * as Layer from "effect/Layer";

const TestLayer = Layer.provide(NLPService.layer(WinkBackendLive), WinkEngine.WinkEngineLive);

describe("NLPService", () => {
  it.effect(
    "processText builds an annotated text graph with a document root",
    Effect.fn(function* () {
      const graph = yield* NLPService.processText("The cat sat. The dog ran.");
      expect(EffectGraph.nodeCount(graph)).toBeGreaterThan(0);
      const docs = Graph.getTextNodes(graph).filter((entry) => entry.node.type === "document");
      expect(docs.length).toBe(1);
    }, provideScopedLayer(TestLayer))
  );

  it.effect(
    "tagPartsOfSpeech delegates to the backend",
    Effect.fn(function* () {
      const tagged = yield* NLPService.tagPartsOfSpeech("dogs run");
      expect(tagged.length).toBe(2);
    }, provideScopedLayer(TestLayer))
  );

  it.effect(
    "extractEntities delegates to the backend",
    Effect.fn(function* () {
      const entities = yield* NLPService.extractEntities("Meet me at 5pm.");
      for (const entity of entities) {
        expect(typeof entity.entityType).toBe("string");
      }
    }, provideScopedLayer(TestLayer))
  );
});
