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
import type { UnsafeTypes } from "@beep/types";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { pipeArguments } from "effect/Pipeable";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import type { ContractError } from "../contract-error";
import * as _internal from "../utils";
import { TypeId } from "./constants";

import { failureContinuation } from "./continuation";
import type {
  Any,
  AnyStructSchema,
  AnyTaggedRequestSchema,
  Contract,
  FailureContinuationOptions,
  FromTaggedRequest,
  ImplementationContext,
  ImplementationFunction,
  ImplementationHandler,
  ImplementOptions,
  Payload,
} from "./types";
import { FailureMode } from "./types";

// =============================================================================
// Constructors
// =============================================================================

const Proto = {
  [TypeId]: { _Requirements: F.identity },
  pipe() {
    return pipeArguments(this, arguments);
  },
  implement(this: Any, handler: ImplementationHandler<Any>, options?: ImplementOptions<Any> | undefined) {
    return implement(this, options)(handler);
  },
  addDependency(this: Any) {
    return userDefinedProto({ ...this });
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
  continuation<Failure = ContractError.UnknownError, Extra extends Record<string, unknown> = Record<string, unknown>>(
    this: Any,
    options?: FailureContinuationOptions<Any, Failure, Extra>
  ) {
    return failureContinuation(this, options);
  },
  decodePayload(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.decode(this.payloadSchema)(value, options),
      Effect.catchAll((e) => Effect.die(e))
    );
  },
  encodePayload(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.encode(this.payloadSchema)(value, options),
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
  isPayload(this: Any, value: unknown, options?: undefined | AST.ParseOptions | number) {
    return S.is(this.payloadSchema)(value, options);
  },
  decodeSuccess(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.decode(this.successSchema)(value, options),
      Effect.catchAll((e) => Effect.die(e))
    );
  },
  encodeSuccess(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.encode(this.successSchema)(value, options),
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
  isSuccess(this: Any, value: unknown, options?: undefined | AST.ParseOptions | number) {
    return S.is(this.successSchema)(value, options);
  },
  decodeFailure(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.decode(_internal.toSchemaAnyNoContext(this.failureSchema))(value, options),
      Effect.catchAll(Effect.die)
    );
  },
  encodeFailure(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.encode(_internal.toSchemaAnyNoContext(this.failureSchema))(value, options),
      Effect.catchAll(Effect.die)
    );
  },
  decodeUnknownFailure(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.decodeUnknown(_internal.toSchemaAnyNoContext(this.failureSchema))(value, options),
      Effect.catchAll(Effect.die)
    );
  },
  encodeUnknownFailure(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.flatMap(
      S.encodeUnknown(_internal.toSchemaAnyNoContext(this.failureSchema))(value, options),
      Effect.catchAll(Effect.die)
    );
  },
  isFailure(this: Any, value: unknown, options?: undefined | AST.ParseOptions | number) {
    const schema = _internal.toSchemaAnyNoContext(this.failureSchema);
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
  options?:
    | {
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
    | undefined
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
    payloadSchema: options?.payload ? S.Struct(options?.payload as UnsafeTypes.UnsafeAny) : _internal.constEmptyStruct,
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

export const implement =
  <const C extends Any>(contract: C, options: ImplementOptions<C> = {}) =>
  <Handler extends ImplementationHandler<C>>(handler: Handler): ImplementationFunction<C> => {
    const context: ImplementationContext<C> = {
      contract,
      annotations: contract.annotations,
    };
    const onSuccessOpt = O.fromNullable(options.onSuccess);
    const onFailureOpt = O.fromNullable(options.onFailure);

    const continuation = failureContinuation(contract);

    return Effect.fn(`${contract.name}.implementation`, { captureStackTrace: false })(function* (payload: Payload<C>) {
      yield* Effect.annotateCurrentSpan({
        contract: contract.name,
        failureMode: contract.failureMode,
      });
      let effect = handler(payload, {
        context,
        continuation,
      });
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

export * from "./annotations";
export * from "./constants";
export * from "./continuation";
export * from "./lift";
export * from "./types";
