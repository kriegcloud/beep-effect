/**
 * RuleSet - Rule collections and factory functions
 *
 * Provides composed rule collections for each extraction stage,
 * combining static rules (constant) with dynamic rules (from ontology context).
 *
 * @module Prompt/RuleSet
 * @since 2.0.0
 */

import { Data } from "effect"
import type { ClassDefinition, PropertyDefinition } from "../Domain/Model/Ontology.js"
import type { IRI } from "../Domain/Rdf/Types.js"
import { buildCaseInsensitiveIriMap } from "../Utils/Iri.js"
import { ExtractionRule, type ExtractionStage, RuleExample } from "./ExtractionRule.js"

/**
 * Coerce string array to IRI array.
 *
 * ClassDefinition.id and PropertyDefinition.id are typed as `string` from Schema parsing,
 * but the values are valid IRIs from ontology. This helper documents
 * the intentional type coercion from string to branded IRI type.
 *
 * @internal
 */
const asIriArray = (ids: ReadonlyArray<string>): ReadonlyArray<IRI> => ids as ReadonlyArray<IRI>

/**
 * AllowedIriSet - Type-safe IRI constraints with case-insensitive lookups
 *
 * Stores the canonical IRIs and pre-built lookup maps for validation.
 *
 * @since 2.0.0
 */
export class AllowedIriSet extends Data.Class<{
  /** Canonical class IRIs */
  readonly classIris: ReadonlyArray<string>
  /** Canonical object property IRIs */
  readonly objectPropertyIris: ReadonlyArray<string>
  /** Canonical datatype property IRIs */
  readonly datatypePropertyIris: ReadonlyArray<string>
  /** Valid entity IDs (from Stage 1) */
  readonly entityIds: ReadonlyArray<string>
  /** Case-insensitive class IRI lookup */
  readonly classIriMap: Map<string, string>
  /** Case-insensitive property IRI lookup */
  readonly propertyIriMap: Map<string, string>
}> {
  /**
   * Create from ontology definitions
   */
  static fromOntology(
    classes: ReadonlyArray<ClassDefinition>,
    objectProperties: ReadonlyArray<PropertyDefinition>,
    datatypeProperties: ReadonlyArray<PropertyDefinition>,
    entityIds: ReadonlyArray<string> = []
  ): AllowedIriSet {
    const classIris = classes.map((c) => c.id)
    const objectPropertyIris = objectProperties.map((p) => p.id)
    const datatypePropertyIris = datatypeProperties.map((p) => p.id)
    const allPropertyIris = [...objectPropertyIris, ...datatypePropertyIris]

    return new AllowedIriSet({
      classIris,
      objectPropertyIris,
      datatypePropertyIris,
      entityIds,
      classIriMap: buildCaseInsensitiveIriMap(asIriArray(classIris)),
      propertyIriMap: buildCaseInsensitiveIriMap(asIriArray(allPropertyIris))
    })
  }

  /**
   * Get preview string of allowed IRIs (first N items)
   */
  previewIris(type: "classes" | "objectProperties" | "datatypeProperties" | "entityIds", limit = 5): string {
    const iris = type === "classes"
      ? this.classIris
      : type === "objectProperties"
      ? this.objectPropertyIris
      : type === "datatypeProperties"
      ? this.datatypePropertyIris
      : this.entityIds

    const preview = iris.slice(0, limit).join(", ")
    return iris.length > limit ? `${preview}...` : preview
  }
}

/**
 * RuleSet - Collection of rules for a specific extraction stage
 *
 * Combines static rules (constant across extractions) with dynamic rules
 * (derived from specific ontology context).
 *
 * @since 2.0.0
 */
export class RuleSet extends Data.Class<{
  /** Stage identifier */
  readonly stage: ExtractionStage
  /** Static rules (don't depend on ontology) */
  readonly staticRules: ReadonlyArray<ExtractionRule>
  /** Dynamic rules (generated from ontology context) */
  readonly dynamicRules: ReadonlyArray<ExtractionRule>
  /** Allowed IRIs (for validation and prompt generation) */
  readonly allowedIris: AllowedIriSet
}> {
  /**
   * Get all rules (static + dynamic)
   */
  get allRules(): ReadonlyArray<ExtractionRule> {
    return [...this.staticRules, ...this.dynamicRules]
  }

  /**
   * Get only hard constraints (error severity)
   */
  get errorRules(): ReadonlyArray<ExtractionRule> {
    return this.allRules.filter((r) => r.severity === "error")
  }

  /**
   * Get only soft preferences (warning severity)
   */
  get warningRules(): ReadonlyArray<ExtractionRule> {
    return this.allRules.filter((r) => r.severity === "warning")
  }

  /**
   * Get rules by category
   */
  getRulesByCategory(category: string): ReadonlyArray<ExtractionRule> {
    return this.allRules.filter((r) => r.category === category)
  }
}

// =============================================================================
// Static Rules - Entity Extraction
// =============================================================================

/**
 * Static rules for entity extraction (Stage 1)
 *
 * These rules are constant across all entity extractions.
 *
 * @since 2.0.0
 */
export const ENTITY_STATIC_RULES: ReadonlyArray<ExtractionRule> = [
  new ExtractionRule({
    id: "entity-id-format",
    category: "id_format",
    severity: "error",
    instruction:
      "Assign unique snake_case IDs starting with a lowercase letter (e.g., 'cristiano_ronaldo' for 'Cristiano Ronaldo')",
    example: new RuleExample({
      input: "Cristiano Ronaldo",
      output: "cristiano_ronaldo",
      explanation: "Lowercase with underscores, no special characters"
    }),
    counterExample: new RuleExample({
      input: "Cristiano Ronaldo",
      output: "CristianoRonaldo",
      explanation: "Avoid PascalCase or camelCase for entity IDs"
    }),
    schemaDescription:
      "Snake_case unique identifier - use this exact ID when referring to this entity in relations (e.g., 'cristiano_ronaldo')",
    validationTemplate: "Entity ID '{value}' must be snake_case starting with a lowercase letter"
  }),

  new ExtractionRule({
    id: "entity-id-numbers",
    category: "id_format",
    severity: "error",
    instruction: "For names starting with numbers, prepend 'e' (e.g., '2pac' becomes 'e2pac')",
    example: new RuleExample({
      input: "2Pac",
      output: "e2pac",
      explanation: "Prepend 'e' for IDs that would start with a number"
    }),
    counterExample: new RuleExample({
      input: "2Pac",
      output: "2pac",
      explanation: "IDs cannot start with a number"
    }),
    schemaDescription: "IDs must start with a letter - prepend 'e' for numeric names",
    validationTemplate: "Entity ID '{value}' cannot start with a number"
  }),

  new ExtractionRule({
    id: "entity-mention-complete",
    category: "mention_format",
    severity: "warning",
    instruction: "Use complete, human-readable names for mentions (e.g., 'Stanford University' not 'Stanford')",
    example: new RuleExample({
      input: "Stanford is a top university",
      output: "Stanford University",
      explanation: "Use full canonical name even if abbreviated in text"
    }),
    counterExample: new RuleExample({
      input: "Stanford is a top university",
      output: "Stanford",
      explanation: "Incomplete - prefer full canonical form"
    }),
    schemaDescription:
      "Human-readable entity name found in text - use complete, canonical form (e.g., 'Cristiano Ronaldo' not 'Ronaldo')",
    validationTemplate: "Mention '{value}' may be incomplete - prefer full canonical form"
  }),

  new ExtractionRule({
    id: "entity-type-required",
    category: "type_mapping",
    severity: "error",
    instruction: "Map each entity to at least one ontology class from the allowed list",
    example: new RuleExample({
      input: "Cristiano Ronaldo is a footballer",
      output: "[\"http://schema.org/Person\"]",
      explanation: "At least one type IRI is required"
    }),
    counterExample: new RuleExample({
      input: "Cristiano Ronaldo is a footballer",
      output: "[]",
      explanation: "Empty types array is not allowed"
    }),
    schemaDescription: "Array of ontology class URIs this entity instantiates (at least one required)",
    validationTemplate: "Entity must have at least one type, got: {value}"
  }),

  new ExtractionRule({
    id: "entity-type-specific",
    category: "type_mapping",
    severity: "warning",
    instruction: "Map each entity to the MOST SPECIFIC applicable ontology class",
    example: new RuleExample({
      input: "Cristiano Ronaldo is a footballer",
      output: "http://ontology/FootballPlayer",
      explanation: "Use specific subclass, not generic Person"
    }),
    counterExample: new RuleExample({
      input: "Cristiano Ronaldo is a footballer",
      output: "http://schema.org/Thing",
      explanation: "Too generic - prefer specific type"
    }),
    schemaDescription: "Use the most specific applicable class from the ontology",
    validationTemplate: "Type '{value}' may be too generic - consider more specific class"
  }),

  new ExtractionRule({
    id: "iri-exact-casing",
    category: "iri_casing",
    severity: "error",
    instruction:
      "Use the short class/property names (Local Names) EXACTLY as shown in the schema. Do NOT use full IRIs.",
    example: new RuleExample({
      input: "Player class with label 'player'",
      output: "Player",
      explanation: "Use local name from schema, not full IRI"
    }),
    counterExample: new RuleExample({
      input: "Player class with label 'player'",
      output: "http://ontology/Player",
      explanation: "Do not use full URL/IRI"
    }),
    schemaDescription: "Use exact local name from allowed list (case-sensitive)",
    validationTemplate: "Name '{value}' has incorrect casing or is a full IRI - check the allowed list"
  }),

  new ExtractionRule({
    id: "entity-id-reuse",
    category: "reference_integrity",
    severity: "error",
    instruction: "Reuse the exact same ID when referring to the same entity across the text",
    example: new RuleExample({
      input: "Ronaldo scored. Ronaldo celebrated.",
      output: "cristiano_ronaldo (both occurrences)",
      explanation: "Same entity = same ID"
    }),
    counterExample: new RuleExample({
      input: "Ronaldo scored. Ronaldo celebrated.",
      output: "cristiano_ronaldo, ronaldo_2",
      explanation: "Don't create duplicate IDs for same entity"
    }),
    schemaDescription: "Reuse exact ID for same entity",
    validationTemplate: "Entity ID '{value}' may be a duplicate - reuse existing ID"
  }),

  new ExtractionRule({
    id: "entity-extract-all",
    category: "cardinality",
    severity: "warning",
    instruction: "Extract as many entities as possible - be thorough",
    example: new RuleExample({
      input: "Ronaldo plays for Al-Nassr in Saudi Arabia",
      output: "3 entities: cristiano_ronaldo, al_nassr, saudi_arabia",
      explanation: "Extract all named entities"
    }),
    counterExample: new RuleExample({
      input: "Ronaldo plays for Al-Nassr in Saudi Arabia",
      output: "1 entity: cristiano_ronaldo",
      explanation: "Missing entities - extract all of them"
    }),
    schemaDescription: "Extract all named entities from the text",
    validationTemplate: "May have missed entities - extraction found only {value}"
  }),

  // =============================================================================
  // Entity Exclusion Rules
  // =============================================================================

  new ExtractionRule({
    id: "entity-exclude-photo-credits",
    category: "entity_exclusion",
    severity: "error",
    instruction: "DO NOT extract photo credits, news agencies, or photographer/journalist names as entities. " +
      "Common patterns: 'Photo by X', 'X/AFP', 'X/Getty Images', bylines like 'By John Smith'",
    example: new RuleExample({
      input: "Ben Stansall/AFP via Getty Images",
      output: "(skip - not an entity)",
      explanation: "Photo credits and photographer names are NOT entities"
    }),
    counterExample: new RuleExample({
      input: "Ben Stansall/AFP via Getty Images",
      output: "{ id: 'ben_stansall', types: ['Player'] }",
      explanation: "WRONG - this is a photographer credit, not a football player"
    }),
    schemaDescription: "Skip photo credits, agency names, and journalist bylines",
    validationTemplate: "'{value}' appears to be a photo credit or journalist - do not extract"
  }),

  new ExtractionRule({
    id: "entity-exclude-agencies",
    category: "entity_exclusion",
    severity: "error",
    instruction: "DO NOT extract news/photo agencies as sports entities. Agencies include: AFP, Reuters, " +
      "Getty Images, AP, PA Media, EPA. These are never players, teams, or leagues.",
    example: new RuleExample({
      input: "AFP reported the score",
      output: "(skip - news agency, not a sports entity)",
      explanation: "AFP is a news agency, not a sports organization"
    }),
    counterExample: new RuleExample({
      input: "AFP",
      output: "{ id: 'afp', types: ['Team'] }",
      explanation: "WRONG - AFP is a news agency, not a team"
    }),
    schemaDescription: "Skip news and photo agencies - they are not sports entities",
    validationTemplate: "'{value}' is a news/photo agency - do not extract as sports entity"
  }),

  // =============================================================================
  // Canonical Name Rules
  // =============================================================================

  new ExtractionRule({
    id: "entity-full-canonical-name",
    category: "mention_format",
    severity: "error",
    instruction: "ALWAYS use full canonical names for organizations, teams, and places. " +
      "Never use ambiguous short forms that could refer to multiple entities. " +
      "Example: 'Manchester United' not 'United', 'Arsenal Football Club' not 'Arsenal'",
    example: new RuleExample({
      input: "United won the match",
      output: "manchester_united (mention: 'Manchester United')",
      explanation: "Expand 'United' to full unambiguous name from context"
    }),
    counterExample: new RuleExample({
      input: "United won the match",
      output: "united (mention: 'United')",
      explanation: "WRONG - 'United' is ambiguous (Man Utd, Newcastle Utd, Leeds Utd, etc.)"
    }),
    schemaDescription: "Use full canonical name, not ambiguous short form",
    validationTemplate: "'{value}' is ambiguous - use full canonical name"
  }),

  new ExtractionRule({
    id: "entity-disambiguate-from-context",
    category: "mention_format",
    severity: "warning",
    instruction: "When text uses short forms or nicknames, infer the full canonical name from context. " +
      "Use other entities, locations, and domain knowledge to disambiguate. " +
      "E.g., if 'City' appears in an article about Premier League with 'Pep Guardiola', it means 'Manchester City'",
    example: new RuleExample({
      input: "City, managed by Pep Guardiola, beat Arsenal",
      output: "manchester_city (mention: 'Manchester City')",
      explanation: "Pep Guardiola context indicates Manchester City, not other 'City' teams"
    }),
    counterExample: new RuleExample({
      input: "City beat Arsenal",
      output: "city (mention: 'City')",
      explanation: "WRONG - must disambiguate using context clues"
    }),
    schemaDescription: "Disambiguate short forms using surrounding context",
    validationTemplate: "'{value}' needs disambiguation - check context for clues"
  })
]

// =============================================================================
// Static Rules - Relation Extraction
// =============================================================================

/**
 * Static rules for relation extraction (Stage 2)
 *
 * These rules are constant across all relation extractions.
 *
 * @since 2.0.0
 */
export const RELATION_STATIC_RULES: ReadonlyArray<ExtractionRule> = [
  new ExtractionRule({
    id: "relation-subject-valid",
    category: "reference_integrity",
    severity: "error",
    instruction: "Subject MUST be one of the entity IDs from Stage 1",
    example: new RuleExample({
      input: "cristiano_ronaldo plays for al_nassr",
      output: "{ \"subjectId\": \"cristiano_ronaldo\" }",
      explanation: "Use exact entity ID from Stage 1"
    }),
    counterExample: new RuleExample({
      input: "cristiano_ronaldo plays for al_nassr",
      output: "{ \"subjectId\": \"ronaldo\" }",
      explanation: "Must use exact ID from Stage 1, not abbreviated"
    }),
    schemaDescription: "Subject entity ID - MUST be from Stage 1 entity list",
    validationTemplate: "Subject '{value}' is not a valid entity ID from Stage 1"
  }),

  new ExtractionRule({
    id: "relation-predicate-valid",
    category: "property_usage",
    severity: "error",
    instruction: "Predicate MUST be the local name of an allowed property (e.g., 'playsFor', NOT the full URI)",
    example: new RuleExample({
      input: "uses playsFor property",
      output: "playsFor",
      explanation: "Use property local name from allowed list"
    }),
    counterExample: new RuleExample({
      input: "uses playsFor property",
      output: "http://ontology/playsFor",
      explanation: "Must use local name only, NOT the full URI"
    }),
    schemaDescription: "Property local name - MUST be from allowed properties list",
    validationTemplate: "Predicate '{value}' is not a valid property name"
  }),

  new ExtractionRule({
    id: "relation-object-type",
    category: "property_usage",
    severity: "error",
    instruction:
      "Object type depends on property: object properties require entity ID, datatype properties require literal value",
    example: new RuleExample({
      input: "Object property 'playsFor'",
      output: "{ \"object\": \"al_nassr\" }",
      explanation: "Object property → entity ID as object"
    }),
    counterExample: new RuleExample({
      input: "Object property 'playsFor'",
      output: "{ \"object\": \"Al-Nassr\" }",
      explanation: "Must use entity ID, not literal string"
    }),
    schemaDescription: "Object: entity ID (for object properties) OR literal value (for datatype properties)",
    validationTemplate: "Object '{value}' has wrong type for this property"
  }),

  new ExtractionRule({
    id: "relation-property-casing",
    category: "iri_casing",
    severity: "warning",
    instruction: "Use property local names as shown in the allowed list. Casing is normalized automatically.",
    example: new RuleExample({
      input: "teamRanking property",
      output: "teamRanking",
      explanation: "Use local name as shown (case will be normalized)"
    }),
    counterExample: new RuleExample({
      input: "teamRanking property",
      output: "TeamRanking",
      explanation: "Prefer exact casing from list, though it will be normalized"
    }),
    schemaDescription: "Property local name from allowed list (case-insensitive matching)",
    validationTemplate: "Property '{value}' not found in allowed list"
  }),

  new ExtractionRule({
    id: "relation-extract-all",
    category: "cardinality",
    severity: "warning",
    instruction: "Extract ALL relationships mentioned or implied in the text - be thorough",
    example: new RuleExample({
      input: "Ronaldo plays for Al-Nassr in Saudi Arabia",
      output: "2 relations: ronaldo-playsFor->al_nassr, al_nassr-locatedIn->saudi_arabia",
      explanation: "Extract all valid relations"
    }),
    counterExample: new RuleExample({
      input: "Ronaldo plays for Al-Nassr in Saudi Arabia",
      output: "1 relation: ronaldo-playsFor->al_nassr",
      explanation: "Missing relation - extract all of them"
    }),
    schemaDescription: "Extract all valid relations from the text",
    validationTemplate: "May have missed relations - extraction found only {value}"
  }),

  // =============================================================================
  // Relation Context Validation Rules
  // =============================================================================

  new ExtractionRule({
    id: "relation-verify-text-support",
    category: "context_validation",
    severity: "error",
    instruction: "Relations MUST be explicitly stated or strongly implied by the text. " +
      "Do NOT infer relations from general knowledge - only extract what the text actually says. " +
      "If the text says 'X scored against Y', extract that relation, not unmentioned team affiliations.",
    example: new RuleExample({
      input: "Vicario made a save against Arsenal",
      output: "vicario-playedAgainst->arsenal",
      explanation: "The text supports 'played against', not 'plays for'"
    }),
    counterExample: new RuleExample({
      input: "Vicario made a save against Arsenal",
      output: "vicario-playsFor->arsenal",
      explanation: "WRONG - text says he played AGAINST Arsenal, not FOR them"
    }),
    schemaDescription: "Extract only relations supported by the text",
    validationTemplate: "Relation '{value}' is not supported by the text context"
  }),

  new ExtractionRule({
    id: "relation-opponent-vs-team",
    category: "context_validation",
    severity: "error",
    instruction: "Carefully distinguish between opponent relationships and team membership. " +
      "'X vs Y', 'X against Y', 'X faced Y' indicate opponents, NOT team membership. " +
      "Only use 'playsFor' when text explicitly states team affiliation.",
    example: new RuleExample({
      input: "Hincapie's Leverkusen lost to Arsenal",
      output: "hincapie-playsFor->leverkusen, leverkusen-playedAgainst->arsenal",
      explanation: "Hincapie plays FOR Leverkusen, who played AGAINST Arsenal"
    }),
    counterExample: new RuleExample({
      input: "Hincapie's tackle against Arsenal",
      output: "hincapie-playsFor->arsenal",
      explanation: "WRONG - 'against Arsenal' means opponent, not team membership"
    }),
    schemaDescription: "Distinguish opponent relations from team membership",
    validationTemplate: "'{value}' confuses opponent relationship with team membership"
  }),

  new ExtractionRule({
    id: "relation-possessive-indicates-affiliation",
    category: "context_validation",
    severity: "warning",
    instruction: "Possessive patterns indicate affiliation: 'X's Y', 'Y of X' suggest membership/ownership. " +
      "E.g., 'Arsenal's goalkeeper' means the goalkeeper plays for Arsenal. " +
      "'Spurs keeper Vicario' means Vicario plays for Tottenham (Spurs).",
    example: new RuleExample({
      input: "Tottenham's goalkeeper Vicario saved the shot",
      output: "vicario-playsFor->tottenham",
      explanation: "Possessive 'Tottenham's goalkeeper' indicates team membership"
    }),
    counterExample: new RuleExample({
      input: "Arsenal faced Tottenham's goalkeeper",
      output: "vicario-playsFor->arsenal",
      explanation: "WRONG - Vicario is TOTTENHAM's goalkeeper, not Arsenal's"
    }),
    schemaDescription: "Use possessive patterns to infer team affiliation",
    validationTemplate: "Check possessive pattern for correct affiliation in '{value}'"
  })
]

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create entity extraction rule set from ontology context
 *
 * Combines static entity rules with dynamic rules derived from
 * the specific classes and properties available.
 *
 * @param classes - Available ontology classes
 * @param datatypeProperties - Available datatype properties for attributes
 * @returns RuleSet for entity extraction
 *
 * @since 2.0.0
 */
export const makeEntityRuleSet = (
  classes: ReadonlyArray<ClassDefinition>,
  datatypeProperties: ReadonlyArray<PropertyDefinition>
): RuleSet => {
  const dynamicRules: Array<ExtractionRule> = []

  // Dynamic rule: allowed classes
  if (classes.length > 0) {
    const preview = classes.slice(0, 5).map((c) => c.id).join(", ")
    const suffix = classes.length > 5 ? "..." : ""

    dynamicRules.push(
      new ExtractionRule({
        id: "entity-allowed-classes",
        category: "type_mapping",
        severity: "error",
        instruction: `Types MUST be from allowed classes: ${preview}${suffix}`,
        example: new RuleExample({
          input: "Selecting entity type",
          output: classes[0]?.id ?? "http://example.org/Person",
          explanation: "Use IRI from the ontology schema"
        }),
        counterExample: null,
        schemaDescription: `Allowed classes: ${preview}${suffix}`,
        validationTemplate: "Type '{value}' is not in allowed classes"
      })
    )
  }

  // Dynamic rule: allowed datatype properties (for attributes)
  if (datatypeProperties.length > 0) {
    const preview = datatypeProperties.slice(0, 5).map((p) => p.id).join(", ")
    const suffix = datatypeProperties.length > 5 ? "..." : ""

    dynamicRules.push(
      new ExtractionRule({
        id: "entity-allowed-attributes",
        category: "property_usage",
        severity: "error", // Error - attributes are important for entity value
        instruction: `Extract entity attributes using property keys. REQUIRED when text contains relevant data. Use: ${preview}${suffix}`,
        example: new RuleExample({
          input: "CEO John Mitchell of Acme Corporation, founded in 2018",
          output: '{ "name": "John Mitchell", "title": "CEO", "foundedDate": "2018" }',
          explanation: "Extract all available attributes from text - names, titles, dates, quantities"
        }),
        counterExample: null,
        schemaDescription: "Entity attributes capture literal values. Extract ALL available data.",
        validationTemplate: "Entity should have attributes extracted from text"
      })
    )
  }

  const allowedIris = AllowedIriSet.fromOntology(
    classes,
    [], // No object properties for entity stage
    datatypeProperties,
    [] // No entity IDs yet
  )

  return new RuleSet({
    stage: "entity",
    staticRules: ENTITY_STATIC_RULES,
    dynamicRules,
    allowedIris
  })
}

/**
 * Create relation extraction rule set from ontology context
 *
 * Combines static relation rules with dynamic rules derived from
 * the specific entity IDs and properties available.
 *
 * @param entityIds - Valid entity IDs from Stage 1
 * @param properties - Available properties (both object and datatype)
 * @returns RuleSet for relation extraction
 *
 * @since 2.0.0
 */
export const makeRelationRuleSet = (
  entityIds: ReadonlyArray<string>,
  properties: ReadonlyArray<PropertyDefinition>
): RuleSet => {
  const dynamicRules: Array<ExtractionRule> = []
  const objectProperties = properties.filter((p) => p.rangeType === "object")
  const datatypeProperties = properties.filter((p) => p.rangeType === "datatype")

  // Dynamic rule: valid entity IDs
  if (entityIds.length > 0) {
    const preview = entityIds.slice(0, 5).join(", ")
    const suffix = entityIds.length > 5 ? "..." : ""

    dynamicRules.push(
      new ExtractionRule({
        id: "relation-valid-entities",
        category: "reference_integrity",
        severity: "error",
        instruction: `Use ONLY these entity IDs from Stage 1: ${preview}${suffix}`,
        example: new RuleExample({
          input: "Selecting subject/object",
          output: entityIds[0] ?? "entity_1",
          explanation: "Use exact ID from Stage 1"
        }),
        counterExample: null,
        schemaDescription: `Valid entity IDs: ${preview}${suffix}`,
        validationTemplate: "Entity ID '{value}' is not from Stage 1"
      })
    )
  }

  // Dynamic rule: allowed object properties
  if (objectProperties.length > 0) {
    const preview = objectProperties.slice(0, 5).map((p) => p.id).join(", ")
    const suffix = objectProperties.length > 5 ? "..." : ""

    dynamicRules.push(
      new ExtractionRule({
        id: "relation-allowed-object-props",
        category: "property_usage",
        severity: "error",
        instruction: `Object properties (link entities): ${preview}${suffix}`,
        example: new RuleExample({
          input: "Entity-to-entity relation",
          output: objectProperties[0]?.id ?? "http://example.org/relatedTo",
          explanation: "Object property → object must be entity ID"
        }),
        counterExample: null,
        schemaDescription: `Object properties: ${preview}${suffix}`,
        validationTemplate: "Property '{value}' is not in allowed object properties"
      })
    )
  }

  // Dynamic rule: allowed datatype properties
  if (datatypeProperties.length > 0) {
    const preview = datatypeProperties.slice(0, 5).map((p) => p.id).join(", ")
    const suffix = datatypeProperties.length > 5 ? "..." : ""

    dynamicRules.push(
      new ExtractionRule({
        id: "relation-allowed-datatype-props",
        category: "property_usage",
        severity: "error",
        instruction: `Datatype properties (literal values): ${preview}${suffix}`,
        example: new RuleExample({
          input: "Entity-to-literal relation",
          output: datatypeProperties[0]?.id ?? "http://example.org/name",
          explanation: "Datatype property → object must be literal"
        }),
        counterExample: null,
        schemaDescription: `Datatype properties: ${preview}${suffix}`,
        validationTemplate: "Property '{value}' is not in allowed datatype properties"
      })
    )
  }

  const allowedIris = AllowedIriSet.fromOntology(
    [], // No classes for relation stage
    objectProperties,
    datatypeProperties,
    entityIds
  )

  return new RuleSet({
    stage: "relation",
    staticRules: RELATION_STATIC_RULES,
    dynamicRules,
    allowedIris
  })
}

/**
 * Create mention extraction rule set
 *
 * Mention extraction has simpler rules since it doesn't involve type assignment.
 *
 * @returns RuleSet for mention extraction
 *
 * @since 2.0.0
 */
export const makeMentionRuleSet = (): RuleSet => {
  const staticRules: ReadonlyArray<ExtractionRule> = [
    new ExtractionRule({
      id: "mention-id-format",
      category: "id_format",
      severity: "error",
      instruction: "Assign unique snake_case IDs starting with a lowercase letter",
      example: new RuleExample({
        input: "Cristiano Ronaldo",
        output: "cristiano_ronaldo",
        explanation: "Lowercase with underscores"
      }),
      counterExample: null,
      schemaDescription: "Snake_case unique identifier",
      validationTemplate: "Mention ID '{value}' must be snake_case"
    }),

    new ExtractionRule({
      id: "mention-complete",
      category: "mention_format",
      severity: "warning",
      instruction: "Use complete, human-readable names for mentions",
      example: new RuleExample({
        input: "Stanford is a university",
        output: "Stanford University",
        explanation: "Use full canonical form"
      }),
      counterExample: null,
      schemaDescription: "Human-readable entity name - use complete form",
      validationTemplate: "Mention '{value}' may be incomplete"
    }),

    new ExtractionRule({
      id: "mention-context",
      category: "mention_format",
      severity: "warning",
      instruction: "Include brief context about each entity to help with later classification",
      example: new RuleExample({
        input: "Ronaldo scored a goal",
        output: "{ \"context\": \"A professional footballer who scored\" }",
        explanation: "Context helps with type assignment in Stage 1"
      }),
      counterExample: null,
      schemaDescription: "Brief context about the entity from text",
      validationTemplate: "Missing context for mention '{value}'"
    }),

    new ExtractionRule({
      id: "mention-extract-all",
      category: "cardinality",
      severity: "warning",
      instruction: "Extract as many entity mentions as possible - be thorough",
      example: new RuleExample({
        input: "Ronaldo plays for Al-Nassr",
        output: "2 mentions",
        explanation: "Extract all named entities"
      }),
      counterExample: null,
      schemaDescription: "Extract all entity mentions from text",
      validationTemplate: "May have missed mentions"
    })
  ]

  return new RuleSet({
    stage: "mention",
    staticRules,
    dynamicRules: [],
    allowedIris: new AllowedIriSet({
      classIris: [],
      objectPropertyIris: [],
      datatypePropertyIris: [],
      entityIds: [],
      classIriMap: new Map(),
      propertyIriMap: new Map()
    })
  })
}
