import {
  ContentEnrichmentAgent,
  ContentEnrichmentAgentLive,
} from "@beep/knowledge-server/Service/ContentEnrichmentAgent";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as AiError from "@effect/ai/AiError";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as O from "effect/Option";
import { createFailingMockLlm, createMockLlmWithResponse } from "../_shared/TestLayers";

describe("ContentEnrichmentAgent", () => {
  effect(
    "enriches content with structured metadata",
    Effect.fn(
      function* () {
        const agent = yield* ContentEnrichmentAgent;

        const enriched = yield* agent.enrich({ content: "# Hello\\n\\nWorld", url: "https://example.com" });

        strictEqual(enriched.headline, "Hello");
        strictEqual(enriched.sourceChannel, "web");
        assertTrue(O.isSome(enriched.webSourceType));
        strictEqual(enriched.webSourceType.value, "news");
        strictEqual(enriched.language, "en");
        strictEqual(enriched.wordCount, 2);
      },
      Effect.provide(ContentEnrichmentAgentLive),
      createMockLlmWithResponse({
        headline: "Hello",
        description: "Short",
        sourceChannel: "web",
        webSourceType: "news",
        publishedAt: "2026-01-01T00:00:00.000Z",
        author: null,
        organization: null,
        keyEntities: [],
        topics: ["example"],
        language: "en",
        wordCount: 2,
      })
    )
  );

  effect(
    "maps LLM failures to ContentEnrichmentError",
    Effect.fn(
      function* () {
        const agent = yield* ContentEnrichmentAgent;
        const either = yield* Effect.either(agent.enrich({ content: "x" }));
        assertTrue(Either.isLeft(either));
        strictEqual(either.left._tag, "ContentEnrichmentError");
      },
      Effect.provide(ContentEnrichmentAgentLive),
      createFailingMockLlm(
        new AiError.UnknownError({
          module: "test",
          method: "enrich",
          description: "fail",
        })
      )
    )
  );
});
