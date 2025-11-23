import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
import type * as A from "effect/Array";
import type * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as Either from "effect/Either";
import * as Match from "effect/Match";
import type { Pipeable } from "effect/Pipeable";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import type { Covariant } from "effect/Types";
import type { ContractError } from "../contract-error";
import type { ProviderDefinedTypeId, TypeId } from "./constants";

export declare namespace Contract {
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

const makeHandleOutcome = <C extends Any>(contract: C, input: FailureMode.MatchInput<C>): HandleOutcome<C> => {
  if (input.isFailure) {
    return {
      mode: FailureMode.Enum.return,
      _tag: "failure",
      result: input.result as Failure<C>,
      encodedResult: input.encodedResult as FailureEncoded<C>,
    };
  }
  return {
    mode: contract.failureMode === "return" ? FailureMode.Enum.return : FailureMode.Enum.error,
    _tag: "success",
    result: input.result as Success<C>,
    encodedResult: input.encodedResult as SuccessEncoded<C>,
  };
};

export class FailureMode extends BS.StringLiteralKit("error", "return").annotations({
  schemaId: Symbol.for("@beep/contract/Contract/FailureMode"),
  identifier: "FailureMode",
  title: "Failure Mode",
  description: "The strategy used for handling errors returned from contract call implementation execution.",
}) {
  static readonly $match =
    <C extends Any, E1, E2, R1, R2>(result: Result<C>) =>
    (
      contract: Any,
      cases: {
        onErrorMode: (result: Failure<C>) => Effect.Effect<
          {
            readonly _tag: "success";
            readonly value: Success<C>;
          },
          E1,
          R1
        >;
        onReturnMode: (result: Result<C>) => Effect.Effect<
          | { readonly _tag: "failure"; readonly value: Failure<C> }
          | {
              readonly _tag: "success";
              readonly value: Success<C>;
            },
          E2,
          R2
        >;
      }
    ) =>
      Match.value(contract.failureMode).pipe(
        Match.when(FailureMode.Enum.error, () => cases.onErrorMode(result)),
        Match.when(FailureMode.Enum.return, () => cases.onReturnMode(result)),
        Match.exhaustive
      );

  /**
   * Experimental helper that projects an implementation result into a discriminated
   * {@link HandleOutcome} using the configured failure mode.
   *
   * @since 1.0.0
   */
  static readonly matchOutcome = <C extends Any>(contract: C, input: FailureMode.MatchInput<C>): HandleOutcome<C> =>
    makeHandleOutcome(contract, input);
}

export declare namespace FailureMode {
  export type Type = typeof FailureMode.Type;
  export type Encoded = typeof FailureMode.Encoded;

  export interface MatchInput<C extends Any> {
    readonly isFailure: boolean;
    readonly result: Result<C>;
    readonly encodedResult: ResultEncoded<C>;
  }

  export type ErrorOutcome<C extends Any> = Extract<HandleOutcome<C>, { readonly mode: typeof FailureMode.Enum.error }>;
  export type ReturnOutcome<C extends Any> = Extract<
    HandleOutcome<C>,
    {
      readonly mode: typeof FailureMode.Enum.return;
    }
  >;
}

export interface AnySchema extends Pipeable {
  readonly [S.TypeId]: UnsafeTypes.UnsafeAny;
  readonly Type: UnsafeTypes.UnsafeAny;
  readonly Encoded: UnsafeTypes.UnsafeAny;
  readonly Context: UnsafeTypes.UnsafeAny;
  readonly make?: (
    params: UnsafeTypes.UnsafeAny,
    ...rest: ReadonlyArray<UnsafeTypes.UnsafeAny>
  ) => UnsafeTypes.UnsafeAny;
  readonly ast: AST.AST;
  readonly annotations: UnsafeTypes.UnsafeAny;
}
/**
 * Represents an API endpoint. An API endpoint is mapped to a single route on
 * the underlying `HttpRouter`.
 *
 * @since 1.0.0
 * @category models
 */
export interface Contract<
  in out Name extends string,
  Config extends {
    readonly payload: AnySchema;
    readonly success: S.Schema.Any;
    readonly failure: S.Schema.All;
    readonly failureMode: FailureMode.Type;
  } = {
    readonly payload: AnySchema;
    readonly success: S.Schema.Any;
    readonly failure: S.Schema.All;
    readonly failureMode: FailureMode.Type;
  },
  Requirements = never,
> extends Pipeable,
    Contract.Variance<Requirements> {
  new (_: never): {};
  /**
   * The contract identifier which is used to uniquely identify the contract.
   */
  readonly id: string;

  /**
   * The name of the contract.
   */
  readonly name: Name;

  /**
   * The optional description of the contract.
   */
  readonly description?: string | undefined;

  /**
   * The strategy used for handling errors returned from contract call implementation
   * execution.
   *
   * If set to `"error"` (the default), errors that occur during contract call
   * implementation execution will be returned in the error channel of the calling
   * effect.
   *
   * If set to `"return"`, errors that occur during contract call implementation execution
   * will be captured and returned as part of the contract call result.
   */
  readonly failureMode: FailureMode.Type;

  /**
   * A `Schema` representing the payload that a contract must be called with.
   */
  readonly payloadSchema: Config["payload"];

  /**
   * A `Schema` representing the value that a contract must return when called if
   * the contract call is successful.
   */
  readonly successSchema: Config["success"];

  /**
   * A `Schema` representing the value that a contract must return when called if
   * it fails.
   */
  readonly failureSchema: Config["failure"];

  /**
   * A `Context` object containing contract annotations which can store metadata
   * about the contract.
   */
  readonly annotations: Context.Context<never>;
  /**
   * Schema helpers for decoding / encoding payloads.
   */
  decodePayload(
    value: Payload<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): Effect.Effect<
    PayloadSchema<Contract<Name, Config, Requirements>>["Type"],
    never,
    PayloadContext<Contract<Name, Config, Requirements>>
  >;

  encodePayload(
    value: Payload<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): Effect.Effect<
    PayloadSchema<Contract<Name, Config, Requirements>>["Encoded"],
    never,
    PayloadContext<Contract<Name, Config, Requirements>>
  >;

  decodeUnknownPayload(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): Effect.Effect<
    PayloadSchema<Contract<Name, Config, Requirements>>["Type"],
    never,
    PayloadContext<Contract<Name, Config, Requirements>>
  >;

  encodeUnknownPayload(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): Effect.Effect<
    PayloadSchema<Contract<Name, Config, Requirements>>["Encoded"],
    never,
    PayloadContext<Contract<Name, Config, Requirements>>
  >;

  isPayload(
    value: unknown,
    options?: undefined | AST.ParseOptions | number
  ): value is PayloadSchema<Contract<Name, Config, Requirements>>["Type"];

  /**
   * Schema helpers for decoding / encoding successes.
   */
  decodeSuccess(
    value: SuccessEncoded<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): Effect.Effect<
    SuccessSchema<Contract<Name, Config, Requirements>>["Type"],
    never,
    SuccessContext<Contract<Name, Config, Requirements>>
  >;

  encodeSuccess(
    value: Success<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): Effect.Effect<
    SuccessSchema<Contract<Name, Config, Requirements>>["Encoded"],
    never,
    SuccessContext<Contract<Name, Config, Requirements>>
  >;

  decodeUnknownSuccess(
    value: unknown,
    options?: AST.ParseOptions
  ): Effect.Effect<
    SuccessSchema<Contract<Name, Config, Requirements>>["Type"],
    never,
    SuccessContext<Contract<Name, Config, Requirements>>
  >;

  encodeUnknownSuccess(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): Effect.Effect<
    SuccessSchema<Contract<Name, Config, Requirements>>["Encoded"],
    never,
    SuccessContext<Contract<Name, Config, Requirements>>
  >;

  isSuccess(
    value: unknown,
    options?: undefined | AST.ParseOptions | number
  ): value is Success<SuccessSchema<Contract<Name, Config, Requirements>>["Type"]>;

  /**
   * Schema helpers for decoding / encoding failures.
   */
  decodeFailure(
    value: FailureEncoded<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): Effect.Effect<
    Failure<Contract<Name, Config, Requirements>>,
    Failure<Contract<Name, Config, Requirements>>,
    FailureContext<Contract<Name, Config, Requirements>>
  >;

  encodeFailure(
    value: Failure<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): Effect.Effect<
    FailureEncoded<Contract<Name, Config, Requirements>>,
    Failure<Contract<Name, Config, Requirements>>,
    FailureContext<Contract<Name, Config, Requirements>>
  >;

  decodeUnknownFailure(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): Effect.Effect<
    Failure<Contract<Name, Config, Requirements>>,
    Failure<Contract<Name, Config, Requirements>>,
    FailureContext<Contract<Name, Config, Requirements>>
  >;

  encodeUnknownFailure(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): Effect.Effect<
    FailureEncoded<Contract<Name, Config, Requirements>>,
    Failure<Contract<Name, Config, Requirements>>,
    FailureContext<Contract<Name, Config, Requirements>>
  >;

  isFailure(
    value: unknown,
    options?: undefined | AST.ParseOptions | number
  ): value is Failure<Contract<Name, Config, Requirements>>;

  /**
   * Helper for creating strongly-typed implementations tied to this contract.
   */
  implement(
    handler: Contract<Name, Config, Requirements> extends Any
      ? ImplementationHandler<Contract<Name, Config, Requirements>>
      : never,
    options?:
      | (Contract<Name, Config, Requirements> extends Any
          ? ImplementOptions<Contract<Name, Config, Requirements>>
          : never)
      | undefined
  ): Contract<Name, Config, Requirements> extends Any
    ? ImplementationFunction<Contract<Name, Config, Requirements>>
    : never;

  /**
   * Adds a _request-level_ dependency which must be provided before the contract
   * call implementation can be executed.
   *
   * This can be useful when the auth client must supply per-request data (for
   * example, tenant context or trace metadata) rather than capturing it when the
   * contract implementation layer is created.
   */
  addDependency<Identifier, Service>(
    tag: Context.Tag<Identifier, Service>
  ): Contract<Name, Config, Identifier | Requirements>;

  /**
   * Set the schema to use to validate the result of a tool call when successful.
   */
  setPayload<PayloadSchema extends S.Struct<UnsafeTypes.UnsafeAny> | S.Schema.Any | S.Struct.Fields>(
    schema: PayloadSchema
  ): Contract<
    Name,
    {
      readonly payload: PayloadSchema extends S.Struct<infer _>
        ? PayloadSchema
        : PayloadSchema extends S.Struct.Fields
          ? S.Struct<PayloadSchema>
          : PayloadSchema;
      readonly success: Config["success"];
      readonly failure: Config["failure"];
      readonly failureMode: Config["failureMode"];
    },
    Requirements
  >;

  /**
   * Set the schema to use to validate the result of a contract call when successful.
   */
  setSuccess<SuccessSchema extends S.Schema.Any>(
    schema: SuccessSchema
  ): Contract<
    Name,
    {
      readonly payload: Config["payload"];
      readonly success: SuccessSchema;
      readonly failure: Config["failure"];
      readonly failureMode: Config["failureMode"];
    },
    Requirements
  >;

  /**
   * Set the schema to use to validate the result of a contract call when it fails.
   */
  setFailure<FailureSchema extends S.Schema.All>(
    schema: FailureSchema
  ): Contract<
    Name,
    {
      readonly payload: Config["payload"];
      readonly success: Config["success"];
      readonly failure: FailureSchema;
      readonly failureMode: Config["failureMode"];
    },
    Requirements
  >;

  /**
   * Add an annotation to the contract.
   */
  annotate<I, S>(tag: Context.Tag<I, S>, value: S): Contract<Name, Config, Requirements>;

  /**
   * Add many annotations to the contract.
   */
  withAnnotations<
    const Annotations extends A.NonEmptyReadonlyArray<
      readonly [Context.Tag<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>, UnsafeTypes.UnsafeAny]
    >,
  >(...annotations: Annotations): Contract<Name, Config, Requirements>;

  /**
   * Add many annotations to the contract.
   */
  annotateContext<I>(context: Context.Context<I>): Contract<Name, Config, Requirements>;

  /**
   * Creates a failure continuation pre-configured with this contract's metadata.
   */
  continuation<Failure = ContractError.UnknownError, Extra extends Record<string, unknown> = Record<string, unknown>>(
    options?: FailureContinuationOptions<Contract<Name, Config, Requirements>, Failure, Extra>
  ): FailureContinuation<Contract<Name, Config, Requirements>, Failure, Extra>;

  /**
   * Projects an implementation result into a discriminated union using the configured failure mode.
   */
  toResult(
    input: FailureMode.MatchInput<Contract<Name, Config, Requirements>>
  ): Contract.ToResult<Contract<Name, Config, Requirements>>;
}

/**
 * A provider-defined contract wraps functionality that ships with an external
 * auth provider (for example, Better Auth hosted screens or third-party social
 * sign-in callbacks).
 *
 * These contracts are triggered by the provider and optionally require an
 * application-defined implementation to post-process the provider output.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/contract/contract-kit/Contract"
 * import * as S from "effect/Schema"
 *
 * const HostedPasswordReset = Contract.providerDefined({
 *   id: "betterauth.reset_password",
 *   contractKitName: "HostedPasswordReset",
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
    readonly payload: AnyStructSchema;
    readonly success: S.Schema.Any;
    readonly failure: S.Schema.All;
    readonly failureMode: FailureMode.Type;
  } = {
    readonly args: S.Struct<{}>;
    readonly payload: S.Struct<{}>;
    readonly success: typeof S.Void;
    readonly failure: typeof S.Never;
    readonly failureMode: typeof FailureMode.Enum.error;
  },
  RequiresImplementation extends boolean = false,
> extends Contract<
      Name,
      {
        readonly payload: Config["payload"];
        readonly success: Config["success"];
        readonly failure: Config["failure"];
        readonly failureMode: Config["failureMode"];
      }
    >,
    Contract.ProviderDefinedProto {
  /**
   * The arguments passed to the provider-defined contract.
   */
  readonly args: Config["args"]["Encoded"];

  /**
   * A `Schema` representing the arguments provided by the end-user which will
   * be used to configure the behavior of the provider-defined contract.
   */
  readonly argsSchema: Config["args"];

  /**
   * Name of the contract as recognized by the external auth provider.
   */
  readonly providerName: string;

  /**
   * If set to `true`, this provider-defined contract requires a user-defined
   * implementation when converting the `ContractKit` containing this contract
   * into a `Layer`.
   */
  readonly requiresImplementation: RequiresImplementation;
}

/**
 * @since 1.0.0
 */
export declare namespace Contract {
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

  /**
   * Discriminated result type produced by {@link Contract.toResult}.
   */
  export type ToResult<C extends Any> =
    | {
        readonly _tag: "success";
        readonly value: Success<C>;
      }
    | {
        readonly _tag: "failure";
        readonly value: Failure<C>;
      };
}

// =============================================================================
// Utility Types
// =============================================================================

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
 * Structural representation of any contract. Primarily used internally when we
 * need to work with heterogeneous collections.
 *
 * @since 1.0.0
 */
export interface Any extends Pipeable {
  readonly [TypeId]: {
    readonly _Requirements: Covariant<UnsafeTypes.UnsafeAny>;
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | undefined;
  readonly payloadSchema: AnySchema;
  readonly successSchema: S.Schema.Any;
  readonly failureSchema: S.Schema.All;
  readonly failureMode: FailureMode.Type;
  readonly annotations: Context.Context<never>;
}

/**
 * A utility type to convert a `Schema.TaggedRequest` into an `Contract`.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export interface FromTaggedRequest<S extends AnyTaggedRequestSchema>
  extends Contract<
    S["_tag"],
    {
      readonly payload: S;
      readonly success: S["success"];
      readonly failure: S["failure"];
      readonly failureMode: typeof FailureMode.Enum.error;
    }
  > {}

/**
 * A utility type to extract the `Name` type from an `Contract`.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type Name<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements> ? _Name : never;

/**
 * A utility type to extract the type of the contract call payload.
 *
 * @since 1.0.0
 * @category Utility Types
 */
// export type Payload<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
//   ? S.Struct.Type<_Config["payload"]["fields"]>
//   : never;

/**
 * A utility type to extract the encoded type of the contract call payload.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type PayloadEncoded<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? S.Schema.Encoded<_Config["payload"]>
  : never;

/**
 * A utility type to extract the schema for the payload which an `Contract`
 * must be called with.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type PayloadSchema<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? _Config["payload"]
  : never;

/**
 * A utility type to extract the type of the contract call result when it succeeds.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type Success<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? S.Schema.Type<_Config["success"]>
  : never;

/**
 * A utility type to extract the encoded type of the contract call result when
 * it succeeds.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type SuccessEncoded<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? S.Schema.Encoded<_Config["success"]>
  : never;

/**
 * A utility type to extract the schema for the return type of a contract call when
 * the contract call succeeds.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type SuccessSchema<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? _Config["success"]
  : never;

/**
 * A utility type to extract the type of the contract call result when it fails.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type Failure<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? S.Schema.Type<_Config["failure"]>
  : never;

export type FailureSchema<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? _Config["failure"]
  : never;
/**
 * A utility type to extract the encoded type of the contract call result when
 * it fails.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type FailureEncoded<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? S.Schema.Encoded<_Config["failure"]>
  : never;

/**
 * Extracts the parse context required by the payload schema.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type PayloadContext<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? S.Schema.Context<_Config["payload"]>
  : never;

/**
 * @since 1.0.0
 * @category models
 */
export type PayloadConstructor<R> = R extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? _Config["payload"] extends { readonly fields: S.Struct.Fields }
    ? S.Simplify<S.Struct.Constructor<_Config["payload"]["fields"]>>
    : _Config["payload"]["Type"]
  : never;

/**
 * @since 1.0.0
 * @category models
 */
export type Payload<R> = R extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? _Config["payload"]["Type"]
  : never;

/**
 * Extracts the parse context required by the success schema.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type SuccessContext<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? S.Schema.Context<_Config["success"]>
  : never;

/**
 * Extracts the parse context required by the failure schema.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type FailureContext<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? S.Schema.Context<_Config["failure"]>
  : never;

/**
 * A utility type to extract the type of the contract call result whether it
 * succeeds or fails.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type Result<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? Success<T> | Failure<T>
  : never;
/**
 * A utility type to extract the encoded type of the contract call result whether
 * it succeeds or fails.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type ResultEncoded<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? SuccessEncoded<T> | FailureEncoded<T>
  : never;

/**
 * Discriminated runtime view of a contract invocation result that
 * preserves the configured failure mode along with the encoded payload.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type HandleOutcome<T extends Any> =
  | {
      readonly mode: typeof FailureMode.Enum.error;
      readonly _tag: "success";
      readonly result: Success<T>;
      readonly encodedResult: SuccessEncoded<T>;
    }
  | {
      readonly mode: typeof FailureMode.Enum.return;
      readonly _tag: "success";
      readonly result: Success<T>;
      readonly encodedResult: SuccessEncoded<T>;
    }
  | {
      readonly mode: typeof FailureMode.Enum.return;
      readonly _tag: "failure";
      readonly result: Failure<T>;
      readonly encodedResult: FailureEncoded<T>;
    };
export declare namespace HandleOutcome {
  export type Success<C extends Any> = Extract<HandleOutcome<C>, { readonly _tag: "success" }>;
  export type Failure<C extends Any> = Extract<HandleOutcome<C>, { readonly _tag: "failure" }>;
}

/**
 * A utility type to extract the requirements of an `Contract`.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type Requirements<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? _Config["payload"]["Context"] | _Config["success"]["Context"] | _Config["failure"]["Context"] | _Requirements
  : never;

/**
 * Represents an `Contract` that has been implemented within the application.
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
 * Represents the result of calling the implementation for a particular `Contract`.
 *
 * @since 1.0.0
 * @category Models
 */
export interface ImplementationResult<Contract extends Any> {
  /**
   * Whether the result of executing the contract call implementation was an error or not.
   */
  readonly isFailure: boolean;
  /**
   * The result of executing the implementation for a particular contract.
   */
  readonly result: Result<Contract>;
  /**
   * The pre-encoded contract call result of executing the implementation for a particular
   * contract as a JSON-serializable value. The encoded result can be forwarded to
   * clients, stored for auditing, or chained into subsequent contract calls.
   */
  readonly encodedResult: unknown;
}

/**
 * A utility type which represents the possible errors that can be raised by
 * a contract call's implementation.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type ImplementationError<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? _Config["failureMode"] extends typeof FailureMode.Enum.error
    ? _Config["failure"]["Type"]
    : never
  : never;

/**
 * A utility type to create a union of `Implementation` types for all contracts in a
 * record.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type ImplementationsFor<Contracts extends Record<string, Any>> = {
  [Name in keyof Contracts]: RequiresImplementation<Contracts[Name]> extends true
    ? Implementation<Contracts[Name]["name"]>
    : never;
}[keyof Contracts];

/**
 * A utility type to determine if the specified contract requires a user-defined
 * implementation to be implemented.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type RequiresImplementation<Contract extends Any> = Contract extends ProviderDefined<
  infer _Name,
  infer _Config,
  infer _RequiresImplementation
>
  ? _RequiresImplementation
  : true;

/**
 * Runtime context passed to contract implementations. Contains the concrete
 * contract reference plus resolved annotations for the current call.
 *
 * @since 1.0.0
 */
export interface ImplementationContext<C extends Any> {
  readonly contract: C;
  readonly annotations: Context.Context<never>;
}

/**
 * Signature for user-provided contract implementations. The handler receives
 * the decoded payload, metadata context, and a continuation helper that can
 * bridge asynchronous transports.
 *
 * @since 1.0.0
 */
export type ImplementationHandler<C extends Any> = (
  payload: Payload<C>,
  opts: {
    readonly context: ImplementationContext<C>;
    readonly continuation: FailureContinuation<C>;
  }
) => Effect.Effect<Success<C>, Failure<C>, Requirements<C>>;

/**
 * Curried function produced by `Contract.implement`. Accepts just the payload
 * and returns the effect whose success/failure channels align with the contract
 * definition.
 *
 * @since 1.0.0
 */
export type ImplementationFunction<C extends Any> = (
  payload: Payload<C>
) => Effect.Effect<Success<C>, Failure<C>, Requirements<C>>;

/**
 * Hooks available when implementing a contract. Useful for logging,
 * instrumentation, or storing additional metadata whenever an implementation
 * succeeds or fails.
 *
 * @since 1.0.0
 */
export interface ImplementOptions<C extends Any> {
  readonly onSuccess?:
    | undefined
    | ((success: Success<C>, context: ImplementationContext<C>) => Effect.Effect<void, never, never>);
  readonly onFailure?:
    | undefined
    | ((failure: Failure<C>, context: ImplementationContext<C>) => Effect.Effect<void, never, never>);
  readonly span?:
    | undefined
    | {
        readonly useMetadataName?: boolean | undefined;
        readonly includeMetadataExtra?: boolean | undefined;
      };
  readonly continuation?:
    | FailureContinuationOptions<C, ContractError.UnknownError, Record<string, unknown>>
    | undefined;
}

/**
 * Human-readable metadata extracted from contract annotations. Extra fields can
 * be attached by callers (for example correlation IDs or tenant info).
 *
 * @since 1.0.0
 */
export interface Metadata<Extra extends Record<string, unknown> = Record<string, unknown>> {
  readonly id: string;
  readonly name: string;
  readonly supportsAbort: boolean;
  readonly description?: string | undefined;
  readonly title?: string | undefined;
  readonly domain?: string | undefined;
  readonly method?: string | undefined;
  readonly extra?: Extra | undefined;
}

/**
 * Options for computing metadata. Allows overriding annotation-derived fields
 * and attaching additional structured data.
 *
 * @since 1.0.0
 */
export interface MetadataOptions<Extra extends Record<string, unknown> = Record<string, unknown>> {
  readonly overrides?: {
    readonly title?: string | undefined;
    readonly domain?: string | undefined;
    readonly method?: string | undefined;
    readonly description?: string | undefined;
  };
  readonly extra?: Extra | undefined;
}

/**
 * Handler set passed to `Contract.handleOutcome`. Consumers provide branching
 * logic for success/failure cases without re-implementing pattern matches.
 *
 * @since 1.0.0
 */
export interface HandleOutcomeHandlers<C extends Any, R = void, E = never, Env = never> {
  readonly onSuccess: (success: HandleOutcome.Success<C>) => Effect.Effect<R, E, Env>;
  readonly onFailure: (failure: HandleOutcome.Failure<C>) => Effect.Effect<R, E, Env>;
}

/**
 * Handlers exposed to continuation register functions. Implementations can use
 * `signal` to wire abort support and `onError` to report transport-level
 * failures back into the Effect pipeline.
 *
 * @since 1.0.0
 */
export interface FailureContinuationHandlers {
  readonly signal?: AbortSignal | undefined;
  readonly onError: (context: { readonly error: unknown }) => void;
}

/**
 * Context passed to error normalizers. Carries the originating contract plus the
 * derived metadata payload.
 *
 * @since 1.0.0
 */
export interface FailureContinuationContext<
  C extends Any,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> {
  readonly contract: C;
  readonly metadata: Metadata<Extra>;
}

/**
 * Options used when constructing a continuation. Callers can opt into abort
 * signals, customize error normalization, or override metadata.
 *
 * @since 1.0.0
 */
export interface FailureContinuationOptions<
  C extends Any,
  Failure = ContractError.UnknownError,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> {
  readonly supportsAbort?: boolean | undefined;
  readonly normalizeError?: ((error: unknown, context: FailureContinuationContext<C, Extra>) => Failure) | undefined;
  readonly decodeFailure?:
    | {
        readonly select?: ((error: unknown, context: FailureContinuationContext<C, Extra>) => unknown) | undefined;
        readonly parseOptions?: AST.ParseOptions | undefined;
      }
    | undefined;
  readonly metadata?: MetadataOptions<Extra> | undefined;
}

/**
 * Helper returned by `Contract.continuation`. Provides metadata plus helpers for
 * running promise-based transports and raising encoded results back into the
 * Effect channel.
 *
 * @since 1.0.0
 */
export interface FailureContinuation<
  C extends Any,
  Failure = ContractError.UnknownError,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> {
  readonly metadata: Metadata<Extra>;
  readonly run: FailureContinuation.Runner<Failure>;
  readonly runRaise: <A extends { readonly error: unknown | null | undefined }>(
    register: (handlers: FailureContinuationHandlers) => Promise<A>
  ) => Effect.Effect<A, never, never>;
  readonly runDecode: <R extends { readonly error: unknown | null | undefined }>(
    register: (handlers: FailureContinuationHandlers) => Promise<R>,
    options?: FailureContinuation.RunDecodeOptions
  ) => Effect.Effect<Success<C>, C["failureSchema"]["Type"], never>;
  readonly runVoid: <A extends { readonly error: unknown | null | undefined }>(
    register: (handlers: FailureContinuationHandlers) => Promise<A>
  ) => Effect.Effect<void, never, never>;
  readonly raiseResult: (result: { readonly error: unknown | null | undefined }) => Effect.Effect<void, never, never>;
}

export declare namespace FailureContinuation {
  export interface RunDecodeOptions {
    readonly decodeFrom?: "data" | "result";
    readonly parseOptions?: AST.ParseOptions | undefined;
  }

  /**
   * Options for `FailureContinuation.run`. Setting `surfaceDefect` returns an
   * `Either` so callers can inspect transport errors without throwing defects.
   *
   * @since 1.0.0
   */
  export interface RunOptions {
    readonly surfaceDefect?: boolean;
  }

  /**
   * Runner signature produced by `FailureContinuation`. Accepts a callback that
   * receives continuation handlers and must return a `Promise`.
   *
   * @since 1.0.0
   */
  export interface Runner<Failure> {
    <A>(register: (handlers: FailureContinuationHandlers) => Promise<A>): Effect.Effect<A, never, never>;

    <A>(
      register: (handlers: FailureContinuationHandlers) => Promise<A>,
      options: { readonly surfaceDefect: true }
    ): Effect.Effect<Either.Either<A, Failure>, never, never>;
  }
}
