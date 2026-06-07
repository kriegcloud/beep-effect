import { LangExtractRequest } from "@beep/langextract/Extraction";
import { layer as LangExtractLayer, LangExtractService } from "@beep/langextract/Service";
import { ExtractionTarget } from "@beep/langextract/Target";
import { DocumentId } from "@beep/nlp/Core";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer, Stream } from "effect";
import * as LanguageModel from "effect/unstable/ai/LanguageModel";

const makeLanguageModelLayer = (text: string): Layer.Layer<LanguageModel.LanguageModel> =>
  Layer.succeed(LanguageModel.LanguageModel, {
    generateObject: () => Effect.die("generateObject is not used by V1 tests") as never,
    generateText: () => Effect.succeed({ text }) as never,
    streamText: () => Stream.empty as never,
  } as LanguageModel.Service);

describe("LangExtractService", () => {
  layer(
    LangExtractLayer.pipe(
      Layer.provide(
        makeLanguageModelLayer(
          `{"extractions":[{"label":"person","text":"Alice"},{"label":"organization","text":"Acme"}]}`
        )
      )
    )
  )("with a deterministic fake language model", (it) => {
    it.effect(
      "extracts and emits NLP handoff output",
      Effect.fnUntraced(function* () {
        const request = LangExtractRequest.make({
          documentId: DocumentId.make("doc-1"),
          targets: [ExtractionTarget.make({ kind: "entity", name: "person" })],
          text: "Alice founded Acme.",
        });

        const service = yield* LangExtractService;
        const result = yield* service.extract(request);

        expect(result.extractions).toHaveLength(2);
        expect(result.diagnostics.alignedCount).toBe(2);
        expect(result.annotatedDocument.entities).toHaveLength(2);
        expect(result.annotatedDocument.chunks[0]?.span.end).toBe("Alice founded Acme.".length);
      })
    );
  });
});
