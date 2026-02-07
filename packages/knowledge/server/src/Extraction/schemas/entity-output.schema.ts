import { $KnowledgeServerId } from "@beep/identity/packages";
import { Confidence } from "@beep/knowledge-domain/value-objects";
import * as S from "effect/Schema";

const $I = $KnowledgeServerId.create("Extraction/schemas/entity-output.schema");

export class ClassifiedEntity extends S.Class<ClassifiedEntity>($I`ClassifiedEntity`)(
  {
    mention: S.String.annotations({
      description: "Original text span of the entity mention",
    }),

    typeIri: S.String.annotations({
      description: "Ontology class IRI (e.g., http://schema.org/Person)",
    }),

    additionalTypes: S.optional(
      S.Array(S.String).annotations({
        description: "Additional ontology class IRIs",
      })
    ),

    confidence: Confidence.annotations({
      description: "Type classification confidence (0-1)",
    }),

    evidence: S.optional(
      S.String.annotations({
        description: "Text evidence supporting type classification",
      })
    ),

    attributes: S.optional(
      S.Record({ key: S.String, value: S.Union(S.String, S.Number, S.Boolean) }).annotations({
        description: "Extracted entity attributes as property-value pairs",
      })
    ),

    canonicalName: S.optional(
      S.String.annotations({
        description: "Normalized/canonical name for entity resolution",
      })
    ),
  },
  $I.annotations("ClassifiedEntity", {
    description: "Entity mention classified into ontology types with confidence, evidence, and optional attributes.",
  })
) {}

export declare namespace ClassifiedEntity {
  export type Type = typeof ClassifiedEntity.Type;
  export type Encoded = typeof ClassifiedEntity.Encoded;
}

export class EntityOutput extends S.Class<EntityOutput>($I`EntityOutput`)(
  {
    entities: S.Array(ClassifiedEntity).annotations({
      description: "List of classified entities with types",
    }),

    reasoning: S.optional(
      S.String.annotations({
        description: "LLM reasoning for entity type classification",
      })
    ),
  },
  $I.annotations("EntityOutput", {
    description: "LLM entity-classification output (entities + optional reasoning).",
  })
) {}

export declare namespace EntityOutput {
  export type Type = typeof EntityOutput.Type;
  export type Encoded = typeof EntityOutput.Encoded;
}
