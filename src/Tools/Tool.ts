import * as Context from "effect/Context"
import * as JsonSchema from "effect/JSONSchema"
import { constFalse, constTrue } from "effect/Function"
import type * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as AST from "effect/SchemaAST"

/**
 * Controls how tool handler failures are represented.
 * - "error": fail the effect
 * - "return": encode failure as a normal result
 */
export type FailureMode = "error" | "return"

export type AnyStructSchema = Schema.Schema.Any

/**
 * Declarative tool definition used for SDK tool registration.
 */
export interface Tool<
  Name extends string,
  Config extends {
    readonly parameters: Schema.Schema.Any
    readonly success: Schema.Schema.Any
    readonly failure: Schema.Schema.All
    readonly failureMode: FailureMode
  },
  Requirements = never
> extends Tool.Variance<Requirements> {
  readonly id: string
  readonly name: Name
  readonly description?: string | undefined
  readonly failureMode: FailureMode
  readonly parametersSchema: Config["parameters"]
  readonly successSchema: Config["success"]
  readonly failureSchema: Config["failure"]
  readonly annotations: Context.Context<never>

  addDependency<Identifier, Service>(
    tag: Context.Tag<Identifier, Service>
  ): Tool<Name, Config, Identifier | Requirements>

  setParameters<
    ParametersSchema extends Schema.Struct<any> | Schema.Struct.Fields
  >(
    schema: ParametersSchema
  ): Tool<
    Name,
    {
      readonly parameters: ParametersSchema extends Schema.Struct<infer _> ? ParametersSchema
        : ParametersSchema extends Schema.Struct.Fields ? Schema.Struct<ParametersSchema>
        : never
      readonly success: Config["success"]
      readonly failure: Config["failure"]
      readonly failureMode: Config["failureMode"]
    },
    Requirements
  >

  setSuccess<SuccessSchema extends Schema.Schema.Any>(
    schema: SuccessSchema
  ): Tool<
    Name,
    {
      readonly parameters: Config["parameters"]
      readonly success: SuccessSchema
      readonly failure: Config["failure"]
      readonly failureMode: Config["failureMode"]
    },
    Requirements
  >

  setFailure<FailureSchema extends Schema.Schema.Any>(
    schema: FailureSchema
  ): Tool<
    Name,
    {
      readonly parameters: Config["parameters"]
      readonly success: Config["success"]
      readonly failure: FailureSchema
      readonly failureMode: Config["failureMode"]
    },
    Requirements
  >

  annotate<I, S>(
    tag: Context.Tag<I, S> | Context.Reference<any, S>,
    value: S
  ): Tool<Name, Config, Requirements>
}

export namespace Tool {
  export interface Variance<Requirements> {
    readonly _R?: (_: Requirements) => void
  }
}

export type Any = Tool<string, {
  readonly parameters: AnyStructSchema
  readonly success: Schema.Schema.Any
  readonly failure: Schema.Schema.All
  readonly failureMode: FailureMode
}>

export type Name<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Name : never

export type Parameters<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  Schema.Schema.Type<_Config["parameters"]> :
  never

export type ParametersEncoded<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  Schema.Schema.Encoded<_Config["parameters"]> :
  never

export type ParametersSchema<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  _Config["parameters"] :
  never

export type Success<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  Schema.Schema.Type<_Config["success"]> :
  never

export type SuccessEncoded<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  Schema.Schema.Encoded<_Config["success"]> :
  never

export type Failure<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  Schema.Schema.Type<_Config["failure"]> :
  never

export type FailureEncoded<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  Schema.Schema.Encoded<_Config["failure"]> :
  never

export type FailureModeOf<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  _Config["failureMode"] :
  never

export type Handler<T> = (params: Parameters<T>) => Effect.Effect<Success<T>, Failure<T>, Requirements<T>>

export type Requirements<T> = T extends Tool<infer _Name, infer _Config, infer Requirements> ? Requirements : never

export type HandlerResult<T> = {
  readonly result: Success<T> | Failure<T>
  readonly encodedResult: SuccessEncoded<T> | FailureEncoded<T>
  readonly isFailure: boolean
}

export type RequiresHandler<T> = T extends Tool<
  infer _Name,
  infer _Config,
  infer _Requirements
> ? true : never

export type HandlerFor<T> = T extends Tool<infer _Name, infer _Config, infer Requirements> ?
  (params: Parameters<T>) => Effect.Effect<Success<T>, Failure<T>, Requirements> :
  never

export type HandlersFor<Tools extends Record<string, Any>> = {
  readonly [Name in keyof Tools as RequiresHandler<Tools[Name]> extends true ? Name : never]: (
    params: Parameters<Tools[Name]>
  ) => Effect.Effect<
    Success<Tools[Name]>,
    Failure<Tools[Name]>,
    Requirements<Tools[Name]>
  >
}

const Proto = {
  addDependency(this: Any) {
    return this
  },
  annotate(this: Any, tag: Context.Tag<any, any> | Context.Reference<any, any>, value: any) {
    return makeTool({
      ...this,
      annotations: Context.add(this.annotations, tag as any, value)
    })
  },
  setParameters(this: Any, schema: Schema.Struct<any> | Schema.Struct.Fields) {
    const parametersSchema: AnyStructSchema = Schema.isSchema(schema)
      ? (schema as AnyStructSchema)
      : Schema.Struct(schema as Schema.Struct.Fields)
    return makeTool({
      ...this,
      parametersSchema
    })
  },
  setSuccess(this: Any, schema: Schema.Schema.Any) {
    return makeTool({
      ...this,
      successSchema: schema
    })
  },
  setFailure(this: Any, schema: Schema.Schema.Any) {
    return makeTool({
      ...this,
      failureSchema: schema
    })
  }
}

const makeTool = <Name extends string>(options: {
  readonly name: Name
  readonly description?: string | undefined
  readonly parametersSchema: AnyStructSchema
  readonly successSchema: Schema.Schema.Any
  readonly failureSchema: Schema.Schema.All
  readonly failureMode: FailureMode
  readonly annotations: Context.Context<never>
}) => {
  const self = Object.assign(Object.create(Proto), options)
  self.id = `@effect/claude-agent-sdk/Tool/${options.name}`
  return self
}

const constEmptyStruct = Schema.Struct({})

/**
 * Create a tool with optional parameter, success, and failure schemas.
 */
export const make = <
  const Name extends string,
  Parameters extends Schema.Struct.Fields = {},
  Success extends Schema.Schema.Any = typeof Schema.Void,
  Failure extends Schema.Schema.All = typeof Schema.Never,
  Mode extends FailureMode | undefined = undefined
>(
  name: Name,
  options?: {
    readonly description?: string | undefined
    readonly parameters?: Parameters | undefined
    readonly success?: Success | undefined
    readonly failure?: Failure | undefined
    readonly failureMode?: Mode
  }
): Tool<
  Name,
  {
    readonly parameters: Schema.Struct<Parameters>
    readonly success: Success
    readonly failure: Failure
    readonly failureMode: Mode extends undefined ? "error" : Mode
  }
> => {
  const successSchema = options?.success ?? Schema.Void
  const failureSchema = options?.failure ?? Schema.Never
  return makeTool({
    name,
    description: options?.description,
    parametersSchema: options?.parameters ? Schema.Struct(options.parameters) : constEmptyStruct,
    successSchema,
    failureSchema,
    failureMode: options?.failureMode ?? "error",
    annotations: Context.empty()
  }) as any
}

/**
 * Create a tool using an existing parameter schema.
 */
export const fromSchema = <
  const Name extends string,
  Parameters extends AnyStructSchema,
  Success extends Schema.Schema.Any = typeof Schema.Void,
  Failure extends Schema.Schema.All = typeof Schema.Never,
  Mode extends FailureMode | undefined = undefined
>(
  name: Name,
  options: {
    readonly description?: string | undefined
    readonly parameters: Parameters
    readonly success?: Success | undefined
    readonly failure?: Failure | undefined
    readonly failureMode?: Mode
  }
): Tool<
  Name,
  {
    readonly parameters: Parameters
    readonly success: Success
    readonly failure: Failure
    readonly failureMode: Mode extends undefined ? "error" : Mode
  }
> =>
  makeTool({
    name,
    description: options.description,
    parametersSchema: options.parameters,
    successSchema: options.success ?? Schema.Void,
    failureSchema: options.failure ?? Schema.Never,
    failureMode: options.failureMode ?? "error",
    annotations: Context.empty()
  }) as any

/**
 * Render tool parameters as JSON Schema (useful for MCP registration).
 */
export const getJsonSchema = <
  Name extends string,
  Config extends {
    readonly parameters: AnyStructSchema
    readonly success: Schema.Schema.Any
    readonly failure: Schema.Schema.All
    readonly failureMode: FailureMode
  }
>(
  tool: Tool<Name, Config>
): JsonSchema.JsonSchema7 => getJsonSchemaFromSchemaAst(tool.parametersSchema.ast)

export const getJsonSchemaFromSchemaAst = (
  ast: AST.AST
): JsonSchema.JsonSchema7 => {
  if (
    AST.isTypeLiteral(ast) &&
    ast.propertySignatures.length === 0 &&
    ast.indexSignatures.length === 0
  ) {
    return {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false
    }
  }
  const $defs = {}
  const schema = JsonSchema.fromAST(ast, {
    definitions: $defs,
    topLevelReferenceStrategy: "skip"
  })
  if (Object.keys($defs).length === 0) return schema
  ;(schema as any).$defs = $defs
  return schema
}

/**
 * Optional title metadata for tools.
 */
export class Title extends Context.Tag("@effect/claude-agent-sdk/Tool/Title")<
  Title,
  string
>() {}

/**
 * Indicates the tool is readonly (no side-effects).
 */
export class Readonly extends Context.Reference<Readonly>()(
  "@effect/claude-agent-sdk/Tool/Readonly",
  {
    defaultValue: constFalse
  }
) {}

/**
 * Indicates the tool is destructive (side-effects likely).
 */
export class Destructive extends Context.Reference<Destructive>()(
  "@effect/claude-agent-sdk/Tool/Destructive",
  {
    defaultValue: constTrue
  }
) {}

/**
 * Indicates the tool is idempotent for repeated calls.
 */
export class Idempotent extends Context.Reference<Idempotent>()(
  "@effect/claude-agent-sdk/Tool/Idempotent",
  {
    defaultValue: constFalse
  }
) {}

/**
 * Indicates the tool can read or write beyond the repo (open-world).
 */
export class OpenWorld extends Context.Reference<OpenWorld>()(
  "@effect/claude-agent-sdk/Tool/OpenWorld",
  {
    defaultValue: constTrue
  }
) {}
