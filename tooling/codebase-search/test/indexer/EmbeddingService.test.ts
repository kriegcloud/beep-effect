import {
  DEFAULT_BATCH_SIZE,
  EMBEDDING_DIMENSIONS,
  EmbeddingService,
  EmbeddingServiceMock,
} from "@beep/codebase-search";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Option } from "effect";
import * as A from "effect/Array";

layer(EmbeddingServiceMock)("EmbeddingService (Mock)", (it) => {
  // ---------------------------------------------------------------------------
  // embed
  // ---------------------------------------------------------------------------

  describe("embed", () => {
    it.effect(
      "returns a Float32Array of length 768",
      Effect.fn(function* () {
        const svc = yield* EmbeddingService;
        const vec = yield* svc.embed("test text");
        expect(vec).toBeInstanceOf(Float32Array);
        expect(vec.length).toBe(EMBEDDING_DIMENSIONS);
      })
    );

    it.effect(
      "returns deterministic results for the same input",
      Effect.fn(function* () {
        const svc = yield* EmbeddingService;
        const vec1 = yield* svc.embed("hello world");
        const vec2 = yield* svc.embed("hello world");
        expect(vec1).toEqual(vec2);
      })
    );

    it.effect(
      "returns different vectors for different inputs",
      Effect.fn(function* () {
        const svc = yield* EmbeddingService;
        const vec1 = yield* svc.embed("first input");
        const vec2 = yield* svc.embed("second input");
        // Vectors should not be identical
        let allSame = true;
        for (let i = 0; i < EMBEDDING_DIMENSIONS; i++) {
          if (vec1[i] !== vec2[i]) {
            allSame = false;
            break;
          }
        }
        expect(allSame).toBe(false);
      })
    );
  });

  // ---------------------------------------------------------------------------
  // embedBatch
  // ---------------------------------------------------------------------------

  describe("embedBatch", () => {
    it.effect(
      "returns 3 Float32Arrays for 3 input texts",
      Effect.fn(function* () {
        const svc = yield* EmbeddingService;
        const results = yield* svc.embedBatch(["text one", "text two", "text three"]);
        expect(A.length(results)).toBe(3);
        for (const vec of results) {
          expect(vec).toBeInstanceOf(Float32Array);
          expect(vec.length).toBe(EMBEDDING_DIMENSIONS);
        }
      })
    );

    it.effect(
      "returns empty array for empty input",
      Effect.fn(function* () {
        const svc = yield* EmbeddingService;
        const results = yield* svc.embedBatch([]);
        expect(A.length(results)).toBe(0);
      })
    );

    it.effect(
      "produces deterministic results matching single embed",
      Effect.fn(function* () {
        const svc = yield* EmbeddingService;
        const batchResults = yield* svc.embedBatch(["alpha", "beta"]);
        const singleAlpha = yield* svc.embed("alpha");
        const singleBeta = yield* svc.embed("beta");
        const first = A.get(batchResults, 0);
        const second = A.get(batchResults, 1);
        expect(Option.isSome(first)).toBe(true);
        expect(Option.isSome(second)).toBe(true);
        if (Option.isSome(first)) expect(first.value).toEqual(singleAlpha);
        if (Option.isSome(second)) expect(second.value).toEqual(singleBeta);
      })
    );

    it.effect(
      "handles single item batch",
      Effect.fn(function* () {
        const svc = yield* EmbeddingService;
        const results = yield* svc.embedBatch(["only one"]);
        expect(A.length(results)).toBe(1);
        const single = yield* svc.embed("only one");
        const first = A.get(results, 0);
        expect(Option.isSome(first)).toBe(true);
        if (Option.isSome(first)) expect(first.value).toEqual(single);
      })
    );
  });

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  describe("constants", () => {
    it.effect("EMBEDDING_DIMENSIONS is 768", () =>
      Effect.sync(() => {
        expect(EMBEDDING_DIMENSIONS).toBe(768);
      })
    );

    it.effect("DEFAULT_BATCH_SIZE is 32", () =>
      Effect.sync(() => {
        expect(DEFAULT_BATCH_SIZE).toBe(32);
      })
    );
  });
});
