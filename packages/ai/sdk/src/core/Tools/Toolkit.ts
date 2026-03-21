import { Cause, Effect, Exit, Layer, type Scope, ServiceMap } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { ToolHandlerError, ToolInputError, ToolNotFoundError, ToolOutputError } from "./Errors.js";
import * as Tool from "./Tool.js";

/**
 * Toolkit bundles tools with their handlers and validation logic.
 */
/**
 * @since 0.0.0
 * @category DomainModel
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
  ): Effect.Effect<ServiceMap.ServiceMap<never>, EX, RX | ToolkitRequirements<Tools>>;
  /**
   * Build a Layer with tool handlers for dependency injection.
   */
  toLayer<Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Layer.Layer<never, EX, Exclude<RX | ToolkitRequirements<Tools>, Scope.Scope>>;
  /**
   * Registered tool definitions.
   */
  readonly tools: Tools;
}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export interface ToolkitWithHandlers<Tools extends Record<string, Tool.Any>> extends Toolkit<Tools> {
  readonly handlers: HandlersFrom<Tools>;
}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Any = Readonly<{
  readonly tools: Record<string, Tool.Any>;
}>;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Tools<T> = T extends Toolkit<infer Tools> ? Tools : never;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ToolsByName<Tools> =
  Tools extends Record<string, Tool.Any>
    ? { readonly [Name in keyof Tools]: Tools[Name] }
    : Tools extends ReadonlyArray<Tool.Any>
      ? { readonly [ToolDef in Tools[number] as ToolDef["name"]]: ToolDef }
      : never;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type ToolsFromDefinitions<Defs extends Record<string, Tool.Definition>> = SimplifyRecord<{
  readonly [Name in keyof Defs]: Tool.ToolFromDefinition<Name & string, Defs[Name]>;
}>;

type ToolkitTool<Tools extends Record<string, Tool.Any>> = Tools[keyof Tools];
type ToolkitRequirements<Tools extends Record<string, Tool.Any>> = Tool.Requirements<ToolkitTool<Tools>>;
type ToolkitHandleResult<Tools extends Record<string, Tool.Any>> = {
  readonly result: Tool.Success<ToolkitTool<Tools>> | Tool.Failure<ToolkitTool<Tools>>;
  readonly encodedResult: Tool.SuccessEncoded<ToolkitTool<Tools>> | Tool.FailureEncoded<ToolkitTool<Tools>>;
  readonly isFailure: boolean;
};
type ToolkitHandleError = ToolHandlerError | ToolInputError | ToolOutputError | ToolNotFoundError;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type HandlersFrom<Tools extends Record<string, Tool.Any>> = Tool.HandlersFor<Tools>;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type WithHandlerTools<T> = T extends WithHandler<infer Tools> ? Tools : never;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export interface WithHandler<Tools extends Record<string, Tool.Any>> {
  readonly handle: (
    name: string,
    params: unknown
  ) => Effect.Effect<ToolkitHandleResult<Tools>, ToolkitHandleError, never>;
  readonly tools: Tools;
}

type HandlerBinding<Result> = {
  readonly run: (params: unknown) => Effect.Effect<Result, ToolkitHandleError, never>;
};

const isHandlerBinding = <Result>(value: unknown): value is HandlerBinding<Result> =>
  P.isObject(value) && P.hasProperty(value, "run") && P.isFunction(value.run);

const forEachTool = <Tools extends Record<string, Tool.Any>>(
  tools: Tools,
  f: <Name extends keyof Tools & string>(name: Name, tool: Tools[Name]) => void
) => {
  for (const name in tools) {
    f(name, tools[name]);
  }
};

const normalizeHandlerExit = <T extends Tool.Any>(
  tool: T,
  exit: Exit.Exit<Tool.Success<T>, Tool.Failure<T>>
): Effect.Effect<
  {
    readonly result: Tool.Success<T> | Tool.Failure<T>;
    readonly isFailure: boolean;
  },
  ToolHandlerError,
  never
> => {
  if (Exit.isSuccess(exit)) {
    return Effect.succeed({
      result: exit.value,
      isFailure: false,
    });
  }

  const failure = Cause.findErrorOption(exit.cause);
  if (O.isSome(failure)) {
    if (tool.failureMode === "error") {
      return Effect.fail(
        ToolHandlerError.make({
          name: tool.name,
          message: `Tool '${tool.name}' handler failed`,
          cause: failure.value,
        })
      );
    }

    return Effect.succeed({
      result: failure.value,
      isFailure: true,
    });
  }

  return Effect.fail(
    ToolHandlerError.make({
      name: tool.name,
      message: `Tool '${tool.name}' handler failed`,
      cause: Cause.squash(exit.cause),
    })
  );
};

const makeProto = <const Tools extends Record<string, Tool.Any>>(tools: Tools): Toolkit<Tools> => {
  const toContext = <Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Effect.Effect<ServiceMap.ServiceMap<never>, EX, RX | ToolkitRequirements<Tools>> =>
    Effect.gen(function* () {
      const context = yield* Effect.services<ToolkitRequirements<Tools>>();
      const handlers: HandlersFrom<Tools> = Effect.isEffect(build) ? yield* build : build;
      return ServiceMap.mutate(ServiceMap.empty(), (serviceMap) => {
        const bindings = serviceMap.mapUnsafe as Map<string, HandlerBinding<unknown>>;

        const registerNamedTool = <Name extends keyof Tools & string>(name: Name, tool: Tools[Name]) => {
          const handler = handlers[name];
          const toolContext = ServiceMap.makeUnsafe<Tool.Requirements<Tools[Name]>>(context.mapUnsafe);
          const providedHandler = (
            params: Tool.Parameters<Tools[Name]>
          ): Effect.Effect<Tool.Success<Tools[Name]>, Tool.Failure<Tools[Name]>, never> =>
            handler(params).pipe(Effect.provide(toolContext));
          const decodeParameters = S.decodeUnknownEffect(tool.parametersSchema);
          const resultSchema = S.Union([tool.successSchema, tool.failureSchema] as const);
          const validateResult = S.decodeUnknownEffect(resultSchema);
          const encodeResult = S.encodeEffect(resultSchema);
          const binding: HandlerBinding<unknown> = {
            run: (params) =>
              decodeParameters(params).pipe(
                Effect.mapError((cause) =>
                  ToolInputError.make({
                    name: tool.name,
                    message: `Failed to decode parameters for tool '${tool.name}'`,
                    input: params,
                    cause,
                  })
                ),
                Effect.flatMap((decodedParams) =>
                  Effect.exit(providedHandler(decodedParams as Tool.Parameters<Tools[Name]>)).pipe(
                    Effect.flatMap((exit) => normalizeHandlerExit(tool, exit))
                  )
                ),
                Effect.flatMap(({ result, isFailure }) =>
                  validateResult(result).pipe(
                    Effect.mapError((cause) =>
                      ToolOutputError.make({
                        name: tool.name,
                        message: `Failed to validate result for tool '${tool.name}'`,
                        cause,
                      })
                    ),
                    Effect.flatMap(() =>
                      encodeResult(result).pipe(
                        Effect.mapError((cause) =>
                          ToolOutputError.make({
                            name: tool.name,
                            message: `Failed to encode result for tool '${tool.name}'`,
                            output: result,
                            cause,
                          })
                        ),
                        Effect.map((encodedResult) => ({
                          isFailure,
                          result,
                          encodedResult,
                        }))
                      )
                    )
                  )
                )
              ),
          };
          bindings.set(tool.id, binding);
        };

        forEachTool(tools, registerNamedTool);
        return serviceMap;
      });
    });

  const toLayer = <Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Layer.Layer<never, EX, Exclude<RX | ToolkitRequirements<Tools>, Scope.Scope>> =>
    Layer.unwrap(toContext(build).pipe(Effect.map((context) => Layer.succeedServices(context))));

  const commit = (): Effect.Effect<WithHandler<Tools>, never, never> =>
    Effect.gen(function* () {
      const bindings = yield* Effect.services<never>();

      const handle: WithHandler<Tools>["handle"] = (name, params) =>
        Effect.gen(function* () {
          const tool = tools[name];
          if (tool === undefined) {
            return yield* ToolNotFoundError.make({
              name,
              available: R.keys(tools),
            });
          }

          const binding = bindings.mapUnsafe.get(tool.id);
          if (!isHandlerBinding<ToolkitHandleResult<Tools>>(binding)) {
            return yield* ToolNotFoundError.make({
              name,
              available: R.keys(tools),
            });
          }

          return yield* binding.run(params);
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
 * @category DomainModel
 */
export const empty: Toolkit<{}> = makeProto({});

/**
 * Build a toolkit from a list of tools.
 */
/**
 * @since 0.0.0
 * @category DomainModel
 */
export const make = <Tools extends ReadonlyArray<Tool.Any>>(...tools: Tools): Toolkit<Record<string, Tools[number]>> =>
  makeProto(resolveInput(...tools));

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type SimplifyRecord<T> = { [K in keyof T]: T[K] } & {};

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type MergeRecords<U> = {
  readonly [K in Extract<U extends unknown ? keyof U : never, string>]: Extract<
    U extends Record<K, infer V> ? V : never,
    Tool.Any
  >;
};

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type MergedTools<Toolkits extends ReadonlyArray<Any>> = SimplifyRecord<MergeRecords<Tools<Toolkits[number]>>>;

/**
 * Build a toolkit from tool definitions that already include handlers.
 */
/**
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
 */
export const merge = <const Toolkits extends ReadonlyArray<Any>>(
  ...toolkits: Toolkits
): Toolkit<Record<string, Tool.Any>> => {
  const tools: Record<string, Tool.Any> = {};

  for (const toolkit of toolkits) {
    for (const [, tool] of R.toEntries(toolkit.tools)) {
      tools[tool.name] = tool;
    }
  }

  return makeProto(tools);
};
