/**
 * Proofs for the wink-nlp backend: tokenize/sentencize/posTag/lemmatize/
 * extractEntities produce the expected node shapes, and the unsupported
 * operations (parseDependencies/extractRelations) fail with BackendNotSupported.
 *
 * Runs against the real wink-nlp model via WinkEngineLive.
 */

import * as Backend from "@beep/nlp/Backend/NLPBackend";
import { WinkBackendLive } from "@beep/nlp/Backend/WinkBackend";
import * as WinkEngine from "@beep/nlp/Wink/WinkEngine";
import { provideScopedLayer } from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const TestLayer = Layer.provide(WinkBackendLive, WinkEngine.WinkEngineLive);

describe("WinkBackend", () => {
  it.effect("tokenizes text into words", () =>
    Effect.gen(function* () {
      const backend = yield* Backend.NLPBackend;
      const tokens = yield* backend.tokenize("Hello world");
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens).toContain("Hello");
    }).pipe(provideScopedLayer(TestLayer))
  );

  it.effect("splits text into sentences", () =>
    Effect.gen(function* () {
      const backend = yield* Backend.NLPBackend;
      const sentences = yield* backend.sentencize("Hello world. How are you?");
      expect(sentences.length).toBe(2);
    }).pipe(provideScopedLayer(TestLayer))
  );

  it.effect("tags parts of speech, one POSNode per token", () =>
    Effect.gen(function* () {
      const backend = yield* Backend.NLPBackend;
      const tagged = yield* backend.posTag("dogs run");
      expect(tagged.length).toBe(2);
      expect(tagged[0]?.text).toBe("dogs");
      expect(typeof tagged[0]?.tag).toBe("string");
      expect(tagged[0]?.position).toBe(0);
    }).pipe(provideScopedLayer(TestLayer))
  );

  it.effect("lemmatizes tokens to canonical forms", () =>
    Effect.gen(function* () {
      const backend = yield* Backend.NLPBackend;
      const lemmas = yield* backend.lemmatize("running dogs");
      expect(lemmas.length).toBe(2);
      expect(lemmas[0]?.token).toBe("running");
      expect(typeof lemmas[0]?.lemma).toBe("string");
    }).pipe(provideScopedLayer(TestLayer))
  );

  it.effect("extracts entities with a type and span", () =>
    Effect.gen(function* () {
      const backend = yield* Backend.NLPBackend;
      const entities = yield* backend.extractEntities("Meet me at 5pm on Monday.");
      // wink detects temporal entities; each carries a type + span
      for (const entity of entities) {
        expect(typeof entity.entityType).toBe("string");
        expect(entity.span.end).toBeGreaterThanOrEqual(entity.span.start);
      }
    }).pipe(provideScopedLayer(TestLayer))
  );

  it.effect("fails parseDependencies with BackendNotSupported", () =>
    Effect.gen(function* () {
      const backend = yield* Backend.NLPBackend;
      const result = yield* Effect.flip(backend.parseDependencies("a sentence"));
      expect(result._tag).toBe("BackendNotSupported");
    }).pipe(provideScopedLayer(TestLayer))
  );

  it.effect("fails extractRelations with BackendNotSupported", () =>
    Effect.gen(function* () {
      const backend = yield* Backend.NLPBackend;
      const result = yield* Effect.flip(backend.extractRelations("a sentence"));
      expect(result._tag).toBe("BackendNotSupported");
    }).pipe(provideScopedLayer(TestLayer))
  );
});
