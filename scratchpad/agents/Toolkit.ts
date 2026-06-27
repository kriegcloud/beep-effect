/**
 * Groups AI tools together with their handlers.
 *
 * A toolkit connects `Tool` schemas to the handler functions an application
 * provides for a language model workflow. It can build a handler context or
 * layer and execute tool calls by name. Execution validates parameters, runs the
 * handler, encodes the result, supports preliminary streamed results, and
 * applies the tool's failure mode.
 *
 * @since 0.0.0
 */
import { P, Struct } from "@beep/utils";
import * as R from 'effect/Record';
import type { Cause, Scope } from "effect";
import { Context, Effect, Effectable, Fiber, Layer, Queue, Stream } from "effect";
import { identity } from "effect/Function";
import * as S from "effect/Schema";
import * as AiError from "./AiError.ts";
import type * as Tool from "./Tool.ts";

const TypeId = "~effect/ai/Toolkit" as const;

/**
 * Represents a collection of tools which can be used to enhance the
 * capabilities of a large language model.
 *
 * @example Defining AI toolkits
 *
 * ```ts
 * import * as S from "effect/Schema"
 * import { Tool, Toolkit } from "effect/unstable/ai"
 * import { Struct } from "@beep/utils";
 * const SearchDocs = Tool.make("SearchDocs", {
 *   description: "Search project documentation",
 *   parameters: S.Struct({ query: S.String }),
 *   success: S.Array(S.String)
 * })
 *
 * const SummarizeText = Tool.make("SummarizeText", {
 *   description: "Summarize text",
 *   parameters: S.Struct({ text: S.String }),
 *   success: S.String
 * })
 *
 * const AiToolkit = Toolkit.make(SearchDocs, SummarizeText)
 *
 * console.log(Struct.keys(AiToolkit.tools))
 * // ["SearchDocs", "SummarizeText"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface Toolkit<in out Tools extends Record<string, Tool.Any>>
  extends Effect.Effect<WithHandler<Tools>, never, Tool.HandlersFor<Tools>> {
  new (_: never): {};

  readonly [TypeId]: typeof TypeId;

  /**
   * A record containing all tools in this toolkit.
   */
  readonly tools: Tools;

  /**
   * A helper method which can be used for type-safe handler declarations.
   */
  of<Handlers extends HandlersFrom<Tools>>(handlers: Handlers): Handlers;

  /**
   * Converts a toolkit into a `Context` containing handlers for each tool
   * in the toolkit.
   */
  toHandlers<Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Effect.Effect<Context.Context<Tool.HandlersFor<Tools>>, EX, RX>;

  /**
   * Converts a toolkit into a `Layer` containing handlers for each tool in the
   * toolkit.
   */
  toLayer<Handlers extends HandlersFrom<Tools>, EX = never, RX = never>(
    /**
     * Handler functions or Effect that produces handlers.
     */
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Layer.Layer<Tool.HandlersFor<Tools>, EX, Exclude<RX, Scope.Scope>>;
}

/**
 * Context provided to tool handlers during execution.
 *
 * @category models
 * @since 0.0.0
 */
export interface HandlerContext<Tool extends Tool.Any> {
  /**
   * Emit a preliminary result during long-running tool calls.
   *
   * **Details**
   *
   * Preliminary results are streamed to the caller before the handler completes,
   * enabling real-time progress updates for lengthy operations.
   */
  readonly preliminary: (result: Tool.Success<Tool>) => Effect.Effect<void>;
}

/**
 * Represents any `Toolkit` instance, used for generic constraints.
 *
 * @category type-level
 * @since 0.0.0
 */
export interface Any {
  readonly [TypeId]: typeof TypeId;
  readonly tools: Record<string, Tool.Any>;
}

/**
 * A utility type which can be used to extract the tool definitions from a
 * toolkit.
 *
 * @category type-level
 * @since 0.0.0
 */
export type Tools<T> = T extends Toolkit<infer Tools> ? Tools : never;

/**
 * A utility type which transforms either a record or an array of tools into
 * a record where keys are tool names and values are the tool instances.
 *
 * @category type-level
 * @since 0.0.0
 */
export type ToolsByName<Tools> =
  Tools extends Record<string, Tool.Any>
    ? { readonly [Name in keyof Tools]: Tools[Name] }
    : Tools extends ReadonlyArray<Tool.Any>
      ? { readonly [Tool in Tools[number] as Tool["name"]]: Tool }
      : never;

/**
 * A utility type that maps tool names to their required handler functions.
 *
 * **Details**
 *
 * Handlers can return either the tool's custom failure type, an `AiErrorReason`
 * (which will be wrapped in `AiError`), or a full `AiError`.
 *
 * @category type-level
 * @since 0.0.0
 */
export type HandlersFrom<Tools extends Record<string, Tool.Any>> = {
  readonly [Name in keyof Tools as Tool.RequiresHandler<Tools[Name]> extends true ? Name : never]: (
    params: Tool.Parameters<Tools[Name]>,
    context: HandlerContext<Tools[Name]>
  ) => Effect.Effect<
    Tool.Success<Tools[Name]>,
    Tool.Failure<Tools[Name]> | AiError.AiError | AiError.AiErrorReason,
    Tool.HandlerServices<Tools[Name]>
  >;
};

/**
 * A toolkit instance with registered handlers ready for tool execution.
 *
 * @category models
 * @since 0.0.0
 */
export interface WithHandler<in out Tools extends Record<string, Tool.Any>> {
  /**
   * The tools available in this toolkit instance.
   */
  readonly tools: Tools;

  /**
   * Executes a tool call by name.
   *
   * **Details**
   *
   * Validates the input parameters, executes the corresponding handler, and
   * streams back both the typed result and encoded result. Streaming allows
   * handlers to emit preliminary results before completion.
   */
  readonly handle: <Name extends keyof Tools>(
    /**
     * The name of the tool to execute.
     */
    name: Name,
    /**
     * Parameters to pass to the tool handler.
     */
    params: Tool.Parameters<Tools[Name]>
  ) => Effect.Effect<
    Stream.Stream<Tool.HandlerResult<Tools[Name]>, Tool.HandlerError<Tools[Name]>, Tool.HandlerServices<Tools[Name]>>,
    AiError.AiError
  >;
}

/**
 * A utility type which can be used to extract the tools from a toolkit with
 * handlers.
 *
 * @category type-level
 * @since 0.0.0
 */
export type WithHandlerTools<T> = T extends WithHandler<infer Tools> ? Tools : never;

const Proto = {
  ...Effectable.Prototype({
    label: "Toolkit",
    evaluate: Effect.fnUntraced(function* (this: Toolkit<Record<string, Tool.Any>>, parent) {
      const tools = this.tools;
      const services = parent.context;
      const schemasCache = new WeakMap<
        any,
        {
          readonly context: Context.Context<never>;
          readonly handler: Tool.Handler<string>["handler"];
          readonly decodeParameters: (u: unknown) => Effect.Effect<unknown, S.SchemaError>;
          readonly decodeResult: (u: unknown) => Effect.Effect<unknown, S.SchemaError>;
          readonly encodeResult: (u: unknown) => Effect.Effect<unknown, S.SchemaError>;
        }
      >();

      const getSchemas = (tool: Tool.Any) => {
        let schemas = schemasCache.get(tool);
        if (P.isUndefined(schemas)) {
          const handler = services.mapUnsafe.get(tool.id)! as Tool.Handler<string>;
          const resultSchema =
            tool.failureMode === "return"
              ? S.Union([tool.successSchema, tool.failureSchema, AiError.AiError])
              : tool.successSchema;
          const decodeParameters = S.isSchema(tool.parametersSchema)
            ? (S.decodeUnknownEffect(tool.parametersSchema) as any)
            : (u: unknown) => Effect.succeed(u);
          const decodeResult = S.decodeUnknownEffect(resultSchema) as any;
          const encodeResult = S.encodeUnknownEffect(resultSchema) as any;
          schemas = {
            context: handler.context,
            handler: handler.handler,
            decodeParameters,
            decodeResult,
            encodeResult,
          };
          schemasCache.set(tool, schemas);
        }
        return schemas;
      };

      const handle = Effect.fnUntraced(function* (name: string, params: unknown) {
        const tool = tools[name];

        yield* Effect.annotateCurrentSpan({
          tool: name,
          parameters: params,
        });

        // If the tool is not found, return an error
        if (P.isUndefined(tool)) {
          return yield* AiError.make({
            module: "Toolkit",
            method: `${name}.handle`,
            reason: AiError.ToolNotFoundError.make({
              toolName: name,
              availableTools: Struct.keys(tools),
            }),
          });
        }

        // Fetch cached schemas / handlers for the tool
        const schemas = getSchemas(tool);

        // Decode the tool call parameters which will be passed to the handler
        const decodedParams = yield* schemas.decodeParameters(params).pipe(
          Effect.mapError((cause) =>
            AiError.make({
              module: "Toolkit",
              method: `${name}.handle`,
              reason: AiError.ToolParameterValidationError.make({
                toolName: name,
                toolParams: params,
                description: cause.message,
              }),
            })
          )
        );

        // Setup the handler context
        const queue = yield* Queue.make<
          {
            readonly result: any;
            readonly isFailure: boolean;
            readonly preliminary: boolean;
          },
          AiError.AiError | AiError.AiErrorReason | Cause.Done
        >();
        const context: HandlerContext<any> = {
          preliminary: (result) =>
            Effect.asVoid(
              Queue.offer(queue, {
                result,
                isFailure: false,
                preliminary: true,
              })
            ),
        };

        const fiber = yield* schemas.handler(decodedParams, context).pipe(
          Effect.flatMap((result) => Queue.offer(queue, { result, isFailure: false, preliminary: false })),
          Effect.provideContext(schemas.context),
          Effect.matchCauseEffect({
            onFailure: (cause) => Queue.failCause(queue, cause),
            onSuccess: () => Queue.end(queue),
          }),
          Effect.forkChild
        );

        const encodeResult = (result: any) =>
          schemas.encodeResult(result).pipe(
            Effect.mapError((cause) =>
              AiError.make({
                module: "Toolkit",
                method: `${name}.handle`,
                reason: AiError.ToolResultEncodingError.make({
                  toolName: name,
                  toolResult: result,
                  description: cause.message,
                }),
              })
            )
          );

        const normalizeError = (error: unknown) => {
          // Schema errors indicate handler returned invalid data
          const normalizedError = S.isSchemaError(error)
            ? AiError.make({
                module: "Toolkit",
                method: `${name}.handle`,
                reason: AiError.InvalidToolResultError.make({
                  toolName: name,
                  description: `Tool handler returned invalid result: ${error.message}`,
                }),
              })
            : AiError.isAiErrorReason(error)
              ? AiError.make({
                  module: "Toolkit",
                  method: `${name}.handle`,
                  reason: error,
                })
              : error;
          return normalizedError;
        };

        return Stream.fromQueue(queue).pipe(
          // If the tool handler failed, check the tool's failure mode to
          // determine how the result should be returned to the end user
          Stream.catch((error) => {
            const normalizedError = normalizeError(error);
            return tool.failureMode === "error"
              ? Stream.fail(normalizedError)
              : Stream.succeed({ result: normalizedError, isFailure: true, preliminary: false });
          }),
          Stream.mapEffect(
            Effect.fnUntraced(function* (output) {
              const encodedResult = yield* encodeResult(output.result);
              return { ...output, encodedResult };
            })
          ),
          Stream.onEnd(Fiber.interrupt(fiber))
        ) satisfies Stream.Stream<Tool.HandlerResult<any>, any>;
      });

      return {
        tools,
        handle: handle as any,
      } satisfies WithHandler<Record<string, any>>;
    }),
  }),
  [TypeId]: TypeId,
  of: identity,
  toHandlers(
    this: Toolkit<Record<string, Tool.Any>>,
    build: Record<string, (params: any) => any> | Effect.Effect<Record<string, (params: any) => any>>
  ) {
    return Effect.gen({ self: this }, function* () {
      const services = yield* Effect.context<never>();
      const handlers = Effect.isEffect(build) ? yield* build : build;
      const context = new Map<string, unknown>();
      for (const [name, handler] of Struct.entries(handlers)) {
        const tool = this.tools[name]!;
        context.set(tool.id, { name, handler, context: services });
      }
      return Context.makeUnsafe(context);
    });
  },
  toLayer(
    this: Toolkit<Record<string, Tool.Any>>,
    build: Record<string, (params: any) => any> | Effect.Effect<Record<string, (params: any) => any>>
  ) {
    return Layer.effectContext(this.toHandlers(build));
  },
  toJSON(this: Toolkit<any>): unknown {
    return {
      _id: "effect/ai/Toolkit",
      tools: Array.from(Object.values(this.tools)).map((tool) => (tool as Tool.Any).name),
    };
  },
};

const makeProto = <Tools extends Record<string, Tool.Any>>(tools: Tools): Toolkit<Tools> =>
  Object.assign(() => {}, Proto, { tools }) as any;

const resolveInput = <Tools extends ReadonlyArray<Tool.Any>>(...tools: Tools): Record<string, Tools[number]> => {
  const output = {} as Record<string, Tools[number]>;
  for (const tool of tools) {
    output[tool.name] = tool;
  }
  return output;
};

/**
 * An empty toolkit with no tools.
 *
 * **When to use**
 *
 * Use when you need an empty starting point for building toolkits or a default
 * toolkit value that can be extended with `merge`.
 *
 * @category constructors
 * @since 0.0.0
 */
export const empty: Toolkit<{}> = makeProto({});

/**
 * Creates a new toolkit from the specified tools.
 *
 * **Details**
 *
 * This is the primary constructor for creating toolkits. It accepts multiple
 * tools and organizes them into a toolkit that can be provided to AI language
 * models.
 *
 * @example Creating a toolkit
 *
 * ```ts
 * import * as S from "effect/Schema"
 * import { Tool, Toolkit } from "effect/unstable/ai"
 *
 * const GetCurrentTime = Tool.make("GetCurrentTime", {
 *   description: "Get the current timestamp",
 *   success: S.Finite
 * })
 *
 * const GetWeather = Tool.make("get_weather", {
 *   description: "Get weather information",
 *   parameters: S.Struct({ location: S.String }),
 *   success: S.Struct({
 *     temperature: S.Finite,
 *     condition: S.String
 *   })
 * })
 *
 * const toolkit = Toolkit.make(GetCurrentTime, GetWeather)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const make = <Tools extends ReadonlyArray<Tool.Any>>(...tools: Tools): Toolkit<ToolsByName<Tools>> =>
  makeProto(resolveInput(...tools)) as any;

/**
 * A utility type which flattens a record type for improved IDE display.
 *
 * @category type-level
 * @since 0.0.0
 */
export type SimplifyRecord<T> = { [K in keyof T]: T[K] } & {};

/**
 * A utility type which merges a union of tool records into a single record.
 *
 * @category type-level
 * @since 0.0.0
 */
export type MergeRecords<U> = {
  readonly [K in Extract<U extends unknown ? keyof U : never, string>]: Extract<
    U extends Record<K, infer V> ? V : never,
    Tool.Any
  >;
};

/**
 * A utility type which merges the tools from multiple toolkits into a single
 * record.
 *
 * @category type-level
 * @since 0.0.0
 */
export type MergedTools<Toolkits extends ReadonlyArray<Any>> = SimplifyRecord<MergeRecords<Tools<Toolkits[number]>>>;

/**
 * Merges multiple toolkits into a single toolkit.
 *
 * **Details**
 *
 * Combines all tools from the provided toolkits into one unified toolkit.
 * If there are naming conflicts, tools from later toolkits will override
 * tools from earlier ones.
 *
 * @example Merging toolkits
 *
 * ```ts
 * import * as S from "effect/Schema"
 * import { Tool, Toolkit } from "effect/unstable/ai"
 *
 * const mathToolkit = Toolkit.make(
 *   Tool.make("add", { success: S.Finite }),
 *   Tool.make("subtract", { success: S.Finite })
 * )
 *
 * const utilityToolkit = Toolkit.make(
 *   Tool.make("get_time", { success: S.Finite }),
 *   Tool.make("get_weather", { success: S.String })
 * )
 *
 * const combined = Toolkit.merge(mathToolkit, utilityToolkit)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const merge = <const Toolkits extends ReadonlyArray<Any>>(
  /**
   * The toolkits to merge together.
   */
  ...toolkits: Toolkits
): Toolkit<MergedTools<Toolkits>> => {
  const tools = R.empty<string, any>();
  for (const toolkit of toolkits) {
    for (const [name, tool] of Struct.entries(toolkit.tools)) {
      tools[name] = tool;
    }
  }
  return makeProto(tools) as any;
};
