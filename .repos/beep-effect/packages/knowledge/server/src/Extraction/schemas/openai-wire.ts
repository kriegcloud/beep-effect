import { Confidence } from "@beep/knowledge-domain/values";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";

/**
 * OpenAI structured-output wire schemas.
 *
 * OpenAI's `strict: true` mode (used by `@effect/ai-openai`) requires EVERY
 * property in a JSON Schema to appear in the `required` array. Domain schemas
 * use `S.optional(X)` which produces non-required properties and triggers
 * HTTP 400 from the API.
 *
 * Wire schemas replace `S.optional(X)` with `S.NullOr(X)` so that every field
 * is required but nullable. After the LLM responds, `stripNullProperties`
 * converts null values to absent keys so that `S.decodeUnknown(DomainSchema)`
 * handles them via `S.optional` defaults.
 */

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Recursively converts `null` values to `undefined` (absent) in a JSON tree
 * and removes keys whose values became `undefined`. This bridges the gap
 * between OpenAI wire format (`"field": null`) and domain schemas that expect
 * the key to be absent (`S.optional`).
 */
export const stripNullProperties = (value: unknown): unknown => {
  if (value === null) return undefined;
  if (A.isArray(value)) return A.map(value as Array<unknown>, stripNullProperties);
  if (P.isRecord(value)) {
    const record = value as Record<string, unknown>;
    return R.filter(R.map(record, stripNullProperties), P.isNotUndefined);
  }
  return value;
};

// ---------------------------------------------------------------------------
// Mention wire schemas
// ---------------------------------------------------------------------------

export const ExtractedMentionWire = S.Struct({
  text: S.String.annotations({
    description: "Exact text span of the entity mention",
  }),
  startChar: S.NonNegativeInt.pipe(
    S.annotations({
      description: "Character offset start (0-indexed relative to chunk)",
    })
  ),
  endChar: S.NonNegativeInt.pipe(
    S.annotations({
      description: "Character offset end (exclusive, relative to chunk)",
    })
  ),
  confidence: Confidence.annotations({
    description: "Extraction confidence score (0-1)",
  }),
  suggestedType: S.NullOr(S.String).annotations({
    description: "Preliminary type suggestion (e.g., 'Person', 'Organization')",
  }),
  context: S.NullOr(S.String).annotations({
    description: "Surrounding text for disambiguation",
  }),
}).annotations({ identifier: "ExtractedMention" });

export const MentionOutputWire = S.Struct({
  mentions: S.Array(ExtractedMentionWire).annotations({
    description: "List of detected entity mentions",
  }),
  reasoning: S.NullOr(S.String).annotations({
    description: "LLM reasoning for mention detection",
  }),
}).annotations({ identifier: "MentionOutput" });

// ---------------------------------------------------------------------------
// Entity wire schemas
// ---------------------------------------------------------------------------

export const ClassifiedEntityWire = S.Struct({
  mention: S.String.annotations({
    description: "Original text span of the entity mention",
  }),
  typeIri: S.String.annotations({
    description: "Ontology class IRI (e.g., http://schema.org/Person)",
  }),
  additionalTypes: S.NullOr(S.Array(S.String)).annotations({
    description: "Additional ontology class IRIs",
  }),
  confidence: Confidence.annotations({
    description: "Type classification confidence (0-1)",
  }),
  evidence: S.NullOr(S.String).annotations({
    description: "Text evidence supporting type classification",
  }),
  attributes: S.NullOr(S.Record({ key: S.String, value: S.Union(S.String, S.Number, S.Boolean) })).annotations({
    description: "Extracted entity attributes as property-value pairs",
  }),
  canonicalName: S.NullOr(S.String).annotations({
    description: "Normalized/canonical name for entity resolution",
  }),
}).annotations({ identifier: "ClassifiedEntity" });

export const EntityOutputWire = S.Struct({
  entities: S.Array(ClassifiedEntityWire).annotations({
    description: "List of classified entities with types",
  }),
  reasoning: S.NullOr(S.String).annotations({
    description: "LLM reasoning for entity type classification",
  }),
}).annotations({ identifier: "EntityOutput" });

// ---------------------------------------------------------------------------
// Relation wire schemas
// ---------------------------------------------------------------------------

export const ExtractedTripleWire = S.Struct({
  subjectMention: S.String.annotations({
    description: "Text mention of the subject entity",
  }),
  predicateIri: S.String.annotations({
    description: "Ontology property IRI (e.g., http://schema.org/memberOf)",
  }),
  predicateLabel: S.NullOr(S.String).annotations({
    description: "Human-readable label for the predicate",
  }),
  objectMention: S.NullOr(S.String).annotations({
    description: "Text mention of the object entity (for object properties)",
  }),
  literalValue: S.NullOr(S.String).annotations({
    description: "Literal value (for datatype properties)",
  }),
  literalType: S.NullOr(S.String).annotations({
    description: "XSD datatype or language tag for literal value",
  }),
  confidence: Confidence.annotations({
    description: "Relation extraction confidence (0-1)",
  }),
  evidence: S.NullOr(S.String).annotations({
    description: "Text span where this relation was expressed",
  }),
  evidenceStartChar: S.NullOr(
    S.NonNegativeInt.pipe(
      S.annotations({
        description: "Character offset start for evidence span",
      })
    )
  ),
  evidenceEndChar: S.NullOr(
    S.NonNegativeInt.pipe(
      S.annotations({
        description: "Character offset end for evidence span (exclusive)",
      })
    )
  ),
}).annotations({ identifier: "ExtractedTriple" });

export const RelationOutputWire = S.Struct({
  triples: S.Array(ExtractedTripleWire).annotations({
    description: "List of extracted subject-predicate-object triples",
  }),
  reasoning: S.NullOr(S.String).annotations({
    description: "LLM reasoning for relation extraction",
  }),
}).annotations({ identifier: "RelationOutput" });

// ---------------------------------------------------------------------------
// Document classification wire schemas
// ---------------------------------------------------------------------------

const DocumentTypeWire = S.Literal(
  "article",
  "transcript",
  "report",
  "contract",
  "correspondence",
  "reference",
  "narrative",
  "structured",
  "unknown"
).annotations({ description: "Document structure/type classification" });

const EntityDensityWire = S.Literal("sparse", "moderate", "dense").annotations({
  description: "Estimated entity density",
});

export const DocumentClassificationWire = S.Struct({
  documentType: DocumentTypeWire,
  domainTags: S.Array(S.String),
  complexityScore: S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1)),
  entityDensity: EntityDensityWire,
  language: S.NullOr(S.String).annotations({
    description: "ISO 639-1 language code if detectable",
  }),
  title: S.NullOr(S.String).annotations({
    description: "Document title if visible",
  }),
}).annotations({ identifier: "DocumentClassification" });

export const BatchClassificationItemWire = S.Struct({
  index: S.Int,
  classification: DocumentClassificationWire,
}).annotations({ identifier: "BatchClassificationItem" });

export const BatchClassificationResponseWire = S.Struct({
  classifications: S.Array(BatchClassificationItemWire),
}).annotations({ identifier: "BatchClassificationResponse" });
