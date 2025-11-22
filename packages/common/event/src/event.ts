import type { StringTypes, UnsafeTypes } from "@beep/types";
import * as MsgPack from "@effect/platform/MsgPack";
import { pipeArguments } from "effect/Pipeable";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { $EventId } from "./internal";

/**
 * @since 0.1.0
 * @category type ids
 */
export const TypeId: unique symbol = Symbol.for($EventId.identifier);

/**
 * @since 0.1.0
 * @category type ids
 */
export type TypeId = typeof TypeId;

/**
 * @since 0.1.0
 * @category guards
 */
export const isEvent = (
  u: unknown
): u is Event<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny> =>
  P.hasProperty(u, TypeId);

/**
 * Represents an event in an EventLog.
 *
 * @since 0.1.0
 * @category models
 */
export interface Event<
  out Tag extends StringTypes.NonEmptyString,
  in out Payload extends S.Schema.Any = typeof S.Void,
  in out Success extends S.Schema.Any = typeof S.Void,
  in out Error extends S.Schema.All = typeof S.Never,
> {
  readonly [TypeId]: TypeId;
  readonly tag: Tag;
  readonly primaryKey: (payload: S.Schema.Type<Payload>) => string;
  readonly payload: Payload;
  readonly payloadMsgPack: MsgPack.schema<Payload>;
  readonly success: Success;
  readonly error: Error;
}

/**
 * @since 0.1.0
 * @category models
 */
export interface EventHandler<in out Tag extends StringTypes.NonEmptyString> {
  readonly _: unique symbol;
  readonly tag: Tag;
}

/**
 * @since 0.1.0
 * @category models
 */
export declare namespace Event {
  /**
   * @since 0.1.0
   * @category models
   */
  export interface Any {
    readonly [TypeId]: TypeId;
    readonly tag: StringTypes.NonEmptyString;
  }

  /**
   * @since 0.1.0
   * @category models
   */
  export interface AnyWithProps extends Event<StringTypes.NonEmptyString, S.Schema.Any, S.Schema.Any, S.Schema.Any> {}

  /**
   * @since 0.1.0
   * @category models
   */
  export type ToService<A> = A extends Event<infer _Tag, infer _Payload, infer _Success, infer _Error>
    ? EventHandler<_Tag>
    : never;

  /**
   * @since 0.1.0
   * @category models
   */
  export type Tag<A> = A extends Event<infer _Tag, infer _Payload, infer _Success, infer _Error> ? _Tag : never;

  /**
   * @since 0.1.0
   * @category models
   */
  export type ErrorSchema<A extends Any> = A extends Event<infer _Tag, infer _Payload, infer _Success, infer _Error>
    ? _Error
    : never;

  /**
   * @since 0.1.0
   * @category models
   */
  export type Error<A extends Any> = S.Schema.Type<ErrorSchema<A>>;

  /**
   * @since 0.1.0
   * @category models
   */
  export type AddError<A extends Any, Error extends S.Schema.Any> = A extends Event<
    infer _Tag,
    infer _Payload,
    infer _Success,
    infer _Error
  >
    ? Event<_Tag, _Payload, _Success, _Error | Error>
    : never;

  /**
   * @since 0.1.0
   * @category models
   */
  export type PayloadSchema<A extends Any> = A extends Event<infer _Tag, infer _Payload, infer _Success, infer _Error>
    ? _Payload
    : never;

  /**
   * @since 0.1.0
   * @category models
   */
  export type Payload<A extends Any> = S.Schema.Type<PayloadSchema<A>>;

  /**
   * @since 0.1.0
   * @category models
   */
  export type TaggedPayload<A extends Any> = A extends Event<infer _Tag, infer _Payload, infer _Success, infer _Error>
    ? {
        readonly _tag: _Tag;
        readonly payload: S.Schema.Type<_Payload>;
      }
    : never;

  /**
   * @since 0.1.0
   * @category models
   */
  export type SuccessSchema<A extends Any> = A extends Event<infer _Tag, infer _Payload, infer _Success, infer _Error>
    ? _Success
    : never;

  /**
   * @since 0.1.0
   * @category models
   */
  export type Success<A extends Any> = S.Schema.Type<SuccessSchema<A>>;

  /**
   * @since 0.1.0
   * @category models
   */
  export type Context<A> = A extends Event<infer _Name, infer _Payload, infer _Success, infer _Error>
    ? S.Schema.Context<_Payload> | S.Schema.Context<_Success> | S.Schema.Context<_Error>
    : never;

  /**
   * @since 0.1.0
   * @category models
   */
  export type WithTag<Events extends Any, Tag extends StringTypes.NonEmptyString> = Extract<
    Events,
    { readonly tag: Tag }
  >;

  /**
   * @since 0.1.0
   * @category models
   */
  export type ExcludeTag<Events extends Any, Tag extends StringTypes.NonEmptyString> = Exclude<
    Events,
    { readonly tag: Tag }
  >;

  /**
   * @since 0.1.0
   * @category models
   */
  export type PayloadWithTag<Events extends Any, Tag extends StringTypes.NonEmptyString> = Payload<
    WithTag<Events, Tag>
  >;

  /**
   * @since 0.1.0
   * @category models
   */
  export type SuccessWithTag<Events extends Any, Tag extends StringTypes.NonEmptyString> = Success<
    WithTag<Events, Tag>
  >;

  /**
   * @since 0.1.0
   * @category models
   */
  export type ErrorWithTag<Events extends Any, Tag extends StringTypes.NonEmptyString> = Error<WithTag<Events, Tag>>;

  /**
   * @since 0.1.0
   * @category models
   */
  export type ContextWithTag<Events extends Any, Tag extends StringTypes.NonEmptyString> = Context<
    WithTag<Events, Tag>
  >;
}

const Proto = {
  [TypeId]: TypeId,
  pipe() {
    return pipeArguments(this, arguments);
  },
};

/**
 * @since 0.1.0
 * @category constructors
 */
export const make = <
  Tag extends StringTypes.NonEmptyString,
  Payload extends S.Schema.Any = typeof S.Void,
  Success extends S.Schema.Any = typeof S.Void,
  Error extends S.Schema.All = typeof S.Never,
>(options: {
  readonly tag: Tag;
  readonly primaryKey: (payload: S.Schema.Type<Payload>) => string;
  readonly payload?: Payload;
  readonly success?: Success;
  readonly error?: Error;
}): Event<Tag, Payload, Success, Error> =>
  Object.assign(Object.create(Proto), {
    tag: options.tag,
    primaryKey: options.primaryKey,
    payload: options.payload ?? S.Void,
    payloadMsgPack: MsgPack.schema(options.payload ?? S.Void),
    success: options.success ?? S.Void,
    error: options.error ?? S.Never,
  });
