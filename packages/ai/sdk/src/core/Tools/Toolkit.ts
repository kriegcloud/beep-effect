import { Effect, Layer, MutableHashMap, type Scope, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
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
   * Finalize the toolkit into a runtime handler with validation.
   */
  commit(): Effect.Effect<WithHandler<Tools>, never, never>;
  /**
   * Helper to type-check handler maps.
   */
  of<Handlers extends HandlersFrom<Tools>>(handlers: Handlers): Handlers;
  /**
   * Build a Context with tool handlers for dependency injection.
   */
  toContext<Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Effect.Effect<ServiceMap.ServiceMap<never>, EX, RX>;
  /**
   * Build a Layer with tool handlers for dependency injection.
   */
  toLayer<Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Layer.Layer<never, EX, Exclude<RX, Scope.Scope>>;
  /**
   * Registered tool definitions.
   */
  readonly tools: Tools;
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
export type Any = Readonly<{
  readonly tools: Record<string, Tool.Any>;
}>;

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
    params: unknown
  ) => Effect.Effect<unknown, unknown, unknown>;
};

/**
 * @since 0.0.0
 */
export type WithHandlerTools<T> = T extends WithHandler<infer Tools> ? Tools : never;

/**
 * @since 0.0.0
 */
export interface WithHandler<Tools extends Record<string, Tool.Any>> {
  readonly handle: (
    name: string,
    params: unknown
  ) => Effect.Effect<
    {
      readonly result: unknown;
      readonly encodedResult: unknown;
      readonly isFailure: boolean;
    },
    ToolInputError | ToolOutputError | ToolNotFoundError | unknown,
    unknown
  >;
  readonly tools: Tools;
}

type HandlerBinding = {
  readonly context: ServiceMap.ServiceMap<never>;
  readonly handler: (params: unknown) => Effect.Effect<unknown, unknown, unknown>;
};

const isHandlerBinding = (value: unknown): value is HandlerBinding =>
  P.isObject(value) &&
  P.hasProperty(value, "context") &&
  P.hasProperty(value, "handler") &&
  P.isFunction(value.handler);

const makeHandlerBinding = (
  context: ServiceMap.ServiceMap<never>,
  handler: (params: unknown) => Effect.Effect<unknown, unknown, unknown>
): HandlerBinding => ({
  context,
  handler: (params) => handler(params).pipe(Effect.provideServices(context)),
});

const makeProto = <Tools extends Record<string, Tool.Any>>(tools: Tools): Toolkit<Tools> => {
  const toContext = <Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Effect.Effect<ServiceMap.ServiceMap<never>, EX, RX> =>
    Effect.gen(function* () {
      const context = yield* Effect.services<never>();
      const handlers = Effect.isEffect(build) ? yield* build : build;
      let serviceMap = ServiceMap.empty();
      for (const [name, handler] of R.toEntries(handlers)) {
        const tool = tools[name];
        if (tool === undefined) {
          continue;
        }
        const binding = ServiceMap.Service<never, HandlerBinding>(tool.id);
        serviceMap = ServiceMap.add(serviceMap, binding, {
          ...makeHandlerBinding(context, handler),
        });
      }
      return serviceMap;
    });

  const toLayer = <Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Layer.Layer<never, EX, Exclude<RX, Scope.Scope>> =>
    Layer.unwrap(toContext(build).pipe(Effect.map((context) => Layer.succeedServices(context))));

  const commit = (): Effect.Effect<WithHandler<Tools>, never, never> =>
    Effect.gen(function* () {
      const context = yield* Effect.services<never>();
      const schemasCache = MutableHashMap.empty<
        Tool.Any,
        {
          readonly context: ServiceMap.ServiceMap<never>;
          readonly handler: (params: unknown) => Effect.Effect<unknown, unknown, unknown>;
          readonly decodeParameters: (u: unknown) => Effect.Effect<unknown, S.SchemaError>;
          readonly validateResult: (u: unknown) => Effect.Effect<unknown, S.SchemaError>;
          readonly encodeResult: (u: unknown) => Effect.Effect<unknown, S.SchemaError>;
        }
      >();
      const getSchemas = (tool: Tool.Any) =>
        Effect.gen(function* () {
          const cached = MutableHashMap.get(schemasCache, tool);
          if (O.isSome(cached)) {
            return cached.value;
          }
          const maybeHandler = context.mapUnsafe.get(tool.id);
          if (maybeHandler === undefined || !isHandlerBinding(maybeHandler)) {
            return yield* ToolNotFoundError.make({
              name: tool.name,
              available: R.keys(tools),
            });
          }
          const decodeParameters = S.decodeUnknownEffect(tool.parametersSchema);
          const resultSchema = S.Union([tool.successSchema, tool.failureSchema]);
          const validateResult = S.decodeUnknownEffect(resultSchema);
          const encodeResult = S.encodeUnknownEffect(resultSchema);
          const schemas = {
            context: maybeHandler.context,
            handler: maybeHandler.handler,
            decodeParameters,
            validateResult,
            encodeResult,
          };
          MutableHashMap.set(schemasCache, tool, schemas);
          return schemas;
        });

      const handle: WithHandler<Tools>["handle"] = (name, params) =>
        Effect.gen(function* () {
          const tool = tools[name];
          if (tool === undefined) {
            return yield* ToolNotFoundError.make({
              name,
              available: R.keys(tools),
            });
          }
          const schemas = yield* getSchemas(tool);
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
              tool.failureMode === "error" ? Effect.fail(error) : Effect.succeed({ result: error, isFailure: true })
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
          };
        });

      return {
        tools,
        handle,
      };
    });

  return {
    tools,
    of: <Handlers extends HandlersFrom<Tools>>(handlers: Handlers) => handlers,
    toContext,
    toLayer,
    commit,
  };
};

const resolveInput = <Tools extends ReadonlyArray<Tool.Any>>(...tools: Tools): Record<string, Tools[number]> => {
  const output: Record<string, Tools[number]> = {};
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
export const make = <Tools extends ReadonlyArray<Tool.Any>>(...tools: Tools): Toolkit<Record<string, Tools[number]>> =>
  makeProto(resolveInput(...tools));

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
): ToolkitWithHandlers<Record<string, Tool.Any>> => {
  const tools: Record<string, Tool.Any> = {};
  const handlers: Record<string, (params: unknown) => Effect.Effect<unknown, unknown, never>> = {};
  for (const [name, definition] of R.toEntries(definitions)) {
    const tool = Tool.define(name, definition);
    tools[name] = tool;
    handlers[name] = tool.handler;
  }
  return {
    ...makeProto(tools),
    handlers,
  };
};

/**
 * Merge multiple toolkits into a single toolkit.
 */
/**
 * @since 0.0.0
 */
export const merge = <const Toolkits extends ReadonlyArray<Any>>(
  ...toolkits: Toolkits
): Toolkit<Record<string, Tool.Any>> => {
  const tools: Record<string, Tool.Any> = {};
  for (const toolkit of toolkits) {
    for (const tool of A.map(R.toEntries(toolkit.tools), ([, tool]) => tool)) {
      tools[tool.name] = tool;
    }
  }
  return makeProto(tools);
};
