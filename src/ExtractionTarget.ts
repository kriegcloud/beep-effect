import { Effect, Option, Schema } from "effect"
import * as JSONSchema from "effect/JSONSchema"
import * as AST from "effect/SchemaAST"

import { ExampleData, Extraction } from "./Data.js"
import { InferenceConfigError } from "./Errors.js"
import {
  buildSchemaPromptDescription,
  type SchemaPromptField,
  type SchemaPromptSection
} from "./SchemaPromptBuilder.js"

const ExtractionTargetTypeId: unique symbol = Symbol.for(
  "@effect-langextract/ExtractionTarget"
)

export interface ExtractionTargetField {
  readonly name: string
  readonly type: string
  readonly description?: string | undefined
  readonly optional: boolean
}

export type ExtractionClassSchema = Schema.Schema<any, any, never>

export interface ExtractionTargetClassDefinition<S extends ExtractionClassSchema = ExtractionClassSchema> {
  readonly key: string
  readonly identifier: string
  readonly schema: S
  readonly description?: string | undefined
  readonly examples: ReadonlyArray<S["Type"]>
  readonly fields: ReadonlyArray<ExtractionTargetField>
  readonly rowSchema: Schema.Schema<any, any, never>
}

export interface ExtractionTarget<Classes extends Record<string, ExtractionClassSchema>> {
  readonly [ExtractionTargetTypeId]: typeof ExtractionTargetTypeId
  readonly classes: Classes
  readonly description: string
  readonly classDefinitions: Readonly<
    Record<string, ExtractionTargetClassDefinition<ExtractionClassSchema>>
  >
  readonly classSchemasByIdentifier: Readonly<Record<string, ExtractionClassSchema>>
  readonly outputSchema: Schema.Schema<any, any, never>
  readonly jsonSchema: JSONSchema.JsonSchema7Root
  readonly promptDescription: string
  readonly promptExamples: ReadonlyArray<ExampleData>
}

export type AnyExtractionTarget = ExtractionTarget<Record<string, ExtractionClassSchema>>

const JsonString = Schema.parseJson()

const getIdentifier = (schema: ExtractionClassSchema): string | undefined =>
  Option.getOrUndefined(AST.getIdentifierAnnotation(schema.ast))

const getDescription = (annotated: AST.Annotated): string | undefined =>
  Option.getOrUndefined(AST.getDescriptionAnnotation(annotated))

const getExamples = (annotated: AST.Annotated): ReadonlyArray<unknown> =>
  Option.getOrUndefined(AST.getExamplesAnnotation(annotated)) ?? []

interface ExampleDecodeFailure {
  readonly index: number
  readonly error: string
}

const decodeExamples = <S extends ExtractionClassSchema>(
  schema: S,
  examples: ReadonlyArray<unknown>
): {
  readonly decoded: ReadonlyArray<S["Type"]>
  readonly failures: ReadonlyArray<ExampleDecodeFailure>
} => {
  const decoded: Array<S["Type"]> = []
  const failures: Array<ExampleDecodeFailure> = []
  for (const [index, example] of examples.entries()) {
    const parsed = Schema.decodeUnknownEither(schema)(example)
    if (parsed._tag === "Right") {
      decoded.push(parsed.right)
    } else {
      failures.push({
        index,
        error: String(parsed.left)
      })
    }
  }
  return { decoded, failures }
}

const astTypeLabel = (ast: AST.AST): string => {
  switch (ast._tag) {
    case "StringKeyword":
      return "string"
    case "NumberKeyword":
      return "number"
    case "BooleanKeyword":
      return "boolean"
    case "BigIntKeyword":
      return "bigint"
    case "Literal":
      return JSON.stringify(ast.literal)
    case "Union":
      return ast.types.map(astTypeLabel).join(" | ")
    case "TupleType":
      return "array"
    case "TypeLiteral":
      return "object"
    case "Enums":
      return "enum"
    case "UndefinedKeyword":
      return "undefined"
    case "Suspend":
      return astTypeLabel(ast.f())
    case "Refinement":
      return astTypeLabel(ast.from)
    case "Transformation":
      return astTypeLabel(ast.to)
    case "Declaration": {
      const identifier = Option.getOrUndefined(AST.getIdentifierAnnotation(ast))
      const firstParam = ast.typeParameters[0]
      return identifier ?? (firstParam !== undefined ? astTypeLabel(firstParam) : "unknown")
    }
    default:
      return "unknown"
  }
}

const collectFields = (schema: ExtractionClassSchema): ReadonlyArray<ExtractionTargetField> => {
  const signatures = AST.getPropertySignatures(schema.ast)
  return signatures
    .filter((signature) => typeof signature.name === "string")
    .map((signature) => {
      const fieldDescription = getDescription(signature)
      return {
        name: signature.name as string,
        type: astTypeLabel(signature.type),
        optional: signature.isOptional,
        ...(fieldDescription !== undefined ? { description: fieldDescription } : {})
      } satisfies ExtractionTargetField
    })
}

const encodeSchemaExample = (
  className: string,
  example: unknown,
  index: number
): ExampleData => {
  const encoded = Schema.encodeSync(JsonString)([{ extractionClass: className, extractionText: "", data: example }])
  return new ExampleData({
    text: `Schema example ${index + 1} for ${className}`,
    extractions: [
      new Extraction({
        extractionClass: className,
        extractionText: ""
      })
    ],
    output: encoded
  })
}

const makeUnionSchema = (
  rows: ReadonlyArray<Schema.Schema<any, any, never>>,
  discriminatorMapping: Readonly<Record<string, string>>
): Schema.Schema<any, any, never> => {
  const [first, second, ...rest] = rows
  const schema =
    first === undefined
      ? Schema.Struct({
      extractionClass: Schema.String,
      extractionText: Schema.String,
      data: Schema.Unknown
    })
      : second === undefined
        ? first
        : Schema.Union(first, second, ...rest)

  return Object.keys(discriminatorMapping).length === 0
    ? schema
    : schema.annotations({
        jsonSchema: {
          discriminator: {
            propertyName: "extractionClass",
            mapping: discriminatorMapping
          }
        }
      })
}

const toJsonPointerDefRef = (identifier: string): string =>
  `#/$defs/${identifier.replace(/~/g, "~0").replace(/\//g, "~1")}`

export const makeExtractionTarget = <Classes extends Record<string, ExtractionClassSchema>>(options: {
  readonly classes: Classes
  readonly description: string
}): ExtractionTarget<Classes> => {
  if (Object.keys(options.classes).length === 0) {
    throw new InferenceConfigError({
      message: "ExtractionTarget requires at least one class. Received empty classes object."
    })
  }

  const classDefinitions: Record<
    string,
    ExtractionTargetClassDefinition<ExtractionClassSchema>
  > = {}
  const classSchemasByIdentifier: Record<string, ExtractionClassSchema> = {}
  const rowSchemas: Array<Schema.Schema<any, any, never>> = []
  const discriminatorMapping: Record<string, string> = {}
  const promptSections: Array<SchemaPromptSection> = []
  const promptExamples: Array<ExampleData> = []

  for (const [classKey, schema] of Object.entries(options.classes)) {
    const declaredIdentifier = getIdentifier(schema)
    if (declaredIdentifier !== undefined && declaredIdentifier !== classKey) {
      throw new InferenceConfigError({
        message:
          `Schema class key '${classKey}' must match identifier annotation '${declaredIdentifier}'. `
          + "Use the class key as canonical identifier for typed extraction."
      })
    }

    const identifier = classKey
    const description = getDescription(schema.ast)
    const decodedExamples = decodeExamples(schema, getExamples(schema.ast))
    if (decodedExamples.failures.length > 0) {
      const firstFailure = decodedExamples.failures[0]
      const details = firstFailure !== undefined
        ? ` First invalid example index: ${firstFailure.index}.`
        : ""
      throw new InferenceConfigError({
        message:
          `Schema class '${identifier}' has invalid annotated examples.${details} `
          + "All examples must decode with the class schema."
      })
    }
    const examples = decodedExamples.decoded
    const fields = collectFields(schema)
    const rowIdentifier = `${identifier}ExtractionRow`

    const rowSchema = Schema.Struct({
      extractionClass: Schema.Literal(identifier),
      extractionText: Schema.String,
      data: schema
    }).annotations({
      identifier: rowIdentifier,
      ...(description !== undefined ? { description } : {})
    })

    classDefinitions[identifier] = {
      key: classKey,
      identifier,
      schema,
      ...(description !== undefined ? { description } : {}),
      examples,
      fields,
      rowSchema
    }
    classSchemasByIdentifier[identifier] = schema
    rowSchemas.push(rowSchema)
    discriminatorMapping[identifier] = toJsonPointerDefRef(rowIdentifier)

    promptSections.push({
      identifier,
      ...(description !== undefined ? { description } : {}),
      fields: fields.map(
        (field) =>
          ({
            name: field.name,
            type: field.type,
            optional: field.optional,
            ...(field.description !== undefined
              ? { description: field.description }
              : {})
          }) satisfies SchemaPromptField
      ),
      examples
    })

    for (const [index, example] of examples.entries()) {
      promptExamples.push(encodeSchemaExample(identifier, example, index))
    }
  }

  const outputSchema = Schema.Struct({
    extractions: Schema.Array(makeUnionSchema(rowSchemas, discriminatorMapping))
  }).annotations({
    identifier: "ExtractionTargetOutput"
  })

  return {
    [ExtractionTargetTypeId]: ExtractionTargetTypeId,
    classes: options.classes,
    description: options.description,
    classDefinitions,
    classSchemasByIdentifier,
    outputSchema,
    jsonSchema: JSONSchema.make(outputSchema),
    promptDescription: buildSchemaPromptDescription({
      description: options.description,
      sections: promptSections
    }),
    promptExamples
  }
}

export const ExtractionTarget = {
  make: makeExtractionTarget,
  makeEffect: <Classes extends Record<string, ExtractionClassSchema>>(options: {
    readonly classes: Classes
    readonly description: string
  }): Effect.Effect<ExtractionTarget<Classes>, InferenceConfigError> =>
    Effect.try({
      try: () => makeExtractionTarget(options),
      catch: (error) =>
        error instanceof InferenceConfigError
          ? error
          : new InferenceConfigError({ message: `Failed to create ExtractionTarget: ${String(error)}` })
    }),
  isExtractionTarget: (value: unknown): value is AnyExtractionTarget =>
    typeof value === "object"
    && value !== null
    && ExtractionTargetTypeId in value
}
