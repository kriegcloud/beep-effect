/**
 * The `Handler` module provides a typed way to describe effectful auth handlers
 * that can be shared between clients and identity runtimes.
 *
 * Use it to define public entry points for onboarding, multi-factor
 * verification, password resets, or any other authenticated workflow while
 * keeping validation and dependencies explicit.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 * import * as S from "effect/Schema"
 *
 * // Define a handler invoked when the user submits a one-time code
 * const VerifyMfaCode = Handler.make("VerifyMfaCode", {
 *   description: "Validates a one-time code during sign-in",
 *   parameters: {
 *     userId: S.String,
 *     code: S.String
 *   },
 *   success: S.Struct({
 *     sessionToken: S.String
 *   })
 * })
 * ```
 *
 * @since 1.0.0
 */
import type { UnsafeTypes } from "@beep/types";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as JsonSchema from "effect/JSONSchema";
import * as O from "effect/Option";
import type { Pipeable } from "effect/Pipeable";
import { pipeArguments } from "effect/Pipeable";
import * as Predicate from "effect/Predicate";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import type { Covariant } from "effect/Types";
import type * as IamError from "./IamError";
// =============================================================================
// Type Ids
// =============================================================================

/**
 * Unique identifier for user-defined handlers.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export const TypeId = "~@beep/iam-sdk/Handler";

/**
 * Type-level representation of the user-defined handler identifier.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export type TypeId = typeof TypeId;

/**
 * Unique identifier for provider-defined handlers.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export const ProviderDefinedTypeId = "~@beep/iam-sdk/Handler/ProviderDefined";

/**
 * Type-level representation of the provider-defined handler identifier.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export type ProviderDefinedTypeId = typeof ProviderDefinedTypeId;

// =============================================================================
// Models
// =============================================================================

/**
 * A user-defined handler that identity clients can call to perform an action.
 *
 * Handlers describe the contract between an auth surface (web, mobile, CLI) and
 * the runtime that fulfills the operation. Each handler declares schemas for
 * parameters, success results, and failure results to keep validation explicit.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 * import * as S from "effect/Schema"
 *
 * const StartPasswordReset = Handler.make("StartPasswordReset", {
 *   description: "Issues a reset token when a user asks to reset their password",
 *   parameters: {
 *     email: S.String
 *   },
 *   success: S.Struct({
 *     tokenId: S.String
 *   })
 * })
 * ```
 *
 * @since 1.0.0
 * @category Models
 */
export interface Handler<
  Name extends string,
  Config extends {
    readonly parameters: AnyStructSchema;
    readonly success: S.Schema.Any;
    readonly failure: S.Schema.All;
    readonly failureMode: FailureMode;
  },
  Requirements = never,
> extends Handler.Variance<Requirements> {
  /**
   * The handler identifier which is used to uniquely identify the handler.
   */
  readonly id: string;

  /**
   * The name of the handler.
   */
  readonly name: Name;

  /**
   * The optional description of the handler.
   */
  readonly description?: string | undefined;

  /**
   * The strategy used for handling errors returned from handler call implementation
   * execution.
   *
   * If set to `"error"` (the default), errors that occur during handler call
   * implementation execution will be returned in the error channel of the calling
   * effect.
   *
   * If set to `"return"`, errors that occur during handler call implementation execution
   * will be captured and returned as part of the handler call result.
   */
  readonly failureMode: FailureMode;

  /**
   * A `Schema` representing the parameters that a handler must be called with.
   */
  readonly parametersSchema: Config["parameters"];

  /**
   * A `Schema` representing the value that a handler must return when called if
   * the handler call is successful.
   */
  readonly successSchema: Config["success"];

  /**
   * A `Schema` representing the value that a handler must return when called if
   * it fails.
   */
  readonly failureSchema: Config["failure"];

  /**
   * A `Context` object containing handler annotations which can store metadata
   * about the handler.
   */
  readonly annotations: Context.Context<never>;

  /**
   * Adds a _request-level_ dependency which must be provided before the handler
   * call implementation can be executed.
   *
   * This can be useful when the auth client must supply per-request data (for
   * example, tenant context or trace metadata) rather than capturing it when the
   * handler implementation layer is created.
   */
  addDependency<Identifier, Service>(
    tag: Context.Tag<Identifier, Service>
  ): Handler<Name, Config, Identifier | Requirements>;

  /**
   * Set the schema to use to validate the result of a handler call when successful.
   */
  setParameters<ParametersSchema extends S.Struct<UnsafeTypes.UnsafeAny> | S.Struct.Fields>(
    schema: ParametersSchema
  ): Handler<
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

  /**
   * Set the schema to use to validate the result of a handler call when successful.
   */
  setSuccess<SuccessSchema extends S.Schema.Any>(
    schema: SuccessSchema
  ): Handler<
    Name,
    {
      readonly parameters: Config["parameters"];
      readonly success: SuccessSchema;
      readonly failure: Config["failure"];
      readonly failureMode: Config["failureMode"];
    },
    Requirements
  >;

  /**
   * Set the schema to use to validate the result of a handler call when it fails.
   */
  setFailure<FailureSchema extends S.Schema.Any>(
    schema: FailureSchema
  ): Handler<
    Name,
    {
      readonly parameters: Config["parameters"];
      readonly success: Config["success"];
      readonly failure: FailureSchema;
      readonly failureMode: Config["failureMode"];
    },
    Requirements
  >;

  /**
   * Add an annotation to the handler.
   */
  annotate<I, S>(tag: Context.Tag<I, S>, value: S): Handler<Name, Config, Requirements>;

  /**
   * Add many annotations to the handler.
   */
  annotateContext<I>(context: Context.Context<I>): Handler<Name, Config, Requirements>;
}

/**
 * A provider-defined handler wraps functionality that ships with an external
 * auth provider (for example, Better Auth hosted screens or third-party social
 * sign-in callbacks).
 *
 * These handlers are triggered by the provider and optionally require an
 * application-defined implementation to post-process the provider output.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 * import * as S from "effect/Schema"
 *
 * const HostedPasswordReset = Handler.providerDefined({
 *   id: "betterauth.reset_password",
 *   handlerSetName: "HostedPasswordReset",
 *   providerName: "reset_password",
 *   args: {
 *     redirectUri: S.String
 *   },
 *   success: S.Struct({
 *     status: S.Literal("redirected")
 *   })
 * })
 * ```
 *
 * @since 1.0.0
 * @category Models
 */
export interface ProviderDefined<
  Name extends string,
  Config extends {
    readonly args: AnyStructSchema;
    readonly parameters: AnyStructSchema;
    readonly success: S.Schema.Any;
    readonly failure: S.Schema.All;
    readonly failureMode: FailureMode;
  } = {
    readonly args: S.Struct<{}>;
    readonly parameters: S.Struct<{}>;
    readonly success: typeof S.Void;
    readonly failure: typeof S.Never;
    readonly failureMode: "error";
  },
  RequiresImplementation extends boolean = false,
> extends Handler<
      Name,
      {
        readonly parameters: Config["parameters"];
        readonly success: Config["success"];
        readonly failure: Config["failure"];
        readonly failureMode: Config["failureMode"];
      }
    >,
    Handler.ProviderDefinedProto {
  /**
   * The arguments passed to the provider-defined handler.
   */
  readonly args: Config["args"]["Encoded"];

  /**
   * A `Schema` representing the arguments provided by the end-user which will
   * be used to configure the behavior of the provider-defined handler.
   */
  readonly argsSchema: Config["args"];

  /**
   * Name of the handler as recognized by the external auth provider.
   */
  readonly providerName: string;

  /**
   * If set to `true`, this provider-defined handler requires a user-defined
   * implementation when converting the `HandlerSet` containing this handler
   * into a `Layer`.
   */
  readonly requiresImplementation: RequiresImplementation;
}

/**
 * The strategy used for handling errors returned from handler call implementation
 * execution.
 *
 * If set to `"error"` (the default), errors that occur during handler call implementation
 * execution will be returned in the error channel of the calling effect.
 *
 * If set to `"return"`, errors that occur during handler call implementation execution
 * will be captured and returned as part of the handler call result.
 *
 * @since 1.0.0
 * @category Models
 */
export type FailureMode = "error" | "return";

/**
 * @since 1.0.0
 */
export declare namespace Handler {
  /**
   * @since 1.0.0
   * @category Models
   */
  export interface Variance<out Requirements> extends Pipeable {
    readonly [TypeId]: VarianceStruct<Requirements>;
  }

  /**
   * @since 1.0.0
   * @category Models
   */
  export interface VarianceStruct<out Requirements> {
    readonly _Requirements: Covariant<Requirements>;
  }

  /**
   * @since 1.0.0
   * @category Models
   */
  export interface ProviderDefinedProto {
    readonly [ProviderDefinedTypeId]: ProviderDefinedTypeId;
  }
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a value is a user-defined handler.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 * import * as S from "effect/Schema"
 *
 * const SignInEmail = Handler.make("SignInEmail", {
 *   description: "Authenticates a user with email and password",
 *   parameters: {
 *     email: S.String,
 *     password: S.String
 *   },
 *   success: S.Struct({
 *     sessionToken: S.String
 *   })
 * })
 *
 * const HostedPasswordReset = Handler.providerDefined({
 *   id: "betterauth.reset_password",
 *   handlerSetName: "HostedPasswordReset",
 *   providerName: "reset_password",
 *   args: {
 *     redirectUri: S.String
 *   },
 *   success: S.Struct({
 *     status: S.Literal("redirected")
 *   })
 * })
 *
 * console.log(Handler.isUserDefined(SignInEmail))           // true
 * console.log(Handler.isUserDefined(HostedPasswordReset))   // false
 * ```
 *
 * @since 1.0.0
 * @category Guards
 */
export const isUserDefined = (u: unknown): u is Handler<string, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny> =>
  Predicate.hasProperty(u, TypeId) && !isProviderDefined(u);

/**
 * Type guard to check if a value is a provider-defined handler.
 *
 * @param u - The value to check
 * @returns `true` if the value is a provider-defined `Handler`, `false` otherwise
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 * import * as S from "effect/Schema"
 *
 * const SignInEmail = Handler.make("SignInEmail", {
 *   description: "Authenticates a user with email and password",
 *   parameters: {
 *     email: S.String,
 *     password: S.String
 *   },
 *   success: S.Struct({
 *     sessionToken: S.String
 *   })
 * })
 *
 * const HostedPasswordReset = Handler.providerDefined({
 *   id: "betterauth.reset_password",
 *   handlerSetName: "HostedPasswordReset",
 *   providerName: "reset_password",
 *   args: {
 *     redirectUri: S.String
 *   },
 *   success: S.Struct({
 *     status: S.Literal("redirected")
 *   })
 * })
 *
 * console.log(Handler.isProviderDefined(SignInEmail))           // false
 * console.log(Handler.isProviderDefined(HostedPasswordReset))   // true
 * ```
 *
 * @since 1.0.0
 * @category Guards
 */
export const isProviderDefined = (u: unknown): u is ProviderDefined<string, UnsafeTypes.UnsafeAny> =>
  Predicate.hasProperty(u, ProviderDefinedTypeId);

// =============================================================================
// Utility Types
// =============================================================================

/**
 * A type which represents any `Handler`.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export interface Any extends Pipeable {
  readonly [TypeId]: {
    readonly _Requirements: Covariant<UnsafeTypes.UnsafeAny>;
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | undefined;
  readonly parametersSchema: AnyStructSchema;
  readonly successSchema: S.Schema.Any;
  readonly failureSchema: S.Schema.All;
  readonly failureMode: FailureMode;
  readonly annotations: Context.Context<never>;
}

/**
 * A type which represents any provider-defined `Handler`.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export interface AnyProviderDefined extends Any {
  readonly args: UnsafeTypes.UnsafeAny;
  readonly argsSchema: AnyStructSchema;
  readonly requiresImplementation: boolean;
  readonly providerName: string;
  readonly decodeResult: (result: unknown) => Effect.Effect<UnsafeTypes.UnsafeAny, IamError.IamError>;
}

/**
 * @since 1.0.0
 * @category Utility Types
 */
export interface AnyStructSchema extends Pipeable {
  readonly [S.TypeId]: UnsafeTypes.UnsafeAny;
  readonly make: UnsafeTypes.UnsafeAny;
  readonly Type: UnsafeTypes.UnsafeAny;
  readonly Encoded: UnsafeTypes.UnsafeAny;
  readonly Context: UnsafeTypes.UnsafeAny;
  readonly ast: AST.AST;
  readonly fields: S.Struct.Fields;
  readonly annotations: UnsafeTypes.UnsafeAny;
}

/**
 * @since 1.0.0
 * @category Utility Types
 */
export interface AnyTaggedRequestSchema extends AnyStructSchema {
  readonly _tag: string;
  readonly success: S.Schema.Any;
  readonly failure: S.Schema.All;
}

/**
 * A utility type to convert a `S.TaggedRequest` into an `Handler`.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export interface FromTaggedRequest<S extends AnyTaggedRequestSchema>
  extends Handler<
    S["_tag"],
    {
      readonly parameters: S;
      readonly success: S["success"];
      readonly failure: S["failure"];
      readonly failureMode: "error";
    }
  > {}

/**
 * A utility type to extract the `Name` type from an `Handler`.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type Name<T> = T extends Handler<infer _Name, infer _Config, infer _Requirements> ? _Name : never;

/**
 * A utility type to extract the type of the handler call parameters.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type Parameters<T> = T extends Handler<infer _Name, infer _Config, infer _Requirements>
  ? S.Struct.Type<_Config["parameters"]["fields"]>
  : never;

/**
 * A utility type to extract the encoded type of the handler call parameters.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type ParametersEncoded<T> = T extends Handler<infer _Name, infer _Config, infer _Requirements>
  ? S.Schema.Encoded<_Config["parameters"]>
  : never;

/**
 * A utility type to extract the schema for the parameters which an `Handler`
 * must be called with.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type ParametersSchema<T> = T extends Handler<infer _Name, infer _Config, infer _Requirements>
  ? _Config["parameters"]
  : never;

/**
 * A utility type to extract the type of the handler call result when it succeeds.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type Success<T> = T extends Handler<infer _Name, infer _Config, infer _Requirements>
  ? S.Schema.Type<_Config["success"]>
  : never;

/**
 * A utility type to extract the encoded type of the handler call result when
 * it succeeds.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type SuccessEncoded<T> = T extends Handler<infer _Name, infer _Config, infer _Requirements>
  ? S.Schema.Encoded<_Config["success"]>
  : never;

/**
 * A utility type to extract the schema for the return type of a handler call when
 * the handler call succeeds.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type SuccessSchema<T> = T extends Handler<infer _Name, infer _Config, infer _Requirements>
  ? _Config["success"]
  : never;

/**
 * A utility type to extract the type of the handler call result when it fails.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type Failure<T> = T extends Handler<infer _Name, infer _Config, infer _Requirements>
  ? S.Schema.Type<_Config["failure"]>
  : never;

/**
 * A utility type to extract the encoded type of the handler call result when
 * it fails.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type FailureEncoded<T> = T extends Handler<infer _Name, infer _Config, infer _Requirements>
  ? S.Schema.Encoded<_Config["failure"]>
  : never;

/**
 * A utility type to extract the type of the handler call result whether it
 * succeeds or fails.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type Result<T> = T extends Handler<infer _Name, infer _Config, infer _Requirements>
  ? Success<T> | Failure<T>
  : never;

/**
 * A utility type to extract the encoded type of the handler call result whether
 * it succeeds or fails.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type ResultEncoded<T> = T extends Handler<infer _Name, infer _Config, infer _Requirements>
  ? SuccessEncoded<T> | FailureEncoded<T>
  : never;

/**
 * A utility type to extract the requirements of an `Handler`.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type Requirements<T> = T extends Handler<infer _Name, infer _Config, infer _Requirements>
  ? _Config["parameters"]["Context"] | _Config["success"]["Context"] | _Config["failure"]["Context"] | _Requirements
  : never;

/**
 * Represents an `Handler` that has been implemented within the application.
 *
 * @since 1.0.0
 * @category Models
 */
export interface Implementation<Name extends string> {
  readonly _: unique symbol;
  readonly name: Name;
  readonly context: Context.Context<never>;
  readonly implementation: (
    params: UnsafeTypes.UnsafeAny
  ) => Effect.Effect<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>;
}

/**
 * Represents the result of calling the implementation for a particular `Handler`.
 *
 * @since 1.0.0
 * @category Models
 */
export interface ImplementationResult<Handler extends Any> {
  /**
   * Whether the result of executing the handler call implementation was an error or not.
   */
  readonly isFailure: boolean;
  /**
   * The result of executing the implementation for a particular handler.
   */
  readonly result: Result<Handler>;
  /**
   * The pre-encoded handler call result of executing the implementation for a particular
   * handler as a JSON-serializable value. The encoded result can be forwarded to
   * clients, stored for auditing, or chained into subsequent handler calls.
   */
  readonly encodedResult: unknown;
}

/**
 * A utility type which represents the possible errors that can be raised by
 * a handler call's implementation.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type ImplementationError<T> = T extends Handler<infer _Name, infer _Config, infer _Requirements>
  ? _Config["failureMode"] extends "error"
    ? _Config["failure"]["Type"]
    : never
  : never;

/**
 * A utility type to create a union of `Implementation` types for all handlers in a
 * record.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type ImplementationsFor<Handlers extends Record<string, Any>> = {
  [Name in keyof Handlers]: RequiresImplementation<Handlers[Name]> extends true
    ? Implementation<Handlers[Name]["name"]>
    : never;
}[keyof Handlers];

/**
 * A utility type to determine if the specified handler requires a user-defined
 * implementation to be implemented.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type RequiresImplementation<Handler extends Any> = Handler extends ProviderDefined<
  infer _Name,
  infer _Config,
  infer _RequiresImplementation
>
  ? _RequiresImplementation
  : true;

// =============================================================================
// Constructors
// =============================================================================

const Proto = {
  [TypeId]: { _Requirements: F.identity },
  pipe() {
    return pipeArguments(this, arguments);
  },
  addDependency(this: Any) {
    return userDefinedProto({ ...this });
  },
  setParameters(this: Any, parametersSchema: S.Struct<UnsafeTypes.UnsafeAny> | S.Struct.Fields) {
    return userDefinedProto({
      ...this,
      parametersSchema: S.isSchema(parametersSchema)
        ? (parametersSchema as UnsafeTypes.UnsafeAny)
        : S.Struct(parametersSchema as UnsafeTypes.UnsafeAny),
    });
  },
  setSuccess(this: Any, successSchema: S.Schema.Any) {
    return userDefinedProto({
      ...this,
      successSchema,
    });
  },
  setFailure(this: Any, failureSchema: S.Schema.All) {
    return userDefinedProto({
      ...this,
      failureSchema,
    });
  },
  annotate<I, S>(this: Any, tag: Context.Tag<I, S>, value: S) {
    return userDefinedProto({
      ...this,
      annotations: Context.add(this.annotations, tag, value),
    });
  },
  annotateContext<I>(this: Any, context: Context.Context<I>) {
    return userDefinedProto({
      ...this,
      annotations: Context.merge(this.annotations, context),
    });
  },
};

const ProviderDefinedProto = {
  ...Proto,
  [ProviderDefinedTypeId]: ProviderDefinedTypeId,
};

const userDefinedProto = <
  const Name extends string,
  Parameters extends AnyStructSchema,
  Success extends S.Schema.Any,
  Failure extends S.Schema.All,
  Mode extends FailureMode,
>(options: {
  readonly name: Name;
  readonly description?: string | undefined;
  readonly parametersSchema: Parameters;
  readonly successSchema: Success;
  readonly failureSchema: Failure;
  readonly annotations: Context.Context<never>;
  readonly failureMode: Mode;
}): Handler<
  Name,
  {
    readonly parameters: Parameters;
    readonly success: Success;
    readonly failure: Failure;
    readonly failureMode: Mode;
  }
> => {
  const self = Object.assign(Object.create(Proto), options);
  self.id = `@beep/iam-sdk/Handler/${options.name}`;
  return self;
};

const providerDefinedProto = <
  const Name extends string,
  Args extends AnyStructSchema,
  Parameters extends AnyStructSchema,
  Success extends S.Schema.Any,
  Failure extends S.Schema.All,
  RequiresImplementation extends boolean,
  Mode extends FailureMode,
>(options: {
  readonly id: string;
  readonly name: Name;
  readonly providerName: string;
  readonly args: Args["Encoded"];
  readonly argsSchema: Args;
  readonly requiresImplementation: RequiresImplementation;
  readonly parametersSchema: Parameters;
  readonly successSchema: Success;
  readonly failureSchema: Failure;
  readonly failureMode: FailureMode;
}): ProviderDefined<
  Name,
  {
    readonly args: Args;
    readonly parameters: Parameters;
    readonly success: Success;
    readonly failure: Failure;
    readonly failureMode: Mode;
  },
  RequiresImplementation
> => Object.assign(Object.create(ProviderDefinedProto), options);

const constEmptyStruct = S.Struct({});

/**
 * Creates a user-defined handler with the specified name and configuration.
 *
 * Use this to expose operations that auth clients call. The handler definition
 * includes parameter validation, success/failure schemas, and optional service
 * dependencies so that the runtime contract stays explicit.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 * import * as S from "effect/Schema"
 *
 * const StartEmailVerification = Handler.make("StartEmailVerification", {
 *   description: "Sends a verification link to a pending member",
 *   parameters: {
 *     email: S.String
 *   },
 *   success: S.Struct({
 *     jobId: S.String
 *   })
 * })
 * ```
 *
 * @since 1.0.0
 * @category Constructors
 */
export const make = <
  const Name extends string,
  Parameters extends S.Struct.Fields = {},
  Success extends S.Schema.Any = typeof S.Void,
  Failure extends S.Schema.All = typeof S.Never,
  Mode extends FailureMode | undefined = undefined,
  Dependencies extends Array<Context.Tag<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>> = [],
>(
  /**
   * The unique name identifier for this handler.
   */
  name: Name,
  options?: {
    /**
     * An optional description explaining what the handler does.
     */
    readonly description?: string | undefined;
    /**
     * Schema defining the parameters this handler accepts.
     */
    readonly parameters?: Parameters | undefined;
    /**
     * Schema for successful handler execution results.
     */
    readonly success?: Success | undefined;
    /**
     * Schema for handler execution failures.
     */
    readonly failure?: Failure | undefined;
    /**
     * The strategy used for handling errors returned from handler call implementation
     * execution.
     *
     * If set to `"error"` (the default), errors that occur during handler call implementation
     * execution will be returned in the error channel of the calling effect.
     *
     * If set to `"return"`, errors that occur during handler call implementation execution
     * will be captured and returned as part of the handler call result.
     */
    readonly failureMode?: Mode;
    /**
     * Service dependencies required by the handler implementation.
     */
    readonly dependencies?: Dependencies | undefined;
  }
): Handler<
  Name,
  {
    readonly parameters: S.Struct<Parameters>;
    readonly success: Success;
    readonly failure: Failure;
    readonly failureMode: Mode extends undefined ? "error" : Mode;
  },
  Context.Tag.Identifier<Dependencies[number]>
> => {
  const successSchema = options?.success ?? S.Void;
  const failureSchema = options?.failure ?? S.Never;
  return userDefinedProto({
    name,
    description: options?.description,
    parametersSchema: options?.parameters ? S.Struct(options?.parameters as UnsafeTypes.UnsafeAny) : constEmptyStruct,
    successSchema,
    failureSchema,
    failureMode: options?.failureMode ?? "error",
    annotations: Context.empty(),
  }) as UnsafeTypes.UnsafeAny;
};

/**
 * Creates a provider-defined handler that delegates to functionality supplied
 * by an auth provider.
 *
 * The provider triggers these handlers, but your runtime can still validate the
 * payload, enforce failure handling, and merge in application-specific logic.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 * import * as S from "effect/Schema"
 *
 * const HostedMagicLink = Handler.providerDefined({
 *   id: "betterauth.magic_link",
 *   handlerSetName: "HostedMagicLink",
 *   providerName: "magic_link",
 *   args: {
 *     redirectUri: S.String
 *   },
 *   success: S.Struct({
 *     verificationUrl: S.String
 *   })
 * })
 * ```
 *
 * @since 1.0.0
 * @category Constructors
 */
export const providerDefined =
  <
    const Name extends string,
    Args extends S.Struct.Fields = {},
    Parameters extends S.Struct.Fields = {},
    Success extends S.Schema.Any = typeof S.Void,
    Failure extends S.Schema.All = typeof S.Never,
    RequiresImplementation extends boolean = false,
  >(options: {
    /**
     * Unique identifier following format `<provider>.<handler-name>`.
     */
    readonly id: `${string}.${string}`;
    /**
     * Name used by the HandlerSet to identify this handler.
     */
    readonly handlerSetName: Name;
    /**
     * Name of the handler as recognized by the auth provider.
     */
    readonly providerName: string;
    /**
     * Schema for user-provided configuration arguments.
     */
    readonly args: Args;
    /**
     * Whether this handler requires a custom implementation implementation.
     */
    readonly requiresImplementation?: RequiresImplementation | undefined;
    /**
     * Schema for parameters the provider sends when calling the handler.
     */
    readonly parameters?: Parameters | undefined;
    /**
     * Schema for successful handler execution results.
     */
    readonly success?: Success | undefined;
    /**
     * Schema for failed handler execution results.
     */
    readonly failure?: Failure | undefined;
  }) =>
  <Mode extends FailureMode | undefined = undefined>(
    args: RequiresImplementation extends true
      ? S.Simplify<
          S.Struct.Encoded<Args> & {
            /**
             * The strategy used for handling errors returned from handler call implementation
             * execution.
             *
             * If set to `"error"` (the default), errors that occur during handler call implementation
             * execution will be returned in the error channel of the calling effect.
             *
             * If set to `"return"`, errors that occur during handler call implementation execution
             * will be captured and returned as part of the handler call result.
             */
            readonly failureMode?: Mode;
          }
        >
      : S.Simplify<S.Struct.Encoded<Args>>
  ): ProviderDefined<
    Name,
    {
      readonly args: S.Struct<Args>;
      readonly parameters: S.Struct<Parameters>;
      readonly success: Success;
      readonly failure: Failure;
      readonly failureMode: Mode extends undefined ? "error" : Mode;
    },
    RequiresImplementation
  > => {
    const failureMode = "failureMode" in args ? args.failureMode : undefined;
    const successSchema = options?.success ?? S.Void;
    const failureSchema = options?.failure ?? S.Never;
    return providerDefinedProto({
      id: options.id,
      name: options.handlerSetName,
      providerName: options.providerName,
      args,
      argsSchema: S.Struct(options.args as UnsafeTypes.UnsafeAny),
      requiresImplementation: options.requiresImplementation ?? false,
      parametersSchema: options?.parameters ? S.Struct(options?.parameters as UnsafeTypes.UnsafeAny) : constEmptyStruct,
      successSchema,
      failureSchema,
      failureMode: failureMode ?? "error",
    }) as UnsafeTypes.UnsafeAny;
  };

/**
 * Creates a Handler from a S.TaggedRequest.
 *
 * This utility function converts Effect's TaggedRequest schemas into Handler
 * definitions, automatically mapping the request parameters, success, and
 * failure schemas.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 * import * as S from "effect/Schema"
 *
 * // Define a tagged request for verifying a pending invitation
 * class GetInvitation extends S.TaggedRequest<GetInvitation>()("GetInvitation", {
 *   success: S.Struct({
 *     invitationId: S.String,
 *     email: S.String
 *   }),
 *   failure: S.Struct({
 *     reason: S.Literal("NotFound", "Expired"),
 *     message: S.String
 *   }),
 *   payload: {
 *     code: S.String
 *   }
 * }) {}
 *
 * // Convert to a Handler
 * const getInvitationHandler = Handler.fromTaggedRequest(GetInvitation)
 * ```
 *
 * @since 1.0.0
 * @category Constructors
 */
export const fromTaggedRequest = <S extends AnyTaggedRequestSchema>(schema: S): FromTaggedRequest<S> =>
  userDefinedProto({
    name: schema._tag,
    description: O.getOrUndefined(AST.getDescriptionAnnotation((schema.ast as UnsafeTypes.UnsafeAny).to)),
    parametersSchema: schema,
    successSchema: schema.success,
    failureSchema: schema.failure,
    failureMode: "error",
    annotations: Context.empty(),
  }) as UnsafeTypes.UnsafeAny;

// =============================================================================
// Utilities
// =============================================================================

/**
 * Extracts the description from a handler's metadata.
 *
 * Returns the handler's description if explicitly set, otherwise attempts to
 * extract it from the parameter schema's AST annotations.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 *
 * const myHandler = Handler.make("example", {
 *   description: "This is an example handler"
 * })
 *
 * const description = Handler.getDescription(myHandler)
 * console.log(description) // "This is an example handler"
 * ```
 *
 * @since 1.0.0
 * @category Utilities
 */
export const getDescription = <
  Name extends string,
  Config extends {
    readonly parameters: AnyStructSchema;
    readonly success: S.Schema.Any;
    readonly failure: S.Schema.All;
    readonly failureMode: FailureMode;
  },
>(
  /**
   * The handler to get the description from.
   */
  handler: Handler<Name, Config>
): string | undefined => {
  if (Predicate.isNotUndefined(handler.description)) {
    return handler.description;
  }
  return getDescriptionFromSchemaAst(handler.parametersSchema.ast);
};

/**
 * @since 1.0.0
 * @category Utilities
 */
export const getDescriptionFromSchemaAst = (ast: AST.AST): string | undefined => {
  const annotations =
    ast._tag === "Transformation"
      ? {
          ...ast.to.annotations,
          ...ast.annotations,
        }
      : ast.annotations;
  return AST.DescriptionAnnotationId in annotations ? (annotations[AST.DescriptionAnnotationId] as string) : undefined;
};

/**
 * Generates a JSON Schema for a handler.
 *
 * This function creates a JSON Schema representation that can be shared with
 * clients or documentation generators to describe the parameters a handler
 * expects.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 * import * as S from "effect/Schema"
 *
 * const completeProfile = Handler.make("complete_profile", {
 *   parameters: {
 *     displayName: S.String,
 *     timezone: S.optional(S.String)
 *   }
 * })
 *
 * const jsonSchema = Handler.getJsonSchema(completeProfile)
 * console.log(jsonSchema)
 * // {
 * //   type: "object",
 * //   properties: {
 * //     displayName: { type: "string" },
 * //     timezone: { type: "string" }
 * //   },
 * //   required: ["displayName"]
 * // }
 * ```
 *
 * @since 1.0.0
 * @category Utilities
 */
export const getJsonSchema = <
  Name extends string,
  Config extends {
    readonly parameters: AnyStructSchema;
    readonly success: S.Schema.Any;
    readonly failure: S.Schema.All;
    readonly failureMode: FailureMode;
  },
>(
  handler: Handler<Name, Config>
): JsonSchema.JsonSchema7 => getJsonSchemaFromSchemaAst(handler.parametersSchema.ast);

/**
 * @since 1.0.0
 * @category Utilities
 */
export const getJsonSchemaFromSchemaAst = (ast: AST.AST): JsonSchema.JsonSchema7 => {
  const props = AST.getPropertySignatures(ast);
  if (props.length === 0) {
    return {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    };
  }
  const $defs = {};
  const schema = JsonSchema.fromAST(ast, {
    definitions: $defs,
    topLevelReferenceStrategy: "skip",
  });
  if (Object.keys($defs).length === 0) return schema;
  (schema as UnsafeTypes.UnsafeAny).$defs = $defs;
  return schema;
};

// =============================================================================
// Annotations
// =============================================================================

/**
 * Annotation for providing a human-readable title for handlers.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 *
 * const myHandler = Handler.make("start_password_reset")
 *   .annotate(Handler.Title, "Start Password Reset")
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class Title extends Context.Tag("@beep/iam-sdk/Handler/Title")<Title, string>() {}

/**
 * Annotation indicating whether a handler only reads data without making changes.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 *
 * const readOnlyHandler = Handler.make("get_user_info")
 *   .annotate(Handler.Readonly, true)
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class Readonly extends Context.Reference<Readonly>()("@beep/iam-sdk/Handler/Readonly", {
  defaultValue: F.constFalse,
}) {}

/**
 * Annotation indicating whether a handler performs destructive operations.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 *
 * const safeHandler = Handler.make("revoke_all_sessions")
 *   .annotate(Handler.Destructive, true)
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class Destructive extends Context.Reference<Destructive>()("@beep/iam-sdk/Handler/Destructive", {
  defaultValue: F.constTrue,
}) {}

/**
 * Annotation indicating whether a handler can be called multiple times safely.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 *
 * const idempotentHandler = Handler.make("fetch_active_session")
 *   .annotate(Handler.Idempotent, true)
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class Idempotent extends Context.Reference<Idempotent>()("@beep/iam-sdk/Handler/Idempotent", {
  defaultValue: F.constFalse,
}) {}

/**
 * Annotation indicating whether a handler can handle arbitrary external data.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 *
 * const restrictedHandler = Handler.make("issue_admin_token")
 *   .annotate(Handler.OpenWorld, false)
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class OpenWorld extends Context.Reference<OpenWorld>()("@beep/iam-sdk/Handler/OpenWorld", {
  defaultValue: F.constTrue,
}) {}

const suspectProtoRx = /"__proto__"\s*:/;
const suspectConstructorRx = /"constructor"\s*:/;

function _parse(text: string) {
  // Parse normally
  const obj = JSON.parse(text);

  // Ignore null and non-objects
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (!suspectProtoRx.test(text) && !suspectConstructorRx.test(text)) {
    return obj;
  }

  // Scan result for proto keys
  return filter(obj);
}

function filter(obj: UnsafeTypes.UnsafeAny) {
  let next = [obj];

  while (next.length) {
    const nodes = next;
    next = [];

    for (const node of nodes) {
      if (Object.prototype.hasOwnProperty.call(node, "__proto__")) {
        throw new SyntaxError("Object contains forbidden prototype property");
      }

      if (
        Object.prototype.hasOwnProperty.call(node, "constructor") &&
        Object.prototype.hasOwnProperty.call(node.constructor, "prototype")
      ) {
        throw new SyntaxError("Object contains forbidden prototype property");
      }

      for (const key in node) {
        const value = node[key];
        if (value && typeof value === "object") {
          next.push(value);
        }
      }
    }
  }
  return obj;
}

/**
 * **Unsafe**: This function will throw an error if an insecure property is
 * found in the parsed JSON or if the provided JSON text is not parseable.
 *
 * @since 1.0.0
 * @category Utilities
 */
export const unsafeSecureJsonParse = (text: string): unknown => {
  // Performance optimization, see https://github.com/fastify/secure-json-parse/pull/90
  const { stackTraceLimit } = Error;
  Error.stackTraceLimit = 0;
  try {
    return _parse(text);
  } finally {
    Error.stackTraceLimit = stackTraceLimit;
  }
};

export const mapBoundary =
  <Input, Output>(
    executor: (
      encoded: Input,
      options?: { readonly signal?: AbortSignal | undefined | null }
    ) => Promise<
      { readonly data: Output; readonly error: null } | { readonly data: null; readonly error: NonNullable<unknown> }
    >
  ) =>
  (encoded: Input, signal: AbortSignal) =>
    F.pipe(executor(encoded, { signal }), (promise) =>
      promise.then((result) => (result.error ? { error: result.error } : ({ data: result.data } as const)))
    );
