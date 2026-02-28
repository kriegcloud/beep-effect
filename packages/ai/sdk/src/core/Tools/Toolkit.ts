import { Effect, Layer, MutableHashMap, type Scope, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { ToolInputError, ToolNotFoundError, ToolOutputError } from "./Errors.js";
import * as Tool from "./Tool.js";

/**
 * Toolkit bundles tools with their handlers and validation logic.
 */
/**
 * @since 0.0.0
 */
export interface Toolkit<Tools extends Record<string, Tool.Any>> {
  /**
   * Registered tool definitions.
   */
  readonly tools: Tools;
  /**
   * Helper to type-check handler maps.
   */
  of<Handlers extends HandlersFrom<Tools>>(handlers: Handlers): Handlers;
  /**
   * Build a Context with tool handlers for dependency injection.
   */
  toContext<Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Effect.Effect<ServiceMap.ServiceMap<Tool.HandlersFor<Tools>>, EX, RX>;
  /**
   * Build a Layer with tool handlers for dependency injection.
   */
  toLayer<Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Layer.Layer<Tool.HandlersFor<Tools>, EX, Exclude<RX, Scope.Scope>>;
  /**
   * Finalize the toolkit into a runtime handler with validation.
   */
  commit(): Effect.Effect<
    WithHandler<Tools>,
    ToolInputError | ToolOutputError | ToolNotFoundError,
    Tool.HandlersFor<Tools>
  >;
}

/**
 * @since 0.0.0
 */
export interface ToolkitWithHandlers<Tools extends Record<string, Tool.Any>> extends Toolkit<Tools> {
  readonly handlers: HandlersFrom<Tools>;
}

/**
 * @since 0.0.0
 */
export interface Any {
  readonly tools: Record<string, Tool.Any>;
}

/**
 * @since 0.0.0
 */
export type Tools<T> = T extends Toolkit<infer Tools> ? Tools : never;

/**
 * @since 0.0.0
 */
export type ToolsByName<Tools> =
  Tools extends Record<string, Tool.Any>
    ? { readonly [Name in keyof Tools]: Tools[Name] }
    : Tools extends ReadonlyArray<Tool.Any>
      ? { readonly [Tool in Tools[number] as Tool["name"]]: Tool }
      : never;

/**
 * @since 0.0.0
 */
export type ToolsFromDefinitions<Defs extends Record<string, Tool.Definition>> = SimplifyRecord<{
  readonly [Name in keyof Defs]: Tool.ToolFromDefinition<Name & string, Defs[Name]>;
}>;

/**
 * @since 0.0.0
 */
export type HandlersFrom<Tools extends Record<string, Tool.Any>> = {
  readonly [Name in keyof Tools as Tool.RequiresHandler<Tools[Name]> extends true ? Name : never]: (
    params: Tool.Parameters<Tools[Name]>
  ) => Effect.Effect<Tool.Success<Tools[Name]>, Tool.Failure<Tools[Name]>, Tool.Requirements<Tools[Name]>>;
};

/**
 * @since 0.0.0
 */
export type WithHandlerTools<T> = T extends WithHandler<infer Tools> ? Tools : never;

/**
 * @since 0.0.0
 */
export interface WithHandler<Tools extends Record<string, Tool.Any>> {
  readonly tools: Tools;
  readonly handle: <Name extends keyof Tools>(
    name: Name,
    params: unknown
  ) => Effect.Effect<
    Tool.HandlerResult<Tools[Name]>,
    ToolInputError | ToolOutputError | ToolNotFoundError | Tool.Failure<Tools[Name]>,
    Tool.Requirements<Tools[Name]>
  >;
}

type HandlerBinding = {
  readonly context: ServiceMap.ServiceMap<never>;
  readonly handler: (params: any) => Effect.Effect<any, any, any>;
};

const Proto = {
  of: <Handlers>(handlers: Handlers) => handlers,
  toContext(
    this: Toolkit<Record<string, Tool.Any>>,
    build: Record<string, (params: any) => any> | Effect.Effect<Record<string, (params: any) => any>>
  ) {
    const tools = this.tools;
    return Effect.gen(function* () {
      const context = yield* Effect.services<never>();
      const handlers = Effect.isEffect(build) ? yield* build : build;
      return A.reduce(R.toEntries(handlers), ServiceMap.empty(), (serviceMap, [name, handler]) => {
        const tool = tools[name]!;
        const binding = ServiceMap.Service<never, HandlerBinding>(tool.id);
        return ServiceMap.add(serviceMap, binding, {
          handler,
          context,
        });
      });
    });
  },
  toLayer(
    this: Toolkit<Record<string, Tool.Any>>,
    build: Record<string, (params: any) => any> | Effect.Effect<Record<string, (params: any) => any>>
  ) {
    return Layer.unwrap(this.toContext(build).pipe(Effect.map((context) => Layer.succeedServices(context))));
  },
  commit(this: Toolkit<Record<string, Tool.Any>>) {
    const tools = this.tools;
    return Effect.gen(function* () {
      const context = yield* Effect.services<never>();
      const schemasCache = MutableHashMap.empty<
        Tool.Any,
        {
          readonly context: ServiceMap.ServiceMap<never>;
          readonly handler: (params: any) => Effect.Effect<any, any, any>;
          readonly decodeParameters: (u: unknown) => Effect.Effect<Tool.Parameters<any>, S.SchemaError>;
          readonly validateResult: (u: unknown) => Effect.Effect<unknown, S.SchemaError>;
          readonly encodeResult: (u: unknown) => Effect.Effect<unknown, S.SchemaError>;
        }
      >();
      const getSchemas = (tool: Tool.Any) => {
        const cached = MutableHashMap.get(schemasCache, tool);
        if (O.isSome(cached)) {
          return cached.value;
        }
        const maybeHandler = context.mapUnsafe.get(tool.id);
        if (maybeHandler === undefined) {
          throw new Error(`Missing handler for tool '${tool.name}'`);
        }
        const handler = maybeHandler as HandlerBinding;
        const decodeParameters = S.decodeUnknownEffect(tool.parametersSchema) as any;
        const resultSchema = S.Union([tool.successSchema, tool.failureSchema]);
        const validateResult = S.decodeUnknownEffect(resultSchema) as any;
        const encodeResult = S.encodeUnknownEffect(resultSchema) as any;
        const schemas = {
          context: handler.context,
          handler: handler.handler,
          decodeParameters,
          validateResult,
          encodeResult,
        };
        MutableHashMap.set(schemasCache, tool, schemas);
        return schemas;
      };
      const handle = (name: string, params: unknown) =>
        Effect.gen(function* () {
          const tool = tools[name];
          if (tool === undefined) {
            return yield* ToolNotFoundError.make({
              name,
              available: R.keys(tools),
            });
          }
          const activeTool = tool!;
          const schemas = getSchemas(activeTool);
          const decodedParams = yield* Effect.mapError(schemas.decodeParameters(params), (cause) =>
            ToolInputError.make({
              name,
              message: `Failed to decode parameters for tool '${name}'`,
              input: params,
              cause,
            })
          );
          const { isFailure, result } = yield* schemas.handler(decodedParams).pipe(
            Effect.map((result) => ({ result, isFailure: false })),
            Effect.catch((error) =>
              activeTool.failureMode === "error"
                ? Effect.fail(error)
                : Effect.succeed({ result: error, isFailure: true })
            ),
            Effect.tap(({ result }) => schemas.validateResult(result)),
            Effect.provideServices(schemas.context),
            Effect.mapError((cause) =>
              S.isSchemaError(cause)
                ? ToolOutputError.make({
                    name,
                    message: `Failed to validate result for tool '${name}'`,
                    cause,
                  })
                : cause
            )
          );
          const encodedResult = yield* Effect.mapError(schemas.encodeResult(result), (cause) =>
            ToolOutputError.make({
              name,
              message: `Failed to encode result for tool '${name}'`,
              output: result,
              cause,
            })
          );
          return {
            isFailure,
            result,
            encodedResult,
          } satisfies Tool.HandlerResult<any>;
        });
      return {
        tools,
        handle,
      } satisfies WithHandler<Record<string, any>>;
    });
  },
};

const makeProto = <Tools extends Record<string, Tool.Any>>(tools: Tools): Toolkit<Tools> =>
  ({
    ...Proto,
    tools,
  }) as any;

const resolveInput = <Tools extends ReadonlyArray<Tool.Any>>(...tools: Tools): Record<string, Tools[number]> => {
  const output = {} as Record<string, Tools[number]>;
  for (const tool of tools) {
    output[tool.name] = tool;
  }
  return output;
};

/**
 * Empty toolkit (useful as a base for composition).
 */
/**
 * @since 0.0.0
 */
export const empty: Toolkit<{}> = makeProto({});

/**
 * Build a toolkit from a list of tools.
 */
/**
 * @since 0.0.0
 */
export const make = <Tools extends ReadonlyArray<Tool.Any>>(...tools: Tools): Toolkit<ToolsByName<Tools>> =>
  makeProto(resolveInput(...tools)) as any;

/**
 * @since 0.0.0
 */
export type SimplifyRecord<T> = { [K in keyof T]: T[K] } & {};

/**
 * @since 0.0.0
 */
export type MergeRecords<U> = {
  readonly [K in Extract<U extends unknown ? keyof U : never, string>]: Extract<
    U extends Record<K, infer V> ? V : never,
    Tool.Any
  >;
};

/**
 * @since 0.0.0
 */
export type MergedTools<Toolkits extends ReadonlyArray<Any>> = SimplifyRecord<MergeRecords<Tools<Toolkits[number]>>>;

/**
 * Build a toolkit from tool definitions that already include handlers.
 */
/**
 * @since 0.0.0
 */
export const fromHandlers = <const Defs extends Record<string, Tool.Definition>>(
  definitions: Defs
): ToolkitWithHandlers<ToolsFromDefinitions<Defs>> => {
  const tools = {} as ToolsFromDefinitions<Defs>;
  const handlers: Record<string, (params: any) => Effect.Effect<any, any, any>> = {};
  for (const name in definitions) {
    const tool = Tool.define(name as string, definitions[name] as any);
    tools[name] = tool as any;
    handlers[name] = tool.handler as any;
  }
  return {
    ...makeProto(tools),
    handlers: handlers as HandlersFrom<ToolsFromDefinitions<Defs>>,
  } as any;
};

/**
 * Merge multiple toolkits into a single toolkit.
 */
/**
 * @since 0.0.0
 */
export const merge = <const Toolkits extends ReadonlyArray<Any>>(
  ...toolkits: Toolkits
): Toolkit<MergedTools<Toolkits>> => {
  const tools = {} as Record<string, Tool.Any>;
  for (const toolkit of toolkits) {
    for (const tool of A.map(R.toEntries(toolkit.tools), ([, tool]) => tool)) {
      tools[tool.name] = tool;
    }
  }
  return makeProto(tools) as any;
};
