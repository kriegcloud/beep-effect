import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"

import { ExtractionTarget } from "../../src/ExtractionTarget.js"
import { InferenceConfigError } from "../../src/Errors.js"

describe("ExtractionTarget", () => {
  it("builds prompt/json schema metadata from schema classes", () => {
    const Person = Schema.Struct({
      name: Schema.String.annotations({ description: "Person name" }),
      age: Schema.Number.annotations({ description: "Person age" })
    }).annotations({
      identifier: "person",
      description: "A person mentioned in text",
      examples: [{ name: "Alice", age: 30 }]
    })

    const target = ExtractionTarget.make({
      classes: { person: Person },
      description: "Extract people"
    })

    expect(target.description).toBe("Extract people")
    expect(target.classDefinitions.person?.fields.length).toBe(2)
    expect(target.promptDescription).toContain("extractionClass")
    expect(target.promptDescription).toContain("person")
    expect(target.jsonSchema).toHaveProperty("$defs.ExtractionTargetOutput.properties.extractions")
    expect(target.jsonSchema).toHaveProperty(
      "$defs.ExtractionTargetOutput.properties.extractions.items.discriminator.propertyName",
      "extractionClass"
    )
    expect(target.jsonSchema).toHaveProperty(
      "$defs.ExtractionTargetOutput.properties.extractions.items.discriminator.mapping.person",
      "#/$defs/personExtractionRow"
    )
  })

  it("rejects mismatched identifier annotations", () => {
    const Person = Schema.Struct({
      name: Schema.String
    }).annotations({
      identifier: "player"
    })

    expect(() =>
      ExtractionTarget.make({
        classes: { person: Person },
        description: "Extract entities"
      })
    ).toThrowError(/must match identifier annotation/)
  })

  it("rejects invalid annotated examples", () => {
    const Person = Schema.Struct({
      name: Schema.String
    }).annotations({
      identifier: "person",
      examples: [{ name: 123 }]
    })

    expect(() =>
      ExtractionTarget.make({
        classes: { person: Person },
        description: "Extract entities"
      })
    ).toThrowError(/invalid annotated examples/)
  })

  it("escapes discriminator mapping refs for identifiers with / and ~", () => {
    const Special = Schema.Struct({
      value: Schema.String
    }).annotations({
      identifier: "foo/bar~baz",
      examples: [{ value: "ok" }]
    })

    const target = ExtractionTarget.make({
      classes: { "foo/bar~baz": Special },
      description: "Extract special"
    })

    expect(target.jsonSchema).toHaveProperty(
      "$defs.ExtractionTargetOutput.properties.extractions.items.discriminator.mapping.foo/bar~baz",
      "#/$defs/foo~1bar~0bazExtractionRow"
    )
  })

  it("marks optional fields and generates valid JSON schema", () => {
    const WithOptional = Schema.Struct({
      required: Schema.String,
      optional: Schema.optional(Schema.String)
    }).annotations({
      identifier: "entity",
      examples: [{ required: "hello" }]
    })

    const target = ExtractionTarget.make({
      classes: { entity: WithOptional },
      description: "Extract entities"
    })

    const fields = target.classDefinitions.entity?.fields ?? []
    const requiredField = fields.find((f) => f.name === "required")
    const optionalField = fields.find((f) => f.name === "optional")
    expect(requiredField?.optional).toBe(false)
    expect(optionalField?.optional).toBe(true)

    // JSON schema should still generate without error
    expect(target.jsonSchema).toBeDefined()
    expect(target.jsonSchema.$defs).toBeDefined()
  })

  it("produces type labels for literal and enum-like union fields", () => {
    const WithLiterals = Schema.Struct({
      status: Schema.Literal("active", "inactive"),
      singleLit: Schema.Literal("only")
    }).annotations({
      identifier: "status_entity",
      examples: [{ status: "active", singleLit: "only" }]
    })

    const target = ExtractionTarget.make({
      classes: { status_entity: WithLiterals },
      description: "Extract status"
    })

    const fields = target.classDefinitions.status_entity?.fields ?? []
    const statusField = fields.find((f) => f.name === "status")
    const singleField = fields.find((f) => f.name === "singleLit")
    expect(statusField?.type).toContain("active")
    expect(statusField?.type).toContain("inactive")
    expect(singleField?.type).toBe('"only"')
  })

  it("rejects empty classes object", () => {
    expect(() =>
      ExtractionTarget.make({
        classes: {},
        description: "Extract nothing"
      })
    ).toThrowError(/at least one class/)
  })

  it("produces meaningful type labels for Declaration types (UUID, Date)", () => {
    const WithDeclarations = Schema.Struct({
      id: Schema.UUID,
      createdAt: Schema.Date
    }).annotations({
      identifier: "timestamped",
      examples: [{ id: "550e8400-e29b-41d4-a716-446655440000", createdAt: "2024-01-01T00:00:00.000Z" }]
    })

    const target = ExtractionTarget.make({
      classes: { timestamped: WithDeclarations },
      description: "Extract timestamped entities"
    })

    const fields = target.classDefinitions.timestamped?.fields ?? []
    const idField = fields.find((f) => f.name === "id")
    const dateField = fields.find((f) => f.name === "createdAt")
    expect(idField?.type).not.toBe("unknown")
    expect(dateField?.type).not.toBe("unknown")
  })

  it.effect("makeEffect returns InferenceConfigError for empty classes", () =>
    Effect.gen(function* () {
      const result = yield* ExtractionTarget.makeEffect({
        classes: {},
        description: "Extract nothing"
      }).pipe(Effect.flip)

      expect(result).toBeInstanceOf(InferenceConfigError)
      expect(result.message).toContain("at least one class")
    })
  )
})
