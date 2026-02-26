import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as ParseResult from "effect/ParseResult"
import * as Schema from "effect/Schema"
import type * as Scope from "effect/Scope"
import * as Tool from "./Tool.js"
import { ToolInputError, ToolNotFoundError, ToolOutputError } from "./Errors.js"

/**
 * Toolkit bundles tools with their handlers and validation logic.
 */
export interface Toolkit<Tools extends Record<string, Tool.Any>> {
  /**
   * Registered tool definitions.
   */
  readonly tools: Tools
  /**
   * Helper to type-check handler maps.
   */
  of<Handlers extends HandlersFrom<Tools>>(handlers: Handlers): Handlers
  /**
   * Build a Context with tool handlers for dependency injection.
   */
  toContext<Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Effect.Effect<Context.Context<Tool.HandlersFor<Tools>>, EX, RX>
  /**
   * Build a Layer with tool handlers for dependency injection.
   */
  toLayer<Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Layer.Layer<Tool.HandlersFor<Tools>, EX, Exclude<RX, Scope.Scope>>
  /**
   * Finalize the toolkit into a runtime handler with validation.
   */
  commit(): Effect.Effect<
    WithHandler<Tools>,
    ToolInputError | ToolOutputError | ToolNotFoundError,
    Tool.HandlersFor<Tools>
  >
}

export interface ToolkitWithHandlers<Tools extends Record<string, Tool.Any>> extends Toolkit<Tools> {
  readonly handlers: HandlersFrom<Tools>
}

export interface Any {
  readonly tools: Record<string, Tool.Any>
}

export type Tools<T> = T extends Toolkit<infer Tools> ? Tools : never

export type ToolsByName<Tools> = Tools extends Record<string, Tool.Any> ?
  { readonly [Name in keyof Tools]: Tools[Name] }
  : Tools extends ReadonlyArray<Tool.Any> ? { readonly [Tool in Tools[number] as Tool["name"]]: Tool }
  : never

export type ToolsFromDefinitions<Defs extends Record<string, Tool.Definition>> = SimplifyRecord<{
  readonly [Name in keyof Defs]: Tool.ToolFromDefinition<Name & string, Defs[Name]>
}>

export type HandlersFrom<Tools extends Record<string, Tool.Any>> = {
  readonly [Name in keyof Tools as Tool.RequiresHandler<Tools[Name]> extends true ? Name : never]: (
    params: Tool.Parameters<Tools[Name]>
  ) => Effect.Effect<
    Tool.Success<Tools[Name]>,
    Tool.Failure<Tools[Name]>,
    Tool.Requirements<Tools[Name]>
  >
}

export type WithHandlerTools<T> = T extends WithHandler<infer Tools> ? Tools : never

export interface WithHandler<Tools extends Record<string, Tool.Any>> {
  readonly tools: Tools
  readonly handle: <Name extends keyof Tools>(
    name: Name,
    params: unknown
  ) => Effect.Effect<
    Tool.HandlerResult<Tools[Name]>,
    ToolInputError | ToolOutputError | ToolNotFoundError | Tool.Failure<Tools[Name]>,
    Tool.Requirements<Tools[Name]>
  >
}

const Proto = {
  of: <Handlers>(handlers: Handlers) => handlers,
  toContext(
    this: Toolkit<Record<string, Tool.Any>>,
    build: Record<string, (params: any) => any> | Effect.Effect<Record<string, (params: any) => any>>
  ) {
    return Effect.gen(this, function*() {
      const context = yield* Effect.context<never>()
      const handlers = Effect.isEffect(build) ? yield* build : build
      const contextMap = new Map<string, unknown>()
      for (const [name, handler] of Object.entries(handlers)) {
        const tool = this.tools[name]!
        contextMap.set(tool.id, { handler, context })
      }
      return Context.unsafeMake(contextMap)
    })
  },
  toLayer(
    this: Toolkit<Record<string, Tool.Any>>,
    build: Record<string, (params: any) => any> | Effect.Effect<Record<string, (params: any) => any>>
  ) {
    return Layer.scopedContext(this.toContext(build))
  },
  commit(this: Toolkit<Record<string, Tool.Any>>) {
    return Effect.gen(this, function*() {
      const tools = this.tools
      const context = yield* Effect.context<never>()
      const schemasCache = new WeakMap<any, {
        readonly context: Context.Context<never>
        readonly handler: (params: any) => Effect.Effect<any, any, any>
        readonly decodeParameters: (u: unknown) => Effect.Effect<Tool.Parameters<any>, ParseResult.ParseError>
        readonly validateResult: (u: unknown) => Effect.Effect<unknown, ParseResult.ParseError>
        readonly encodeResult: (u: unknown) => Effect.Effect<unknown, ParseResult.ParseError>
      }>()
      const getSchemas = (tool: Tool.Any) => {
        let schemas = schemasCache.get(tool)
        if (schemas === undefined) {
          const handler = context.unsafeMap.get(tool.id)! as {
            readonly handler: (params: any) => Effect.Effect<any, any, any>
            readonly context: Context.Context<never>
          }
          const decodeParameters = Schema.decodeUnknown(tool.parametersSchema) as any
          const resultSchema = Schema.Union(tool.successSchema, tool.failureSchema)
          const validateResult = Schema.validate(resultSchema) as any
          const encodeResult = Schema.encodeUnknown(resultSchema) as any
          schemas = {
            context: handler.context,
            handler: handler.handler,
            decodeParameters,
            validateResult,
            encodeResult
          }
          schemasCache.set(tool, schemas)
        }
        return schemas
      }
      const handle = Effect.fn("Toolkit.handle", { captureStackTrace: false })(
        function*(name: string, params: unknown) {
          const tool = tools[name]
          if (tool === undefined) {
            return yield* ToolNotFoundError.make({
              name,
              available: Object.keys(tools)
            })
          }
          const activeTool = tool!
          const schemas = getSchemas(activeTool)
          const decodedParams = yield* Effect.mapError(
            schemas.decodeParameters(params),
            (cause) =>
              ToolInputError.make({
                name,
                message: `Failed to decode parameters for tool '${name}'`,
                input: params,
                cause
              })
          )
          const { isFailure, result } = yield* schemas.handler(decodedParams).pipe(
            Effect.map((result) => ({ result, isFailure: false })),
            Effect.catchAll((error) =>
              activeTool.failureMode === "error"
                ? Effect.fail(error)
                : Effect.succeed({ result: error, isFailure: true })
            ),
            Effect.tap(({ result }) => schemas.validateResult(result)),
            Effect.mapInputContext((input) => Context.merge(schemas.context, input)),
            Effect.mapError((cause) =>
              ParseResult.isParseError(cause)
                ? ToolOutputError.make({
                  name,
                  message: `Failed to validate result for tool '${name}'`,
                  cause
                })
                : cause
            )
          )
          const encodedResult = yield* Effect.mapError(
            schemas.encodeResult(result),
            (cause) =>
              ToolOutputError.make({
                name,
                message: `Failed to encode result for tool '${name}'`,
                output: result,
                cause
              })
          )
          return {
            isFailure,
            result,
            encodedResult
          } satisfies Tool.HandlerResult<any>
        }
      )
      return {
        tools,
        handle
      } satisfies WithHandler<Record<string, any>>
    })
  }
}

const makeProto = <Tools extends Record<string, Tool.Any>>(tools: Tools): Toolkit<Tools> =>
  Object.assign(function() {}, Proto, { tools }) as any

const resolveInput = <Tools extends ReadonlyArray<Tool.Any>>(
  ...tools: Tools
): Record<string, Tools[number]> => {
  const output = {} as Record<string, Tools[number]>
  for (const tool of tools) {
    output[tool.name] = tool
  }
  return output
}

/**
 * Empty toolkit (useful as a base for composition).
 */
export const empty: Toolkit<{}> = makeProto({})

/**
 * Build a toolkit from a list of tools.
 */
export const make = <Tools extends ReadonlyArray<Tool.Any>>(
  ...tools: Tools
): Toolkit<ToolsByName<Tools>> => makeProto(resolveInput(...tools)) as any

export type SimplifyRecord<T> = { [K in keyof T]: T[K] } & {}

export type MergeRecords<U> = {
  readonly [K in Extract<U extends unknown ? keyof U : never, string>]: Extract<
    U extends Record<K, infer V> ? V : never,
    Tool.Any
  >
}

export type MergedTools<Toolkits extends ReadonlyArray<Any>> = SimplifyRecord<
  MergeRecords<Tools<Toolkits[number]>>
>

/**
 * Build a toolkit from tool definitions that already include handlers.
 */
export const fromHandlers = <const Defs extends Record<string, Tool.Definition>>(
  definitions: Defs
): ToolkitWithHandlers<ToolsFromDefinitions<Defs>> => {
  const tools = {} as ToolsFromDefinitions<Defs>
  const handlers: Record<string, (params: any) => Effect.Effect<any, any, any>> = {}
  for (const name in definitions) {
    const tool = Tool.define(name as string, definitions[name] as any)
    tools[name] = tool as any
    handlers[name] = tool.handler as any
  }
  return Object.assign(makeProto(tools), { handlers: handlers as HandlersFrom<ToolsFromDefinitions<Defs>> }) as any
}

/**
 * Merge multiple toolkits into a single toolkit.
 */
export const merge = <const Toolkits extends ReadonlyArray<Any>>(
  ...toolkits: Toolkits
): Toolkit<MergedTools<Toolkits>> => {
  const tools = {} as Record<string, Tool.Any>
  for (const toolkit of toolkits) {
    for (const tool of Object.values(toolkit.tools)) {
      tools[tool.name] = tool
    }
  }
  return makeProto(tools) as any
}
