import { Effect, Layer, type Scope, ServiceMap } from "effect";
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
export type Tools<T> = T extends Toolkit<infer ToolkitTools> ? ToolkitTools : never;

/**
 * @since 0.0.0
 */
export type ToolsByName<Tools> =
  Tools extends Record<string, Tool.Any>
    ? { readonly [Name in keyof Tools]: Tools[Name] }
    : Tools extends ReadonlyArray<Tool.Any>
      ? { readonly [ToolEntry in Tools[number] as ToolEntry["name"]]: ToolEntry }
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
export type WithHandlerTools<T> = T extends WithHandler<infer ToolkitTools> ? ToolkitTools : never;

/**
 * @since 0.0.0
 */
export interface WithHandler<Tools extends Record<string, Tool.Any>> {
  readonly tools: Tools;
  readonly handle: <Name extends keyof Tools & string>(
    name: Name,
    params: unknown
  ) => Effect.Effect<
    Tool.HandlerResult<Tools[Name]>,
    ToolInputError | ToolOutputError | ToolNotFoundError | Tool.Failure<Tools[Name]>,
    Tool.Requirements<Tools[Name]>
  >;
}

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

type HandlerBinding<ToolEntry extends Tool.Any> = {
  readonly context: ServiceMap.ServiceMap<never>;
  readonly handler: Tool.HandlerFor<ToolEntry>;
};

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

const makeBinding = <Tools extends Record<string, Tool.Any>, Name extends keyof Tools & string>(
  tools: Tools,
  name: Name
): ServiceMap.Service<Tool.HandlersFor<Tools>, HandlerBinding<Tools[Name]>> =>
  ServiceMap.Service<Tool.HandlersFor<Tools>, HandlerBinding<Tools[Name]>>(tools[name].id);

const makeProto = <Tools extends Record<string, Tool.Any>>(tools: Tools): Toolkit<Tools> => {
  const of = <Handlers extends HandlersFrom<Tools>>(handlers: Handlers): Handlers => handlers;

  const toContext = <Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Effect.Effect<ServiceMap.ServiceMap<Tool.HandlersFor<Tools>>, EX, RX> =>
    Effect.gen(function* () {
      const context = yield* Effect.services<never>();
      const handlers = Effect.isEffect(build) ? yield* build : build;
      const handlerMap: HandlersFrom<Tools> = handlers;
      let serviceMap: ServiceMap.ServiceMap<Tool.HandlersFor<Tools>> = ServiceMap.empty();
      for (const name in handlerMap) {
        const binding = makeBinding(tools, name);
        serviceMap = ServiceMap.add(serviceMap, binding, {
          handler: handlerMap[name],
          context,
        });
      }
      return serviceMap;
    });

  const toLayer = <Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Layer.Layer<Tool.HandlersFor<Tools>, EX, Exclude<RX, Scope.Scope>> =>
    Layer.unwrap(toContext(build).pipe(Effect.map((context) => Layer.succeedServices(context))));

  const commit = (): Effect.Effect<
    WithHandler<Tools>,
    ToolInputError | ToolOutputError | ToolNotFoundError,
    Tool.HandlersFor<Tools>
  > =>
    Effect.gen(function* () {
      const context = yield* Effect.services<Tool.HandlersFor<Tools>>();
      const handle = <Name extends keyof Tools & string>(name: Name, params: unknown) =>
        Effect.gen(function* () {
          const maybeTool = R.get(tools, name);
          if (O.isNone(maybeTool)) {
            return yield* ToolNotFoundError.make({
              name,
              available: R.keys(tools),
            });
          }
          const activeTool = maybeTool.value;
          const binding = makeBinding(tools, name);
          const maybeHandler = ServiceMap.getOption(context, binding);
          if (O.isNone(maybeHandler)) {
            return yield* ToolNotFoundError.make({
              name,
              available: R.keys(tools),
            });
          }
          const handlerBinding = maybeHandler.value;
          const decodeParameters = S.decodeUnknownEffect(activeTool.parametersSchema);
          const resultSchema = S.Union([activeTool.successSchema, activeTool.failureSchema]);
          const validateResult = S.decodeUnknownEffect(resultSchema);
          const encodeResult = S.encodeUnknownEffect(resultSchema);
          const decodedParams = yield* Effect.mapError(decodeParameters(params), (cause) =>
            ToolInputError.make({
              name,
              message: `Failed to decode parameters for tool '${name}'`,
              input: params,
              cause,
            })
          );
          const { isFailure, result } = yield* handlerBinding.handler(decodedParams).pipe(
            Effect.map((result) => ({ result, isFailure: false })),
            Effect.catch((error) =>
              activeTool.failureMode === "error"
                ? Effect.fail(error)
                : Effect.succeed({ result: error, isFailure: true })
            ),
            Effect.tap(({ result }) => validateResult(result)),
            Effect.provideServices(handlerBinding.context),
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
          const encodedResult = yield* Effect.mapError(encodeResult(result), (cause) =>
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
          } satisfies Tool.HandlerResult<Tools[Name]>;
        });
      return {
        tools,
        handle,
      } satisfies WithHandler<Tools>;
    });

  return {
    tools,
    of,
    toContext,
    toLayer,
    commit,
  };
};

const resolveToolsRecord = (tools: ReadonlyArray<Tool.Any>): Record<string, Tool.Any> => {
  const output: Record<string, Tool.Any> = {};
  for (const tool of tools) {
    output[tool.name] = tool;
  }
  return output;
};

const mergeToolsRecord = (toolkits: ReadonlyArray<Any>): Record<string, Tool.Any> => {
  const tools: Record<string, Tool.Any> = {};
  for (const toolkit of toolkits) {
    for (const tool of A.map(R.toEntries(toolkit.tools), ([, tool]) => tool)) {
      tools[tool.name] = tool;
    }
  }
  return tools;
};

const fromHandlersRecord = (
  definitions: Record<string, Tool.Definition>
): ToolkitWithHandlers<Record<string, Tool.Any>> => {
  const tools: Record<string, Tool.Any> = {};
  const handlers: Mutable<HandlersFrom<Record<string, Tool.Any>>> = {};
  for (const name in definitions) {
    const tool = Tool.define(name, definitions[name]);
    tools[name] = tool;
    handlers[name] = tool.handler;
  }
  return {
    ...makeProto(tools),
    handlers,
  };
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
export function make<Tools extends ReadonlyArray<Tool.Any>>(...tools: Tools): Toolkit<ToolsByName<Tools>>;
export function make(...tools: ReadonlyArray<Tool.Any>): Toolkit<Record<string, Tool.Any>> {
  return makeProto(resolveToolsRecord(tools));
}

/**
 * Build a toolkit from tool definitions that already include handlers.
 */
/**
 * @since 0.0.0
 */
export function fromHandlers<const Defs extends Record<string, Tool.Definition>>(
  definitions: Defs
): ToolkitWithHandlers<ToolsFromDefinitions<Defs>>;
export function fromHandlers(
  definitions: Record<string, Tool.Definition>
): ToolkitWithHandlers<Record<string, Tool.Any>> {
  return fromHandlersRecord(definitions);
}

/**
 * Merge multiple toolkits into a single toolkit.
 */
/**
 * @since 0.0.0
 */
export function merge<const Toolkits extends ReadonlyArray<Any>>(...toolkits: Toolkits): Toolkit<MergedTools<Toolkits>>;
export function merge(...toolkits: ReadonlyArray<Any>): Toolkit<Record<string, Tool.Any>> {
  return makeProto(mergeToolsRecord(toolkits));
}
