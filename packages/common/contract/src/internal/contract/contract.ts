/**
 * Effect-first helpers for building, annotating, and implementing RPC-style
 * contracts. Use this module whenever you want to describe how clients interact
 * with a runtime in a fully typed, schema-validated way.
 *
 * @example
 * ```ts
 * const Summarize = Contract.make("Summarize", {
 *   description: "Summarize a block of markdown",
 *   payload: { markdown: S.String },
 *   success: S.Struct({ paragraphs: S.Array(S.String) }),
 * });
 *
 * const implementation = Summarize.implement(({ markdown }) =>
 *   Effect.succeed({ paragraphs: [`Summary for ${markdown.length} chars`] })
 * );
 * ```
 *
 * @since 1.0.0
 */
import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
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
  AnySchema,
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
  /**
   * Creates a strongly typed implementation bound to this contract. See
   * {@link implement} for additional details about the returned function.
   */
  implement(this: Any, handler: ImplementationHandler<Any>, options?: ImplementOptions<Any> | undefined) {
    return implement(this, options)(handler);
  },
  /**
   * Adds a request-scoped dependency that will be required when calling this
   * contract. Use this when downstream runtimes must supply context per
   * invocation rather than at construction time.
   */
  addDependency(this: Any) {
    return userDefinedProto({ ...this });
  },
  /**
   * Replaces the payload schema used to validate inputs before invoking an
   * implementation.
   *
   * @param payloadSchema - Either a schema instance or struct fields describing
   *   the new payload shape.
   */
  setPayload(this: Any, payloadSchema: S.Struct<UnsafeTypes.UnsafeAny> | S.Schema.Any | S.Struct.Fields) {
    return userDefinedProto({
      ...this,
      payloadSchema: S.isSchema(payloadSchema)
        ? (payloadSchema as any)
        : payloadSchema
          ? S.Struct(payloadSchema as any)
          : S.Void,
    });
  },
  /**
   * Overrides the schema describing successful results for the contract.
   *
   * @param successSchema - Schema encoding the new success payload.
   */
  setSuccess(this: Any, successSchema: S.Schema.Any) {
    return userDefinedProto({
      ...this,
      successSchema,
    });
  },
  /**
   * Overrides the schema describing failure results for the contract.
   *
   * @param failureSchema - Schema encoding structured failures.
   */
  setFailure(this: Any, failureSchema: S.Schema.All) {
    return userDefinedProto({
      ...this,
      failureSchema,
    });
  },
  /**
   * Attaches a single annotation value to the contract.
   *
   * @param tag - Annotation tag to populate.
   * @param value - Annotation value.
   */
  annotate<I, S>(this: Any, tag: Context.Tag<I, S>, value: S) {
    return userDefinedProto({
      ...this,
      annotations: Context.add(this.annotations, tag, value),
    });
  },

  /**
   * Attaches multiple annotations to the contract.
   *
   * @param annotations - Array of annotation tags and values to populate.
   */
  withAnnotations<Annotations extends A.NonEmptyReadonlyArray<readonly [Context.Tag<any, any>, any]>>(
    this: Any,
    ...annotations: Annotations
  ) {
    return userDefinedProto({
      ...this,
      annotations: F.pipe(
        annotations,
        A.reduce(this.annotations as Context.Context<never>, (acc, [tag, value]) => Context.add(acc, tag, value))
      ),
    });
  },
  /**
   * Merges an annotation context into the existing annotations.
   *
   * @param context - Context of annotation tags to merge.
   */
  annotateContext<I>(this: Any, context: Context.Context<I>) {
    return userDefinedProto({
      ...this,
      annotations: Context.merge(this.annotations, context),
    });
  },
  /**
   * Creates a continuation helper for this contract. Continuations centralize
   * metadata derivation, abort handling, and transport error normalization.
   *
   * @param options - Overrides for metadata, abort support, and error shaping.
   */
  continuation<Failure = ContractError.UnknownError, Extra extends Record<string, unknown> = Record<string, unknown>>(
    this: Any,
    options?: FailureContinuationOptions<Any, Failure, Extra>
  ) {
    return failureContinuation(this, options);
  },
  /**
   * Decodes a known payload value according to the payload schema. Defects if
   * validation fails.
   */
  decodePayload(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.catchAll(S.decode(this.payloadSchema)(value, options), (e) => Effect.die(e));
  },
  /**
   * Encodes a typed payload into its transport representation. Defects if
   * encoding fails.
   */
  encodePayload(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.catchAll(S.encode(this.payloadSchema)(value, options), (e) => Effect.die(e));
  },
  /**
   * Decodes an unknown input into the payload type. Useful when inputs come
   * from an untyped transport such as HTTP.
   */
  decodeUnknownPayload(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.catchAll(S.decodeUnknown(this.payloadSchema)(value, options), (e) => Effect.die(e));
  },
  /**
   * Encodes an unknown payload by first validating it against the schema.
   */
  encodeUnknownPayload(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.catchAll(S.encodeUnknown(this.payloadSchema)(value, options), (e) => Effect.die(e));
  },
  /**
   * Runtime predicate to check if a value conforms to the payload schema.
   */
  isPayload(this: Any, value: unknown, options?: undefined | AST.ParseOptions | number) {
    return S.is(this.payloadSchema)(value, options);
  },
  /**
   * Decodes a known success payload into the schema-defined type.
   */
  decodeSuccess(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.catchAll(S.decode(this.successSchema)(value, options), (e) => Effect.die(e));
  },
  /**
   * Encodes a success value for transport or persistence.
   */
  encodeSuccess(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.catchAll(S.encode(this.successSchema)(value, options), (e) => Effect.die(e));
  },
  /**
   * Decodes an arbitrary value into the success schema.
   */
  decodeUnknownSuccess(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    const successSchema = this.successSchema;
    return Effect.catchAll(S.decodeUnknown(successSchema)(value, options), (e) => Effect.die(e));
  },
  /**
   * Encodes an arbitrary success-like input after validating it.
   */
  encodeUnknownSuccess(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.catchAll(S.encodeUnknown(this.successSchema)(value, options), (e) => Effect.die(e));
  },
  /**
   * Runtime predicate that checks whether a value adheres to the success
   * schema.
   */
  isSuccess(this: Any, value: unknown, options?: undefined | AST.ParseOptions | number) {
    return S.is(this.successSchema)(value, options);
  },
  /**
   * Decodes a known failure payload into its typed representation.
   */
  decodeFailure(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.catchAll(S.decode(_internal.toSchemaAnyNoContext(this.failureSchema))(value, options), Effect.die);
  },
  /**
   * Encodes a structured failure according to the declared schema.
   */
  encodeFailure(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.catchAll(S.encode(_internal.toSchemaAnyNoContext(this.failureSchema))(value, options), Effect.die);
  },
  /**
   * Decodes an arbitrary value into the failure schema, surfacing validation
   * defects if the value is malformed.
   */
  decodeUnknownFailure(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.catchAll(
      S.decodeUnknown(_internal.toSchemaAnyNoContext(this.failureSchema))(value, options),
      Effect.die
    );
  },
  /**
   * Encodes an arbitrary failure-like input after validation.
   */
  encodeUnknownFailure(this: Any, value: unknown, options?: undefined | AST.ParseOptions) {
    return Effect.catchAll(
      S.encodeUnknown(_internal.toSchemaAnyNoContext(this.failureSchema))(value, options),
      Effect.die
    );
  },
  /**
   * Runtime predicate to determine whether a value matches the failure schema.
   */
  isFailure(this: Any, value: unknown, options?: undefined | AST.ParseOptions | number) {
    const schema = _internal.toSchemaAnyNoContext(this.failureSchema);
    return S.is(schema)(value, options);
  },
};

const userDefinedProto = <
  const Name extends string,
  Payload extends AnySchema,
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
  Payload extends S.Schema.Any | S.Struct.Fields = typeof S.Void,
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
  Payload extends S.Struct.Fields
    ? {
        readonly payload: S.Struct<Payload>;
        readonly success: Success;
        readonly failure: Failure;
        readonly failureMode: Mode extends undefined ? typeof FailureMode.Enum.error : Mode;
      }
    : {
        readonly payload: Payload;
        readonly success: Success;
        readonly failure: Failure;
        readonly failureMode: Mode extends undefined ? typeof FailureMode.Enum.error : Mode;
      },
  Context.Tag.Identifier<Dependencies[number]>
> => {
  const successSchema = options?.success ?? S.Void;
  const failureSchema = options?.failure ?? S.Never;
  const payloadSchema = S.isSchema(options?.payload)
    ? (options?.payload as any)
    : options?.payload
      ? S.Struct(options?.payload as any)
      : S.Void;
  return userDefinedProto({
    name,
    description: options?.description,
    payloadSchema,
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

/**
 * Curried helper used by both the prototype and namespace `implement` methods.
 * Creates a function that wires handler hooks, span annotations, and optional
 * continuation overrides for a specific contract.
 */
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

    return Effect.fn(`${contract.name}.implementation`, { captureStackTrace: false })(
      function* (payload: Payload<C>) {
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
      },
      Effect.tapError((e) => Effect.logError(e)),
      (effect, n) =>
        Effect.annotateLogs({
          contractName: contract.name,
          metadata: continuation.metadata,
          payload: n,
        })(effect)
    );
  };

export * from "./annotations";
export * from "./constants";
export * from "./continuation";
export * from "./lift";
export * from "./types";
