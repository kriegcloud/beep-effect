/**
 * EntityOutput - LLM output schema for entity classification
 *
 * Defines the structured output format for entity type classification
 * using ontology classes.
 *
 * @module knowledge-server/Extraction/schemas/EntityOutput
 * @since 0.1.0
 */
import * as S from "effect/Schema";

/**
 * ClassifiedEntity - A mention classified with ontology type
 *
 * @since 0.1.0
 * @category schemas
 */
export class ClassifiedEntity extends S.Class<ClassifiedEntity>("@beep/knowledge-server/ClassifiedEntity")({
  /**
   * The original mention text
   */
  mention: S.String.annotations({
    description: "Original text span of the entity mention",
  }),

  /**
   * Ontology class IRI for this entity type
   *
   * @example "http://schema.org/Person"
   */
  typeIri: S.String.annotations({
    description: "Ontology class IRI (e.g., http://schema.org/Person)",
  }),

  /**
   * Additional type IRIs if entity has multiple types
   */
  additionalTypes: S.optional(
    S.Array(S.String).annotations({
      description: "Additional ontology class IRIs",
    })
  ),

  /**
   * Confidence in the type classification (0-1)
   */
  confidence: S.Number.pipe(
    S.greaterThanOrEqualTo(0),
    S.lessThanOrEqualTo(1),
    S.annotations({
      description: "Type classification confidence (0-1)",
    })
  ),

  /**
   * Evidence text supporting the classification
   */
  evidence: S.optional(
    S.String.annotations({
      description: "Text evidence supporting type classification",
    })
  ),

  /**
   * Extracted attributes for this entity
   */
  attributes: S.optional(
    S.Record({ key: S.String, value: S.Union(S.String, S.Number, S.Boolean) }).annotations({
      description: "Extracted entity attributes as property-value pairs",
    })
  ),

  /**
   * Canonical name for entity resolution
   */
  canonicalName: S.optional(
    S.String.annotations({
      description: "Normalized/canonical name for entity resolution",
    })
  ),
}) {}

export declare namespace ClassifiedEntity {
  export type Type = typeof ClassifiedEntity.Type;
  export type Encoded = typeof ClassifiedEntity.Encoded;
}

/**
 * EntityOutput - Complete output from entity classification
 *
 * @since 0.1.0
 * @category schemas
 */
export class EntityOutput extends S.Class<EntityOutput>("@beep/knowledge-server/EntityOutput")({
  /**
   * List of classified entities
   */
  entities: S.Array(ClassifiedEntity).annotations({
    description: "List of classified entities with types",
  }),

  /**
   * LLM's reasoning for type assignments
   */
  reasoning: S.optional(
    S.String.annotations({
      description: "LLM reasoning for entity type classification",
    })
  ),
}) {}

export declare namespace EntityOutput {
  export type Type = typeof EntityOutput.Type;
  export type Encoded = typeof EntityOutput.Encoded;
}
