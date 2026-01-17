/**
 * @since 1.0.0
 */

import { $WrapId } from "@beep/identity/packages";
import type { UnsafeTypes } from "@beep/types";
import * as Context_ from "effect/Context";
import type { Effect } from "effect/Effect";
import type { Exit as Exit_ } from "effect/Exit";
import { globalValue } from "effect/GlobalValue";
import type { ReadonlyMailbox } from "effect/Mailbox";
import * as O from "effect/Option";
import { type Pipeable, pipeArguments } from "effect/Pipeable";
import * as P from "effect/Predicate";
import * as PrimaryKey from "effect/PrimaryKey";
import * as S from "effect/Schema";
import type { Stream } from "effect/Stream";
import type { NoInfer } from "effect/Types";
import type * as WrapperMiddleware from "./middleware";
import * as WrapperSchema from "./schema";
import {
  type AnySchema,
  type AnyStructOrFields,
  type AnyTaggedRequestSchema,
  structOrElseMakeFromFields,
} from "./schema";

const $I = $WrapId.create("wrapper");
/**
 * @since 1.0.0
 * @category type ids
 */
export const TypeId: unique symbol = Symbol.for($I`Wrapper`);

/**
 * @since 1.0.0
 * @category type ids
 */
export type TypeId = typeof TypeId;

/**
 * @since 1.0.0
 * @category guards
 */
export const isWrapper = (
  u: unknown
): u is Wrapper<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny> => P.hasProperty(u, TypeId);

/**
 * Represents an API endpoint. An API endpoint is mapped to a single route on
 * the underlying `HttpRouter`.
 *
 * @since 1.0.0
 * @category models
 */
export interface Wrapper<
  in out Tag extends string,
  out Payload extends AnySchema = typeof S.Void,
  out Success extends S.Schema.Any = typeof S.Void,
  out Error extends S.Schema.All = typeof S.Never,
  out Middleware extends WrapperMiddleware.TagClassAny = never,
> extends Pipeable {
  new (_: never): {};

  readonly [TypeId]: TypeId;
  readonly _tag: Tag;
  readonly key: string;
  readonly payloadSchema: Payload;
  readonly successSchema: Success;
  readonly errorSchema: Error;
  readonly annotations: Context_.Context<never>;
  readonly middlewares: ReadonlySet<Middleware>;

  /**
   * Set the schema for the success response of the rpc.
   */
  setSuccess<S extends S.Schema.Any>(schema: S): Wrapper<Tag, Payload, S, Error, Middleware>;

  /**
   * Implement the wrapper with a handler function.
   * Returns the implementation function unchanged, but with type constraints
   * ensuring the payload, success, and error types match the wrapper's schemas.
   */
  implement<Requirements>(
    impl: (payload: S.Schema.Type<Payload>) => Effect<S.Schema.Type<Success>, S.Schema.Type<Error>, Requirements>
  ): (payload: S.Schema.Type<Payload>) => Effect<S.Schema.Type<Success>, S.Schema.Type<Error>, Requirements>;

  /**
   * Set the schema for the error response of the rpc.
   */
  setError<E extends S.Schema.Any>(schema: E): Wrapper<Tag, Payload, Success, E, Middleware>;

  /**
   * Set the schema for the payload of the rpc.
   */
  setPayload<P extends AnyStructOrFields>(
    schema: P
  ): Wrapper<
    Tag,
    P extends S.Struct<infer _> ? P : P extends S.Struct.Fields ? S.Struct<P> : never,
    Success,
    Error,
    Middleware
  >;

  /**
   * Add an `WrapperMiddleware` to this procedure.
   */
  middleware<M extends WrapperMiddleware.TagClassAny>(
    middleware: M
  ): Wrapper<Tag, Payload, Success, Error, Middleware | M>;

  /**
   * Set the schema for the error response of the rpc.
   */
  prefix<const Prefix extends string>(prefix: Prefix): Wrapper<`${Prefix}${Tag}`, Payload, Success, Error, Middleware>;

  /**
   * Add an annotation on the rpc.
   */
  annotate<I, S>(tag: Context_.Tag<I, S>, value: S): Wrapper<Tag, Payload, Success, Error, Middleware>;

  /**
   * Merge the annotations of the rpc with the provided context.
   */
  annotateContext<I>(context: Context_.Context<I>): Wrapper<Tag, Payload, Success, Error, Middleware>;
}

/**
 * Represents an implemented rpc.
 *
 * @since 1.0.0
 * @category models
 */
export interface Handler<Tag extends string> {
  readonly _: unique symbol;
  readonly tag: Tag;
  readonly handler: (
    request: UnsafeTypes.UnsafeAny,
    options: {
      readonly clientId: number;
    }
  ) => Effect<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny> | Stream<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>;
  readonly context: Context<never>;
}

/**
 * @since 1.0.0
 * @category models
 */
export interface Any extends Pipeable {
  readonly [TypeId]: TypeId;
  readonly _tag: string;
  readonly key: string;
}

/**
 * @since 1.0.0
 * @category models
 */
export interface AnyWithProps {
  readonly [TypeId]: TypeId;
  readonly _tag: string;
  readonly key: string;
  readonly payloadSchema: AnySchema;
  readonly successSchema: S.Schema.Any;
  readonly errorSchema: S.Schema.All;
  readonly annotations: Context_.Context<never>;
  readonly middlewares: ReadonlySet<WrapperMiddleware.TagClassAnyWithProps>;
}

/**
 * @since 1.0.0
 * @category models
 */
export type Tag<R> =
  R extends Wrapper<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware> ? _Tag : never;

/**
 * @since 1.0.0
 * @category models
 */
export type SuccessSchema<R> =
  R extends Wrapper<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware> ? _Success : never;

/**
 * @since 1.0.0
 * @category models
 */
export type Success<R> =
  R extends Wrapper<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware>
    ? _Success["Type"]
    : never;

/**
 * @since 1.0.0
 * @category models
 */
export type SuccessEncoded<R> =
  R extends Wrapper<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware>
    ? _Success["Encoded"]
    : never;

/**
 * @since 1.0.0
 * @category models
 */
export type SuccessExit<R> =
  SuccessSchema<R> extends infer S
    ? S extends WrapperSchema.Stream<infer _A, infer _E>
      ? void
      : S.Schema.Type<S>
    : never;

/**
 * @since 1.0.0
 * @category models
 */
export type SuccessExitEncoded<R> =
  SuccessSchema<R> extends infer S
    ? S extends WrapperSchema.Stream<infer _A, infer _E>
      ? void
      : S.Schema.Encoded<S>
    : never;

/**
 * @since 1.0.0
 * @category models
 */
export type SuccessChunk<R> = Success<R> extends Stream<infer _A, infer _E, infer _Env> ? _A : never;

/**
 * @since 1.0.0
 * @category models
 */
export type SuccessChunkEncoded<R> = SuccessEncoded<R> extends Stream<infer _A, infer _E, infer _Env> ? _A : never;

/**
 * @since 1.0.0
 * @category models
 */
export type ErrorSchema<R> =
  R extends Wrapper<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware>
    ? _Error | _Middleware
    : never;

/**
 * @since 1.0.0
 * @category models
 */
export type Error<R> = S.Schema.Type<ErrorSchema<R>>;

/**
 * @since 1.0.0
 * @category models
 */
export type ErrorEncoded<R> = S.Schema.Encoded<ErrorSchema<R>>;
/**
 * @since 1.0.0
 * @category models
 */
export type ErrorExit<R> =
  SuccessSchema<R> extends WrapperSchema.Stream<infer _A, infer _E> ? _E["Type"] | Error<R> : Error<R>;

/**
 * @since 1.0.0
 * @category models
 */
export type ErrorExitEncoded<R> =
  SuccessSchema<R> extends WrapperSchema.Stream<infer _A, infer _E> ? _E["Encoded"] | ErrorEncoded<R> : ErrorEncoded<R>;

/**
 * @since 1.0.0
 * @category models
 */
export type Exit<R> = Exit_<SuccessExit<R>, ErrorExit<R>>;

/**
 * @since 1.0.0
 * @category models
 */
export type ExitEncoded<R, Defect = unknown> = S.ExitEncoded<SuccessExitEncoded<R>, ErrorExitEncoded<R>, Defect>;

/**
 * @since 1.0.0
 * @category models
 */
export type PayloadConstructor<R> =
  R extends Wrapper<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware>
    ? _Payload extends { readonly fields: S.Struct.Fields }
      ? S.Simplify<S.Struct.Constructor<_Payload["fields"]>>
      : _Payload["Type"]
    : never;

/**
 * @since 1.0.0
 * @category models
 */
export type Payload<R> =
  R extends Wrapper<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware>
    ? _Payload["Type"]
    : never;

/**
 * @since 1.0.0
 * @category models
 */
export type Context<R> =
  R extends Wrapper<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware>
    ? _Payload["Context"] | _Success["Context"] | _Error["Context"]
    : never;

/**
 * @since 1.0.0
 * @category models
 */
export type Middleware<R> =
  R extends Wrapper<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware>
    ? Context_.Tag.Identifier<_Middleware>
    : never;

/**
 * @since 1.0.0
 * @category models
 */
export type MiddlewareClient<R> =
  R extends Wrapper<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware>
    ? _Middleware extends { readonly requiredForClient: true }
      ? WrapperMiddleware.ForClient<Context_.Tag.Identifier<_Middleware>>
      : never
    : never;

/**
 * @since 1.0.0
 * @category models
 */
export type AddError<R extends Any, Error extends S.Schema.All> = R extends Wrapper<
  infer _Tag,
  infer _Payload,
  infer _Success,
  infer _Error,
  infer _Middleware
>
  ? Wrapper<_Tag, _Payload, _Success, _Error | Error, _Middleware>
  : never;

/**
 * @since 1.0.0
 * @category models
 */
export type AddMiddleware<R extends Any, Middleware extends WrapperMiddleware.TagClassAny> = R extends Wrapper<
  infer _Tag,
  infer _Payload,
  infer _Success,
  infer _Error,
  infer _Middleware
>
  ? Wrapper<_Tag, _Payload, _Success, _Error, _Middleware | Middleware>
  : never;

/**
 * @since 1.0.0
 * @category models
 */
export type ToHandler<R extends Any> =
  R extends Wrapper<infer _Tag, infer _Payload, infer _Success, infer _Error, infer _Middleware>
    ? Handler<_Tag>
    : never;

/**
 * @since 1.0.0
 * @category models
 */
export type ToHandlerFn<Current extends Any, R = UnsafeTypes.UnsafeAny> = (
  payload: Payload<Current>,
  options: {
    readonly clientId: number;
  }
) => ResultFrom<Current, R> | WrapperWrapper<ResultFrom<Current, R>>;

/**
 * @since 1.0.0
 * @category models
 */
export type IsStream<R extends Any, Tag extends string> = R extends Wrapper<
  Tag,
  infer _Payload,
  WrapperSchema.Stream<infer _A, infer _E>,
  infer _Error,
  infer _Middleware
>
  ? true
  : never;

/**
 * @since 1.0.0
 * @category models
 */
export type ExtractTag<R extends Any, Tag extends string> = R extends Wrapper<
  Tag,
  infer _Payload,
  infer _Success,
  infer _Error,
  infer _Middleware
>
  ? R
  : never;

/**
 * @since 1.0.0
 * @category models
 */
export type ExtractProvides<R extends Any, Tag extends string> = R extends Wrapper<
  Tag,
  infer _Payload,
  infer _Success,
  infer _Error,
  infer _Middleware
>
  ? _Middleware extends {
      readonly provides: Context_.Tag<infer _I, infer _S>;
    }
    ? _I
    : never
  : never;

/**
 * @since 1.0.0
 * @category models
 */
export type ExcludeProvides<Env, R extends Any, Tag extends string> = Exclude<Env, ExtractProvides<R, Tag>>;

/**
 * @since 1.0.0
 * @category models
 */
export interface From<S extends AnyTaggedRequestSchema> extends Wrapper<S["_tag"], S, S["success"], S["failure"]> {}

/**
 * @since 1.0.0
 * @category models
 */
export type ResultFrom<R extends Any, Context> = R extends Wrapper<
  infer _Tag,
  infer _Payload,
  infer _Success,
  infer _Error,
  infer _Middleware
>
  ? [_Success] extends [WrapperSchema.Stream<infer _SA, infer _SE>]
    ?
        | Stream<_SA["Type"], _SE["Type"] | _Error["Type"], Context>
        | Effect<
            ReadonlyMailbox<_SA["Type"], _SE["Type"] | _Error["Type"]>,
            _SE["Type"] | S.Schema.Type<_Error>,
            Context
          >
    : Effect<_Success["Type"], _Error["Type"], Context>
  : never;

/**
 * @since 1.0.0
 * @category models
 */
export type Prefixed<Wrappers extends Any, Prefix extends string> = Wrappers extends Wrapper<
  infer _Tag,
  infer _Payload,
  infer _Success,
  infer _Error,
  infer _Middleware
>
  ? Wrapper<`${Prefix}${_Tag}`, _Payload, _Success, _Error, _Middleware>
  : never;

const Proto = {
  [TypeId]: TypeId,
  pipe() {
    return pipeArguments(this, arguments);
  },
  setSuccess(this: AnyWithProps, successSchema: S.Schema.Any) {
    return makeProto({
      _tag: this._tag,
      payloadSchema: this.payloadSchema,
      successSchema,
      errorSchema: this.errorSchema,
      annotations: this.annotations,
      middlewares: this.middlewares,
    });
  },
  setError(this: AnyWithProps, errorSchema: S.Schema.All) {
    return makeProto({
      _tag: this._tag,
      payloadSchema: this.payloadSchema,
      successSchema: this.successSchema,
      errorSchema,
      annotations: this.annotations,
      middlewares: this.middlewares,
    });
  },
  setPayload(this: AnyWithProps, payloadSchema: AnyStructOrFields) {
    return makeProto({
      _tag: this._tag,
      payloadSchema: structOrElseMakeFromFields(payloadSchema),
      successSchema: this.successSchema,
      errorSchema: this.errorSchema,
      annotations: this.annotations,
      middlewares: this.middlewares,
    });
  },
  middleware(this: AnyWithProps, middleware: WrapperMiddleware.TagClassAny) {
    return makeProto({
      _tag: this._tag,
      payloadSchema: this.payloadSchema,
      successSchema: this.successSchema,
      errorSchema: this.errorSchema,
      annotations: this.annotations,
      middlewares: new Set([...this.middlewares, middleware]),
    });
  },
  prefix(this: AnyWithProps, prefix: string) {
    return makeProto({
      _tag: `${prefix}${this._tag}`,
      payloadSchema: this.payloadSchema,
      successSchema: this.successSchema,
      errorSchema: this.errorSchema,
      annotations: this.annotations,
      middlewares: this.middlewares,
    });
  },
  annotate(
    this: AnyWithProps,
    tag: Context_.Tag<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>,
    value: UnsafeTypes.UnsafeAny
  ) {
    return makeProto({
      _tag: this._tag,
      payloadSchema: this.payloadSchema,
      successSchema: this.successSchema,
      errorSchema: this.errorSchema,
      middlewares: this.middlewares,
      annotations: Context_.add(this.annotations, tag, value),
    });
  },
  annotateContext(this: AnyWithProps, context: Context_.Context<UnsafeTypes.UnsafeAny>) {
    return makeProto({
      _tag: this._tag,
      payloadSchema: this.payloadSchema,
      successSchema: this.successSchema,
      errorSchema: this.errorSchema,
      middlewares: this.middlewares,
      annotations: Context_.merge(this.annotations, context),
    });
  },
  implement(this: AnyWithProps, impl: UnsafeTypes.UnsafeAny) {
    return impl;
  },
};

const makeProto = <
  const Tag extends string,
  Payload extends S.Schema.Any,
  Success extends S.Schema.Any,
  Error extends S.Schema.All,
  Middleware extends WrapperMiddleware.TagClassAny,
>(options: {
  readonly _tag: Tag;
  readonly payloadSchema: Payload;
  readonly successSchema: Success;
  readonly errorSchema: Error;
  readonly annotations: Context_.Context<never>;
  readonly middlewares: ReadonlySet<Middleware>;
}): Wrapper<Tag, Payload, Success, Error, Middleware> => {
  function Wrapper() {}
  Object.setPrototypeOf(Wrapper, Proto);
  Object.assign(Wrapper, options);
  Wrapper.key = `${$I.string()}/${options._tag}`;
  return Wrapper as UnsafeTypes.UnsafeAny;
};

/**
 * @since 1.0.0
 * @category constructors
 */
export const make = <
  const Tag extends string,
  Payload extends S.Schema.Any | S.Struct.Fields = typeof S.Void,
  Success extends S.Schema.Any = typeof S.Void,
  Error extends S.Schema.All = typeof S.Never,
  const Stream extends boolean = false,
>(
  tag: Tag,
  options?: {
    readonly payload?: Payload;
    readonly success?: Success;
    readonly error?: Error;
    readonly stream?: Stream;
    readonly primaryKey?: [Payload] extends [S.Struct.Fields]
      ? (payload: S.Simplify<S.Struct.Type<NoInfer<Payload>>>) => string
      : never;
  }
): Wrapper<
  Tag,
  Payload extends S.Struct.Fields ? S.Struct<Payload> : Payload,
  Stream extends true ? WrapperSchema.Stream<Success, Error> : Success,
  Stream extends true ? typeof S.Never : Error
> => {
  const successSchema = options?.success ?? S.Void;
  const errorSchema = options?.error ?? S.Never;
  let payloadSchema: UnsafeTypes.UnsafeAny;
  if (options?.primaryKey) {
    payloadSchema = class Payload extends (
      S.Class<Payload>(`${$I.string()}/${tag}`)(options.payload as UnsafeTypes.UnsafeAny)
    ) {
      [PrimaryKey.symbol](): string {
        return options.primaryKey!(this as UnsafeTypes.UnsafeAny);
      }
    };
  } else {
    payloadSchema = S.isSchema(options?.payload)
      ? (options?.payload as UnsafeTypes.UnsafeAny)
      : options?.payload
        ? S.Struct(options?.payload as UnsafeTypes.UnsafeAny)
        : S.Void;
  }
  return makeProto({
    _tag: tag,
    payloadSchema,
    successSchema: options?.stream
      ? WrapperSchema.Stream({
          success: successSchema,
          failure: errorSchema,
        })
      : successSchema,
    errorSchema: options?.stream ? S.Never : errorSchema,
    annotations: Context_.empty(),
    middlewares: new Set<never>(),
  }) as UnsafeTypes.UnsafeAny;
};

/**
 * @since 1.0.0
 * @category constructors
 */
export const fromTaggedRequest = <S extends AnyTaggedRequestSchema>(schema: S): From<S> =>
  makeProto({
    _tag: schema._tag,
    payloadSchema: schema as UnsafeTypes.UnsafeAny,
    successSchema: schema.success as UnsafeTypes.UnsafeAny,
    errorSchema: schema.failure,
    annotations: Context_.empty(),
    middlewares: new Set<never>(),
  }) as UnsafeTypes.UnsafeAny;

const exitSchemaCache = globalValue($I`exitSchemaCache`, () => new WeakMap<Any, S.Schema.Any>());

/**
 * @since 1.0.0
 * @category constructors
 */
export const exitSchema = <R extends Any>(self: R): S.Schema<Exit<R>, ExitEncoded<R>, Context<R>> => {
  if (exitSchemaCache.has(self)) {
    return exitSchemaCache.get(self) as UnsafeTypes.UnsafeAny;
  }
  const rpc = self as UnsafeTypes.UnsafeAny as AnyWithProps;
  const failures = new Set<S.Schema.All>([rpc.errorSchema]);
  const streamSchemas = WrapperSchema.getStreamSchemas(rpc.successSchema.ast);
  if (O.isSome(streamSchemas)) {
    failures.add(streamSchemas.value.failure);
  }
  for (const middleware of rpc.middlewares) {
    failures.add(middleware.failure);
  }
  const schema = S.Exit({
    success: O.isSome(streamSchemas) ? S.Void : rpc.successSchema,
    failure: S.Union(...failures),
    defect: S.Defect,
  });
  exitSchemaCache.set(self, schema);
  return schema as UnsafeTypes.UnsafeAny;
};

/**
 * @since 1.0.0
 * @category WrapperWrapper
 */
export const WrapperWrapperTypeId: unique symbol = Symbol.for($I`WrapperWrapper`);

/**
 * @since 1.0.0
 * @category WrapperWrapper
 */
export type WrapperWrapperTypeId = typeof WrapperWrapperTypeId;

/**
 * @since 1.0.0
 * @category WrapperWrapper
 */
export interface WrapperWrapper<A> {
  readonly [WrapperWrapperTypeId]: WrapperWrapperTypeId;
  readonly value: A;
  readonly fork: boolean;
  readonly uninterruptible: boolean;
}

/**
 * @since 1.0.0
 * @category WrapperWrapper
 */
export const isWrapperWrapper = (u: object): u is WrapperWrapper<UnsafeTypes.UnsafeAny> => WrapperWrapperTypeId in u;

/**
 * @since 1.0.0
 * @category WrapperWrapper
 */
export const wrapWrapper =
  (options: { readonly fork?: boolean | undefined; readonly uninterruptible?: boolean | undefined }) =>
  <A extends object>(value: A): A extends WrapperWrapper<infer _> ? A : WrapperWrapper<A> =>
    (isWrapperWrapper(value)
      ? {
          [WrapperWrapperTypeId]: WrapperWrapperTypeId,
          value: value.value,
          fork: options.fork ?? value.fork,
          uninterruptible: options.uninterruptible ?? value.uninterruptible,
        }
      : {
          [WrapperWrapperTypeId]: WrapperWrapperTypeId,
          value,
          fork: options.fork ?? false,
          uninterruptible: options.uninterruptible ?? false,
        }) as UnsafeTypes.UnsafeAny;

/**
 * You can use `fork` to wrap a response Effect or Stream, to ensure that the
 * response is executed concurrently regardless of the WrapperServer concurrency
 * setting.
 *
 * @since 1.0.0
 * @category WrapperWrapper
 */
export const fork: <A extends object>(value: A) => A extends WrapperWrapper<infer _> ? A : WrapperWrapper<A> =
  wrapWrapper({ fork: true });

/**
 * You can use `uninterruptible` to wrap a response Effect or Stream, to ensure
 * that it is executed inside an uninterruptible region.
 *
 * @since 1.0.0
 * @category WrapperWrapper
 */
export const uninterruptible: <A extends object>(
  value: A
) => A extends WrapperWrapper<infer _> ? A : WrapperWrapper<A> = wrapWrapper({
  uninterruptible: true,
});
