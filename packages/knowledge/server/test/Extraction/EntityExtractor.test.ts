/**
 * EntityExtractor Tests
 *
 * Tests for ontology-guided entity classification service.
 *
 * @module knowledge-server/test/Extraction/EntityExtractor.test
 * @since 0.1.0
 */
import { describe } from "bun:test";
import { assertTrue, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { EntityExtractor } from "../../src/Extraction/EntityExtractor";
import { ClassifiedEntity } from "../../src/Extraction/schemas/entity-output.schema";
import { ExtractedMention } from "../../src/Extraction/schemas/mention-output.schema";
import { clearMockResponses, createMockOntologyContext, MockLlmLive, setMockResponse } from "../_shared/TestLayers";

// Build the test layer with mock LLM
const TestEntityExtractorLayer = Layer.provide(EntityExtractor.Default, MockLlmLive);

describe("EntityExtractor", () => {
  effect("classifies entities from mentions", () =>
    Effect.gen(function* () {
      clearMockResponses();
      setMockResponse("EntityOutput", {
        entities: [
          {
            mention: "John Smith",
            typeIri: "http://schema.org/Person",
            confidence: 0.95,
          },
        ],
      });

      const extractor = yield* EntityExtractor;
      const ontologyContext = createMockOntologyContext({
        classes: [{ iri: "http://schema.org/Person", label: "Person" }],
      });

      const mentions = [
        new ExtractedMention({
          text: "John Smith",
          startChar: 0,
          endChar: 10,
          confidence: 0.9,
        }),
      ];

      const result = yield* extractor.classify(mentions, ontologyContext);

      strictEqual(result.entities.length, 1);
      strictEqual(result.entities[0]?.mention, "John Smith");
      strictEqual(result.entities[0]?.typeIri, "http://schema.org/Person");
      strictEqual(result.invalidTypes.length, 0);
    }).pipe(Effect.provide(TestEntityExtractorLayer))
  );

  effect("filters entities below confidence threshold", () =>
    Effect.gen(function* () {
      clearMockResponses();
      setMockResponse("EntityOutput", {
        entities: [
          { mention: "John", typeIri: "http://schema.org/Person", confidence: 0.9 },
          { mention: "maybe-entity", typeIri: "http://schema.org/Thing", confidence: 0.3 },
        ],
      });

      const extractor = yield* EntityExtractor;
      const ontologyContext = createMockOntologyContext({
        classes: [
          { iri: "http://schema.org/Person", label: "Person" },
          { iri: "http://schema.org/Thing", label: "Thing" },
        ],
      });

      const mentions = [
        new ExtractedMention({ text: "John", startChar: 0, endChar: 4, confidence: 0.9 }),
        new ExtractedMention({ text: "maybe-entity", startChar: 10, endChar: 22, confidence: 0.4 }),
      ];

      const result = yield* extractor.classify(mentions, ontologyContext, { minConfidence: 0.5 });

      strictEqual(result.entities.length, 1);
      strictEqual(result.entities[0]?.mention, "John");
    }).pipe(Effect.provide(TestEntityExtractorLayer))
  );

  effect("identifies invalid types not in ontology", () =>
    Effect.gen(function* () {
      clearMockResponses();
      setMockResponse("EntityOutput", {
        entities: [{ mention: "Widget", typeIri: "http://invalid.org/UnknownType", confidence: 0.9 }],
      });

      const extractor = yield* EntityExtractor;
      const ontologyContext = createMockOntologyContext({
        classes: [{ iri: "http://schema.org/Person", label: "Person" }],
      });

      const mentions = [new ExtractedMention({ text: "Widget", startChar: 0, endChar: 6, confidence: 0.9 })];

      const result = yield* extractor.classify(mentions, ontologyContext);

      strictEqual(result.entities.length, 0);
      strictEqual(result.invalidTypes.length, 1);
      strictEqual(result.invalidTypes[0]?.typeIri, "http://invalid.org/UnknownType");
    }).pipe(Effect.provide(TestEntityExtractorLayer))
  );

  effect("handles empty input", () =>
    Effect.gen(function* () {
      const extractor = yield* EntityExtractor;
      const ontologyContext = createMockOntologyContext();

      const result = yield* extractor.classify([], ontologyContext);

      strictEqual(result.entities.length, 0);
      strictEqual(result.unclassified.length, 0);
      strictEqual(result.tokensUsed, 0);
    }).pipe(Effect.provide(TestEntityExtractorLayer))
  );

  effect("tracks unclassified mentions", () =>
    Effect.gen(function* () {
      clearMockResponses();
      setMockResponse("EntityOutput", {
        entities: [{ mention: "John", typeIri: "http://schema.org/Person", confidence: 0.9 }],
      });

      const extractor = yield* EntityExtractor;
      const ontologyContext = createMockOntologyContext({
        classes: [{ iri: "http://schema.org/Person", label: "Person" }],
      });

      const mentions = [
        new ExtractedMention({ text: "John", startChar: 0, endChar: 4, confidence: 0.9 }),
        new ExtractedMention({ text: "Unknown", startChar: 10, endChar: 17, confidence: 0.8 }),
      ];

      const result = yield* extractor.classify(mentions, ontologyContext);

      strictEqual(result.entities.length, 1);
      strictEqual(result.unclassified.length, 1);
      strictEqual(result.unclassified[0]?.text, "Unknown");
    }).pipe(Effect.provide(TestEntityExtractorLayer))
  );

  effect("resolves entities by canonical name", () =>
    Effect.gen(function* () {
      const extractor = yield* EntityExtractor;

      const entities = [
        new ClassifiedEntity({
          mention: "John Smith",
          typeIri: "http://schema.org/Person",
          confidence: 0.95,
          canonicalName: "john_smith",
        }),
        new ClassifiedEntity({
          mention: "J. Smith",
          typeIri: "http://schema.org/Person",
          confidence: 0.85,
          canonicalName: "john_smith",
        }),
      ];

      const groups = yield* extractor.resolveEntities(entities);

      strictEqual(groups.size, 1);
      const group = groups.get("john_smith");
      assertTrue(group !== undefined);
      strictEqual(group.mentions.length, 2);
      strictEqual(group.canonical.confidence, 0.95);
    }).pipe(Effect.provide(TestEntityExtractorLayer))
  );
});
