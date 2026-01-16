import * as Context from "effect/Context"
import type * as Effect from "effect/Effect"
import { constFalse, constTrue, identity } from "effect/Function"
import * as JsonSchema from "effect/JSONSchema"
import * as Option from "effect/Option"
import type { Pipeable } from "effect/Pipeable"
import { pipeArguments } from "effect/Pipeable"
import * as Predicate from "effect/Predicate"
import * as Schema from "effect/Schema"
import * as AST from "effect/SchemaAST"
import type { Covariant } from "effect/Types"
import type * as ContractError from "./ContractError"
import type { UnsafeTypes } from "@beep/types";
export const TypeId = "~@beep/contract/Contract"

export type TypeId = typeof TypeId


export const ProviderDefinedTypeId = "~@beep/contract/Contract/ProviderDefined"


export type ProviderDefinedTypeId = typeof ProviderDefinedTypeId

export interface Contract<
  Name extends string,
  Config extends {
    readonly parameters: AnyStructSchema
    readonly success: Schema.Schema.Any
    readonly failure: Schema.Schema.All
    readonly failureMode: FailureMode
  },
  Requirements = never
> extends Contract.Variance<Requirements> {
  /**
   * The tool identifier which is used to uniquely identify the tool.
   */
  readonly id: string

  /**
   * The name of the tool.
   */
  readonly name: Name

  /**
   * The optional description of the tool.
   */
  readonly description?: string | undefined


  readonly failureMode: FailureMode


  readonly parametersSchema: Config["parameters"]


  readonly successSchema: Config["success"]


  readonly failureSchema: Config["failure"]


  readonly annotations: Context.Context<never>


  addDependency<Identifier, Service>(
    tag: Context.Tag<Identifier, Service>
  ): Contract<Name, Config, Identifier | Requirements>


  setParameters<
    ParametersSchema extends Schema.Struct<any> | Schema.Struct.Fields
  >(
    schema: ParametersSchema
  ): Contract<
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
  ): Contract<
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
  ): Contract<
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
    tag: Context.Tag<I, S>,
    value: S
  ): Contract<Name, Config, Requirements>

  /**
   * Add many annotations to the tool.
   */
  annotateContext<I>(
    context: Context.Context<I>
  ): Contract<Name, Config, Requirements>
}

export interface ProviderDefined<
  Name extends string,
  Config extends {
    readonly args: AnyStructSchema
    readonly parameters: AnyStructSchema
    readonly success: Schema.Schema.Any
    readonly failure: Schema.Schema.All
    readonly failureMode: FailureMode
  } = {
    readonly args: Schema.Struct<{}>
    readonly parameters: Schema.Struct<{}>
    readonly success: typeof Schema.Void
    readonly failure: typeof Schema.Never
    readonly failureMode: "error"
  },
  RequiresHandler extends boolean = false
> extends
  Contract<
    Name,
    {
      readonly parameters: Config["parameters"]
      readonly success: Config["success"]
      readonly failure: Config["failure"]
      readonly failureMode: Config["failureMode"]
    }
  >,
  Contract.ProviderDefinedProto
{

  readonly args: Config["args"]["Encoded"]


  readonly argsSchema: Config["args"]


  readonly providerName: string


  readonly requiresHandler: RequiresHandler
}

export type FailureMode = "error" | "return"

export declare namespace Contract {


  export interface Variance<out Requirements> extends Pipeable {
    readonly [TypeId]: VarianceStruct<Requirements>
  }

  export interface VarianceStruct<out Requirements> {
    readonly _Requirements: Covariant<Requirements>
  }

  export interface ProviderDefinedProto {
    readonly [ProviderDefinedTypeId]: ProviderDefinedTypeId
  }
}

export const isUserDefined = (u: unknown): u is Contract<string, any, any> =>
  Predicate.hasProperty(u, TypeId) && !isProviderDefined(u)

export const isProviderDefined = (
  u: unknown
): u is ProviderDefined<string, any> => Predicate.hasProperty(u, ProviderDefinedTypeId)

export interface Any extends Pipeable {
  readonly [TypeId]: {
    readonly _Requirements: Covariant<any>
  }
  readonly id: string
  readonly name: string
  readonly description?: string | undefined
  readonly parametersSchema: AnyStructSchema
  readonly successSchema: Schema.Schema.Any
  readonly failureSchema: Schema.Schema.All
  readonly failureMode: FailureMode
  readonly annotations: Context.Context<never>
}

export interface AnyProviderDefined extends Any {
  readonly args: UnsafeTypes.UnsafeAny
  readonly argsSchema: AnyStructSchema
  readonly requiresHandler: boolean
  readonly providerName: string
  readonly decodeResult: (
    result: unknown
  ) => Effect.Effect<UnsafeTypes.UnsafeAny, ContractError.ContractError>
}


export interface AnyStructSchema extends Pipeable {
  readonly [Schema.TypeId]: UnsafeTypes.UnsafeAny
  readonly make: UnsafeTypes.UnsafeAny
  readonly Type: UnsafeTypes.UnsafeAny
  readonly Encoded: UnsafeTypes.UnsafeAny
  readonly Context: UnsafeTypes.UnsafeAny
  readonly ast: AST.AST
  readonly fields: Schema.Struct.Fields
  readonly annotations: UnsafeTypes.UnsafeAny
}


export interface AnyTaggedRequestSchema extends AnyStructSchema {
  readonly _tag: string
  readonly success: Schema.Schema.Any
  readonly failure: Schema.Schema.All
}

export interface FromTaggedRequest<S extends AnyTaggedRequestSchema> extends
  Contract<
    S["_tag"],
    {
      readonly parameters: S
      readonly success: S["success"]
      readonly failure: S["failure"]
      readonly failureMode: "error"
    }
  >
{}


export type Name<T> = T extends Contract<
  infer _Name,
  infer _Config,
  infer _Requirements
> ? _Name
  : never


export type Parameters<T> = T extends Contract<
  infer _Name,
  infer _Config,
  infer _Requirements
> ? Schema.Struct.Type<_Config["parameters"]["fields"]>
  : never


export type ParametersEncoded<T> = T extends Contract<
  infer _Name,
  infer _Config,
  infer _Requirements
> ? Schema.Schema.Encoded<_Config["parameters"]>
  : never


export type ParametersSchema<T> = T extends Contract<
  infer _Name,
  infer _Config,
  infer _Requirements
> ? _Config["parameters"]
  : never


export type Success<T> = T extends Contract<
  infer _Name,
  infer _Config,
  infer _Requirements
> ? Schema.Schema.Type<_Config["success"]>
  : never


export type SuccessEncoded<T> = T extends Contract<
  infer _Name,
  infer _Config,
  infer _Requirements
> ? Schema.Schema.Encoded<_Config["success"]>
  : never


export type SuccessSchema<T> = T extends Contract<
  infer _Name,
  infer _Config,
  infer _Requirements
> ? _Config["success"]
  : never


export type Failure<T> = T extends Contract<
  infer _Name,
  infer _Config,
  infer _Requirements
> ? Schema.Schema.Type<_Config["failure"]>
  : never


export type FailureEncoded<T> = T extends Contract<
  infer _Name,
  infer _Config,
  infer _Requirements
> ? Schema.Schema.Encoded<_Config["failure"]>
  : never


export type Result<T> = T extends Contract<
  infer _Name,
  infer _Config,
  infer _Requirements
> ? Success<T> | Failure<T>
  : never


export type ResultEncoded<T> = T extends Contract<
  infer _Name,
  infer _Config,
  infer _Requirements
> ? SuccessEncoded<T> | FailureEncoded<T>
  : never


export type Requirements<T> = T extends Contract<
  infer _Name,
  infer _Config,
  infer _Requirements
> ?
    | _Config["parameters"]["Context"]
    | _Config["success"]["Context"]
    | _Config["failure"]["Context"]
    | _Requirements
  : never


export interface Handler<Name extends string> {
  readonly _: unique symbol
  readonly name: Name
  readonly context: Context.Context<never>
  readonly handler: (params: UnsafeTypes.UnsafeAny) => Effect.Effect<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>
}


export interface HandlerResult<Contract extends Any> {

  readonly isFailure: boolean

  readonly result: Result<Contract>

  readonly encodedResult: unknown
}


export type HandlerError<T> = T extends Contract<
  infer _Name,
  infer _Config,
  infer _Requirements
> ? _Config["failureMode"] extends "error" ? _Config["failure"]["Type"]
  : never
  : never


export type HandlersFor<Contracts extends Record<string, Any>> = {
  [Name in keyof Contracts]: RequiresHandler<Contracts[Name]> extends true ? Handler<Contracts[Name]["name"]>
    : never
}[keyof Contracts]


export type RequiresHandler<Contract extends Any> = Contract extends ProviderDefined<
  infer _Name,
  infer _Config,
  infer _RequiresHandler
> ? _RequiresHandler
  : true

// =============================================================================
// Constructors
// =============================================================================

const Proto = {
  [TypeId]: { _Requirements: identity },
  pipe() {
    return pipeArguments(this, arguments)
  },
  addDependency(this: Any) {
    return userDefinedProto({ ...this })
  },
  setParameters(
    this: Any,
    parametersSchema: Schema.Struct<UnsafeTypes.UnsafeAny> | Schema.Struct.Fields
  ) {
    return userDefinedProto({
      ...this,
      parametersSchema: Schema.isSchema(parametersSchema)
        ? (parametersSchema as UnsafeTypes.UnsafeAny)
        : Schema.Struct(parametersSchema as UnsafeTypes.UnsafeAny)
    })
  },
  setSuccess(this: Any, successSchema: Schema.Schema.Any) {
    return userDefinedProto({
      ...this,
      successSchema
    })
  },
  setFailure(this: Any, failureSchema: Schema.Schema.All) {
    return userDefinedProto({
      ...this,
      failureSchema
    })
  },
  annotate<I, S>(this: Any, tag: Context.Tag<I, S>, value: S) {
    return userDefinedProto({
      ...this,
      annotations: Context.add(this.annotations, tag, value)
    })
  },
  annotateContext<I>(this: Any, context: Context.Context<I>) {
    return userDefinedProto({
      ...this,
      annotations: Context.merge(this.annotations, context)
    })
  }
}

const ProviderDefinedProto = {
  ...Proto,
  [ProviderDefinedTypeId]: ProviderDefinedTypeId
}

const userDefinedProto = <
  const Name extends string,
  Parameters extends AnyStructSchema,
  Success extends Schema.Schema.Any,
  Failure extends Schema.Schema.All,
  Mode extends FailureMode
>(options: {
  readonly name: Name
  readonly description?: string | undefined
  readonly parametersSchema: Parameters
  readonly successSchema: Success
  readonly failureSchema: Failure
  readonly annotations: Context.Context<never>
  readonly failureMode: Mode
}): Contract<
  Name,
  {
    readonly parameters: Parameters
    readonly success: Success
    readonly failure: Failure
    readonly failureMode: Mode
  }
> => {
  const self = Object.assign(Object.create(Proto), options)
  self.id = `@effect/contract/Contract/${options.name}`
  return self
}

const providerDefinedProto = <
  const Name extends string,
  Args extends AnyStructSchema,
  Parameters extends AnyStructSchema,
  Success extends Schema.Schema.Any,
  Failure extends Schema.Schema.All,
  RequiresHandler extends boolean,
  Mode extends FailureMode
>(options: {
  readonly id: string
  readonly name: Name
  readonly providerName: string
  readonly args: Args["Encoded"]
  readonly argsSchema: Args
  readonly requiresHandler: RequiresHandler
  readonly parametersSchema: Parameters
  readonly successSchema: Success
  readonly failureSchema: Failure
  readonly failureMode: FailureMode
}): ProviderDefined<
  Name,
  {
    readonly args: Args
    readonly parameters: Parameters
    readonly success: Success
    readonly failure: Failure
    readonly failureMode: Mode
  },
  RequiresHandler
> => Object.assign(Object.create(ProviderDefinedProto), options)

const constEmptyStruct = Schema.Struct({})


export const make = <
  const Name extends string,
  Parameters extends Schema.Struct.Fields = {},
  Success extends Schema.Schema.Any = typeof Schema.Void,
  Failure extends Schema.Schema.All = typeof Schema.Never,
  Mode extends FailureMode | undefined = undefined,
  Dependencies extends Array<Context.Tag<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>> = []
>(

  name: Name,
  options?: {

    readonly description?: string | undefined

    readonly parameters?: Parameters | undefined

    readonly success?: Success | undefined

    readonly failure?: Failure | undefined

    readonly failureMode?: Mode

    readonly dependencies?: Dependencies | undefined
  }
): Contract<
  Name,
  {
    readonly parameters: Schema.Struct<Parameters>
    readonly success: Success
    readonly failure: Failure
    readonly failureMode: Mode extends undefined ? "error" : Mode
  },
  Context.Tag.Identifier<Dependencies[number]>
> => {
  const successSchema = options?.success ?? Schema.Void
  const failureSchema = options?.failure ?? Schema.Never
  return userDefinedProto({
    name,
    description: options?.description,
    parametersSchema: options?.parameters
      ? Schema.Struct(options?.parameters as UnsafeTypes.UnsafeAny)
      : constEmptyStruct,
    successSchema,
    failureSchema,
    failureMode: options?.failureMode ?? "error",
    annotations: Context.empty()
  }) as UnsafeTypes.UnsafeAny
}

export const providerDefined = <
  const Name extends string,
  Args extends Schema.Struct.Fields = {},
  Parameters extends Schema.Struct.Fields = {},
  Success extends Schema.Schema.Any = typeof Schema.Void,
  Failure extends Schema.Schema.All = typeof Schema.Never,
  RequiresHandler extends boolean = false
>(options: {

  readonly id: `${string}.${string}`

  readonly toolkitName: Name

  readonly providerName: string

  readonly args: Args

  readonly requiresHandler?: RequiresHandler | undefined

  readonly parameters?: Parameters | undefined
  readonly success?: Success | undefined
  readonly failure?: Failure | undefined
}) =>
<Mode extends FailureMode | undefined = undefined>(
  args: RequiresHandler extends true ? Schema.Simplify<
      Schema.Struct.Encoded<Args> & {

        readonly failureMode?: Mode
      }
    >
    : Schema.Simplify<Schema.Struct.Encoded<Args>>
): ProviderDefined<
  Name,
  {
    readonly args: Schema.Struct<Args>
    readonly parameters: Schema.Struct<Parameters>
    readonly success: Success
    readonly failure: Failure
    readonly failureMode: Mode extends undefined ? "error" : Mode
  },
  RequiresHandler
> => {
  const failureMode = "failureMode" in args ? args.failureMode : undefined
  const successSchema = options?.success ?? Schema.Void
  const failureSchema = options?.failure ?? Schema.Never
  return providerDefinedProto({
    id: options.id,
    name: options.toolkitName,
    providerName: options.providerName,
    args,
    argsSchema: Schema.Struct(options.args as UnsafeTypes.UnsafeAny),
    requiresHandler: options.requiresHandler ?? false,
    parametersSchema: options?.parameters
      ? Schema.Struct(options?.parameters as UnsafeTypes.UnsafeAny)
      : constEmptyStruct,
    successSchema,
    failureSchema,
    failureMode: failureMode ?? "error"
  }) as UnsafeTypes.UnsafeAny
}


export const fromTaggedRequest = <S extends AnyTaggedRequestSchema>(
  schema: S
): FromTaggedRequest<S> =>
  userDefinedProto({
    name: schema._tag,
    description: Option.getOrUndefined(
      AST.getDescriptionAnnotation((schema.ast as UnsafeTypes.UnsafeAny).to)
    ),
    parametersSchema: schema,
    successSchema: schema.success,
    failureSchema: schema.failure,
    failureMode: "error",
    annotations: Context.empty()
  }) as UnsafeTypes.UnsafeAny

export const getDescription = <
  Name extends string,
  Config extends {
    readonly parameters: AnyStructSchema
    readonly success: Schema.Schema.Any
    readonly failure: Schema.Schema.All
    readonly failureMode: FailureMode
  }
>(
  /**
   * The tool to get the description from.
   */
  tool: Contract<Name, Config>
): string | undefined => {
  if (Predicate.isNotUndefined(tool.description)) {
    return tool.description
  }
  return getDescriptionFromSchemaAst(tool.parametersSchema.ast)
}

/**
 * @since 1.0.0
 * @category Utilities
 */
export const getDescriptionFromSchemaAst = (
  ast: AST.AST
): string | undefined => {
  const annotations = ast._tag === "Transformation"
    ? {
      ...ast.to.annotations,
      ...ast.annotations
    }
    : ast.annotations
  return AST.DescriptionAnnotationId in annotations
    ? (annotations[AST.DescriptionAnnotationId] as string)
    : undefined
}

export const getJsonSchema = <
  Name extends string,
  Config extends {
    readonly parameters: AnyStructSchema
    readonly success: Schema.Schema.Any
    readonly failure: Schema.Schema.All
    readonly failureMode: FailureMode
  }
>(
  tool: Contract<Name, Config>
): JsonSchema.JsonSchema7 => getJsonSchemaFromSchemaAst(tool.parametersSchema.ast)

/**
 * @since 1.0.0
 * @category Utilities
 */
export const getJsonSchemaFromSchemaAst = (
  ast: AST.AST
): JsonSchema.JsonSchema7 => {
  const props = AST.getPropertySignatures(ast)
  if (props.length === 0) {
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
  ;(schema as UnsafeTypes.UnsafeAny).$defs = $defs
  return schema
}

export class Title extends Context.Tag("@effect/contract/Contract/Title")<
  Title,
  string
>() {}

export class Readonly extends Context.Reference<Readonly>()(
  "@effect/contract/Contract/Readonly",
  {
    defaultValue: constFalse
  }
) {}

export class Destructive extends Context.Reference<Destructive>()(
  "@effect/contract/Contract/Destructive",
  {
    defaultValue: constTrue
  }
) {}

export class Idempotent extends Context.Reference<Idempotent>()(
  "@effect/contract/Contract/Idempotent",
  {
    defaultValue: constFalse
  }
) {}

export class OpenWorld extends Context.Reference<OpenWorld>()(
  "@effect/contract/Contract/OpenWorld",
  {
    defaultValue: constTrue
  }
) {}

const suspectProtoRx = /"__proto__"\s*:/
const suspectConstructorRx = /"constructor"\s*:/

function _parse(text: string) {
  // Parse normally
  const obj = JSON.parse(text)

  // Ignore null and non-objects
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  if (
    suspectProtoRx?.test(text) === false &&
    suspectConstructorRx?.test(text) === false
  ) {
    return obj
  }

  // Scan result for proto keys
  return filter(obj)
}

function filter(obj: UnsafeTypes.UnsafeAny) {
  let next = [obj]

  while (next.length) {
    const nodes = next
    next = []

    for (const node of nodes) {
      if (Object.prototype.hasOwnProperty.call(node, "__proto__")) {
        throw new SyntaxError("Object contains forbidden prototype property")
      }

      if (
        Object.prototype.hasOwnProperty.call(node, "constructor") &&
        Object.prototype.hasOwnProperty.call(node.constructor, "prototype")
      ) {
        throw new SyntaxError("Object contains forbidden prototype property")
      }

      for (const key in node) {
        const value = node[key]
        if (value && typeof value === "object") {
          next.push(value)
        }
      }
    }
  }
  return obj
}

export const unsafeSecureJsonParse = (text: string): unknown => {
  // Performance optimization, see https://github.com/fastify/secure-json-parse/pull/90
  const { stackTraceLimit } = Error
  Error.stackTraceLimit = 0
  try {
    return _parse(text)
  } finally {
    Error.stackTraceLimit = stackTraceLimit
  }
}
