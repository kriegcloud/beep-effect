/**
 * @since 1.0.0
 */

import { $WrapId } from "@beep/identity/packages";
import type { UnsafeTypes } from "@beep/types";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import { Scope } from "effect/Scope";
import type { Mutable } from "effect/Types";
import type { Request } from "./message";
import type * as Wrapper from "./wrapper";

const $I = $WrapId.create("middleware");

/**
 * @since 1.0.0
 * @category type ids
 */
export const TypeId: unique symbol = Symbol.for($I`WrapperMiddleware`);

/**
 * @since 1.0.0
 * @category type ids
 */
export type TypeId = typeof TypeId;

/**
 * @since 1.0.0
 * @category models
 */
export interface WrapperMiddleware<Provides, E> {
  // biome-ignore lint/style/useShorthandFunctionType: no
  (options: {
    readonly clientId: number;
    readonly rpc: Wrapper.AnyWithProps;
    readonly payload: unknown;
  }): Effect.Effect<Provides, E>;
}

/**
 * @since 1.0.0
 * @category models
 */
export interface WrapperMiddlewareWrap<Provides, E> {
  // biome-ignore lint/style/useShorthandFunctionType: no
  (options: {
    readonly clientId: number;
    readonly rpc: Wrapper.AnyWithProps;
    readonly payload: unknown;

    readonly next: Effect.Effect<SuccessValue, E, Provides>;
  }): Effect.Effect<SuccessValue, E>;
}

/**
 * @since 1.0.0
 * @category models
 */
export interface SuccessValue {
  readonly _: unique symbol;
}

/**
 * @since 1.0.0
 * @category models
 */
export interface WrapperMiddlewareClient<R = never> {
  // biome-ignore lint/style/useShorthandFunctionType: no
  (options: {
    readonly rpc: Wrapper.AnyWithProps;
    readonly request: Request<Wrapper.Any>;
  }): Effect.Effect<Request<Wrapper.Any>, never, R>;
}

/**
 * @since 1.0.0
 * @category models
 */
export interface ForClient<Id> {
  readonly _: unique symbol;
  readonly id: Id;
}

/**
 * @since 1.0.0
 * @category models
 */
export interface Any {
  // biome-ignore lint/style/useShorthandFunctionType: no
  (options: {
    readonly rpc: Wrapper.AnyWithProps;
    readonly payload: unknown;
    readonly next?: Effect.Effect<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>;
  }): Effect.Effect<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>;
}

/**
 * @since 1.0.0
 * @category models
 */
export interface TagClass<Self, Name extends string, Options>
  extends TagClass.Base<
    Self,
    Name,
    Options,
    TagClass.Wrap<Options> extends true
      ? WrapperMiddlewareWrap<TagClass.Provides<Options>, TagClass.Failure<Options>>
      : WrapperMiddleware<TagClass.Service<Options>, TagClass.FailureService<Options>>
  > {}

/**
 * @since 1.0.0
 * @category models
 */
export declare namespace TagClass {
  /**
   * @since 1.0.0
   * @category models
   */
  export type Provides<Options> = Options extends {
    readonly provides: Context.Tag<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>;
    readonly optional?: false;
  }
    ? Context.Tag.Identifier<Options["provides"]>
    : never;

  /**
   * @since 1.0.0
   * @category models
   */
  export type Service<Options> = Options extends {
    readonly provides: Context.Tag<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>;
  }
    ? Context.Tag.Service<Options["provides"]>
    : void;

  /**
   * @since 1.0.0
   * @category models
   */
  export type FailureSchema<Options> = Options extends { readonly failure: S.Schema.All; readonly optional?: false }
    ? Options["failure"]
    : typeof S.Never;

  /**
   * @since 1.0.0
   * @category models
   */
  export type Failure<Options> = Options extends {
    readonly failure: S.Schema<infer _A, infer _I, infer _R>;
    readonly optional?: false;
  }
    ? _A
    : never;

  /**
   * @since 1.0.0
   * @category models
   */
  export type FailureContext<Options> = S.Schema.Context<FailureSchema<Options>>;

  /**
   * @since 1.0.0
   * @category models
   */
  export type FailureService<Options> = Optional<Options> extends true ? unknown : Failure<Options>;

  /**
   * @since 1.0.0
   * @category models
   */
  export type Optional<Options> = Options extends { readonly optional: true } ? true : false;

  /**
   * @since 1.0.0
   * @category models
   */
  export type RequiredForClient<Options> = Options extends { readonly requiredForClient: true } ? true : false;

  /**
   * @since 1.0.0
   * @category models
   */
  export type Wrap<Options> = Options extends { readonly wrap: true } ? true : false;

  /**
   * @since 1.0.0
   * @category models
   */
  export interface Base<Self, Name extends string, Options, Service> extends Context.Tag<Self, Service> {
    new (_: never): Context.TagClassShape<Name, Service>;
    readonly [TypeId]: TypeId;
    readonly optional: Optional<Options>;
    readonly failure: FailureSchema<Options>;
    readonly provides: Options extends { readonly provides: Context.Tag<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny> }
      ? Options["provides"]
      : undefined;
    readonly requiredForClient: RequiredForClient<Options>;
    readonly wrap: Wrap<Options>;
  }
}

/**
 * @since 1.0.0
 * @category models
 */
export interface TagClassAny extends Context.Tag<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny> {
  readonly [TypeId]: TypeId;
  readonly optional: boolean;
  readonly provides?: Context.Tag<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny> | undefined;
  readonly failure: S.Schema.All;
  readonly requiredForClient: boolean;
  readonly wrap: boolean;
}

/**
 * @since 1.0.0
 * @category models
 */
export interface TagClassAnyWithProps
  extends Context.Tag<
    UnsafeTypes.UnsafeAny,
    | WrapperMiddleware<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>
    | WrapperMiddlewareWrap<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>
  > {
  readonly [TypeId]: TypeId;
  readonly optional: boolean;
  readonly provides?: Context.Tag<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>;
  readonly failure: S.Schema.All;
  readonly requiredForClient: boolean;
  readonly wrap: boolean;
}

/**
 * @since 1.0.0
 * @category tags
 */
export const Tag =
  <Self>(): (<
    const Name extends string,
    const Options extends {
      readonly wrap?: boolean;
      readonly optional?: boolean;
      readonly failure?: S.Schema.All;
      readonly provides?: Context.Tag<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>;
      readonly requiredForClient?: boolean;
    },
  >(
    id: Name,
    options?: Options | undefined
  ) => TagClass<Self, Name, Options>) =>
  (
    id: string,
    options?: {
      readonly optional?: boolean;
      readonly failure?: S.Schema.All;
      readonly provides?: Context.Tag<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>;
      readonly requiredForClient?: boolean;
      readonly wrap?: boolean;
    }
  ) => {
    const Err = globalThis.Error as UnsafeTypes.UnsafeAny;
    const limit = Err.stackTraceLimit;
    Err.stackTraceLimit = 2;
    const creationError = new Err();
    Err.stackTraceLimit = limit;

    function TagClass() {}
    const TagClass_ = TagClass as UnsafeTypes.UnsafeAny as Mutable<TagClassAny>;
    Object.setPrototypeOf(TagClass, Object.getPrototypeOf(Context.GenericTag<Self, UnsafeTypes.UnsafeAny>(id)));
    TagClass.key = id;
    Object.defineProperty(TagClass, "stack", {
      get() {
        return creationError.stack;
      },
    });
    TagClass_[TypeId] = TypeId;
    TagClass_.failure = options?.optional === true || options?.failure === undefined ? S.Never : options.failure;
    if (options?.provides) {
      TagClass_.provides = options.provides;
    }
    TagClass_.optional = options?.optional ?? false;
    TagClass_.requiredForClient = options?.requiredForClient ?? false;
    TagClass_.wrap = options?.wrap ?? false;
    return TagClass as UnsafeTypes.UnsafeAny;
  };

/**
 * @since 1.0.0
 * @category client
 */
export const layerClient = <Id, S, R, EX = never, RX = never>(
  tag: Context.Tag<Id, S>,
  service: WrapperMiddlewareClient<R> | Effect.Effect<WrapperMiddlewareClient<R>, EX, RX>
): Layer.Layer<ForClient<Id>, EX, R | Exclude<RX, Scope>> =>
  Layer.scopedContext(
    Effect.gen(function* () {
      const context = (yield* Effect.context<R | Scope>()).pipe(Context.omit(Scope)) as Context.Context<R>;
      const middleware = Effect.isEffect(service) ? yield* service : service;
      return Context.unsafeMake(
        new Map([
          [
            `${tag.key}/Client`,
            (options: UnsafeTypes.UnsafeAny) =>
              Effect.mapInputContext(middleware(options), (requestContext) => Context.merge(context, requestContext)),
          ],
        ])
      );
    })
  );
