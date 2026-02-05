import { Confidence } from "@beep/knowledge-domain/value-objects";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

export class ExtractedTriple extends S.Class<ExtractedTriple>("@beep/knowledge-server/ExtractedTriple")({
  subjectMention: S.String.annotations({
    description: "Text mention of the subject entity",
  }),

  predicateIri: S.String.annotations({
    description: "Ontology property IRI (e.g., http://schema.org/memberOf)",
  }),

  predicateLabel: S.optional(
    S.String.annotations({
      description: "Human-readable label for the predicate",
    })
  ),

  objectMention: S.optional(
    S.String.annotations({
      description: "Text mention of the object entity (for object properties)",
    })
  ),

  literalValue: S.optional(
    S.String.annotations({
      description: "Literal value (for datatype properties)",
    })
  ),

  literalType: S.optional(
    S.String.annotations({
      description: "XSD datatype or language tag for literal value",
    })
  ),

  confidence: Confidence.annotations({
    description: "Relation extraction confidence (0-1)",
  }),

  evidence: S.optional(
    S.String.annotations({
      description: "Text span where this relation was expressed",
    })
  ),

  evidenceStartChar: S.optional(
    S.NonNegativeInt.pipe(
      S.annotations({
        description: "Character offset start for evidence span",
      })
    )
  ),

  evidenceEndChar: S.optional(
    S.NonNegativeInt.pipe(
      S.annotations({
        description: "Character offset end for evidence span (exclusive)",
      })
    )
  ),
}) {
  get isLiteralTriple(): boolean {
    return P.isNotUndefined(this.literalValue) && P.isUndefined(this.objectMention);
  }

  get isEntityTriple(): boolean {
    return P.isNotUndefined(this.objectMention);
  }
}

export declare namespace ExtractedTriple {
  export type Type = typeof ExtractedTriple.Type;
  export type Encoded = typeof ExtractedTriple.Encoded;
}

export class RelationOutput extends S.Class<RelationOutput>("@beep/knowledge-server/RelationOutput")({
  triples: S.Array(ExtractedTriple).annotations({
    description: "List of extracted subject-predicate-object triples",
  }),

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
