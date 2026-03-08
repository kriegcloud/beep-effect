/**
 * Lightweight JSON Schema subset validator for structured llm_query output.
 *
 * Supports: object, array, string, number, integer, boolean, null,
 * properties, required, items, enum, type unions.
 */

export interface ValidationResult {
  readonly valid: boolean
  readonly errors: ReadonlyArray<string>
}

export interface ParseAndValidateJsonOptions {
  readonly strict?: boolean
}

type JsonSchemaNode = {
  readonly type?: string | ReadonlyArray<string>
  readonly properties?: Record<string, JsonSchemaNode>
  readonly required?: ReadonlyArray<string>
  readonly items?: JsonSchemaNode
  readonly enum?: ReadonlyArray<unknown>
  readonly additionalProperties?: boolean | JsonSchemaNode
}

const typeOf = (value: unknown): string => {
  if (value === null) return "null"
  if (Array.isArray(value)) return "array"
  return typeof value
}

const matchesType = (value: unknown, expected: string): boolean => {
  if (expected === "integer") {
    return typeof value === "number" && Number.isInteger(value)
  }
  return typeOf(value) === expected
}

const validateNode = (
  value: unknown,
  schema: JsonSchemaNode,
  path: string,
  errors: Array<string>
): void => {
  // enum check
  if (schema.enum !== undefined) {
    if (!schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(value))) {
      errors.push(`${path}: value ${JSON.stringify(value)} not in enum [${schema.enum.map((e) => JSON.stringify(e)).join(", ")}]`)
    }
    return
  }

  // type check
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type]
    if (!types.some((t) => matchesType(value, t))) {
      errors.push(`${path}: expected ${types.join("|")}, got ${typeOf(value)}`)
      return
    }
  }

  // object properties
  if (schema.properties !== undefined && typeof value === "object" && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>

    // required fields
    if (schema.required !== undefined) {
      for (const key of schema.required) {
        if (!(key in obj)) {
          errors.push(`${path}: missing required property "${key}"`)
        }
      }
    }

    // validate known properties
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in obj) {
        validateNode(obj[key], propSchema, `${path}.${key}`, errors)
      }
    }
  }

  // array items
  if (schema.items !== undefined && Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      validateNode(value[i], schema.items, `${path}[${i}]`, errors)
    }
  }
}

/**
 * Validate a parsed value against a JSON Schema subset.
 */
export const validateJsonSchema = (value: unknown, schema: object): ValidationResult => {
  const errors: Array<string> = []
  validateNode(value, schema as JsonSchemaNode, "$", errors)
  return { valid: errors.length === 0, errors }
}

/**
 * Extract JSON from text that may contain markdown code fences,
 * parse it, validate against schema, and return the parsed value.
 *
 * Throws on parse failure or validation failure.
 */
export const parseAndValidateJson = (
  text: string,
  schema: object,
  options?: ParseAndValidateJsonOptions
): unknown => {
  let jsonText = text.trim()
  const strict = options?.strict === true

  if (!strict) {
    // Strip markdown code fences
    const fenceMatch = jsonText.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/m)
    if (fenceMatch) {
      jsonText = fenceMatch[1]!.trim()
    }

    // Try to extract JSON object/array from surrounding text
    if (!jsonText.startsWith("{") && !jsonText.startsWith("[")) {
      const objectMatch = jsonText.match(/(\{[\s\S]*\})/)
      const arrayMatch = jsonText.match(/(\[[\s\S]*\])/)
      if (objectMatch) {
        jsonText = objectMatch[1]!
      } else if (arrayMatch) {
        jsonText = arrayMatch[1]!
      }
    }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${e instanceof Error ? e.message : String(e)}`)
  }

  const result = validateJsonSchema(parsed, schema)
  if (!result.valid) {
    throw new Error(`JSON schema validation failed: ${result.errors.join("; ")}`)
  }

  return parsed
}
