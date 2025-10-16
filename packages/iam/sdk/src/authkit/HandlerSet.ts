/**
 * The `HandlerSet` module groups related auth handlers into a cohesive bundle
 * that can be implemented once and shared across clients.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 * import * as HandlerSet from "@beep/iam-sdk/authkit/HandlerSet"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 *
 * const StartPasswordReset = Handler.make("StartPasswordReset", {
 *   description: "Issues a reset token for a pending user",
 *   parameters: { email: S.String },
 *   success: S.Struct({ tokenId: S.String })
 * })
 *
 * const VerifyMfaCode = Handler.make("VerifyMfaCode", {
 *   description: "Validates a one-time passcode",
 *   parameters: { userId: S.String, code: S.String },
 *   success: S.Struct({ sessionToken: S.String })
 * })
 *
 * const AuthHandlers = HandlerSet.make(StartPasswordReset, VerifyMfaCode)
 *
 * const layer = AuthHandlers.toLayer({
 *   StartPasswordReset: ({ email }) =>
 *     Effect.succeed({ tokenId: `token-${email}` }),
 *   VerifyMfaCode: ({ userId, code }) =>
 *     Effect.succeed({ sessionToken: `${userId}:${code}` })
 * })
 * ```
 *
 * @since 1.0.0
 */

import type { UnsafeTypes } from "@beep/types";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { CommitPrototype } from "effect/Effectable";
import { identity } from "effect/Function";
import type { Inspectable } from "effect/Inspectable";
import { BaseProto as InspectableProto } from "effect/Inspectable";
import * as Layer from "effect/Layer";
import type { ParseError } from "effect/ParseResult";
import * as ParseResult from "effect/ParseResult";
import { type Pipeable, pipeArguments } from "effect/Pipeable";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type * as Scope from "effect/Scope";
import * as Handler from "./Handler";
import * as IamError from "./IamError";

/**
 * Unique identifier for handlerSet instances.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export const TypeId = "~@beep/iam-sdk/HandlerSet";

/**
 * Type-level representation of the handlerSet identifier.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export type TypeId = typeof TypeId;

/**
 * Represents a collection of auth handlers that are deployed together.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 * import * as HandlerSet from "@beep/iam-sdk/authkit/HandlerSet"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 *
 * const SignInEmail = Handler.make("SignInEmail", {
 *   description: "Authenticates a user with email and password",
 *   parameters: { email: S.String, password: S.String },
 *   success: S.Struct({ sessionToken: S.String })
 * })
 *
 * const RefreshSession = Handler.make("RefreshSession", {
 *   description: "Issues a fresh session token",
 *   parameters: { refreshToken: S.String },
 *   success: S.Struct({ sessionToken: S.String })
 * })
 *
 * const Kit = HandlerSet.make(SignInEmail, RefreshSession)
 *
 * const implementations = Kit.toLayer({
 *   SignInEmail: ({ email }) => Effect.succeed({ sessionToken: email }),
 *   RefreshSession: ({ refreshToken }) => Effect.succeed({ sessionToken: refreshToken })
 * })
 * ```
 *
 * @since 1.0.0
 * @category Models
 */
export interface HandlerSet<in out Tools extends Record<string, Handler.Any>>
  extends Effect.Effect<WithImplementation<Tools>, never, Handler.ImplementationsFor<Tools>>,
    Inspectable,
    Pipeable {
  readonly [TypeId]: TypeId;

  new (_: never): {};

  /**
   * A record containing all handlers in this handlerSet.
   */
  readonly handlers: Tools;

  /**
   * A helper method which can be used for type-safe implementation declarations.
   */
  of<Implementations extends ImplementationsFrom<Tools>>(implementations: Implementations): Implementations;

  /**
   * Converts a handlerSet into an Effect Context containing implementations for each handler
   * in the handlerSet.
   */
  toContext<Implementations extends ImplementationsFrom<Tools>, EX = never, RX = never>(
    build: Implementations | Effect.Effect<Implementations, EX, RX>
  ): Effect.Effect<Context.Context<Handler.ImplementationsFor<Tools>>, EX, RX>;

  /**
   * Converts a handlerSet into a Layer containing implementations for each handler in the
   * handlerSet.
   */
  toLayer<Implementations extends ImplementationsFrom<Tools>, EX = never, RX = never>(
    /**
     * Implementation functions or Effect that produces implementations.
     */
    build: Implementations | Effect.Effect<Implementations, EX, RX>
  ): Layer.Layer<Handler.ImplementationsFor<Tools>, EX, Exclude<RX, Scope.Scope>>;
}

/**
 * A utility type which structurally represents any handlerSet instance.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export interface Any {
  readonly [TypeId]: TypeId;
  readonly handlers: Record<string, Handler.Any>;
}

/**
 * A utility type which can be used to extract the handler definitions from a
 * handlerSet.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type Tools<T> = T extends HandlerSet<infer Tools> ? Tools : never;

/**
 * A utility type which can transforms either a record or an array of handlers into
 * a record where keys are handler names and values are the handler instances.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type ToolsByName<Tools> = Tools extends Record<string, Handler.Any>
  ? { readonly [Name in keyof Tools]: Tools[Name] }
  : Tools extends ReadonlyArray<Handler.Any>
    ? { readonly [Tool in Tools[number] as Tool["name"]]: Tool }
    : never;

/**
 * A utility type that maps handler names to their required implementation functions.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type ImplementationsFrom<Tools extends Record<string, Handler.Any>> = {
  readonly [Name in keyof Tools as Handler.RequiresImplementation<Tools[Name]> extends true ? Name : never]: (
    params: Handler.Parameters<Tools[Name]>
  ) => Effect.Effect<Handler.Success<Tools[Name]>, Handler.Failure<Tools[Name]>, Handler.Requirements<Tools[Name]>>;
};

/**
 * A handlerSet instance with registered implementations ready for handler execution.
 *
 * @since 1.0.0
 * @category Models
 */
export interface WithImplementation<in out Tools extends Record<string, Handler.Any>> {
  /**
   * The handlers available in this handlerSet instance.
   */
  readonly handlers: Tools;

  /**
   * Implementation function for executing handler calls.
   *
   * Receives a handler name and parameters, validates the input, executes the
   * corresponding implementation, and returns both the typed result and encoded result.
   */
  readonly handle: <Name extends keyof Tools>(
    /**
     * The name of the handler to execute.
     */
    name: Name,
    /**
     * Parameters to pass to the handler implementation.
     */
    params: Handler.Parameters<Tools[Name]>
  ) => Effect.Effect<
    Handler.ImplementationResult<Tools[Name]>,
    Handler.Failure<Tools[Name]>,
    Handler.Requirements<Tools[Name]>
  >;
}

const Proto = {
  ...CommitPrototype,
  ...InspectableProto,
  of: identity,
  toContext(
    this: HandlerSet<Record<string, Handler.Any>>,
    build:
      | Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>
      | Effect.Effect<Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>>
  ) {
    return Effect.gen(this, function* () {
      const context = yield* Effect.context<never>();
      const implementations = Effect.isEffect(build) ? yield* build : build;
      const contextMap = new Map<string, unknown>();
      for (const [name, implementation] of Object.entries(implementations)) {
        const handler = this.handlers[name]!;
        contextMap.set(handler.id, { implementation, context });
      }
      return Context.unsafeMake(contextMap);
    });
  },
  toLayer(
    this: HandlerSet<Record<string, Handler.Any>>,
    build:
      | Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>
      | Effect.Effect<Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>>
  ) {
    return Layer.scopedContext(this.toContext(build));
  },
  commit(this: HandlerSet<Record<string, Handler.Any>>) {
    return Effect.gen(this, function* () {
      const handlers = this.handlers;
      const context = yield* Effect.context<never>();
      const schemasCache = new WeakMap<
        UnsafeTypes.UnsafeAny,
        {
          readonly context: Context.Context<never>;
          readonly implementation: (
            params: UnsafeTypes.UnsafeAny
          ) => Effect.Effect<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>;
          readonly decodeParameters: (
            u: unknown
          ) => Effect.Effect<Handler.Parameters<UnsafeTypes.UnsafeAny>, ParseError>;
          readonly validateResult: (u: unknown) => Effect.Effect<unknown, ParseError>;
          readonly encodeResult: (u: unknown) => Effect.Effect<unknown, ParseError>;
        }
      >();
      const getSchemas = (handler: Handler.Any) => {
        let schemas = schemasCache.get(handler);
        if (P.isUndefined(schemas)) {
          const implementation = context.unsafeMap.get(handler.id)! as Handler.Implementation<UnsafeTypes.UnsafeAny>;
          const decodeParameters = S.decodeUnknown(handler.parametersSchema) as UnsafeTypes.UnsafeAny;
          const resultSchema = S.Union(handler.successSchema, handler.failureSchema);
          const validateResult = S.validate(resultSchema) as UnsafeTypes.UnsafeAny;
          const encodeResult = S.encodeUnknown(resultSchema) as UnsafeTypes.UnsafeAny;
          schemas = {
            context: implementation.context,
            implementation: implementation.implementation,
            decodeParameters,
            validateResult,
            encodeResult,
          };
          schemasCache.set(handler, schemas);
        }
        return schemas;
      };
      const handle = Effect.fn("HandlerSet.handle", { captureStackTrace: false })(function* (
        name: string,
        params: unknown
      ) {
        yield* Effect.annotateCurrentSpan({ handler: name, parameters: params });
        const handler = handlers[name];
        if (P.isUndefined(handler)) {
          const handlerNames = Object.keys(handlers).join(",");
          return yield* new IamError.MalformedOutput({
            module: "HandlerSet",
            method: `${name}.handle`,
            description: `Failed to find handler with name '${name}' in handlerSet - available handlers: ${handlerNames}`,
          });
        }
        const schemas = getSchemas(handler);
        const decodedParams = yield* Effect.mapError(
          schemas.decodeParameters(params),
          (cause) =>
            new IamError.MalformedOutput({
              module: "HandlerSet",
              method: `${name}.handle`,
              description: `Failed to decode handler call parameters for handler '${name}' from:\n'${JSON.stringify(
                params,
                undefined,
                2
              )}'`,
              cause,
            })
        );
        const { isFailure, result } = yield* schemas.implementation(decodedParams).pipe(
          Effect.map((result) => ({ result, isFailure: false })),
          Effect.catchAll((error) =>
            // If the handler implementation failed, check the handler's failure mode to
            // determine how the result should be returned to the end user
            handler.failureMode === "error" ? Effect.fail(error) : Effect.succeed({ result: error, isFailure: true })
          ),
          Effect.tap(({ result }) => schemas.validateResult(result)),
          Effect.mapInputContext((input) => Context.merge(schemas.context, input)),
          Effect.mapError((cause) =>
            ParseResult.isParseError(cause)
              ? new IamError.MalformedInput({
                  module: "HandlerSet",
                  method: `${name}.handle`,
                  description: `Failed to validate handler call result for handler '${name}'`,
                  cause,
                })
              : cause
          )
        );
        const encodedResult = yield* Effect.mapError(
          schemas.encodeResult(result),
          (cause) =>
            new IamError.MalformedInput({
              module: "HandlerSet",
              method: `${name}.handle`,
              description: `Failed to encode handler call result for handler '${name}'`,
              cause,
            })
        );
        return {
          isFailure,
          result,
          encodedResult,
        } satisfies Handler.ImplementationResult<UnsafeTypes.UnsafeAny>;
      });
      return {
        handlers,
        handle,
      } satisfies WithImplementation<Record<string, UnsafeTypes.UnsafeAny>>;
    });
  },
  toJSON(this: HandlerSet<UnsafeTypes.UnsafeAny>): unknown {
    return {
      _id: "@beep/iam-sdk/HandlerSet",
      handlers: Array.from(Object.values(this.handlers)).map((handler) => (handler as Handler.Any).name),
    };
  },
  pipe() {
    return pipeArguments(this, arguments);
  },
};

const makeProto = <Tools extends Record<string, Handler.Any>>(handlers: Tools): HandlerSet<Tools> =>
  Object.assign(() => {}, Proto, { handlers }) as UnsafeTypes.UnsafeAny;

const resolveInput = <Tools extends ReadonlyArray<Handler.Any>>(...handlers: Tools): Record<string, Tools[number]> => {
  const output = {} as Record<string, Tools[number]>;
  for (const handler of handlers) {
    output[handler.name] = (
      S.isSchema(handler) ? Handler.fromTaggedRequest(handler as UnsafeTypes.UnsafeAny) : handler
    ) as UnsafeTypes.UnsafeAny;
  }
  return output;
};

/**
 * An empty handlerSet with no handlers.
 *
 * Useful as a starting point for building handlerSets or as a default value. Can
 * be extended using the merge function to add handlers.
 *
 * @since 1.0.0
 * @category Constructors
 */
export const empty: HandlerSet<{}> = makeProto({});

/**
 * Creates a new handlerSet from the specified handlers.
 *
 * Use this to compose related auth handlers so they can be provided and
 * implemented together. Handlers can be `Handler.make` definitions or tagged
 * requests converted with `Handler.fromTaggedRequest`.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 * import * as HandlerSet from "@beep/iam-sdk/authkit/HandlerSet"
 * import * as S from "effect/Schema"
 *
 * const SignInEmail = Handler.make("SignInEmail", {
 *   parameters: { email: S.String, password: S.String },
 *   success: S.Struct({ sessionToken: S.String })
 * })
 *
 * const VerifyInvite = Handler.make("VerifyInvite", {
 *   parameters: { token: S.String },
 *   success: S.Struct({ memberId: S.String })
 * })
 *
 * const handlerSet = HandlerSet.make(SignInEmail, VerifyInvite)
 * ```
 *
 * @since 1.0.0
 * @category Constructors
 */
export const make = <Tools extends ReadonlyArray<Handler.Any>>(...handlers: Tools): HandlerSet<ToolsByName<Tools>> =>
  makeProto(resolveInput(...handlers)) as UnsafeTypes.UnsafeAny;

/**
 * A utility type which simplifies a record type.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type SimplifyRecord<T> = { [K in keyof T]: T[K] } & {};

/**
 * A utility type which merges two records of handlers together.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type MergeRecords<U> = {
  readonly [K in Extract<U extends unknown ? keyof U : never, string>]: Extract<
    U extends Record<K, infer V> ? V : never,
    Handler.Any
  >;
};

/**
 * A utility type which merges the handler calls of two handlerSets into a single
 * handlerSet.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type MergedTools<HandlerSets extends ReadonlyArray<Any>> = SimplifyRecord<
  MergeRecords<Tools<HandlerSets[number]>>
>;

/**
 * Merges multiple handlerSets into a single handlerSet.
 *
 * Combines all handlers from the provided handlerSets into one unified handlerSet.
 * If there are naming conflicts, handlers from later handlerSets will override
 * handlers from earlier ones.
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 * import * as HandlerSet from "@beep/iam-sdk/authkit/HandlerSet"
 *
 * const signInKit = HandlerSet.make(
 *   Handler.make("SignInEmail"),
 *   Handler.make("SignInMagicLink")
 * )
 *
 * const recoveryKit = HandlerSet.make(
 *   Handler.make("StartPasswordReset"),
 *   Handler.make("CompletePasswordReset")
 * )
 *
 * const combined = HandlerSet.merge(signInKit, recoveryKit)
 * // combined now has: SignInEmail, SignInMagicLink, StartPasswordReset, CompletePasswordReset
 * ```
 *
 * @example
 * ```ts
 * import * as Handler from "@beep/iam-sdk/authkit/Handler"
 * import * as HandlerSet from "@beep/iam-sdk/authkit/HandlerSet"
 *
 * // Incremental handlerSet building
 * const baseKit = HandlerSet.make(Handler.make("SignOut"))
 * const extendedKit = HandlerSet.merge(
 *   baseKit,
 *   HandlerSet.make(Handler.make("LinkSocialAccount")),
 *   HandlerSet.make(Handler.make("UnlinkSocialAccount"))
 * )
 * ```
 *
 * @since 1.0.0
 * @category Constructors
 */
export const merge = <const HandlerSets extends ReadonlyArray<Any>>(
  /**
   * The handlerSets to merge together.
   */
  ...handlerSets: HandlerSets
): HandlerSet<MergedTools<HandlerSets>> => {
  const handlers = {} as Record<string, UnsafeTypes.UnsafeAny>;
  for (const handlerSet of handlerSets) {
    for (const [name, handler] of Object.entries(handlerSet.handlers)) {
      handlers[name] = handler;
    }
  }
  return makeProto(handlers) as UnsafeTypes.UnsafeAny;
};
