/**
 * RelationOutput - LLM output schema for relation extraction
 *
 * Defines the structured output format for triple extraction
 * (subject-predicate-object relations).
 *
 * @module knowledge-server/Extraction/schemas/RelationOutput
 * @since 0.1.0
 */
import * as S from "effect/Schema";

/**
 * ExtractedTriple - A subject-predicate-object relation
 *
 * @since 0.1.0
 * @category schemas
 */
export class ExtractedTriple extends S.Class<ExtractedTriple>("@beep/knowledge-server/ExtractedTriple")({
  /**
   * Subject entity mention text
   */
  subjectMention: S.String.annotations({
    description: "Text mention of the subject entity",
  }),

  /**
   * Ontology property IRI for the predicate
   *
   * @example "http://schema.org/memberOf"
   */
  predicateIri: S.String.annotations({
    description: "Ontology property IRI (e.g., http://schema.org/memberOf)",
  }),

  /**
   * Human-readable predicate label
   */
  predicateLabel: S.optional(
    S.String.annotations({
      description: "Human-readable label for the predicate",
    })
  ),

  /**
   * Object entity mention text (for object properties)
   */
  objectMention: S.optional(
    S.String.annotations({
      description: "Text mention of the object entity (for object properties)",
    })
  ),

  /**
   * Literal value (for datatype properties)
   */
  literalValue: S.optional(
    S.String.annotations({
      description: "Literal value (for datatype properties)",
    })
  ),

  /**
   * Datatype or language tag for literal
   *
   * @example "xsd:date", "en"
   */
  literalType: S.optional(
    S.String.annotations({
      description: "XSD datatype or language tag for literal value",
    })
  ),

  /**
   * Confidence in this relation extraction (0-1)
   */
  confidence: S.Number.pipe(
    S.greaterThanOrEqualTo(0),
    S.lessThanOrEqualTo(1),
    S.annotations({
      description: "Relation extraction confidence (0-1)",
    })
  ),

  /**
   * Evidence text where relation was expressed
   */
  evidence: S.optional(
    S.String.annotations({
      description: "Text span where this relation was expressed",
    })
  ),

  /**
   * Character offset of evidence start
   */
  evidenceStartChar: S.optional(
    S.NonNegativeInt.pipe(
      S.annotations({
        description: "Character offset start for evidence span",
      })
    )
  ),

  /**
   * Character offset of evidence end
   */
  evidenceEndChar: S.optional(
    S.NonNegativeInt.pipe(
      S.annotations({
        description: "Character offset end for evidence span (exclusive)",
      })
    )
  ),
}) {
  /**
   * Check if this triple has a literal object (vs entity reference)
   */
  get isLiteralTriple(): boolean {
    return this.literalValue !== undefined && this.objectMention === undefined;
  }

  /**
   * Check if this triple has an entity object
   */
  get isEntityTriple(): boolean {
    return this.objectMention !== undefined;
  }
}

export declare namespace ExtractedTriple {
  export type Type = typeof ExtractedTriple.Type;
  export type Encoded = typeof ExtractedTriple.Encoded;
}

/**
 * RelationOutput - Complete output from relation extraction
 *
 * @since 0.1.0
 * @category schemas
 */
export class RelationOutput extends S.Class<RelationOutput>("@beep/knowledge-server/RelationOutput")({
  /**
   * List of extracted triples
   */
  triples: S.Array(ExtractedTriple).annotations({
    description: "List of extracted subject-predicate-object triples",
  }),

  /**
   * LLM's reasoning for relation extraction
   */
  reasoning: S.optional(
    S.String.annotations({
      description: "LLM reasoning for relation extraction",
    })
  ),
}) {}

export declare namespace RelationOutput {
  export type Type = typeof RelationOutput.Type;
  export type Encoded = typeof RelationOutput.Encoded;
}
