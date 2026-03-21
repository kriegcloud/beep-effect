import { createSdkMcpServer as sdkCreateSdkMcpServer, tool as sdkTool } from "@anthropic-ai/claude-agent-sdk";
import { Effect, type Scope } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import type { ZodRawShape, z } from "zod";
import { McpError } from "../Errors.js";
import { schemaToZodObject } from "../internal/schemaToZod.js";
import type * as Tool from "../Tools/Tool.js";
import type * as Toolkit from "../Tools/Toolkit.js";

/**
 * @since 0.0.0
 * @category Integration
 */
export type ToolNameValidation = Readonly<{
  readonly isValid: boolean;
  readonly warnings: ReadonlyArray<string>;
}>;

const TOOL_NAME_REGEX = /^[A-Za-z0-9._-]{1,128}$/;

/**
 * Validate an MCP tool name against the naming guidelines.
 */
/**
 * @since 0.0.0
 * @category Integration
 */
export const validateToolName = (name: string): ToolNameValidation => {
  const warnings: Array<string> = [];
  if (name.length === 0) {
    return {
      isValid: false,
      warnings: ["Tool name cannot be empty"],
    };
  }
  if (name.length > 128) {
    return {
      isValid: false,
      warnings: [`Tool name exceeds maximum length of 128 characters (current: ${name.length})`],
    };
  }
  if (name.includes(" ")) {
    warnings.push("Tool name contains spaces, which may cause parsing issues");
  }
  if (name.includes(",")) {
    warnings.push("Tool name contains commas, which may cause parsing issues");
  }
  if (name.startsWith("-") || name.endsWith("-")) {
    warnings.push("Tool name starts or ends with a dash, which may cause parsing issues in some contexts");
  }
  if (name.startsWith(".") || name.endsWith(".")) {
    warnings.push("Tool name starts or ends with a dot, which may cause parsing issues in some contexts");
  }
  if (!TOOL_NAME_REGEX.test(name)) {
    const invalidChars = name
      .split("")
      .filter((char) => !/[A-Za-z0-9._-]/.test(char))
      .filter((char, index, arr) => arr.indexOf(char) === index);
    warnings.push(
      `Tool name contains invalid characters: ${invalidChars.map((char) => `"${char}"`).join(", ")}`,
      "Allowed characters are: A-Z, a-z, 0-9, underscore (_), dash (-), and dot (.)"
    );
    return {
      isValid: false,
      warnings,
    };
  }
  return {
    isValid: true,
    warnings,
  };
};

/**
 * Log warnings for tool names that may cause MCP compatibility issues.
 */
/**
 * @since 0.0.0
 * @category Integration
 */
export const warnOnInvalidToolName = (name: string) => {
  const result = validateToolName(name);
  if (result.warnings.length > 0) {
    console.warn(`Tool name validation warning for "${name}":`);
    for (const warning of result.warnings) {
      console.warn(`  - ${warning}`);
    }
    console.warn("Tool registration will proceed, but this may cause compatibility issues.");
    console.warn("Consider updating the tool name to conform to the MCP tool naming standard.");
  }
  return result;
};

/**
 * Context passed to MCP tool handlers.
 */
/**
 * @since 0.0.0
 * @category Integration
 */
export type McpToolContext = {
  readonly signal: AbortSignal | undefined;
  readonly extra: unknown;
};

type SdkCallToolResult = Awaited<ReturnType<Parameters<typeof sdkTool>[3]>>;
type SdkToolInputSchema = Parameters<typeof sdkTool>[2];

/**
 * Effectful MCP tool handler.
 */
/**
 * @since 0.0.0
 * @category Integration
 */
export type McpToolHandler<Parameters, R, E> = (
  params: Parameters,
  context: McpToolContext
) => Effect.Effect<SdkCallToolResult, E, R>;

/**
 * @since 0.0.0
 * @category Integration
 */
export type McpToolInputSchema = ZodRawShape | z.ZodTypeAny;

/**
 * Options for building an MCP tool from an Effect handler.
 */
/**
 * @since 0.0.0
 * @category Integration
 */
export type McpToolOptions<ParametersSchema extends S.Top & { readonly DecodingServices: never }, R, E> = {
  readonly name: string;
  readonly description: string;
  readonly parameters: ParametersSchema;
  readonly handler: McpToolHandler<ParametersSchema["Type"], R, E>;
  readonly inputSchema?: McpToolInputSchema;
};

/**
 * @since 0.0.0
 * @category Integration
 */
export type ToolResultRenderer = (tool: Tool.Any, result: Tool.HandlerResult<Tool.Any>) => SdkCallToolResult;

/**
 * @since 0.0.0
 * @category Integration
 */
export type ToolErrorRenderer = (tool: Tool.Any, error: unknown) => SdkCallToolResult;

/**
 * Optional overrides for building MCP tools from a toolkit.
 */
/**
 * @since 0.0.0
 * @category Integration
 */
export type ToolkitMcpOptions = Readonly<{
  readonly inputSchema?: Record<string, McpToolInputSchema>;
  readonly renderResult?: ToolResultRenderer;
  readonly renderError?: ToolErrorRenderer;
}>;

const getSignalFromExtra = (extra: unknown): AbortSignal | undefined => {
  const isAbortSignal = (value: unknown): value is AbortSignal =>
    P.isObject(value) &&
    "aborted" in value &&
    P.isBoolean(value.aborted) &&
    "addEventListener" in value &&
    P.isFunction(value.addEventListener) &&
    "removeEventListener" in value &&
    P.isFunction(value.removeEventListener);

  if (!P.isObject(extra)) return undefined;
  const signal = "signal" in extra ? extra.signal : undefined;
  if (!isAbortSignal(signal)) return undefined;
  return signal;
};

const stringifyValue = (value: unknown): string => {
  if (P.isString(value)) return value;
  const encoded = S.encodeUnknownOption(S.UnknownFromJsonString)(value);
  return O.getOrElse(encoded, () => String(value));
};

const readField = (value: unknown, field: string): unknown =>
  P.isObject(value) ? Reflect.get(value, field) : undefined;

const isZodSchema = (value: unknown): value is z.ZodTypeAny =>
  P.isObject(value) &&
  ("_def" in value ||
    "_zod" in value ||
    (() => {
      const safeParse = readField(value, "safeParse");
      return P.isFunction(safeParse);
    })());

const isZodRawShapeCompat = (value: unknown): value is ZodRawShape => {
  if (!P.isObject(value)) return false;
  if (isZodSchema(value)) return false;
  const entries = A.map(R.toEntries(value), ([, entry]) => entry);
  if (entries.length === 0) return true;
  return entries.some((entry) => isZodSchema(entry));
};

const getZodRawShape = (schema: z.ZodTypeAny): ZodRawShape | undefined => {
  const directShape = readField(schema, "shape");
  if (P.isFunction(directShape)) {
    let produced: unknown = undefined;
    try {
      produced = directShape();
    } catch {
      produced = undefined;
    }
    if (isZodRawShapeCompat(produced)) return produced;
  } else if (isZodRawShapeCompat(directShape)) {
    return directShape;
  }
  const defShape = readField(readField(schema, "_def"), "shape");
  if (P.isFunction(defShape)) {
    let produced: unknown = undefined;
    try {
      produced = defShape();
    } catch {
      produced = undefined;
    }
    if (isZodRawShapeCompat(produced)) return produced;
  } else if (isZodRawShapeCompat(defShape)) {
    return defShape;
  }
  const zodDefShape = readField(readField(readField(schema, "_zod"), "def"), "shape");
  if (P.isFunction(zodDefShape)) {
    let produced: unknown = undefined;
    try {
      produced = zodDefShape();
    } catch {
      produced = undefined;
    }
    if (isZodRawShapeCompat(produced)) return produced;
  } else if (isZodRawShapeCompat(zodDefShape)) {
    return zodDefShape;
  }
  return undefined;
};

const normalizeMcpInputSchema = (
  toolName: string,
  schema?: McpToolInputSchema
): Effect.Effect<SdkToolInputSchema, McpError> => {
  if (schema === undefined) {
    return Effect.fail(
      McpError.make({
        message: `Missing MCP input schema for tool '${toolName}'`,
      })
    );
  }
  if (isZodRawShapeCompat(schema)) return Effect.succeed(schema);
  if (isZodSchema(schema)) {
    const rawShape = getZodRawShape(schema);
    if (rawShape !== undefined) return Effect.succeed(rawShape);
  }
  return Effect.fail(
    McpError.make({
      message: `Unsupported MCP input schema for tool '${toolName}'`,
    })
  );
};

const toStructuredContent = (value: unknown): Record<string, unknown> | undefined => {
  if (A.isArray(value)) return undefined;
  return O.getOrUndefined(S.decodeUnknownOption(S.Record(S.String, S.Unknown))(value));
};

/**
 * Convert a value into an MCP CallToolResult.
 */
/**
 * @since 0.0.0
 * @category Integration
 */
export const makeCallToolResult = (value: unknown, isError = false): SdkCallToolResult => {
  const structuredContent = toStructuredContent(value);
  const base: SdkCallToolResult = {
    isError,
    content: [
      {
        type: "text",
        text: stringifyValue(value),
      },
    ],
  };
  return structuredContent === undefined ? base : { ...base, structuredContent };
};

const defaultRenderResult: ToolResultRenderer = (_tool, result) =>
  makeCallToolResult(result.encodedResult, result.isFailure);

const defaultRenderError: ToolErrorRenderer = (_tool, error) => makeCallToolResult(error, true);

/**
 * Create a single MCP tool from an Effect handler and Schema parameters.
 */
/**
 * @since 0.0.0
 * @category Integration
 */
export const tool = <ParametersSchema extends S.Top & { readonly DecodingServices: never }, R, E>(
  options: McpToolOptions<ParametersSchema, R, E>
): Effect.Effect<ReturnType<typeof sdkTool>, McpError, R> =>
  Effect.gen(function* () {
    warnOnInvalidToolName(options.name);
    const services = yield* Effect.services<R>();
    const runWithServices = Effect.runPromiseWith(services);
    const inputSchema =
      options.inputSchema ??
      (yield* schemaToZodObject(options.parameters).pipe(
        Effect.mapError((cause) =>
          McpError.make({
            message: `Unsupported parameters schema for MCP tool '${options.name}'`,
            cause,
          })
        )
      ));
    const normalizedInputSchema = yield* normalizeMcpInputSchema(options.name, inputSchema);
    const decodeParams = S.decodeUnknownEffect(options.parameters);
    const handler = (args: unknown, extra: unknown) => {
      const signal = getSignalFromExtra(extra);
      const effect = decodeParams(args).pipe(
        Effect.mapError((cause) =>
          McpError.make({
            message: `Failed to decode arguments for MCP tool '${options.name}'`,
            cause,
          })
        ),
        Effect.flatMap((params) =>
          options.handler(params, { signal, extra }).pipe(
            Effect.mapError((cause) =>
              McpError.make({
                message: `MCP tool '${options.name}' handler failed`,
                cause,
              })
            )
          )
        )
      );
      const runOptions = signal === undefined ? undefined : { signal };
      return runWithServices(effect, runOptions);
    };
    return sdkTool(options.name, options.description, normalizedInputSchema, handler);
  });

/**
 * Convert a toolkit and handlers into MCP tools.
 */
/**
 * @since 0.0.0
 * @category Integration
 */
export const toolsFromToolkit = <Tools extends Record<string, Tool.Any>, EX = never, RX = never>(
  toolkit: Toolkit.Toolkit<Tools>,
  handlers: Toolkit.HandlersFrom<Tools> | Effect.Effect<Toolkit.HandlersFrom<Tools>, EX, RX>,
  options?: ToolkitMcpOptions
): Effect.Effect<
  ReadonlyArray<ReturnType<typeof sdkTool>>,
  McpError | EX,
  RX | Tool.Requirements<Tools[keyof Tools]>
> =>
  Effect.gen(function* () {
    const services = yield* Effect.services<RX | Tool.Requirements<Tools[keyof Tools]>>();
    const runWithServices = Effect.runPromiseWith(services);
    const context = yield* toolkit.toContext(handlers);
    const built = yield* toolkit.commit().pipe(Effect.provide(context), Effect.orDie);
    const renderResult = options?.renderResult ?? defaultRenderResult;
    const renderError = options?.renderError ?? defaultRenderError;
    const inputSchemas = options?.inputSchema;

    return yield* Effect.forEach(
      A.map(R.toEntries(built.tools), ([, tool]) => tool),
      (toolEntry) =>
        Effect.gen(function* () {
          warnOnInvalidToolName(toolEntry.name);
          const inputSchema =
            inputSchemas?.[toolEntry.name] ??
            (yield* schemaToZodObject(toolEntry.parametersSchema).pipe(
              Effect.mapError((cause) =>
                McpError.make({
                  message: `Unsupported parameters schema for MCP tool '${toolEntry.name}'`,
                  cause,
                })
              )
            ));
          const normalizedInputSchema = yield* normalizeMcpInputSchema(toolEntry.name, inputSchema);
          const handler = (args: unknown, extra: unknown) => {
            const signal = getSignalFromExtra(extra);
            const effect = built.handle(toolEntry.name, args).pipe(
              Effect.map((result) => renderResult(toolEntry, result)),
              Effect.catch((error) => Effect.succeed(renderError(toolEntry, error)))
            );
            const runOptions = signal === undefined ? undefined : { signal };
            return runWithServices(effect, runOptions);
          };
          return sdkTool(toolEntry.name, toolEntry.description ?? toolEntry.name, normalizedInputSchema, handler);
        })
    );
  });

/**
 * @since 0.0.0
 * @category Integration
 */
export type CreateSdkMcpServerOptions<R = never> = {
  readonly name: string;
  readonly version?: string;
  readonly tools?: ReadonlyArray<ReturnType<typeof sdkTool> | Effect.Effect<ReturnType<typeof sdkTool>, McpError, R>>;
};

/**
 * Create an MCP server using SDK tooling (optionally with Effect-built tools).
 */
/**
 * @since 0.0.0
 * @category Integration
 */
export const createSdkMcpServer: <R = never>(
  options: CreateSdkMcpServerOptions<R>
) => Effect.Effect<ReturnType<typeof sdkCreateSdkMcpServer>, McpError, R> = Effect.fn("Mcp.createSdkMcpServer")(
  function* <R>(options: CreateSdkMcpServerOptions<R>) {
    const tools =
      options.tools === undefined
        ? undefined
        : yield* Effect.forEach(options.tools, (entry) => (Effect.isEffect(entry) ? entry : Effect.succeed(entry)));
    const sdkOptions: Parameters<typeof sdkCreateSdkMcpServer>[0] = {
      name: options.name,
      ...(options.version !== undefined ? { version: options.version } : {}),
      ...(tools !== undefined ? { tools } : {}),
    };
    return yield* Effect.try({
      try: () => sdkCreateSdkMcpServer(sdkOptions),
      catch: (cause) =>
        McpError.make({
          message: "Failed to create SDK MCP server",
          cause,
        }),
    });
  }
);

const closeSdkMcpServer = (server: { readonly instance?: { close?: () => Promise<void> } }) =>
  Effect.tryPromise({
    try: async () => {
      if (server.instance?.close !== undefined) {
        await server.instance.close();
      }
    },
    catch: (cause) =>
      McpError.make({
        message: "Failed to close SDK MCP server",
        cause,
      }),
  }).pipe(Effect.ignore);

/**
 * Create an MCP server scoped to the current Effect scope.
 */
/**
 * @since 0.0.0
 * @category Integration
 */
export const createSdkMcpServerScoped: <R = never>(
  options: CreateSdkMcpServerOptions<R>
) => Effect.Effect<ReturnType<typeof sdkCreateSdkMcpServer>, McpError, R | Scope.Scope> = Effect.fn(
  "Mcp.createSdkMcpServerScoped"
)(function* <R>(options: CreateSdkMcpServerOptions<R>) {
  return yield* Effect.acquireRelease(createSdkMcpServer(options), closeSdkMcpServer);
});
