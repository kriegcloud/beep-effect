import { $AiSdkId } from "@beep/identity/packages";
import type { Effect, JsonSchema, SchemaAST } from "effect";
import { Function as F, Predicate as P, ServiceMap } from "effect";
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

type StructParametersInput = S.Struct.Fields | S.Struct<S.Struct.Fields>;

type NormalizedStructParametersSchema<ParametersSchema extends StructParametersInput> =
  ParametersSchema extends S.Struct<infer Fields extends S.Struct.Fields>
    ? S.Struct<Fields>
    : ParametersSchema extends S.Struct.Fields
      ? S.Struct<ParametersSchema>
      : never;

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
  readonly annotations: ServiceMap.ServiceMap<unknown>;

  addDependency<Identifier, Service>(
    tag: ServiceMap.Service<Identifier, Service>
  ): Tool<Name, Config, Identifier | Requirements>;

  setParameters<ParametersSchema extends StructParametersInput>(
    schema: ParametersSchema
  ): Tool<
    Name,
    {
      readonly parameters: NormalizedStructParametersSchema<ParametersSchema>;
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
  readonly handler: (params: unknown) => Effect.Effect<unknown, unknown, unknown>;
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
  handler: (params: unknown) => infer Result;
}
  ? Result extends Effect.Effect<unknown, unknown, infer R>
    ? R
    : never
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

type ToolConfigShape<
  Parameters extends AnyStructSchema,
  Success extends S.Top,
  Failure extends S.Top,
  Mode extends FailureMode,
> = {
  readonly parameters: Parameters;
  readonly success: Success;
  readonly failure: Failure;
  readonly failureMode: Mode;
};

type ToolOptions<
  Name extends string,
  Parameters extends AnyStructSchema,
  Success extends S.Top,
  Failure extends S.Top,
  Mode extends FailureMode,
> = {
  readonly name: Name;
  readonly description?: string | undefined;
  readonly parametersSchema: Parameters;
  readonly successSchema: Success;
  readonly failureSchema: Failure;
  readonly failureMode: Mode;
  readonly annotations: ServiceMap.ServiceMap<unknown>;
};

const hasFieldsProperty = P.hasProperty("fields");

const isStructSchema = (schema: unknown): schema is S.Struct<S.Struct.Fields> => S.isSchema(schema) && hasFieldsProperty(schema);

function toStructSchema<Fields extends S.Struct.Fields>(schema: Fields): S.Struct<Fields>;
function toStructSchema<Schema extends S.Struct<S.Struct.Fields>>(schema: Schema): Schema;
function toStructSchema(schema: StructParametersInput) {
  if (isStructSchema(schema)) {
    return schema;
  }
  return S.Struct(schema);
}

function addDependency<
  Name extends string,
  Parameters extends AnyStructSchema,
  Success extends S.Top,
  Failure extends S.Top,
  Mode extends FailureMode,
  Requirements,
  Identifier,
  Service,
>(
  this: Tool<Name, ToolConfigShape<Parameters, Success, Failure, Mode>, Requirements>,
  _tag: ServiceMap.Service<Identifier, Service>
): Tool<Name, ToolConfigShape<Parameters, Success, Failure, Mode>, Identifier | Requirements> {
  return makeTool<Name, Parameters, Success, Failure, Mode, Identifier | Requirements>({
    name: this.name,
    description: this.description,
    parametersSchema: this.parametersSchema,
    successSchema: this.successSchema,
    failureSchema: this.failureSchema,
    failureMode: this.failureMode,
    annotations: this.annotations,
  });
}

function annotate<
  Name extends string,
  Parameters extends AnyStructSchema,
  Success extends S.Top,
  Failure extends S.Top,
  Mode extends FailureMode,
  Requirements,
  Identifier,
  Service,
>(
  this: Tool<Name, ToolConfigShape<Parameters, Success, Failure, Mode>, Requirements>,
  tag: ServiceMap.Service<Identifier, Service> | ServiceMap.Reference<Service>,
  value: Service
): Tool<Name, ToolConfigShape<Parameters, Success, Failure, Mode>, Requirements> {
  const annotations = ServiceMap.isReference(tag)
    ? ServiceMap.add(this.annotations, tag, value)
    : ServiceMap.add(this.annotations, tag, value);

  return makeTool<Name, Parameters, Success, Failure, Mode, Requirements>({
    name: this.name,
    description: this.description,
    parametersSchema: this.parametersSchema,
    successSchema: this.successSchema,
    failureSchema: this.failureSchema,
    failureMode: this.failureMode,
    annotations,
  });
}

function setParameters<
  Name extends string,
  Parameters extends AnyStructSchema,
  Success extends S.Top,
  Failure extends S.Top,
  Mode extends FailureMode,
  Requirements,
  NextParametersSchema extends StructParametersInput,
>(
  this: Tool<Name, ToolConfigShape<Parameters, Success, Failure, Mode>, Requirements>,
  schema: NextParametersSchema
): Tool<
  Name,
  ToolConfigShape<NormalizedStructParametersSchema<NextParametersSchema>, Success, Failure, Mode>,
  Requirements
> {
  const parametersSchema = toStructSchema(schema);

  return makeTool<
    Name,
    NormalizedStructParametersSchema<NextParametersSchema>,
    Success,
    Failure,
    Mode,
    Requirements
  >({
    name: this.name,
    description: this.description,
    parametersSchema,
    successSchema: this.successSchema,
    failureSchema: this.failureSchema,
    failureMode: this.failureMode,
    annotations: this.annotations,
  });
}

function setSuccess<
  Name extends string,
  Parameters extends AnyStructSchema,
  Success extends S.Top,
  Failure extends S.Top,
  Mode extends FailureMode,
  Requirements,
  NextSuccessSchema extends S.Top,
>(
  this: Tool<Name, ToolConfigShape<Parameters, Success, Failure, Mode>, Requirements>,
  schema: NextSuccessSchema
): Tool<
  Name,
  ToolConfigShape<Parameters, NextSuccessSchema, Failure, Mode>,
  Requirements
> {
  return makeTool<Name, Parameters, NextSuccessSchema, Failure, Mode, Requirements>({
    name: this.name,
    description: this.description,
    parametersSchema: this.parametersSchema,
    successSchema: schema,
    failureSchema: this.failureSchema,
    failureMode: this.failureMode,
    annotations: this.annotations,
  });
}

function setFailure<
  Name extends string,
  Parameters extends AnyStructSchema,
  Success extends S.Top,
  Failure extends S.Top,
  Mode extends FailureMode,
  Requirements,
  NextFailureSchema extends S.Top,
>(
  this: Tool<Name, ToolConfigShape<Parameters, Success, Failure, Mode>, Requirements>,
  schema: NextFailureSchema
): Tool<
  Name,
  ToolConfigShape<Parameters, Success, NextFailureSchema, Mode>,
  Requirements
> {
  return makeTool<Name, Parameters, Success, NextFailureSchema, Mode, Requirements>({
    name: this.name,
    description: this.description,
    parametersSchema: this.parametersSchema,
    successSchema: this.successSchema,
    failureSchema: schema,
    failureMode: this.failureMode,
    annotations: this.annotations,
  });
}

const makeTool = <
  Name extends string,
  Parameters extends AnyStructSchema,
  Success extends S.Top,
  Failure extends S.Top,
  Mode extends FailureMode,
  Requirements = never,
>(
  options: ToolOptions<Name, Parameters, Success, Failure, Mode>
): Tool<Name, ToolConfigShape<Parameters, Success, Failure, Mode>, Requirements> => ({
  id: `${toolIdentity.string()}/${options.name}`,
  name: options.name,
  description: options.description,
  failureMode: options.failureMode,
  parametersSchema: options.parametersSchema,
  successSchema: options.successSchema,
  failureSchema: options.failureSchema,
  annotations: options.annotations,
  addDependency,
  annotate,
  setParameters,
  setSuccess,
  setFailure,
});

const constEmptyStruct = S.Struct({});

function resolveFailureMode<Mode extends FailureMode | undefined>(
  mode: Mode
): Mode extends undefined ? "error" : Mode;
function resolveFailureMode(mode: FailureMode | undefined): FailureMode {
  return mode ?? "error";
}

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
  const failureMode = resolveFailureMode(options?.failureMode);
  return makeTool({
    name,
    description: options?.description,
    parametersSchema: options?.parameters ? S.Struct(options.parameters) : constEmptyStruct,
    successSchema,
    failureSchema,
    failureMode,
    annotations: ServiceMap.empty(),
  });
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
> => {
  const failureMode = resolveFailureMode(options.failureMode);
  return makeTool({
    name,
    description: options.description,
    parametersSchema: options.parameters,
    successSchema: options.success ?? S.Void,
    failureSchema: options.failure ?? S.Never,
    failureMode,
    annotations: ServiceMap.empty(),
  });
};

const attachHandler = <
  Name extends string,
  Config extends {
    readonly parameters: AnyStructSchema;
    readonly success: S.Top;
    readonly failure: S.Top;
    readonly failureMode: FailureMode;
  },
  Requirements,
>(
  tool: Tool<Name, Config, Requirements>,
  handler: (params: S.Schema.Type<Config["parameters"]>) => Effect.Effect<
    S.Schema.Type<Config["success"]>,
    S.Schema.Type<Config["failure"]>,
    Requirements
  >
): ToolWithHandler<Name, Config, Requirements> => ({
  ...tool,
  handler,
});

/**
 * Define a tool alongside its handler in a single expression.
 */
/**
 * @since 0.0.0
 */
export function define<
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
export function define<
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
export function define(
  name: string,
  options: Definition
): ToolWithHandler<
  string,
  {
    readonly parameters: AnyStructSchema;
    readonly success: S.Top;
    readonly failure: S.Top;
    readonly failureMode: FailureMode;
  },
  unknown
> {
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
          parameters: parameters === undefined || S.isSchema(parameters) ? undefined : parameters,
          success: options.success,
          failure: options.failure,
          failureMode: options.failureMode,
        });
  return attachHandler(tool, options.handler);
}

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
