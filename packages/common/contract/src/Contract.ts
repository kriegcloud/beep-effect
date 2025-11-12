/**
 * The `Contract` module provides a typed way to describe effectful auth contracts
 * that can be shared between clients and identity runtimes.
 *
 * Use it to define public entry points for onboarding, multi-factor
 * verification, password resets, or any other authenticated workflow while
 * keeping validation and dependencies explicit.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/contract/contract-kit/Contract"
 * import * as S from "effect/Schema"
 *
 * // Define a contract invoked when the user submits a one-time code
 * const VerifyMfaCode = Contract.make("VerifyMfaCode", {
 *   description: "Validates a one-time code during sign-in",
 *   payload: {
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

import {BS} from "@beep/schema";
import type {UnsafeTypes} from "@beep/types";
import {makeAssertsReturn} from "@beep/utils";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import type * as Either from "effect/Either";
import * as Exit from "effect/Exit";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import type {Pipeable} from "effect/Pipeable";
import {pipeArguments} from "effect/Pipeable";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import type {Covariant} from "effect/Types";
import * as ContractError from "./ContractError";
import {reverseRecord} from "@beep/utils/data/record.utils";

// =============================================================================
// Type Ids
// =============================================================================

/**
 * Unique identifier for user-defined contracts.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export const TypeId = "~@beep/contract/Contract";

/**
 * Type-level representation of the user-defined contract identifier.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export type TypeId = typeof TypeId;

/**
 * Unique identifier for provider-defined contracts.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export const ProviderDefinedTypeId = "~@beep/contract/Contract/ProviderDefined";

/**
 * Type-level representation of the provider-defined contract identifier.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export type ProviderDefinedTypeId = typeof ProviderDefinedTypeId;

// =============================================================================
// Models
// =============================================================================

/**
 * A user-defined contract that identity clients can call to perform an action.
 *
 * Contracts describe the contract between an auth surface (web, mobile, CLI) and
 * the runtime that fulfills the operation. Each contract declares schemas for
 * payload, success results, and failure results to keep validation explicit.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/contract/contract-kit/Contract"
 * import * as S from "effect/Schema"
 *
 * const StartPasswordReset = Contract.make("StartPasswordReset", {
 *   description: "Issues a reset token when a user asks to reset their password",
 *   payload: {
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
export interface Contract<
  Name extends string,
  Config extends {
    readonly payload: AnyStructSchema;
    readonly success: S.Schema.Any;
    readonly failure: S.Schema.All;
    readonly failureMode: FailureMode.Type;
  },
  Requirements = never,
> extends Contract.Variance<Requirements> {
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
    value: PayloadEncoded<Contract<Name, Config, Requirements>>,
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

  decodePayloadOption(
    value: PayloadEncoded<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): O.Option<PayloadSchema<Contract<Name, Config, Requirements>>["Type"]>;

  encodePayloadOption(
    value: Payload<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): O.Option<PayloadSchema<Contract<Name, Config, Requirements>>["Encoded"]>;

  decodeUnknownPayloadOption(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): O.Option<PayloadSchema<Contract<Name, Config, Requirements>>["Type"]>;

  encodeUnknownPayloadOption(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): O.Option<PayloadSchema<Contract<Name, Config, Requirements>>["Encoded"]>;

  decodePayloadEither(
    value: PayloadEncoded<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): Either.Either<
    PayloadSchema<Contract<Name, Config, Requirements>>["Type"],
    Failure<Contract<Name, Config, Requirements>>
  >;

  encodePayloadEither(
    value: Payload<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): Either.Either<
    PayloadSchema<Contract<Name, Config, Requirements>>["Encoded"],
    Failure<Contract<Name, Config, Requirements>>
  >;

  decodeUnknownPayloadEither(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): Either.Either<
    PayloadSchema<Contract<Name, Config, Requirements>>["Type"],
    Failure<Contract<Name, Config, Requirements>>
  >;

  encodeUnknownPayloadEither(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): Either.Either<
    PayloadSchema<Contract<Name, Config, Requirements>>["Encoded"],
    Failure<Contract<Name, Config, Requirements>>
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

  decodeSuccessOption(
    value: SuccessEncoded<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): O.Option<SuccessSchema<Contract<Name, Config, Requirements>>["Type"]>;

  encodeSuccessOption(
    value: Success<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): O.Option<SuccessSchema<Contract<Name, Config, Requirements>>["Encoded"]>;

  decodeUnknownSuccessOption(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): O.Option<SuccessSchema<Contract<Name, Config, Requirements>>["Type"]>;

  encodeUnknownSuccessOption(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): O.Option<SuccessSchema<Contract<Name, Config, Requirements>>["Encoded"]>;

  decodeSuccessEither(
    value: SuccessEncoded<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): Either.Either<
    SuccessSchema<Contract<Name, Config, Requirements>>["Type"],
    Failure<Contract<Name, Config, Requirements>>
  >;

  encodeSuccessEither(
    value: Success<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): Either.Either<
    SuccessSchema<Contract<Name, Config, Requirements>>["Encoded"],
    Failure<Contract<Name, Config, Requirements>>
  >;

  decodeUnknownSuccessEither(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): Either.Either<
    SuccessSchema<Contract<Name, Config, Requirements>>["Type"],
    Failure<Contract<Name, Config, Requirements>>
  >;

  encodeUnknownSuccessEither(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): Either.Either<
    SuccessSchema<Contract<Name, Config, Requirements>>["Encoded"],
    Failure<Contract<Name, Config, Requirements>>
  >;

  isSuccess(
    value: unknown,
    options?: undefined | AST.ParseOptions | number
  ): value is Success<SuccessSchema<Contract<Name, Config, Requirements>>["Type"]>;

  decodeOption(
    value: SuccessEncoded<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): O.Option<SuccessSchema<Contract<Name, Config, Requirements>>["Type"]>;

  encodeOption(
    value: Success<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): O.Option<SuccessSchema<Contract<Name, Config, Requirements>>["Encoded"]>;

  decodeUnknownOption(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): O.Option<SuccessSchema<Contract<Name, Config, Requirements>>["Type"]>;

  encodeUnknownOption(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): O.Option<SuccessSchema<Contract<Name, Config, Requirements>>["Encoded"]>;

  decodeEither(
    value: SuccessEncoded<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): Either.Either<
    SuccessSchema<Contract<Name, Config, Requirements>>["Type"],
    Failure<Contract<Name, Config, Requirements>>
  >;

  encodeEither(
    value: Success<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): Either.Either<
    SuccessSchema<Contract<Name, Config, Requirements>>["Encoded"],
    Failure<Contract<Name, Config, Requirements>>
  >;

  decodeUnknownEither(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): Either.Either<
    SuccessSchema<Contract<Name, Config, Requirements>>["Type"],
    Failure<Contract<Name, Config, Requirements>>
  >;

  encodeUnknownEither(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): Either.Either<
    SuccessSchema<Contract<Name, Config, Requirements>>["Encoded"],
    Failure<Contract<Name, Config, Requirements>>
  >;

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

  decodeFailureOption(
    value: FailureEncoded<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): O.Option<Failure<Contract<Name, Config, Requirements>>>;

  encodeFailureOption(
    value: Failure<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): O.Option<FailureEncoded<Contract<Name, Config, Requirements>>>;

  decodeUnknownFailureOption(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): O.Option<Failure<Contract<Name, Config, Requirements>>>;

  encodeUnknownFailureOption(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): O.Option<FailureEncoded<Contract<Name, Config, Requirements>>>;

  decodeFailureEither(
    value: FailureEncoded<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): Either.Either<Failure<Contract<Name, Config, Requirements>>, Failure<Contract<Name, Config, Requirements>>>;

  encodeFailureEither(
    value: Failure<Contract<Name, Config, Requirements>>,
    options?: undefined | AST.ParseOptions
  ): Either.Either<FailureEncoded<Contract<Name, Config, Requirements>>, Failure<Contract<Name, Config, Requirements>>>;

  decodeUnknownFailureEither(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): Either.Either<Failure<Contract<Name, Config, Requirements>>, Failure<Contract<Name, Config, Requirements>>>;

  encodeUnknownFailureEither(
    value: unknown,
    options?: undefined | AST.ParseOptions
  ): Either.Either<FailureEncoded<Contract<Name, Config, Requirements>>, Failure<Contract<Name, Config, Requirements>>>;

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
    options?: Contract<Name, Config, Requirements> extends Any
      ? ImplementOptions<Contract<Name, Config, Requirements>> | undefined
      : never
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
  setPayload<PayloadSchema extends S.Struct<UnsafeTypes.UnsafeAny> | S.Struct.Fields>(
    schema: PayloadSchema
  ): Contract<
    Name,
    {
      readonly payload: PayloadSchema extends S.Struct<infer _>
        ? PayloadSchema
        : PayloadSchema extends S.Struct.Fields
          ? S.Struct<PayloadSchema>
          : never;
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
  annotateContext<I>(context: Context.Context<I>): Contract<Name, Config, Requirements>;
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
 * The strategy used for handling errors returned from contract call implementation
 * execution.
 *
 * If set to `"error"` (the default), errors that occur during contract call implementation
 * execution will be returned in the error channel of the calling effect.
 *
 * If set to `"return"`, errors that occur during contract call implementation execution
 * will be captured and returned as part of the contract call result.
 *
 * @since 1.0.0
 * @category Models
 */
export const FailureModeKit = BS.stringLiteralKit("error", "return");

export class FailureMode extends FailureModeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/contract/Contract/FailureMode"),
  identifier: "FailureMode",
  title: "Failure Mode",
  description: "The strategy used for handling errors returned from contract call implementation execution.",
}) {
  static readonly Enum = FailureModeKit.Enum;
  static readonly Options = FailureModeKit.Options;
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
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a value is a provider-defined contract.
 *
 * @param u - The value to check
 * @returns `true` if the value is a provider-defined `Contract`, `false` otherwise
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/contract/contract-kit/Contract"
 * import * as S from "effect/Schema"
 *
 * const SignInEmail = Contract.make("SignInEmail", {
 *   description: "Authenticates a user with email and password",
 *   payload: {
 *     email: S.String,
 *     password: S.String
 *   },
 *   success: S.Struct({
 *     sessionToken: S.String
 *   })
 * })
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
 *
 * console.log(Contract.isProviderDefined(SignInEmail))           // false
 * console.log(Contract.isProviderDefined(HostedPasswordReset))   // true
 * ```
 *
 * @since 1.0.0
 * @category Guards
 */
export const isProviderDefined = (u: unknown): u is ProviderDefined<string, UnsafeTypes.UnsafeAny> =>
  P.hasProperty(u, ProviderDefinedTypeId);

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

export interface Any extends Pipeable {
  readonly [TypeId]: {
    readonly _Requirements: Covariant<UnsafeTypes.UnsafeAny>;
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | undefined;
  readonly payloadSchema: AnyStructSchema;
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
  > {
}

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
export type Payload<T> = T extends Contract<infer _Name, infer _Config, infer _Requirements>
  ? S.Struct.Type<_Config["payload"]["fields"]>
  : never;

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

// =============================================================================
// Constructors
// =============================================================================

const Proto = {
  [TypeId]: {_Requirements: F.identity},
  pipe() {
    return pipeArguments(this, arguments);
  },
  implement(this: Any, handler: ImplementationHandler<Any>, options?: ImplementOptions<Any>) {
    return implement(this, options)(handler);
  },
  addDependency(this: Any) {
    return userDefinedProto({...this});
  },
  setPayload(this: Any, payloadSchema: S.Struct<UnsafeTypes.UnsafeAny> | S.Struct.Fields) {
    return userDefinedProto({
      ...this,
      payloadSchema: S.isSchema(payloadSchema)
        ? (payloadSchema as UnsafeTypes.UnsafeAny)
        : S.Struct(payloadSchema as UnsafeTypes.UnsafeAny),
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
  decodePayload(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.decode(this.payloadSchema)(value as never, options),
      Effect.catchAll((e) => Effect.die(e))
    );
  },
  encodePayload(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.encode(this.payloadSchema)(value as never, options),
      Effect.catchAll((e) => Effect.die(e))
    );
  },
  decodeUnknownPayload(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.decodeUnknown(this.payloadSchema)(value, options),
      Effect.catchAll((e) => Effect.die(e))
    );
  },
  encodeUnknownPayload(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.encodeUnknown(this.payloadSchema)(value, options),
      Effect.catchAll((e) => Effect.die(e))
    );
  },
  decodePayloadOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return S.decodeOption(S.typeSchema(this.payloadSchema))(value as never, options);
  },
  encodePayloadOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return S.encodeOption(S.encodedBoundSchema(this.payloadSchema))(value as never, options);
  },
  decodeUnknownPayloadOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return S.decodeUnknownOption(S.typeSchema(this.payloadSchema))(value, options);
  },
  encodeUnknownPayloadOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return S.encodeUnknownOption(S.encodedBoundSchema(this.payloadSchema))(value, options);
  },
  decodePayloadEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return S.decodeEither(S.typeSchema(this.payloadSchema))(value as never, options);
  },
  encodePayloadEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return S.encodeEither(S.encodedBoundSchema(this.payloadSchema))(value as never, options);
  },
  decodeUnknownPayloadEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return S.decodeUnknownEither(S.typeSchema(this.payloadSchema))(value, options);
  },
  encodeUnknownPayloadEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return S.encodeUnknownEither(S.encodedBoundSchema(this.payloadSchema))(value, options);
  },
  isPayload(this: Any, value: unknown, options?: undefined | AST.ParseOptions | number) {
    return S.is(this.payloadSchema)(value, options);
  },
  decodeSuccess(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.decode(this.successSchema)(value as never, options),
      Effect.catchAll((e) => Effect.die(e))
    );
  },
  encodeSuccess(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.encode(this.successSchema)(value as never, options),
      Effect.catchAll((e) => Effect.die(e))
    );
  },
  decodeUnknownSuccess(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const successSchema = this.successSchema;
    return Effect.flatMap(
      S.decodeUnknown(successSchema)(value, options),
      Effect.catchAll((e) => Effect.die(e))
    );
  },
  encodeUnknownSuccess(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.encodeUnknown(this.successSchema)(value, options),
      Effect.catchAll((e) => Effect.die(e))
    );
  },
  decodeSuccessOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.decodeOption(schema)(value as never, options);
  },
  encodeSuccessOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.encodeOption(schema)(value as never, options);
  },
  decodeUnknownSuccessOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.decodeUnknownOption(schema)(value, options);
  },
  encodeUnknownSuccessOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.encodeUnknownOption(schema)(value, options);
  },
  decodeSuccessEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.decodeEither(schema)(value as never, options);
  },
  encodeSuccessEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.encodeEither(schema)(value as never, options);
  },
  decodeUnknownSuccessEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.decodeUnknownEither(schema)(value, options);
  },
  encodeUnknownSuccessEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.encodeUnknownEither(schema)(value, options);
  },
  isSuccess(this: Any, value: unknown, options?: undefined | AST.ParseOptions | number) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.is(schema)(value, options);
  },
  decodeOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.decodeOption(schema)(value as never, options);
  },
  encodeOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.encodeOption(schema)(value as never, options);
  },
  decodeUnknownOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.decodeUnknownOption(schema)(value, options);
  },
  encodeUnknownOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.encodeUnknownOption(schema)(value, options);
  },
  decodeEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.decodeEither(schema)(value as never, options);
  },
  encodeEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.encodeEither(schema)(value as never, options);
  },
  decodeUnknownEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.decodeUnknownEither(schema)(value, options);
  },
  encodeUnknownEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.successSchema);
    return S.encodeUnknownEither(schema)(value, options);
  },
  decodeFailure(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.decode(toSchemaAnyNoContext(this.failureSchema))(value as never, options),
      Effect.catchAll(Effect.die)
    );
  },
  encodeFailure(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.encode(toSchemaAnyNoContext(this.failureSchema))(value as never, options),
      Effect.catchAll(Effect.die)
    );
  },
  decodeUnknownFailure(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.decodeUnknown(toSchemaAnyNoContext(this.failureSchema))(value, options),
      Effect.catchAll(Effect.die)
    );
  },
  encodeUnknownFailure(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.encodeUnknown(toSchemaAnyNoContext(this.failureSchema))(value, options),
      Effect.catchAll(Effect.die)
    );
  },
  decodeFailureOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.failureSchema);
    return S.decodeOption(schema)(value as never, options);
  },
  encodeFailureOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.failureSchema);
    return S.encodeOption(schema)(value as never, options);
  },
  decodeUnknownFailureOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.failureSchema);
    return S.decodeUnknownOption(schema)(value, options);
  },
  encodeUnknownFailureOption(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.failureSchema);
    return S.encodeUnknownOption(schema)(value, options);
  },
  decodeFailureEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.failureSchema);
    return S.decodeEither(schema)(value as never, options);
  },
  encodeFailureEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.failureSchema);
    return S.encodeEither(schema)(value as never, options);
  },
  decodeUnknownFailureEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.failureSchema);
    return S.decodeUnknownEither(schema)(value, options);
  },
  encodeUnknownFailureEither(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const schema = toSchemaAnyNoContext(this.failureSchema);
    return S.encodeUnknownEither(schema)(value, options);
  },
  isFailure(this: Any, value: unknown, options?: undefined | AST.ParseOptions | number) {
    const schema = toSchemaAnyNoContext(this.failureSchema);
    return S.is(schema)(value, options);
  },
};

const userDefinedProto = <
  const Name extends string,
  Payload extends AnyStructSchema,
  Success extends S.Schema.Any,
  Failure extends S.Schema.All,
  Mode extends FailureMode.Type,
>(options: {
  readonly name: Name;
  readonly description?: string | undefined;
  readonly payloadSchema: Payload;
  readonly successSchema: Success;
  readonly failureSchema: Failure;
  readonly annotations: Context.Context<never>;
  readonly failureMode: Mode;
}): Contract<
  Name,
  {
    readonly payload: Payload;
    readonly success: Success;
    readonly failure: Failure;
    readonly failureMode: Mode;
  }
> => {
  const self = Object.assign(Object.create(Proto), options);
  self.id = `@beep/contract/Contract/${options.name}`;
  return self;
};

const constEmptyStruct = S.Struct({});

const toSchemaAnyNoContext = <Schema extends S.Schema.All>(
  schema: Schema
): S.Schema<S.Schema.Type<Schema>, S.Schema.Encoded<Schema>, never> =>
  S.asSchema(schema) as S.Schema<S.Schema.Type<Schema>, S.Schema.Encoded<Schema>, never>;

/**
 * Creates a user-defined contract with the specified name and configuration.
 *
 * Use this to expose operations that auth clients call. The contract definition
 * includes parameter validation, success/failure schemas, and optional service
 * dependencies so that the runtime contract stays explicit.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/contract/contract-kit/Contract"
 * import * as S from "effect/Schema"
 *
 * const StartEmailVerification = Contract.make("StartEmailVerification", {
 *   description: "Sends a verification link to a pending member",
 *   payload: {
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
  Payload extends S.Struct.Fields = {},
  Success extends S.Schema.Any = typeof S.Void,
  Failure extends S.Schema.All = typeof S.Never,
  Mode extends FailureMode.Type | undefined = undefined,
  Dependencies extends Array<Context.Tag<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>> = [],
>(
  /**
   * The unique name identifier for this tool.
   */
  name: Name,
  options?: {
    /**
     * An optional description explaining what the tool does.
     */
    readonly description?: string | undefined;
    /**
     * Schema defining the payload this tool accepts.
     */
    readonly payload?: Payload | undefined;
    /**
     * Schema for successful tool execution results.
     */
    readonly success?: Success | undefined;
    /**
     * Schema for tool execution failures.
     */
    readonly failure?: Failure | undefined;
    /**
     * The strategy used for handling errors returned from tool call handler
     * execution.
     *
     * If set to `"error"` (the default), errors that occur during tool call handler
     * execution will be returned in the error channel of the calling effect.
     *
     * If set to `"return"`, errors that occur during tool call handler execution
     * will be captured and returned as part of the tool call result.
     */
    readonly failureMode?: Mode;
    /**
     * Service dependencies required by the tool handler.
     */
    readonly dependencies?: Dependencies | undefined;
  }
): Contract<
  Name,
  {
    readonly payload: S.Struct<Payload>;
    readonly success: Success;
    readonly failure: Failure;
    readonly failureMode: Mode extends undefined ? typeof FailureMode.Enum.error : Mode;
  },
  Context.Tag.Identifier<Dependencies[number]>
> => {
  const successSchema = options?.success ?? S.Void;
  const failureSchema = options?.failure ?? S.Never;
  return userDefinedProto({
    name,
    description: options?.description,
    payloadSchema: options?.payload ? S.Struct(options?.payload as UnsafeTypes.UnsafeAny) : constEmptyStruct,
    successSchema,
    failureSchema,
    failureMode: options?.failureMode ?? FailureMode.Enum.error,
    annotations: Context.empty(),
  }) as UnsafeTypes.UnsafeAny;
};

/**
 * Creates a Contract from a S.TaggedRequest.
 *
 * This utility function converts Effect's TaggedRequest schemas into Contract
 * definitions, automatically mapping the request payload, success, and
 * failure schemas.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/contract/contract-kit/Contract"
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
 * // Convert to a Contract
 * const getInvitationContract = Contract.fromTaggedRequest(GetInvitation)
 * ```
 *
 * @since 1.0.0
 * @category Constructors
 */
export const fromTaggedRequest = <S extends AnyTaggedRequestSchema>(schema: S): FromTaggedRequest<S> =>
  userDefinedProto({
    name: schema._tag,
    description: O.getOrUndefined(AST.getDescriptionAnnotation((schema.ast as UnsafeTypes.UnsafeAny).to)),
    payloadSchema: schema,
    successSchema: schema.success,
    failureSchema: schema.failure,
    failureMode: FailureMode.Enum.error,
    annotations: Context.empty(),
  }) as UnsafeTypes.UnsafeAny;

// =============================================================================
// Annotations
// =============================================================================

/**
 * Annotation for providing a human-readable title for contracts.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/contract/contract-kit/Contract"
 *
 * const myContract = Contract.make("start_password_reset")
 *   .annotate(Contract.Title, "Start Password Reset")
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class Title extends Context.Tag("@beep/contract/Contract/Title")<Title, string>() {
}

/**
 * Annotation for providing a human-readable title for contracts.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/contract/contract-kit/Contract"
 *
 * const myContract = Contract.make("start_password_reset")
 *   .annotate(Contract.Domain, "Organizations")
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class Domain extends Context.Tag("@beep/contract/Contract/Domain")<Domain, string>() {
}

/**
 * Annotation for providing a human-readable title for contracts.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/contract/contract-kit/Contract"
 *
 * const myContract = Contract.make("start_password_reset")
 *   .annotate(Contract.Method, "signIn")
 * ```
 *
 * @since 1.0.0
 * @category Annotations
 */
export class Method extends Context.Tag("@beep/contract/Contract/Method")<Method, string>() {
}

export interface ImplementationContext<C extends Any> {
  readonly contract: C;
  readonly annotations: Context.Context<never>;
}

export type ImplementationHandler<C extends Any> = (
  payload: Payload<C>,
  context: ImplementationContext<C>
) => Effect.Effect<Success<C>, Failure<C>, Requirements<C>>;

export type ImplementationFunction<C extends Any> = (
  payload: Payload<C>
) => Effect.Effect<Success<C>, Failure<C>, Requirements<C>>;

export interface ImplementOptions<C extends Any> {
  readonly onSuccess?:
    | undefined
    | ((success: Success<C>, context: ImplementationContext<C>) => Effect.Effect<void, never, never>);
  readonly onFailure?:
    | undefined
    | ((failure: Failure<C>, context: ImplementationContext<C>) => Effect.Effect<void, never, never>);
}

export const implement =
  <const C extends Any>(contract: C, options: ImplementOptions<C> = {}) =>
    <Handler extends ImplementationHandler<C>>(handler: Handler): ImplementationFunction<C> => {
      const context: ImplementationContext<C> = {
        contract,
        annotations: contract.annotations,
      };
      const onSuccessOpt = O.fromNullable(options.onSuccess);
      const onFailureOpt = O.fromNullable(options.onFailure);
      return Effect.fn(`${contract.name}.implementation`, {captureStackTrace: false})(function* (payload: Payload<C>) {
        yield* Effect.annotateCurrentSpan({
          contract: contract.name,
          failureMode: contract.failureMode,
        });
        let effect = handler(payload, context);
        if (O.isSome(onSuccessOpt)) {
          const onSuccess = onSuccessOpt.value;
          effect = Effect.tap(effect, (success) => onSuccess(success, context));
        }
        if (O.isSome(onFailureOpt)) {
          const onFailure = onFailureOpt.value;
          effect = Effect.tapError(effect, (failure) => onFailure(failure, context));
        }
        return yield* effect;
      });
    };

export interface LiftOptions<C extends Any> {
  readonly method: (payload: Payload<C>) => Effect.Effect<ImplementationResult<C>, Failure<C>, Requirements<C>>;
  readonly onFailure?: undefined | ((failure: Failure<C>) => Effect.Effect<void, never, never>);
  readonly onSuccess?: undefined | ((success: Success<C>) => Effect.Effect<void, never, never>);
  readonly onDefect?: undefined | ((cause: Cause.Cause<unknown>) => Effect.Effect<void, never, never>);
}

export interface LiftedContract<C extends Any> {
  readonly result: (
    payload: Payload<C>
  ) => Effect.Effect<HandleOutcome<C>, Failure<C> | ContractError.UnknownError, Requirements<C>>;
  readonly success: (
    payload: Payload<C>
  ) => Effect.Effect<Success<C>, Failure<C> | ContractError.UnknownError, Requirements<C>>;
}

export const lift = <const C extends Any>(contract: C, options: LiftOptions<C>): LiftedContract<C> => {
  const {method, onFailure, onSuccess, onDefect} = options;

  const annotateOutcome = (outcome: HandleOutcome<C>) =>
    Match.value(outcome).pipe(
      Match.tagsExhaustive({
        success: (successOutcome) =>
          onSuccess
            ? Effect.flatMap(onSuccess(successOutcome.result), () => Effect.succeed(successOutcome))
            : Effect.succeed(successOutcome),
        failure: (failureOutcome) =>
          onFailure
            ? Effect.flatMap(onFailure(failureOutcome.result), () => Effect.succeed(failureOutcome))
            : Effect.succeed(failureOutcome),
      })
    );

  const defectToUnknown = (cause: Cause.Cause<unknown>) =>
    Effect.gen(function* () {
      if (onDefect) {
        yield* onDefect(cause);
      }
      return yield* Effect.fail(
        new ContractError.UnknownError({
          module: contract.name,
          method: contract.name,
          description: "Contract implementation raised an unexpected defect.",
          cause: Cause.squash(cause),
        })
      );
    });

  const toOutcome = (implResult: ImplementationResult<C>) =>
    annotateOutcome(
      FailureMode.matchOutcome(contract, {
        isFailure: implResult.isFailure,
        result: implResult.result,
        encodedResult: implResult.encodedResult as ResultEncoded<C>,
      })
    );

  const liftedResult = (payload: Payload<C>) =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(method(payload));
      return yield* Exit.matchEffect(exit, {
        onFailure: (cause) =>
          O.match(Cause.failureOption(cause), {
            onNone: () => defectToUnknown(cause),
            onSome: (failure) =>
              Effect.gen(function* () {
                if (onFailure) {
                  yield* onFailure(failure);
                }
                return yield* Effect.fail(failure);
              }),
          }),
        onSuccess: (implResult) => toOutcome(implResult),
      });
    });

  const liftedSuccess = (payload: Payload<C>) =>
    Effect.flatMap(liftedResult(payload), (outcome) =>
      Match.value(outcome).pipe(
        Match.tagsExhaustive({
          success: (successOutcome) => Effect.succeed(successOutcome.result),
          failure: (failureOutcome) => Effect.fail(failureOutcome.result),
        })
      )
    );

  return {
    result: liftedResult,
    success: liftedSuccess,
  };
};

export interface HandleOutcomeHandlers<C extends Any, R = void, E = never, Env = never> {
  readonly onSuccess: (success: HandleOutcome.Success<C>) => Effect.Effect<R, E, Env>;
  readonly onFailure: (failure: HandleOutcome.Failure<C>) => Effect.Effect<R, E, Env>;
}

export const handleOutcome =
  <const C extends Any>(_contract: C) =>
    <R, E, Env>(handlers: HandleOutcomeHandlers<C, R, E, Env>) =>
      (outcome: HandleOutcome<C>): Effect.Effect<R, E, Env> =>
        Match.value(outcome).pipe(
          Match.discriminatorsExhaustive("mode")({
            error: (result) =>
              Match.value(result).pipe(
                Match.tagsExhaustive({
                  success: (successOutcome) => handlers.onSuccess(successOutcome),
                })
              ),
            return: (result) =>
              Match.value(result).pipe(
                Match.tagsExhaustive({
                  success: (successOutcome) => handlers.onSuccess(successOutcome),
                  failure: (failureOutcome) => handlers.onFailure(failureOutcome),
                })
              ),
          })
        );


export const getAnnotations = <Ctx extends Any["annotations"]>(
  self: Ctx
) => Effect.gen(function* () {
  const c = (id: ContextAnnotationTag.Type) => Match.value(id).pipe(
    Match.when(ContextAnnotationTag.Enum.Title, () => Title),
    Match.when(ContextAnnotationTag.Enum.Domain, () => Domain),
    Match.when(ContextAnnotationTag.Enum.Method, () => Method),
    Match.exhaustive,
  );

  return yield* F.pipe(
    Effect.all(A.map(ContextAnnotationTag.Options, (id) => Effect.succeed([id, c(id)] as const)), {concurrency: "unbounded"}),
    Effect.map(A.reduce({} as {
        readonly [Id in keyof typeof ContextAnnotationTag.Enum]: string
      }, (acc, [id]) => ({
        ...acc,
        [ContextAnnotationTag.ReverseEnum[id]]: Match.value(id).pipe(
          Match.when(ContextAnnotationTag.Enum.Title, () => F.pipe(
            Context.getOption(
              self,
              Title,
            ),
            O.getOrThrow,
          )),
          Match.when(ContextAnnotationTag.Enum.Domain, () => F.pipe(
            Context.getOption(
              self,
              Domain,
            ),
            O.getOrThrow,
          )),
          Match.when(ContextAnnotationTag.Enum.Method, () => F.pipe(
            Context.getOption(
              self,
              Domain,
            ),
            O.getOrThrow,
          )),
          Match.exhaustive,
        ),
      } as const))
    ));
});

export const getAnnotation = <Ctx extends Any["annotations"]>(
  self: Ctx
) => (mappedKey: keyof typeof ContextAnnotationTag.Enum): Effect.Effect<string, never, never> =>
  Effect.flatMap(getAnnotations(self), (annotations) => Effect.succeed(
    annotations[mappedKey]
  ));


export const ContextAnnotationTagKit = BS.stringLiteralKit(
  "@beep/contract/Contract/Title",
  "@beep/contract/Contract/Domain",
  "@beep/contract/Contract/Method",
  {
    enumMapping: [
      ["@beep/contract/Contract/Title", "Title"],
      ["@beep/contract/Contract/Domain", "Domain"],
      ["@beep/contract/Contract/Method", "Method"],
    ]
  }
);

export class ContextAnnotationTag extends ContextAnnotationTagKit.Schema.annotations({
  schemaId: Symbol.for("@beep/contract/ContextAnnotationTag"),
  identifier: "ContextAnnotationTag",
  title: "Context Annotation Tag",
  description: "One of the possible keys for Context Annotations within `@beep/contract/Contract.ts`"
}) {
  static readonly Options = ContextAnnotationTagKit.Options;
  static readonly Enum = ContextAnnotationTagKit.Enum;
  static readonly ReverseEnum = reverseRecord(ContextAnnotationTagKit.Enum);
  static readonly Discriminated = ContextAnnotationTagKit.toTagged("id");
  static readonly HashSet = HashSet.make(ContextAnnotationTagKit.Options);
  static readonly assertReturn = makeAssertsReturn(ContextAnnotationTag);
  private static readonly toDiscriminated = S.transform(
    ContextAnnotationTag,
    ContextAnnotationTag.Discriminated.Union,
    {
      strict: true,
      decode: (i) => Match.value(i).pipe(
        Match.when(ContextAnnotationTag.Enum.Title, () => Data.struct({
          id: ContextAnnotationTag.Enum.Title,
        } as const)),
        Match.when(ContextAnnotationTag.Enum.Domain, () => Data.struct({
          id: ContextAnnotationTag.Enum.Method,
        } as const)),
        Match.when(ContextAnnotationTag.Enum.Method, () => Data.struct({
          id: ContextAnnotationTag.Enum.Method,
        } as const)),
        Match.exhaustive,
      ),
      encode: ContextAnnotationTag.assertReturn,
    }
  );
  static readonly transformDiscriminated = S.decode(ContextAnnotationTag.toDiscriminated);

  static readonly getOption = <Ctx extends Context.Context<never>>(self: Ctx) => (id: ContextAnnotationTag.Type) => ContextAnnotationTag.transformDiscriminated(id).pipe(
    Effect.flatMap((ctxLiteral) => Match.value(ctxLiteral).pipe(
      Match.discriminatorsExhaustive("id")({
        [ContextAnnotationTag.Enum.Title]: () => Context.getOption(self, Title),
        [ContextAnnotationTag.Enum.Domain]: () => Context.getOption(self, Domain),
        [ContextAnnotationTag.Enum.Method]: () => Context.getOption(self, Method),
      })
    ))
  );
}

export declare namespace ContextAnnotationTag {
  export type Type = typeof ContextAnnotationTag.Type
  export type Encoded = typeof ContextAnnotationTag.Encoded

}