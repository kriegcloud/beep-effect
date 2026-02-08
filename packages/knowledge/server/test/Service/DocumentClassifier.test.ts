import {
  ClassifyBatchDocumentInput,
  ClassifyBatchInput,
  ClassifyInput,
  DocumentClassifier,
  DocumentClassifierLive,
} from "@beep/knowledge-server/Service/DocumentClassifier";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as AiError from "@effect/ai/AiError";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as O from "effect/Option";
import { createFailingMockLlm, createMockLlmWithResponse, createTrackingMockLlm } from "../_shared/TestLayers";

describe("DocumentClassifier", () => {
  effect(
    "classifies a document preview via LLM output schema",
    Effect.fn(
      function* () {
        const classifier = yield* DocumentClassifier;

        const result = yield* classifier.classify(
          new ClassifyInput({
            preview: "Hello world",
            contentType: O.none(),
          })
        );

        strictEqual(result.documentType, "article");
        strictEqual(result.entityDensity, "sparse");
        strictEqual(result.complexityScore, 0.2);
        assertTrue(O.isSome(result.language));
        strictEqual(result.language.value, "en");
        assertTrue(O.isSome(result.title));
        strictEqual(result.title.value, "Title");
      },
      Effect.provide(DocumentClassifierLive),
      createMockLlmWithResponse({
        documentType: "article",
        domainTags: ["wealth"],
        complexityScore: 0.2,
        entityDensity: "sparse",
        language: "en",
        title: "Title",
      })
    )
  );

  effect(
    "maps LLM failures to ClassificationError",
    Effect.fn(
      function* () {
        const classifier = yield* DocumentClassifier;

        const either = yield* Effect.either(
          classifier.classify(
            new ClassifyInput({
              preview: "Hello world",
              contentType: O.none(),
            })
          )
        );

        assertTrue(Either.isLeft(either));
        strictEqual(either.left._tag, "ClassificationError");
      },
      Effect.provide(DocumentClassifierLive),
      createFailingMockLlm(
        new AiError.UnknownError({
          module: "test",
          method: "classifier",
          description: "fail",
        })
      )
    )
  );

  effect(
    "classifyBatch returns empty results without calling the LLM",
    Effect.fn(
      function* () {
        const classifier = yield* DocumentClassifier;

        const result = yield* classifier.classifyBatch(new ClassifyBatchInput({ documents: [] }));
        strictEqual(result.length, 0);
      },
      Effect.provide(DocumentClassifierLive),
      createFailingMockLlm(
        new AiError.UnknownError({
          module: "test",
          method: "classifier.batch",
          description: "should not be called",
        })
      )
    )
  );

  effect(
    "classifyBatch normalizes order and fills missing results with defaults",
    Effect.fn(
      function* () {
        const classifier = yield* DocumentClassifier;

        const result = yield* classifier.classifyBatch(
          new ClassifyBatchInput({
            documents: [
              new ClassifyBatchDocumentInput({ index: 10, preview: "doc a" }),
              new ClassifyBatchDocumentInput({ index: 20, preview: "doc b" }),
            ],
          })
        );

        strictEqual(result.length, 2);
        strictEqual(result[0]!.index, 10);
        strictEqual(result[0]!.classification.documentType, "article");
        strictEqual(result[1]!.index, 20);
        strictEqual(result[1]!.classification.documentType, "unknown");
      },
      Effect.provide(DocumentClassifierLive),
      createMockLlmWithResponse({
        classifications: [
          {
            index: 10,
            classification: {
              documentType: "article",
              domainTags: ["x"],
              complexityScore: 0.1,
              entityDensity: "sparse",
              language: "en",
              title: null,
            },
          },
        ],
      })
    )
  );

  effect(
    "classifyWithAutoBatching splits work into multiple LLM calls",
    Effect.fn(function* () {
      const docs = Array.from({ length: 11 }, (_, i) => ({ index: i, preview: `doc ${i}` }));

      const tracker = yield* createTrackingMockLlm({ classifications: [] });

      const result = yield* Effect.gen(function* () {
        const classifier = yield* DocumentClassifier;
        return yield* classifier.classifyWithAutoBatching(docs, 5, 1);
      }).pipe(Effect.provide(DocumentClassifierLive), tracker.withTracking);

      strictEqual(result.length, 11);

      const calls = yield* tracker.getCalls;
      // 11 docs with batchSize=5 => 3 LLM calls
      strictEqual(calls.length, 3);
    })
  );
});
