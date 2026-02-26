import * as ServiceMap from "effect/ServiceMap"
import * as JsonSchema from "effect/JsonSchema"
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

export type AnyStructSchema = Schema.Top

/**
 * Declarative tool definition used for SDK tool registration.
 */
export interface Tool<
  Name extends string,
  Config extends {
    readonly parameters: Schema.Top
    readonly success: Schema.Top
    readonly failure: Schema.Top
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
  readonly annotations: ServiceMap.ServiceMap<never>

  addDependency<Identifier, Service>(
    tag: ServiceMap.Service<Identifier, Service>
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

  setSuccess<SuccessSchema extends Schema.Top>(
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

  setFailure<FailureSchema extends Schema.Top>(
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
    tag: ServiceMap.Service<I, S> | ServiceMap.Reference<S>,
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
  readonly success: Schema.Top
  readonly failure: Schema.Top
  readonly failureMode: FailureMode
}>

export type Name<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Name : never

export type Parameters<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  Schema.Schema.Type<_Config["parameters"]> :
  never

export type ParametersEncoded<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  Schema.Codec.Encoded<_Config["parameters"]> :
  never

export type ParametersSchema<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  _Config["parameters"] :
  never

export type Success<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  Schema.Schema.Type<_Config["success"]> :
  never

export type SuccessSchema<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  _Config["success"] :
  never

export type SuccessEncoded<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  Schema.Codec.Encoded<_Config["success"]> :
  never

export type Failure<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  Schema.Schema.Type<_Config["failure"]> :
  never

export type FailureSchema<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  _Config["failure"] :
  never

export type FailureEncoded<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ?
  Schema.Codec.Encoded<_Config["failure"]> :
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

export type ToolWithHandler<
  Name extends string,
  Config extends {
    readonly parameters: AnyStructSchema
    readonly success: Schema.Top
    readonly failure: Schema.Top
    readonly failureMode: FailureMode
  },
  Requirements = never
> = Tool<Name, Config, Requirements> & {
  readonly handler: HandlerFor<Tool<Name, Config, Requirements>>
}

export type DefinitionFields<
  Parameters extends Schema.Struct.Fields = {},
  Success extends Schema.Top = typeof Schema.Void,
  Failure extends Schema.Top = typeof Schema.Never,
  Mode extends FailureMode | undefined = undefined,
  R = never
> = {
  readonly description?: string | undefined
  readonly parameters?: Parameters | undefined
  readonly success?: Success | undefined
  readonly failure?: Failure | undefined
  readonly failureMode?: Mode
  readonly handler: (
    params: Schema.Schema.Type<Schema.Struct<Parameters>>
  ) => Effect.Effect<Schema.Schema.Type<Success>, Schema.Schema.Type<Failure>, R>
}

export type DefinitionSchema<
  Parameters extends AnyStructSchema,
  Success extends Schema.Top = typeof Schema.Void,
  Failure extends Schema.Top = typeof Schema.Never,
  Mode extends FailureMode | undefined = undefined,
  R = never
> = {
  readonly description?: string | undefined
  readonly parameters: Parameters
  readonly success?: Success | undefined
  readonly failure?: Failure | undefined
  readonly failureMode?: Mode
  readonly handler: (
    params: Schema.Schema.Type<Parameters>
  ) => Effect.Effect<Schema.Schema.Type<Success>, Schema.Schema.Type<Failure>, R>
}

export type Definition = {
  readonly description?: string | undefined
  readonly parameters?: Schema.Struct.Fields | AnyStructSchema | undefined
  readonly success?: Schema.Top | undefined
  readonly failure?: Schema.Top | undefined
  readonly failureMode?: FailureMode | undefined
  readonly handler: (params: any) => Effect.Effect<any, any, any>
}

type DefinitionParametersSchema<D> = D extends { parameters: infer P }
  ? P extends Schema.Top
    ? P
    : P extends Schema.Struct.Fields
      ? Schema.Struct<P>
      : typeof constEmptyStruct
  : typeof constEmptyStruct

type DefinitionSuccessSchema<D> = D extends { success: infer S }
  ? S extends Schema.Top
    ? S
    : typeof Schema.Void
  : typeof Schema.Void

type DefinitionFailureSchema<D> = D extends { failure: infer F }
  ? F extends Schema.Top
    ? F
    : typeof Schema.Never
  : typeof Schema.Never

type DefinitionFailureMode<D> = D extends { failureMode: infer M }
  ? M extends FailureMode ? M : "error"
  : "error"

type DefinitionRequirements<D> = D extends {
  handler: (...args: any[]) => Effect.Effect<any, any, infer R>
} ? R : never

export type ToolFromDefinition<
  Name extends string,
  Def
> = ToolWithHandler<
  Name,
  {
    readonly parameters: DefinitionParametersSchema<Def>
    readonly success: DefinitionSuccessSchema<Def>
    readonly failure: DefinitionFailureSchema<Def>
    readonly failureMode: DefinitionFailureMode<Def>
  },
  DefinitionRequirements<Def>
>

const Proto = {
  addDependency(this: Any) {
    return this
  },
  annotate(this: Any, tag: ServiceMap.Service<any, any> | ServiceMap.Reference<any>, value: any) {
    return makeTool({
      ...this,
      annotations: ServiceMap.add(this.annotations, tag as any, value)
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
  setSuccess(this: Any, schema: Schema.Top) {
    return makeTool({
      ...this,
      successSchema: schema
    })
  },
  setFailure(this: Any, schema: Schema.Top) {
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
  readonly successSchema: Schema.Top
  readonly failureSchema: Schema.Top
  readonly failureMode: FailureMode
  readonly annotations: ServiceMap.ServiceMap<never>
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
  Success extends Schema.Top = typeof Schema.Void,
  Failure extends Schema.Top = typeof Schema.Never,
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
    annotations: ServiceMap.empty()
  }) as any
}

/**
 * Create a tool using an existing parameter schema.
 */
export const fromSchema = <
  const Name extends string,
  Parameters extends AnyStructSchema,
  Success extends Schema.Top = typeof Schema.Void,
  Failure extends Schema.Top = typeof Schema.Never,
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
    annotations: ServiceMap.empty()
  }) as any

const attachHandler = <T extends Any>(
  tool: T,
  handler: HandlerFor<T>
) => Object.assign(tool, { handler }) as unknown as ToolWithHandler<
  Name<T>,
  {
    readonly parameters: ParametersSchema<T>
    readonly success: SuccessSchema<T>
    readonly failure: FailureSchema<T>
    readonly failureMode: FailureModeOf<T>
  },
  Requirements<T>
>

/**
 * Define a tool alongside its handler in a single expression.
 */
export const define: {
  <
    const Name extends string,
    Parameters extends Schema.Struct.Fields = {},
    Success extends Schema.Top = typeof Schema.Void,
    Failure extends Schema.Top = typeof Schema.Never,
    Mode extends FailureMode | undefined = undefined,
    R = never
  >(
    name: Name,
    options: DefinitionFields<Parameters, Success, Failure, Mode, R>
  ): ToolWithHandler<
    Name,
    {
      readonly parameters: Schema.Struct<Parameters>
      readonly success: Success
      readonly failure: Failure
      readonly failureMode: Mode extends undefined ? "error" : Mode
    },
    R
  >
  <
    const Name extends string,
    Parameters extends AnyStructSchema,
    Success extends Schema.Top = typeof Schema.Void,
    Failure extends Schema.Top = typeof Schema.Never,
    Mode extends FailureMode | undefined = undefined,
    R = never
  >(
    name: Name,
    options: DefinitionSchema<Parameters, Success, Failure, Mode, R>
  ): ToolWithHandler<
    Name,
    {
      readonly parameters: Parameters
      readonly success: Success
      readonly failure: Failure
      readonly failureMode: Mode extends undefined ? "error" : Mode
    },
    R
  >
} = (name: string, options: Definition) => {
  const parameters = "parameters" in options ? options.parameters : undefined
  const tool = parameters && Schema.isSchema(parameters)
    ? fromSchema(name, {
        description: options.description,
        parameters: parameters as AnyStructSchema,
        success: options.success,
        failure: options.failure,
        failureMode: options.failureMode as FailureMode | undefined
      })
    : make(name, {
        description: options.description,
        parameters: parameters as Schema.Struct.Fields | undefined,
        success: options.success,
        failure: options.failure,
        failureMode: options.failureMode as FailureMode | undefined
      })
  return attachHandler(tool as Any, (options as Definition).handler as any) as any
}

/**
 * Define a tool by passing the handler as the last argument.
 */
export const fn = <
  const Name extends string,
  Parameters extends Schema.Struct.Fields = {},
  Success extends Schema.Top = typeof Schema.Void,
  Failure extends Schema.Top = typeof Schema.Never,
  Mode extends FailureMode | undefined = undefined,
  R = never
>(
  name: Name,
  options: Omit<DefinitionFields<Parameters, Success, Failure, Mode, R>, "handler">,
  handler: DefinitionFields<Parameters, Success, Failure, Mode, R>["handler"]
): ToolWithHandler<
  Name,
  {
    readonly parameters: Schema.Struct<Parameters>
    readonly success: Success
    readonly failure: Failure
    readonly failureMode: Mode extends undefined ? "error" : Mode
  },
  R
> => define(name, { ...options, handler })

/**
 * Render tool parameters as JSON Schema (useful for MCP registration).
 */
export const getJsonSchema = <
  Name extends string,
  Config extends {
    readonly parameters: AnyStructSchema
    readonly success: Schema.Top
    readonly failure: Schema.Top
    readonly failureMode: FailureMode
  }
>(
  tool: Tool<Name, Config>
): JsonSchema.JsonSchema => getJsonSchemaFromSchema(tool.parametersSchema)

const getJsonSchemaFromSchema = (schema: Schema.Top): JsonSchema.JsonSchema => {
  const document = Schema.toJsonSchemaDocument(schema)
  if (Object.keys(document.definitions).length === 0) {
    return document.schema
  }
  return {
    ...document.schema,
    $defs: document.definitions
  }
}

export const getJsonSchemaFromSchemaAst = (
  ast: AST.AST
): JsonSchema.JsonSchema => getJsonSchemaFromSchema(Schema.make(ast))

/**
 * Optional title metadata for tools.
 */
export const Title = ServiceMap.Service<string>("@effect/claude-agent-sdk/Tool/Title")

/**
 * Indicates the tool is readonly (no side-effects).
 */
export const Readonly = ServiceMap.Reference<boolean>("@effect/claude-agent-sdk/Tool/Readonly", {
  defaultValue: constFalse
})

/**
 * Indicates the tool is destructive (side-effects likely).
 */
export const Destructive = ServiceMap.Reference<boolean>(
  "@effect/claude-agent-sdk/Tool/Destructive",
  {
    defaultValue: constTrue
  }
)

/**
 * Indicates the tool is idempotent for repeated calls.
 */
export const Idempotent = ServiceMap.Reference<boolean>("@effect/claude-agent-sdk/Tool/Idempotent", {
  defaultValue: constFalse
})

/**
 * Indicates the tool can read or write beyond the repo (open-world).
 */
export const OpenWorld = ServiceMap.Reference<boolean>("@effect/claude-agent-sdk/Tool/OpenWorld", {
  defaultValue: constTrue
})
