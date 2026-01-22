/**
 * RelationExtractor Tests
 *
 * Tests for triple extraction service.
 *
 * @module knowledge-server/test/Extraction/RelationExtractor.test
 * @since 0.1.0
 */
import { describe } from "bun:test";
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { RelationExtractor } from "../../src/Extraction/RelationExtractor";
import { ClassifiedEntity } from "../../src/Extraction/schemas/entity-output.schema";
import { ExtractedTriple } from "../../src/Extraction/schemas/relation-output.schema";
import { TextChunk } from "../../src/Nlp/TextChunk";
import { clearMockResponses, createMockOntologyContext, MockLlmLive, setMockResponse } from "../_shared/TestLayers";

// Build the test layer with mock LLM
const TestRelationExtractorLayer = Layer.provide(RelationExtractor.Default, MockLlmLive);

describe("RelationExtractor", () => {
  effect("extracts relations between entities", () =>
    Effect.gen(function* () {
      clearMockResponses();
      setMockResponse("RelationOutput", {
        triples: [
          {
            subjectMention: "John Smith",
            predicateIri: "http://schema.org/worksFor",
            objectMention: "Acme Corp",
            confidence: 0.9,
          },
        ],
      });

      const extractor = yield* RelationExtractor;
      const ontologyContext = createMockOntologyContext({
        classes: [
          { iri: "http://schema.org/Person", label: "Person" },
          { iri: "http://schema.org/Organization", label: "Organization" },
        ],
        properties: [{ iri: "http://schema.org/worksFor", label: "worksFor" }],
      });

      const entities = [
        new ClassifiedEntity({ mention: "John Smith", typeIri: "http://schema.org/Person", confidence: 0.95 }),
        new ClassifiedEntity({ mention: "Acme Corp", typeIri: "http://schema.org/Organization", confidence: 0.9 }),
      ];

      const chunk = new TextChunk({
        index: 0,
        text: "John Smith works for Acme Corp as a developer.",
        startOffset: 0,
        endOffset: 45,
      });

      const result = yield* extractor.extract(entities, chunk, ontologyContext);

      strictEqual(result.triples.length, 1);
      strictEqual(result.triples[0]?.subjectMention, "John Smith");
      strictEqual(result.triples[0]?.predicateIri, "http://schema.org/worksFor");
      strictEqual(result.triples[0]?.objectMention, "Acme Corp");
      strictEqual(result.invalidTriples.length, 0);
    }).pipe(Effect.provide(TestRelationExtractorLayer))
  );

  effect("filters relations below confidence threshold", () =>
    Effect.gen(function* () {
      clearMockResponses();
      setMockResponse("RelationOutput", {
        triples: [
          { subjectMention: "John", predicateIri: "http://schema.org/knows", objectMention: "Jane", confidence: 0.9 },
          { subjectMention: "John", predicateIri: "http://schema.org/likes", objectMention: "Pizza", confidence: 0.3 },
        ],
      });

      const extractor = yield* RelationExtractor;
      const ontologyContext = createMockOntologyContext({
        properties: [
          { iri: "http://schema.org/knows", label: "knows" },
          { iri: "http://schema.org/likes", label: "likes" },
        ],
      });

      const entities = [
        new ClassifiedEntity({ mention: "John", typeIri: "http://schema.org/Person", confidence: 0.9 }),
        new ClassifiedEntity({ mention: "Jane", typeIri: "http://schema.org/Person", confidence: 0.9 }),
      ];

      const chunk = new TextChunk({
        index: 0,
        text: "John knows Jane. John might like pizza.",
        startOffset: 0,
        endOffset: 38,
      });

      const result = yield* extractor.extract(entities, chunk, ontologyContext, { minConfidence: 0.5 });

      strictEqual(result.triples.length, 1);
      strictEqual(result.triples[0]?.predicateIri, "http://schema.org/knows");
    }).pipe(Effect.provide(TestRelationExtractorLayer))
  );

  effect("identifies invalid predicates not in ontology", () =>
    Effect.gen(function* () {
      clearMockResponses();
      setMockResponse("RelationOutput", {
        triples: [
          {
            subjectMention: "John",
            predicateIri: "http://invalid.org/unknownPredicate",
            objectMention: "Jane",
            confidence: 0.9,
          },
        ],
      });

      const extractor = yield* RelationExtractor;
      const ontologyContext = createMockOntologyContext({
        properties: [{ iri: "http://schema.org/knows", label: "knows" }],
      });

      const entities = [
        new ClassifiedEntity({ mention: "John", typeIri: "http://schema.org/Person", confidence: 0.9 }),
        new ClassifiedEntity({ mention: "Jane", typeIri: "http://schema.org/Person", confidence: 0.9 }),
      ];

      const chunk = new TextChunk({ index: 0, text: "John and Jane.", startOffset: 0, endOffset: 14 });

      const result = yield* extractor.extract(entities, chunk, ontologyContext, { validatePredicates: true });

      strictEqual(result.triples.length, 0);
      strictEqual(result.invalidTriples.length, 1);
    }).pipe(Effect.provide(TestRelationExtractorLayer))
  );

  effect("skips extraction when insufficient entities", () =>
    Effect.gen(function* () {
      const extractor = yield* RelationExtractor;
      const ontologyContext = createMockOntologyContext();

      const entities: readonly ClassifiedEntity[] = [];
      const chunk = new TextChunk({ index: 0, text: "No entities here.", startOffset: 0, endOffset: 17 });

      const result = yield* extractor.extract(entities, chunk, ontologyContext);

      strictEqual(result.triples.length, 0);
      strictEqual(result.tokensUsed, 0);
    }).pipe(Effect.provide(TestRelationExtractorLayer))
  );

  effect("deduplicates relations keeping highest confidence", () =>
    Effect.gen(function* () {
      const extractor = yield* RelationExtractor;

      const triples = [
        new ExtractedTriple({
          subjectMention: "John",
          predicateIri: "http://schema.org/knows",
          objectMention: "Jane",
          confidence: 0.8,
        }),
        new ExtractedTriple({
          subjectMention: "John",
          predicateIri: "http://schema.org/knows",
          objectMention: "Jane",
          confidence: 0.95,
        }),
      ];

      const deduped = yield* extractor.deduplicateRelations(triples);

      strictEqual(deduped.length, 1);
      strictEqual(deduped[0]?.confidence, 0.95);
    }).pipe(Effect.provide(TestRelationExtractorLayer))
  );

  effect("handles literal values", () =>
    Effect.gen(function* () {
      clearMockResponses();
      setMockResponse("RelationOutput", {
        triples: [
          {
            subjectMention: "John",
            predicateIri: "http://schema.org/age",
            literalValue: "30",
            literalType: "xsd:integer",
            confidence: 0.9,
          },
        ],
      });

      const extractor = yield* RelationExtractor;
      const ontologyContext = createMockOntologyContext({
        properties: [{ iri: "http://schema.org/age", label: "age" }],
      });

      const entities = [
        new ClassifiedEntity({ mention: "John", typeIri: "http://schema.org/Person", confidence: 0.9 }),
      ];

      const chunk = new TextChunk({ index: 0, text: "John is 30 years old.", startOffset: 0, endOffset: 21 });

      const result = yield* extractor.extract(entities, chunk, ontologyContext);

      strictEqual(result.triples.length, 1);
      strictEqual(result.triples[0]?.literalValue, "30");
      strictEqual(result.triples[0]?.objectMention, undefined);
    }).pipe(Effect.provide(TestRelationExtractorLayer))
  );

  effect("adjusts evidence offsets to document level", () =>
    Effect.gen(function* () {
      clearMockResponses();
      setMockResponse("RelationOutput", {
        triples: [
          {
            subjectMention: "John",
            predicateIri: "http://schema.org/knows",
            objectMention: "Jane",
            confidence: 0.9,
            evidence: "John knows Jane",
            evidenceStartChar: 0,
            evidenceEndChar: 15,
          },
        ],
      });

      const extractor = yield* RelationExtractor;
      const ontologyContext = createMockOntologyContext({
        properties: [{ iri: "http://schema.org/knows", label: "knows" }],
      });

      const entities = [
        new ClassifiedEntity({ mention: "John", typeIri: "http://schema.org/Person", confidence: 0.9 }),
        new ClassifiedEntity({ mention: "Jane", typeIri: "http://schema.org/Person", confidence: 0.9 }),
      ];

      const chunk = new TextChunk({ index: 2, text: "John knows Jane.", startOffset: 100, endOffset: 116 });

      const result = yield* extractor.extract(entities, chunk, ontologyContext);

      strictEqual(result.triples.length, 1);
      strictEqual(result.triples[0]?.evidenceStartChar, 100);
      strictEqual(result.triples[0]?.evidenceEndChar, 115);
    }).pipe(Effect.provide(TestRelationExtractorLayer))
  );
});
