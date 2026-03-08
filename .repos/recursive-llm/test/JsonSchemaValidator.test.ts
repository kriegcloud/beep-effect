import { describe, expect, test } from "bun:test"
import { validateJsonSchema, parseAndValidateJson } from "../src/JsonSchemaValidator"

describe("validateJsonSchema", () => {
  test("valid object with required properties", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" }
      },
      required: ["name", "age"]
    }
    const result = validateJsonSchema({ name: "Alice", age: 30 }, schema)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test("missing required property", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" }
      },
      required: ["name", "age"]
    }
    const result = validateJsonSchema({ name: "Alice" }, schema)
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain("age")
  })

  test("type mismatch: string expected, number given", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" }
      }
    }
    const result = validateJsonSchema({ name: 42 }, schema)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain("expected string")
  })

  test("type mismatch at root level", () => {
    const schema = { type: "object" }
    const result = validateJsonSchema("hello", schema)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain("expected object, got string")
  })

  test("valid array with items", () => {
    const schema = {
      type: "array",
      items: { type: "string" }
    }
    const result = validateJsonSchema(["a", "b", "c"], schema)
    expect(result.valid).toBe(true)
  })

  test("invalid array item type", () => {
    const schema = {
      type: "array",
      items: { type: "string" }
    }
    const result = validateJsonSchema(["a", 42, "c"], schema)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain("[1]")
    expect(result.errors[0]).toContain("expected string, got number")
  })

  test("nested objects", () => {
    const schema = {
      type: "object",
      properties: {
        actors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              role: { type: "string" }
            },
            required: ["name", "role"]
          }
        }
      },
      required: ["actors"]
    }
    const result = validateJsonSchema({
      actors: [
        { name: "Alice", role: "researcher" },
        { name: "Bob", role: "engineer" }
      ]
    }, schema)
    expect(result.valid).toBe(true)
  })

  test("nested object missing required in array item", () => {
    const schema = {
      type: "object",
      properties: {
        actors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              role: { type: "string" }
            },
            required: ["name", "role"]
          }
        }
      },
      required: ["actors"]
    }
    const result = validateJsonSchema({
      actors: [
        { name: "Alice" },
        { name: "Bob", role: "engineer" }
      ]
    }, schema)
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain("actors")
    expect(result.errors[0]).toContain("[0]")
    expect(result.errors[0]).toContain("role")
  })

  test("enum validation: valid value", () => {
    const schema = {
      type: "object",
      properties: {
        status: { enum: ["active", "inactive", "pending"] }
      }
    }
    const result = validateJsonSchema({ status: "active" }, schema)
    expect(result.valid).toBe(true)
  })

  test("enum validation: invalid value", () => {
    const schema = {
      type: "object",
      properties: {
        status: { enum: ["active", "inactive", "pending"] }
      }
    }
    const result = validateJsonSchema({ status: "unknown" }, schema)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain("not in enum")
  })

  test("integer type", () => {
    const validResult = validateJsonSchema(42, { type: "integer" })
    expect(validResult.valid).toBe(true)

    const invalidResult = validateJsonSchema(3.14, { type: "integer" })
    expect(invalidResult.valid).toBe(false)
  })

  test("boolean type", () => {
    const result = validateJsonSchema(true, { type: "boolean" })
    expect(result.valid).toBe(true)

    const invalidResult = validateJsonSchema("true", { type: "boolean" })
    expect(invalidResult.valid).toBe(false)
  })

  test("null type", () => {
    const result = validateJsonSchema(null, { type: "null" })
    expect(result.valid).toBe(true)

    const invalidResult = validateJsonSchema(undefined, { type: "null" })
    expect(invalidResult.valid).toBe(false)
  })

  test("type union", () => {
    const schema = { type: ["string", "null"] }
    expect(validateJsonSchema("hello", schema).valid).toBe(true)
    expect(validateJsonSchema(null, schema).valid).toBe(true)
    expect(validateJsonSchema(42, schema).valid).toBe(false)
  })

  test("no schema constraints: always valid", () => {
    const result = validateJsonSchema({ anything: "goes" }, {})
    expect(result.valid).toBe(true)
  })

  test("optional properties are not required", () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
        nickname: { type: "string" }
      },
      required: ["name"]
    }
    const result = validateJsonSchema({ name: "Alice" }, schema)
    expect(result.valid).toBe(true)
  })
})

describe("parseAndValidateJson", () => {
  test("parses plain JSON object", () => {
    const schema = {
      type: "object",
      properties: { x: { type: "number" } },
      required: ["x"]
    }
    const result = parseAndValidateJson('{"x": 42}', schema)
    expect(result).toEqual({ x: 42 })
  })

  test("parses JSON from markdown code fence", () => {
    const schema = {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"]
    }
    const text = '```json\n{"name": "Alice"}\n```'
    const result = parseAndValidateJson(text, schema)
    expect(result).toEqual({ name: "Alice" })
  })

  test("parses JSON from code fence without language tag", () => {
    const schema = { type: "object" }
    const text = '```\n{"key": "value"}\n```'
    const result = parseAndValidateJson(text, schema)
    expect(result).toEqual({ key: "value" })
  })

  test("extracts JSON object from surrounding text", () => {
    const schema = {
      type: "object",
      properties: { count: { type: "number" } },
      required: ["count"]
    }
    const text = 'Here is the result: {"count": 5}'
    const result = parseAndValidateJson(text, schema)
    expect(result).toEqual({ count: 5 })
  })

  test("strict mode rejects surrounding prose", () => {
    const schema = {
      type: "object",
      properties: { count: { type: "number" } },
      required: ["count"]
    }
    const text = 'Here is the result: {"count": 5}'
    expect(() => parseAndValidateJson(text, schema, { strict: true })).toThrow("Failed to parse JSON")
  })

  test("strict mode rejects markdown code fences", () => {
    const schema = {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"]
    }
    const text = '```json\n{"name":"Alice"}\n```'
    expect(() => parseAndValidateJson(text, schema, { strict: true })).toThrow("Failed to parse JSON")
  })

  test("throws on invalid JSON", () => {
    expect(() => parseAndValidateJson("not json", { type: "object" })).toThrow("Failed to parse JSON")
  })

  test("throws on schema mismatch", () => {
    const schema = {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"]
    }
    expect(() => parseAndValidateJson('{"age": 30}', schema)).toThrow("schema validation failed")
  })

  test("parses JSON array", () => {
    const schema = {
      type: "array",
      items: { type: "number" }
    }
    const result = parseAndValidateJson("[1, 2, 3]", schema)
    expect(result).toEqual([1, 2, 3])
  })
})
