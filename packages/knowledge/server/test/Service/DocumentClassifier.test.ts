import {
  ClassifyInput,
  DocumentClassifier,
  DocumentClassifierLive,
} from "@beep/knowledge-server/Service/DocumentClassifier";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as AiError from "@effect/ai/AiError";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as O from "effect/Option";
import { createFailingMockLlm, createMockLlmWithResponse } from "../_shared/TestLayers";

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
});
