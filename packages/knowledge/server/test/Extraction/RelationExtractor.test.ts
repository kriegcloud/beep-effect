import { RelationExtractor, RelationExtractorLive } from "@beep/knowledge-server/Extraction/RelationExtractor";
import { ClassifiedEntity } from "@beep/knowledge-server/Extraction/schemas/entity-output.schema";
import { ExtractedTriple } from "@beep/knowledge-server/Extraction/schemas/relation-output.schema";
import { TextChunk } from "@beep/knowledge-server/Nlp/TextChunk";
import { describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { createMockOntologyContext, withLanguageModel } from "../_shared/TestLayers";

const TEST_TIMEOUT = 60000;

describe("RelationExtractor", () => {
  effect(
    "extracts relations between entities",
    Effect.fn(
      function* () {
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

        strictEqual(A.length(result.triples), 1);
        strictEqual(result.triples[0]?.subjectMention, "John Smith");
        strictEqual(result.triples[0]?.predicateIri, "http://schema.org/worksFor");
        strictEqual(result.triples[0]?.objectMention, "Acme Corp");
        strictEqual(A.length(result.invalidTriples), 0);
      },
      Effect.provide(RelationExtractorLive),
      withLanguageModel({
        generateObject: (objectName: string | undefined) =>
          objectName === "RelationOutput"
            ? {
                triples: [
                  {
                    subjectMention: "John Smith",
                    predicateIri: "http://schema.org/worksFor",
                    objectMention: "Acme Corp",
                    confidence: 0.9,
                  },
                ],
              }
            : {},
      })
    ),
    TEST_TIMEOUT
  );

  effect(
    "filters relations below confidence threshold",
    Effect.fn(
      function* () {
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

        strictEqual(A.length(result.triples), 1);
        strictEqual(result.triples[0]?.predicateIri, "http://schema.org/knows");
      },
      Effect.provide(RelationExtractorLive),
      withLanguageModel({
        generateObject: (objectName: string | undefined) =>
          objectName === "RelationOutput"
            ? {
                triples: [
                  {
                    subjectMention: "John",
                    predicateIri: "http://schema.org/knows",
                    objectMention: "Jane",
                    confidence: 0.9,
                  },
                  {
                    subjectMention: "John",
                    predicateIri: "http://schema.org/likes",
                    objectMention: "Pizza",
                    confidence: 0.3,
                  },
                ],
              }
            : {},
      })
    ),
    TEST_TIMEOUT
  );

  effect(
    "identifies invalid predicates not in ontology",
    Effect.fn(
      function* () {
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

        strictEqual(A.length(result.triples), 0);
        strictEqual(A.length(result.invalidTriples), 1);
      },
      Effect.provide(RelationExtractorLive),
      withLanguageModel({
        generateObject: (objectName: string | undefined) =>
          objectName === "RelationOutput"
            ? {
                triples: [
                  {
                    subjectMention: "John",
                    predicateIri: "http://invalid.org/unknownPredicate",
                    objectMention: "Jane",
                    confidence: 0.9,
                  },
                ],
              }
            : {},
      })
    ),
    TEST_TIMEOUT
  );

  effect(
    "skips extraction when insufficient entities",
    Effect.fn(
      function* () {
        const extractor = yield* RelationExtractor;
        const ontologyContext = createMockOntologyContext();

        const entities: readonly ClassifiedEntity[] = [];
        const chunk = new TextChunk({ index: 0, text: "No entities here.", startOffset: 0, endOffset: 17 });

        const result = yield* extractor.extract(entities, chunk, ontologyContext);

        strictEqual(A.length(result.triples), 0);
        strictEqual(result.tokensUsed, 0);
      },
      Effect.provide(RelationExtractorLive),
      withLanguageModel({})
    ),
    TEST_TIMEOUT
  );

  effect(
    "deduplicates relations keeping highest confidence",
    Effect.fn(
      function* () {
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

        strictEqual(A.length(deduped), 1);
        strictEqual(deduped[0]?.confidence, 0.95);
      },
      Effect.provide(RelationExtractorLive),
      withLanguageModel({})
    ),
    TEST_TIMEOUT
  );

  effect(
    "handles literal values",
    Effect.fn(
      function* () {
        const extractor = yield* RelationExtractor;
        const ontologyContext = createMockOntologyContext({
          properties: [{ iri: "http://schema.org/age", label: "age" }],
        });

        const entities = [
          new ClassifiedEntity({ mention: "John", typeIri: "http://schema.org/Person", confidence: 0.9 }),
        ];

        const chunk = new TextChunk({ index: 0, text: "John is 30 years old.", startOffset: 0, endOffset: 21 });

        const result = yield* extractor.extract(entities, chunk, ontologyContext);

        strictEqual(A.length(result.triples), 1);
        strictEqual(result.triples[0]?.literalValue, "30");
        strictEqual(result.triples[0]?.objectMention, undefined);
      },
      Effect.provide(RelationExtractorLive),
      withLanguageModel({
        generateObject: (objectName: string | undefined) =>
          objectName === "RelationOutput"
            ? {
                triples: [
                  {
                    subjectMention: "John",
                    predicateIri: "http://schema.org/age",
                    literalValue: "30",
                    literalType: "xsd:integer",
                    confidence: 0.9,
                  },
                ],
              }
            : {},
      })
    ),
    TEST_TIMEOUT
  );

  effect(
    "adjusts evidence offsets to document level",
    Effect.fn(
      function* () {
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

        strictEqual(A.length(result.triples), 1);
        strictEqual(result.triples[0]?.evidenceStartChar, 100);
        strictEqual(result.triples[0]?.evidenceEndChar, 115);
      },
      Effect.provide(RelationExtractorLive),
      withLanguageModel({
        generateObject: (objectName: string | undefined) =>
          objectName === "RelationOutput"
            ? {
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
              }
            : {},
      })
    ),
    TEST_TIMEOUT
  );
});
