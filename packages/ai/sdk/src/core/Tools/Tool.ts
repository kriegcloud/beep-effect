import { $AiSdkId } from "@beep/identity/packages";
import type { Effect, JsonSchema, SchemaAST } from "effect";
import { Function as F, ServiceMap } from "effect";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/Tools/Tool");
const toolIdentity = $I.create("Tool");

/**
 * Controls how tool handler failures are represented.
 * - "error": fail the effect
 * - "return": encode failure as a normal result
 */
/**
 * @since 0.0.0
 */
export type FailureMode = "error" | "return";

/**
 * @since 0.0.0
 */
export type AnySchema = S.Top & {
  readonly DecodingServices: unknown;
  readonly EncodingServices: unknown;
};

/**
 * @since 0.0.0
 */
export type AnyStructSchema = AnySchema;

/**
 * Declarative tool definition used for SDK tool registration.
 */
/**
 * @since 0.0.0
 */
export interface Tool<
  Name extends string,
  Config extends {
    readonly parameters: AnyStructSchema;
    readonly success: AnySchema;
    readonly failure: AnySchema;
    readonly failureMode: FailureMode;
  },
  Requirements = never,
> extends Tool.Variance<Requirements> {
  addDependency(tag: ServiceMap.Service<unknown, unknown>): Tool<Name, Config, Requirements>;

  annotate<I, S>(tag: ServiceMap.Service<I, S> | ServiceMap.Reference<S>, value: S): Tool<Name, Config, Requirements>;
  readonly annotations: ServiceMap.ServiceMap<never>;
  readonly description?: string | undefined;
  readonly failureMode: FailureMode;
  readonly failureSchema: Config["failure"];
  readonly id: string;
  readonly name: Name;
  readonly parametersSchema: Config["parameters"];

  setFailure(schema: AnySchema): Tool<
    Name,
    {
      readonly parameters: Config["parameters"];
      readonly success: Config["success"];
      readonly failure: AnySchema;
      readonly failureMode: Config["failureMode"];
    },
    Requirements
  >;

  setParameters(schema: S.Struct<S.Struct.Fields> | S.Struct.Fields): Tool<
    Name,
    {
      readonly parameters: AnyStructSchema;
      readonly success: Config["success"];
      readonly failure: Config["failure"];
      readonly failureMode: Config["failureMode"];
    },
    Requirements
  >;

  setSuccess(schema: AnySchema): Tool<
    Name,
    {
      readonly parameters: Config["parameters"];
      readonly success: AnySchema;
      readonly failure: Config["failure"];
      readonly failureMode: Config["failureMode"];
    },
    Requirements
  >;
  readonly successSchema: Config["success"];
}

/**
 * @since 0.0.0
 */
export namespace Tool {
  /**
   * @since 0.0.0
   */
  export interface Variance<Requirements> {
    readonly _R?: (_: Requirements) => void;
  }
}

/**
 * @since 0.0.0
 */
export type Any = Tool<
  string,
  {
    readonly parameters: AnyStructSchema;
    readonly success: AnySchema;
    readonly failure: AnySchema;
    readonly failureMode: FailureMode;
  }
>;

/**
 * @since 0.0.0
 */
export type Name<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Name : never;

/**
 * @since 0.0.0
 */
export type Parameters<T> =
  T extends Tool<infer _Name, infer _Config, infer _Requirements> ? S.Schema.Type<_Config["parameters"]> : never;

/**
 * @since 0.0.0
 */
export type ParametersEncoded<T> =
  T extends Tool<infer _Name, infer _Config, infer _Requirements> ? S.Codec.Encoded<_Config["parameters"]> : never;

/**
 * @since 0.0.0
 */
export type ParametersSchema<T> =
  T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["parameters"] : never;

/**
 * @since 0.0.0
 */
export type Success<T> =
  T extends Tool<infer _Name, infer _Config, infer _Requirements> ? S.Schema.Type<_Config["success"]> : never;

/**
 * @since 0.0.0
 */
export type SuccessSchema<T> =
  T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["success"] : never;

/**
 * @since 0.0.0
 */
export type SuccessEncoded<T> =
  T extends Tool<infer _Name, infer _Config, infer _Requirements> ? S.Codec.Encoded<_Config["success"]> : never;

/**
 * @since 0.0.0
 */
export type Failure<T> =
  T extends Tool<infer _Name, infer _Config, infer _Requirements> ? S.Schema.Type<_Config["failure"]> : never;

/**
 * @since 0.0.0
 */
export type FailureSchema<T> =
  T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["failure"] : never;

/**
 * @since 0.0.0
 */
export type FailureEncoded<T> =
  T extends Tool<infer _Name, infer _Config, infer _Requirements> ? S.Codec.Encoded<_Config["failure"]> : never;

/**
 * @since 0.0.0
 */
export type FailureModeOf<T> =
  T extends Tool<infer _Name, infer _Config, infer _Requirements> ? _Config["failureMode"] : never;

/**
 * @since 0.0.0
 */
export type Handler<T> = (params: Parameters<T>) => Effect.Effect<Success<T>, Failure<T>, Requirements<T>>;

/**
 * @since 0.0.0
 */
export type Requirements<T> = T extends Tool<infer _Name, infer _Config, infer Requirements> ? Requirements : never;

/**
 * @since 0.0.0
 */
export type HandlerResult<T> = {
  readonly result: Success<T> | Failure<T>;
  readonly encodedResult: SuccessEncoded<T> | FailureEncoded<T>;
  readonly isFailure: boolean;
};

/**
 * @since 0.0.0
 */
export type RequiresHandler<T> = T extends Tool<infer _Name, infer _Config, infer _Requirements> ? true : never;

/**
 * @since 0.0.0
 */
export type HandlerFor<T> =
  T extends Tool<infer _Name, infer _Config, infer Requirements>
    ? (params: Parameters<T>) => Effect.Effect<Success<T>, Failure<T>, Requirements>
    : never;

/**
 * @since 0.0.0
 */
export type HandlersFor<Tools extends Record<string, Any>> = {
  readonly [Name in keyof Tools as RequiresHandler<Tools[Name]> extends true ? Name : never]: (
    params: Parameters<Tools[Name]>
  ) => Effect.Effect<Success<Tools[Name]>, Failure<Tools[Name]>, Requirements<Tools[Name]>>;
};

/**
 * @since 0.0.0
 */
export type ToolWithHandler<
  Name extends string,
  Config extends {
    readonly parameters: AnyStructSchema;
    readonly success: AnySchema;
    readonly failure: AnySchema;
    readonly failureMode: FailureMode;
  },
  Requirements = never,
> = Tool<Name, Config, Requirements> & {
  readonly handler: HandlerFor<Tool<Name, Config, Requirements>>;
};

/**
 * @since 0.0.0
 */
export type DefinitionFields<
  Parameters extends S.Struct.Fields = {},
  Success extends AnySchema = typeof S.Void,
  Failure extends AnySchema = typeof S.Never,
  Mode extends FailureMode | undefined = undefined,
  R = never,
> = {
  readonly description?: string | undefined;
  readonly parameters?: Parameters | undefined;
  readonly success?: Success | undefined;
  readonly failure?: Failure | undefined;
  readonly failureMode?: Mode;
  readonly handler: (
    params: S.Schema.Type<S.Struct<Parameters>>
  ) => Effect.Effect<S.Schema.Type<Success>, S.Schema.Type<Failure>, R>;
};

/**
 * @since 0.0.0
 */
export type DefinitionSchema<
  Parameters extends AnyStructSchema,
  Success extends AnySchema = typeof S.Void,
  Failure extends AnySchema = typeof S.Never,
  Mode extends FailureMode | undefined = undefined,
  R = never,
> = {
  readonly description?: string | undefined;
  readonly parameters: Parameters;
  readonly success?: Success | undefined;
  readonly failure?: Failure | undefined;
  readonly failureMode?: Mode;
  readonly handler: (
    params: S.Schema.Type<Parameters>
  ) => Effect.Effect<S.Schema.Type<Success>, S.Schema.Type<Failure>, R>;
};

/**
 * @since 0.0.0
 */
export type Definition = {
  readonly description?: string | undefined;
  readonly parameters?: S.Struct.Fields | AnyStructSchema | undefined;
  readonly success?: AnySchema | undefined;
  readonly failure?: AnySchema | undefined;
  readonly failureMode?: FailureMode | undefined;
  readonly handler: (params: unknown) => Effect.Effect<unknown, unknown, never>;
};

type DefinitionParametersSchema<D> = D extends { parameters: infer P }
  ? P extends AnySchema
    ? P
    : P extends S.Struct.Fields
      ? S.Struct<P>
      : typeof constEmptyStruct
  : typeof constEmptyStruct;

type DefinitionSuccessSchema<D> = D extends { success: infer S }
  ? S extends AnySchema
    ? S
    : typeof S.Void
  : typeof S.Void;

type DefinitionFailureSchema<D> = D extends { failure: infer F }
  ? F extends AnySchema
    ? F
    : typeof S.Never
  : typeof S.Never;

type DefinitionFailureMode<D> = D extends { failureMode: infer M } ? (M extends FailureMode ? M : "error") : "error";

type DefinitionRequirements<D> = D extends {
  handler: (...args: ReadonlyArray<unknown>) => Effect.Effect<unknown, unknown, infer R>;
}
  ? R
  : never;

/**
 * @since 0.0.0
 */
export type ToolFromDefinition<Name extends string, Def> = ToolWithHandler<
  Name,
  {
    readonly parameters: DefinitionParametersSchema<Def>;
    readonly success: DefinitionSuccessSchema<Def>;
    readonly failure: DefinitionFailureSchema<Def>;
    readonly failureMode: DefinitionFailureMode<Def>;
  },
  DefinitionRequirements<Def>
>;

const Proto = {
  addDependency(this: Any) {
    return this;
  },
  annotate<I, S>(this: Any, _tag: ServiceMap.Service<I, S> | ServiceMap.Reference<S>, _value: S) {
    return makeTool({
      ...this,
      annotations: this.annotations,
    });
  },
  setParameters(this: Any, schema: S.Struct<S.Struct.Fields> | S.Struct.Fields) {
    if (isStructFields(schema)) {
      return makeTool({
        ...this,
        parametersSchema: S.Struct(schema),
      });
    }
    return makeTool({
      ...this,
      parametersSchema: schema,
    });
  },
  setSuccess(this: Any, schema: AnySchema) {
    return makeTool({
      ...this,
      successSchema: schema,
    });
  },
  setFailure(this: Any, schema: AnySchema) {
    return makeTool({
      ...this,
      failureSchema: schema,
    });
  },
};

const isStructFields = (schema: S.Struct<S.Struct.Fields> | S.Struct.Fields): schema is S.Struct.Fields =>
  !S.isSchema(schema);

const makeTool = <Name extends string>(options: {
  readonly name: Name;
  readonly description?: string | undefined;
  readonly parametersSchema: AnyStructSchema;
  readonly successSchema: AnySchema;
  readonly failureSchema: AnySchema;
  readonly failureMode: FailureMode;
  readonly annotations: ServiceMap.ServiceMap<never>;
}) => {
  return {
    ...Proto,
    ...options,
    id: `${toolIdentity.string()}/${options.name}`,
  };
};

const constEmptyStruct = S.Struct({});

/**
 * Create a tool with optional parameter, success, and failure schemas.
 */
/**
 * @since 0.0.0
 */
export const make = <const Name extends string>(
  name: Name,
  options?: {
    readonly description?: string | undefined;
    readonly parameters?: S.Struct.Fields | undefined;
    readonly success?: AnySchema | undefined;
    readonly failure?: AnySchema | undefined;
    readonly failureMode?: FailureMode | undefined;
  }
): Any => {
  const successSchema = options?.success ?? S.Void;
  const failureSchema = options?.failure ?? S.Never;
  return makeTool({
    name,
    description: options?.description,
    parametersSchema: options?.parameters ? S.Struct(options.parameters) : constEmptyStruct,
    successSchema,
    failureSchema,
    failureMode: options?.failureMode ?? "error",
    annotations: ServiceMap.empty(),
  });
};

/**
 * Create a tool using an existing parameter schema.
 */
/**
 * @since 0.0.0
 */
export const fromSchema = <const Name extends string>(
  name: Name,
  options: {
    readonly description?: string | undefined;
    readonly parameters: AnyStructSchema;
    readonly success?: AnySchema | undefined;
    readonly failure?: AnySchema | undefined;
    readonly failureMode?: FailureMode | undefined;
  }
): Any =>
  makeTool({
    name,
    description: options.description,
    parametersSchema: options.parameters,
    successSchema: options.success ?? S.Void,
    failureSchema: options.failure ?? S.Never,
    failureMode: options.failureMode ?? "error",
    annotations: ServiceMap.empty(),
  });

const attachHandler = (
  tool: Any,
  handler: (params: unknown) => Effect.Effect<unknown, unknown, never>
): ToolWithHandler<
  string,
  {
    readonly parameters: AnyStructSchema;
    readonly success: AnySchema;
    readonly failure: AnySchema;
    readonly failureMode: FailureMode;
  },
  never
> => ({
  ...tool,
  handler,
});

/**
 * Define a tool alongside its handler in a single expression.
 */
/**
 * @since 0.0.0
 */
export const define = (
  name: string,
  options: Definition
): ToolWithHandler<
  string,
  {
    readonly parameters: AnyStructSchema;
    readonly success: AnySchema;
    readonly failure: AnySchema;
    readonly failureMode: FailureMode;
  },
  never
> => {
  const parameters = options.parameters;
  const tool =
    parameters !== undefined && S.isSchema(parameters)
      ? fromSchema(name, {
          description: options.description,
          parameters,
          success: options.success,
          failure: options.failure,
          failureMode: options.failureMode,
        })
      : make(name, {
          description: options.description,
          parameters: parameters !== undefined && !S.isSchema(parameters) ? parameters : undefined,
          success: options.success,
          failure: options.failure,
          failureMode: options.failureMode,
        });
  return attachHandler(tool, options.handler);
};

/**
 * Define a tool by passing the handler as the last argument.
 */
/**
 * @since 0.0.0
 */
export const fn = <const Name extends string>(
  name: Name,
  options: Omit<Definition, "handler">,
  handler: Definition["handler"]
): ToolWithHandler<
  string,
  {
    readonly parameters: AnyStructSchema;
    readonly success: AnySchema;
    readonly failure: AnySchema;
    readonly failureMode: FailureMode;
  },
  never
> => define(name, { ...options, handler });

/**
 * Render tool parameters as JSON Schema (useful for MCP registration).
 */
/**
 * @since 0.0.0
 */
export const getJsonSchema = <
  Name extends string,
  Config extends {
    readonly parameters: AnyStructSchema;
    readonly success: AnySchema;
    readonly failure: AnySchema;
    readonly failureMode: FailureMode;
  },
>(
  tool: Tool<Name, Config>
): JsonSchema.JsonSchema => getJsonSchemaFromSchema(tool.parametersSchema);

const getJsonSchemaFromSchema = (schema: AnySchema): JsonSchema.JsonSchema => {
  const document = S.toJsonSchemaDocument(schema);
  if (R.keys(document.definitions).length === 0) {
    return document.schema;
  }
  return {
    ...document.schema,
    $defs: document.definitions,
  };
};

/**
 * @since 0.0.0
 */
export const getJsonSchemaFromSchemaAst = (ast: SchemaAST.AST): JsonSchema.JsonSchema =>
  getJsonSchemaFromSchema(S.make(ast));

/**
 * Optional title metadata for tools.
 */
/**
 * @since 0.0.0
 */
export const Title = ServiceMap.Service<string>($I`Title`);

/**
 * Indicates the tool is readonly (no side-effects).
 */
/**
 * @since 0.0.0
 */
export const Readonly = ServiceMap.Reference<boolean>($I`Readonly`, {
  defaultValue: F.constFalse,
});

/**
 * Indicates the tool is destructive (side-effects likely).
 */
/**
 * @since 0.0.0
 */
export const Destructive = ServiceMap.Reference<boolean>($I`Destructive`, {
  defaultValue: F.constTrue,
});

/**
 * Indicates the tool is idempotent for repeated calls.
 */
/**
 * @since 0.0.0
 */
export const Idempotent = ServiceMap.Reference<boolean>($I`Idempotent`, {
  defaultValue: F.constFalse,
});

/**
 * Indicates the tool can read or write beyond the repo (open-world).
 */
/**
 * @since 0.0.0
 */
export const OpenWorld = ServiceMap.Reference<boolean>($I`OpenWorld`, {
  defaultValue: F.constTrue,
});
