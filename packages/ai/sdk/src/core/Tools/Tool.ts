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
export type AnyStructSchema = S.Top;

/**
 * Declarative tool definition used for SDK tool registration.
 */
/**
 * @since 0.0.0
 */
export interface Tool<
  Name extends string,
  Config extends {
    readonly parameters: S.Top;
    readonly success: S.Top;
    readonly failure: S.Top;
    readonly failureMode: FailureMode;
  },
  Requirements = never,
> extends Tool.Variance<Requirements> {
  readonly id: string;
  readonly name: Name;
  readonly description?: string | undefined;
  readonly failureMode: FailureMode;
  readonly parametersSchema: Config["parameters"];
  readonly successSchema: Config["success"];
  readonly failureSchema: Config["failure"];
  readonly annotations: ServiceMap.ServiceMap<never>;

  addDependency<Identifier, Service>(
    tag: ServiceMap.Service<Identifier, Service>
  ): Tool<Name, Config, Identifier | Requirements>;

  setParameters<ParametersSchema extends S.Struct<any> | S.Struct.Fields>(
    schema: ParametersSchema
  ): Tool<
    Name,
    {
      readonly parameters: ParametersSchema extends S.Struct<infer _>
        ? ParametersSchema
        : ParametersSchema extends S.Struct.Fields
          ? S.Struct<ParametersSchema>
          : never;
      readonly success: Config["success"];
      readonly failure: Config["failure"];
      readonly failureMode: Config["failureMode"];
    },
    Requirements
  >;

  setSuccess<SuccessSchema extends S.Top>(
    schema: SuccessSchema
  ): Tool<
    Name,
    {
      readonly parameters: Config["parameters"];
      readonly success: SuccessSchema;
      readonly failure: Config["failure"];
      readonly failureMode: Config["failureMode"];
    },
    Requirements
  >;

  setFailure<FailureSchema extends S.Top>(
    schema: FailureSchema
  ): Tool<
    Name,
    {
      readonly parameters: Config["parameters"];
      readonly success: Config["success"];
      readonly failure: FailureSchema;
      readonly failureMode: Config["failureMode"];
    },
    Requirements
  >;

  annotate<I, S>(tag: ServiceMap.Service<I, S> | ServiceMap.Reference<S>, value: S): Tool<Name, Config, Requirements>;
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
    readonly success: S.Top;
    readonly failure: S.Top;
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
    readonly success: S.Top;
    readonly failure: S.Top;
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
  Success extends S.Top = typeof S.Void,
  Failure extends S.Top = typeof S.Never,
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
  Success extends S.Top = typeof S.Void,
  Failure extends S.Top = typeof S.Never,
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
  readonly success?: S.Top | undefined;
  readonly failure?: S.Top | undefined;
  readonly failureMode?: FailureMode | undefined;
  readonly handler: (params: any) => Effect.Effect<any, any, any>;
};

type DefinitionParametersSchema<D> = D extends { parameters: infer P }
  ? P extends S.Top
    ? P
    : P extends S.Struct.Fields
      ? S.Struct<P>
      : typeof constEmptyStruct
  : typeof constEmptyStruct;

type DefinitionSuccessSchema<D> = D extends { success: infer S }
  ? S extends S.Top
    ? S
    : typeof S.Void
  : typeof S.Void;

type DefinitionFailureSchema<D> = D extends { failure: infer F }
  ? F extends S.Top
    ? F
    : typeof S.Never
  : typeof S.Never;

type DefinitionFailureMode<D> = D extends { failureMode: infer M } ? (M extends FailureMode ? M : "error") : "error";

type DefinitionRequirements<D> = D extends {
  handler: (...args: any[]) => Effect.Effect<any, any, infer R>;
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
  annotate(this: Any, tag: ServiceMap.Service<any, any> | ServiceMap.Reference<any>, value: any) {
    return makeTool({
      ...this,
      annotations: ServiceMap.add(this.annotations, tag as any, value),
    });
  },
  setParameters(this: Any, schema: S.Struct<any> | S.Struct.Fields) {
    const parametersSchema: AnyStructSchema = S.isSchema(schema)
      ? (schema as AnyStructSchema)
      : S.Struct(schema as S.Struct.Fields);
    return makeTool({
      ...this,
      parametersSchema,
    });
  },
  setSuccess(this: Any, schema: S.Top) {
    return makeTool({
      ...this,
      successSchema: schema,
    });
  },
  setFailure(this: Any, schema: S.Top) {
    return makeTool({
      ...this,
      failureSchema: schema,
    });
  },
};

const makeTool = <Name extends string>(options: {
  readonly name: Name;
  readonly description?: string | undefined;
  readonly parametersSchema: AnyStructSchema;
  readonly successSchema: S.Top;
  readonly failureSchema: S.Top;
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
export const make = <
  const Name extends string,
  Parameters extends S.Struct.Fields = {},
  Success extends S.Top = typeof S.Void,
  Failure extends S.Top = typeof S.Never,
  Mode extends FailureMode | undefined = undefined,
>(
  name: Name,
  options?: {
    readonly description?: string | undefined;
    readonly parameters?: Parameters | undefined;
    readonly success?: Success | undefined;
    readonly failure?: Failure | undefined;
    readonly failureMode?: Mode;
  }
): Tool<
  Name,
  {
    readonly parameters: S.Struct<Parameters>;
    readonly success: Success;
    readonly failure: Failure;
    readonly failureMode: Mode extends undefined ? "error" : Mode;
  }
> => {
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
  }) as any;
};

/**
 * Create a tool using an existing parameter schema.
 */
/**
 * @since 0.0.0
 */
export const fromSchema = <
  const Name extends string,
  Parameters extends AnyStructSchema,
  Success extends S.Top = typeof S.Void,
  Failure extends S.Top = typeof S.Never,
  Mode extends FailureMode | undefined = undefined,
>(
  name: Name,
  options: {
    readonly description?: string | undefined;
    readonly parameters: Parameters;
    readonly success?: Success | undefined;
    readonly failure?: Failure | undefined;
    readonly failureMode?: Mode;
  }
): Tool<
  Name,
  {
    readonly parameters: Parameters;
    readonly success: Success;
    readonly failure: Failure;
    readonly failureMode: Mode extends undefined ? "error" : Mode;
  }
> =>
  makeTool({
    name,
    description: options.description,
    parametersSchema: options.parameters,
    successSchema: options.success ?? S.Void,
    failureSchema: options.failure ?? S.Never,
    failureMode: options.failureMode ?? "error",
    annotations: ServiceMap.empty(),
  }) as any;

const attachHandler = <T extends Any>(tool: T, handler: HandlerFor<T>) =>
  ({
    ...tool,
    handler,
  }) as unknown as ToolWithHandler<
    Name<T>,
    {
      readonly parameters: ParametersSchema<T>;
      readonly success: SuccessSchema<T>;
      readonly failure: FailureSchema<T>;
      readonly failureMode: FailureModeOf<T>;
    },
    Requirements<T>
  >;

/**
 * Define a tool alongside its handler in a single expression.
 */
/**
 * @since 0.0.0
 */
export const define: {
  <
    const Name extends string,
    Parameters extends S.Struct.Fields = {},
    Success extends S.Top = typeof S.Void,
    Failure extends S.Top = typeof S.Never,
    Mode extends FailureMode | undefined = undefined,
    R = never,
  >(
    name: Name,
    options: DefinitionFields<Parameters, Success, Failure, Mode, R>
  ): ToolWithHandler<
    Name,
    {
      readonly parameters: S.Struct<Parameters>;
      readonly success: Success;
      readonly failure: Failure;
      readonly failureMode: Mode extends undefined ? "error" : Mode;
    },
    R
  >;
  <
    const Name extends string,
    Parameters extends AnyStructSchema,
    Success extends S.Top = typeof S.Void,
    Failure extends S.Top = typeof S.Never,
    Mode extends FailureMode | undefined = undefined,
    R = never,
  >(
    name: Name,
    options: DefinitionSchema<Parameters, Success, Failure, Mode, R>
  ): ToolWithHandler<
    Name,
    {
      readonly parameters: Parameters;
      readonly success: Success;
      readonly failure: Failure;
      readonly failureMode: Mode extends undefined ? "error" : Mode;
    },
    R
  >;
} = (name: string, options: Definition) => {
  const parameters = "parameters" in options ? options.parameters : undefined;
  const tool =
    parameters && S.isSchema(parameters)
      ? fromSchema(name, {
          description: options.description,
          parameters: parameters as AnyStructSchema,
          success: options.success,
          failure: options.failure,
          failureMode: options.failureMode as FailureMode | undefined,
        })
      : make(name, {
          description: options.description,
          parameters: parameters as S.Struct.Fields | undefined,
          success: options.success,
          failure: options.failure,
          failureMode: options.failureMode as FailureMode | undefined,
        });
  return attachHandler(tool as Any, (options as Definition).handler as any) as any;
};

/**
 * Define a tool by passing the handler as the last argument.
 */
/**
 * @since 0.0.0
 */
export const fn = <
  const Name extends string,
  Parameters extends S.Struct.Fields = {},
  Success extends S.Top = typeof S.Void,
  Failure extends S.Top = typeof S.Never,
  Mode extends FailureMode | undefined = undefined,
  R = never,
>(
  name: Name,
  options: Omit<DefinitionFields<Parameters, Success, Failure, Mode, R>, "handler">,
  handler: DefinitionFields<Parameters, Success, Failure, Mode, R>["handler"]
): ToolWithHandler<
  Name,
  {
    readonly parameters: S.Struct<Parameters>;
    readonly success: Success;
    readonly failure: Failure;
    readonly failureMode: Mode extends undefined ? "error" : Mode;
  },
  R
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
    readonly success: S.Top;
    readonly failure: S.Top;
    readonly failureMode: FailureMode;
  },
>(
  tool: Tool<Name, Config>
): JsonSchema.JsonSchema => getJsonSchemaFromSchema(tool.parametersSchema);

const getJsonSchemaFromSchema = (schema: S.Top): JsonSchema.JsonSchema => {
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
