/**
 * Tests for Relation Schema Factory
 *
 * @module test/Schema/RelationFactory
 */

import { JSONSchema, Schema } from "effect"
import { describe, expect, it } from "vitest"
import { PropertyDefinition } from "../../src/Domain/Model/Ontology.js"
import { EmptyVocabularyError, makeRelationSchema } from "../../src/Schema/RelationFactory.js"

describe("makeRelationSchema", () => {
  it("should create schema from entity IDs and PropertyDefinition array", () => {
    const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    // Should be a valid schema
    expect(schema).toBeDefined()

    // Should generate JSON Schema
    const jsonSchema = JSONSchema.make(schema)
    expect(jsonSchema).toBeDefined()
    expect(jsonSchema).toHaveProperty("$ref")
  })

  it("should throw EmptyVocabularyError for empty entity IDs", () => {
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    expect(() => makeRelationSchema([], properties)).toThrow(EmptyVocabularyError)
  })

  it("should throw EmptyVocabularyError for empty properties", () => {
    const validEntityIds = ["cristiano_ronaldo"]

    expect(() => makeRelationSchema(validEntityIds, [])).toThrow(EmptyVocabularyError)
  })

  it("should create schema with correct structure matching Relation model", () => {
    const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    // Test that schema validates correct Relation structure
    // Schema now expects local names (e.g., "memberOf") which are expanded to IRIs post-extraction
    const validRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "memberOf", // Local name, not full IRI
          object: "al_nassr" // Entity reference
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validRelation)
    expect(result.relations).toHaveLength(1)
    expect(result.relations[0].subjectId).toBe("cristiano_ronaldo")
    expect(result.relations[0].predicate).toBe("memberOf") // Returns local name, IRI expansion is post-extraction
    expect(result.relations[0].object).toBe("al_nassr")
  })

  it("should reject relations with invalid subjectId", () => {
    const validEntityIds = ["cristiano_ronaldo"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    const invalidRelation = {
      relations: [
        {
          subjectId: "invalid_entity_id", // Not in validEntityIds
          predicate: "memberOf", // Local name
          object: "cristiano_ronaldo"
        }
      ]
    }

    expect(() => Schema.decodeUnknownSync(schema)(invalidRelation)).toThrow()
  })

  it("should reject relations with invalid predicate", () => {
    const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    const invalidRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "invalidProperty", // Not in allowed properties (local name doesn't match)
          object: "al_nassr"
        }
      ]
    }

    expect(() => Schema.decodeUnknownSync(schema)(invalidRelation)).toThrow()
  })

  it("should support literal string objects", () => {
    const validEntityIds = ["cristiano_ronaldo"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/birthDate",
        label: "birth date",
        comment: "Date of birth",
        domain: [],
        range: [],
        rangeType: "datatype"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    const validRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "birthDate", // Local name
          object: "1985-02-05" // Literal string
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validRelation)
    expect(result.relations[0].object).toBe("1985-02-05")
  })

  it("should support literal number objects", () => {
    const validEntityIds = ["cristiano_ronaldo"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/age",
        label: "age",
        comment: "Age in years",
        domain: [],
        range: [],
        rangeType: "datatype"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    const validRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "age", // Local name
          object: 39 // Literal number
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validRelation)
    expect(result.relations[0].object).toBe(39)
  })

  it("should support literal boolean objects", () => {
    const validEntityIds = ["cristiano_ronaldo"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/active",
        label: "active",
        comment: "Whether the entity is active",
        domain: [],
        range: [],
        rangeType: "datatype"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    const validRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "active", // Local name
          object: true // Literal boolean
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validRelation)
    expect(result.relations[0].object).toBe(true)
  })

  it("should support entity reference objects", () => {
    const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    const validRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "memberOf", // Local name
          object: "al_nassr" // Entity reference (must be in validEntityIds)
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validRelation)
    expect(result.relations[0].object).toBe("al_nassr")
  })

  it("should reject literal values for object properties", () => {
    const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    // Object property should reject literal string (not entity ID)
    const invalidRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "memberOf", // Local name
          object: "1985-02-05" // Literal string, not entity ID - should be rejected
        }
      ]
    }

    expect(() => Schema.decodeUnknownSync(schema)(invalidRelation)).toThrow()
  })

  it("should accept any string for datatype properties (schema cannot distinguish entity IDs from literals)", () => {
    // Note: Schema validation cannot distinguish between entity IDs and literal strings
    // because both are strings. The schema enforces structure, not semantic meaning.
    // Entity ID validation happens at runtime via Relation.isEntityReference.
    const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/birthDate",
        label: "birth date",
        comment: "Date of birth",
        domain: [],
        range: [],
        rangeType: "datatype"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    // Datatype property accepts any string (including strings that look like entity IDs)
    // The schema validates structure (string/number/boolean), not semantic meaning
    const relation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "birthDate", // Local name
          object: "al_nassr" // String literal - schema accepts it (can't distinguish from entity ID)
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(relation)
    expect(result.relations[0].object).toBe("al_nassr")
  })

  it("should enforce rangeType constraints with mixed properties", () => {
    const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      }),
      new PropertyDefinition({
        id: "http://schema.org/birthDate",
        label: "birth date",
        comment: "Date of birth",
        domain: [],
        range: [],
        rangeType: "datatype"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    // Valid: object property with entity ID
    const validObjectRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "memberOf", // Local name
          object: "al_nassr" // Entity ID - valid for object property
        }
      ]
    }
    expect(() => Schema.decodeUnknownSync(schema)(validObjectRelation)).not.toThrow()

    // Valid: datatype property with literal
    const validDatatypeRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "birthDate", // Local name
          object: "1985-02-05" // Literal - valid for datatype property
        }
      ]
    }
    expect(() => Schema.decodeUnknownSync(schema)(validDatatypeRelation)).not.toThrow()

    // Invalid: object property with literal
    const invalidObjectRelation = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "memberOf", // Local name
          object: "1985-02-05" // Literal - invalid for object property
        }
      ]
    }
    expect(() => Schema.decodeUnknownSync(schema)(invalidObjectRelation)).toThrow()

    // Note: Schema cannot reject entity IDs for datatype properties because
    // entity IDs are strings, and datatype properties accept strings.
    // The distinction is semantic, not structural, so schema validation passes.
    // Runtime validation (via Relation.isEntityReference) would catch this.
    const datatypeRelationWithEntityId = {
      relations: [
        {
          subjectId: "cristiano_ronaldo",
          predicate: "birthDate", // Local name
          object: "al_nassr" // String that looks like entity ID - schema accepts as string literal
        }
      ]
    }
    // Schema accepts this because "al_nassr" is a valid string
    const result = Schema.decodeUnknownSync(schema)(datatypeRelationWithEntityId)
    expect(result.relations[0].object).toBe("al_nassr")
  })

  it("should handle all object properties correctly", () => {
    const validEntityIds = ["entity_a", "entity_b"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/knows",
        label: "knows",
        comment: "Knows relationship",
        domain: [],
        range: [],
        rangeType: "object"
      }),
      new PropertyDefinition({
        id: "http://schema.org/memberOf",
        label: "member of",
        comment: "Organization membership",
        domain: [],
        range: [],
        rangeType: "object"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    // Should accept entity IDs for all object properties
    const validRelation = {
      relations: [
        {
          subjectId: "entity_a",
          predicate: "knows", // Local name
          object: "entity_b"
        },
        {
          subjectId: "entity_a",
          predicate: "memberOf", // Local name
          object: "entity_b"
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validRelation)
    expect(result.relations).toHaveLength(2)
  })

  it("should handle all datatype properties correctly", () => {
    const validEntityIds = ["entity_a"]
    const properties = [
      new PropertyDefinition({
        id: "http://schema.org/name",
        label: "name",
        comment: "Entity name",
        domain: [],
        range: [],
        rangeType: "datatype"
      }),
      new PropertyDefinition({
        id: "http://schema.org/age",
        label: "age",
        comment: "Age in years",
        domain: [],
        range: [],
        rangeType: "datatype"
      })
    ]

    const schema = makeRelationSchema(validEntityIds, properties)

    // Should accept literals for all datatype properties
    const validRelation = {
      relations: [
        {
          subjectId: "entity_a",
          predicate: "name", // Local name
          object: "Alice"
        },
        {
          subjectId: "entity_a",
          predicate: "age", // Local name
          object: 30
        }
      ]
    }

    const result = Schema.decodeUnknownSync(schema)(validRelation)
    expect(result.relations).toHaveLength(2)
  })

  describe("evidence spans", () => {
    it("should accept relation with evidence containing text and character offsets", () => {
      const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
      const properties = [
        new PropertyDefinition({
          id: "http://schema.org/memberOf",
          label: "member of",
          comment: "Organization membership",
          domain: [],
          range: [],
          rangeType: "object"
        })
      ]

      const schema = makeRelationSchema(validEntityIds, properties)

      const relationWithEvidence = {
        relations: [
          {
            subjectId: "cristiano_ronaldo",
            predicate: "memberOf",
            object: "al_nassr",
            evidence: {
              text: "Ronaldo joined Al-Nassr in January 2023",
              startChar: 245,
              endChar: 285,
              confidence: 0.92
            }
          }
        ]
      }

      const result = Schema.decodeUnknownSync(schema)(relationWithEvidence) as any
      expect(result.relations[0].evidence).toBeDefined()
      expect(result.relations[0].evidence.text).toBe("Ronaldo joined Al-Nassr in January 2023")
      expect(result.relations[0].evidence.startChar).toBe(245)
      expect(result.relations[0].evidence.endChar).toBe(285)
      expect(result.relations[0].evidence.confidence).toBe(0.92)
    })

    it("should accept evidence without confidence (optional field)", () => {
      const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
      const properties = [
        new PropertyDefinition({
          id: "http://schema.org/memberOf",
          label: "member of",
          comment: "Organization membership",
          domain: [],
          range: [],
          rangeType: "object"
        })
      ]

      const schema = makeRelationSchema(validEntityIds, properties)

      const relationWithEvidence = {
        relations: [
          {
            subjectId: "cristiano_ronaldo",
            predicate: "memberOf",
            object: "al_nassr",
            evidence: {
              text: "Ronaldo joined Al-Nassr",
              startChar: 245,
              endChar: 268
              // no confidence
            }
          }
        ]
      }

      const result = Schema.decodeUnknownSync(schema)(relationWithEvidence) as any
      expect(result.relations[0].evidence).toBeDefined()
      expect(result.relations[0].evidence.confidence).toBeUndefined()
    })

    it("should accept relation without evidence (optional field)", () => {
      const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
      const properties = [
        new PropertyDefinition({
          id: "http://schema.org/memberOf",
          label: "member of",
          comment: "Organization membership",
          domain: [],
          range: [],
          rangeType: "object"
        })
      ]

      const schema = makeRelationSchema(validEntityIds, properties)

      const relationWithoutEvidence = {
        relations: [
          {
            subjectId: "cristiano_ronaldo",
            predicate: "memberOf",
            object: "al_nassr"
            // no evidence field
          }
        ]
      }

      const result = Schema.decodeUnknownSync(schema)(relationWithoutEvidence) as any
      expect(result.relations[0].evidence).toBeUndefined()
    })

    it("should work with datatype property relations", () => {
      const validEntityIds = ["cristiano_ronaldo"]
      const properties = [
        new PropertyDefinition({
          id: "http://schema.org/birthDate",
          label: "birth date",
          comment: "Date of birth",
          domain: [],
          range: [],
          rangeType: "datatype"
        })
      ]

      const schema = makeRelationSchema(validEntityIds, properties)

      const relationWithEvidence = {
        relations: [
          {
            subjectId: "cristiano_ronaldo",
            predicate: "birthDate",
            object: "1985-02-05",
            evidence: {
              text: "born on February 5, 1985",
              startChar: 100,
              endChar: 124,
              confidence: 0.85
            }
          }
        ]
      }

      const result = Schema.decodeUnknownSync(schema)(relationWithEvidence) as any
      expect(result.relations[0].object).toBe("1985-02-05")
      expect(result.relations[0].evidence.text).toBe("born on February 5, 1985")
    })

    it("should reject evidence with negative character offsets", () => {
      const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
      const properties = [
        new PropertyDefinition({
          id: "http://schema.org/memberOf",
          label: "member of",
          comment: "Organization membership",
          domain: [],
          range: [],
          rangeType: "object"
        })
      ]

      const schema = makeRelationSchema(validEntityIds, properties)

      const invalidEvidence = {
        relations: [
          {
            subjectId: "cristiano_ronaldo",
            predicate: "memberOf",
            object: "al_nassr",
            evidence: {
              text: "Ronaldo joined Al-Nassr",
              startChar: -1, // Invalid: negative offset
              endChar: 268
            }
          }
        ]
      }

      expect(() => Schema.decodeUnknownSync(schema)(invalidEvidence)).toThrow()
    })

    it("should reject evidence with confidence outside 0-1 range", () => {
      const validEntityIds = ["cristiano_ronaldo", "al_nassr"]
      const properties = [
        new PropertyDefinition({
          id: "http://schema.org/memberOf",
          label: "member of",
          comment: "Organization membership",
          domain: [],
          range: [],
          rangeType: "object"
        })
      ]

      const schema = makeRelationSchema(validEntityIds, properties)

      const invalidConfidence = {
        relations: [
          {
            subjectId: "cristiano_ronaldo",
            predicate: "memberOf",
            object: "al_nassr",
            evidence: {
              text: "Ronaldo joined Al-Nassr",
              startChar: 0,
              endChar: 23,
              confidence: 2.5 // Invalid: > 1
            }
          }
        ]
      }

      expect(() => Schema.decodeUnknownSync(schema)(invalidConfidence)).toThrow()
    })
  })
})
