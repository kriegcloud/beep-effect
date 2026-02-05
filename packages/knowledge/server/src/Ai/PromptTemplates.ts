import { thunkEmptyStr } from "@beep/utils";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { ClassifiedEntity } from "../Extraction/schemas/entity-output.schema";
import type { ExtractedMention } from "../Extraction/schemas/mention-output.schema";
import type { OntologyContext } from "../Ontology";

export const buildMentionPrompt = (chunkText: string, chunkIndex: number): string => {
  return `You are an expert entity mention detector. Your task is to identify all named entity mentions in the following text.

## Instructions
1. Find all mentions of named entities (people, organizations, places, products, events, concepts, etc.)
2. For each mention, provide the exact text span and character offsets
3. Assign a confidence score (0-1) based on how certain you are this is a named entity
4. Optionally suggest a preliminary entity type

## Input Text (Chunk ${String(chunkIndex)})
"""
${chunkText}
"""

## Output Format
Return a JSON object with:
- mentions: array of detected mentions, each with:
  - text: exact text span
  - startChar: character offset start (0-indexed relative to chunk)
  - endChar: character offset end (exclusive)
  - confidence: detection confidence (0-1)
  - suggestedType: optional preliminary type (e.g., "Person", "Organization")
  - context: optional surrounding context for disambiguation

Be precise with character offsets. Count from the beginning of the text provided.`;
};

export const buildEntityPrompt = (mentions: readonly ExtractedMention[], ontologyContext: OntologyContext): string => {
  const typeOptions = F.pipe(
    ontologyContext.classes,
    A.map((cls) => {
      const comment = O.getOrElse(cls.comment, thunkEmptyStr);
      const altLabels = A.isNonEmptyReadonlyArray(cls.altLabels) ? ` (also: ${A.join(cls.altLabels, ", ")})` : "";
      return `- ${cls.iri}: ${cls.label}${altLabels}${comment ? ` - ${comment}` : ""}`;
    }),
    A.join("\n")
  );

  const mentionList = F.pipe(
    mentions,
    A.map((m) => {
      const type = m.suggestedType ?? "unknown";
      return `- "${m.text}" (suggested: ${type}, confidence: ${m.confidence.toFixed(2)})`;
    }),
    A.join("\n")
  );

  return `You are an expert entity classifier. Your task is to classify each entity mention using the provided ontology.

## Available Ontology Classes
${typeOptions}

## Entity Mentions to Classify
${mentionList}

## Instructions
1. For each mention, select the most specific appropriate ontology class IRI
2. Assign a confidence score (0-1) for your classification
3. If an entity could have multiple types, list additional types
4. Extract any obvious attributes mentioned in context
5. Provide a canonical name if different from the mention text

## Output Format
Return a JSON object with:
- entities: array of classified entities, each with:
  - mention: original text
  - typeIri: ontology class IRI (MUST be from the available classes above)
  - additionalTypes: optional array of additional type IRIs
  - confidence: classification confidence (0-1)
  - evidence: text evidence supporting classification
  - attributes: optional property-value pairs
  - canonicalName: optional normalized name

Only use type IRIs from the available ontology classes listed above.`;
};

export const buildRelationPrompt = (
  entities: readonly ClassifiedEntity[],
  chunkText: string,
  ontologyContext: OntologyContext
): string => {
  const propertyOptions = F.pipe(
    ontologyContext.properties,
    A.map((prop) => {
      const comment = O.getOrElse(prop.comment, () => "");
      const domainLabels = A.filterMap(prop.domain, (d) => O.map(ontologyContext.findClass(d), (c) => c.label));
      const rangeLabels = A.filterMap(prop.range, (r) => O.map(ontologyContext.findClass(r), (c) => c.label));
      const domainStr = A.isNonEmptyReadonlyArray(domainLabels) ? `domain: ${A.join(domainLabels, ", ")}` : "";
      const rangeStr = A.isNonEmptyReadonlyArray(rangeLabels) ? `range: ${A.join(rangeLabels, ", ")}` : "";
      const constraints = F.pipe(A.make(domainStr, rangeStr), A.filter(Str.isNonEmpty), A.join("; "));
      return `- ${prop.iri}: ${prop.label} (${prop.rangeType}${constraints ? ` | ${constraints}` : ""})${comment ? ` - ${comment}` : ""}`;
    }),
    A.join("\n")
  );

  const entityList = F.pipe(
    entities,
    A.map((e) => {
      const types = e.additionalTypes ? `[${e.typeIri}, ${A.join(e.additionalTypes, ", ")}]` : e.typeIri;
      return `- "${e.mention}" (type: ${types})`;
    }),
    A.join("\n")
  );

  return `You are an expert relation extractor. Your task is to identify relationships between entities in the text.

## Available Ontology Properties
${propertyOptions}

## Recognized Entities
${entityList}

## Source Text
"""
${chunkText}
"""

## Instructions
1. Find relationships between the recognized entities
2. Each relation must use a predicate from the available ontology properties
3. Relations can be:
   - Object properties: linking two entities (subjectMention → predicateIri → objectMention)
   - Datatype properties: linking an entity to a literal value (subjectMention → predicateIri → literalValue)
4. Provide confidence scores and evidence for each relation

## Output Format
Return a JSON object with:
- triples: array of relations, each with:
  - subjectMention: text of subject entity
  - predicateIri: ontology property IRI (MUST be from available properties)
  - objectMention: text of object entity (for object properties)
  - literalValue: literal value (for datatype properties)
  - literalType: optional XSD datatype or language tag
  - confidence: extraction confidence (0-1)
  - evidence: text span where relation is expressed
  - evidenceStartChar: optional character offset start
  - evidenceEndChar: optional character offset end

Only use predicate IRIs from the available ontology properties listed above.`;
};

export const buildSystemPrompt = (): string => {
  return `You are an expert knowledge extraction system. Your task is to extract structured knowledge from text following ontology-guided schemas.

Key principles:
1. Be precise with text spans and character offsets
2. Only use types and properties from the provided ontology
3. Assign realistic confidence scores based on evidence clarity
4. Prefer explicit statements over inferences
5. When uncertain, assign lower confidence rather than omitting

Always respond with valid JSON matching the requested output format.`;
};
