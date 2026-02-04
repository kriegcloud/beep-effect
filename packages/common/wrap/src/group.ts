/**
 * @since 0.1.0
 */

import { $WrapId } from "@beep/identity/packages";
import type { UnsafeTypes } from "@beep/types";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { identity } from "effect/Function";
import * as Layer from "effect/Layer";
import type { ReadonlyMailbox } from "effect/Mailbox";
import type { Pipeable } from "effect/Pipeable";
import type * as Record from "effect/Record";
import * as S from "effect/Schema";
import type { Scope } from "effect/Scope";
import * as Stream from "effect/Stream";
import type * as WrapperMiddleware from "./middleware";
import * as Wrapper from "./wrapper";

const $I = $WrapId.create("group");
/**
 * @since 0.1.0
 * @category type ids
 */
export const TypeId: unique symbol = Symbol.for($I`WrapperGroup`);

/**
 * @since 0.1.0
 * @category type ids
 */
export type TypeId = typeof TypeId;

/**
 * @since 0.1.0
 * @category groups
 */
export interface WrapperGroup<in out R extends Wrapper.Any> extends Pipeable {
  new (_: never): {};

  readonly [TypeId]: TypeId;
  readonly requests: ReadonlyMap<string, R>;
  readonly annotations: Context.Context<never>;

  /**
   * Add one or more procedures to the group.
   */
  add<const Wrappers2 extends ReadonlyArray<Wrapper.Any>>(...rpcs: Wrappers2): WrapperGroup<R | Wrappers2[number]>;

  /**
   * Merge this group with one or more other groups.
   */
  merge<const Groups extends ReadonlyArray<Any>>(...groups: Groups): WrapperGroup<R | Wrappers<Groups[number]>>;

  /**
   * Add middleware to all the procedures added to the group until this point.
   */
  middleware<M extends WrapperMiddleware.TagClassAny>(middleware: M): WrapperGroup<Wrapper.AddMiddleware<R, M>>;

  /**
   * Add a prefix to the procedures in this group, returning a new group
   */
  prefix<const Prefix extends string>(prefix: Prefix): WrapperGroup<Wrapper.Prefixed<R, Prefix>>;

  /**
   * Implement the handlers for the procedures in this group, returning a
   * context object.
   */
  toHandlersContext<Handlers extends HandlersFrom<R>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Effect.Effect<Context.Context<Wrapper.ToHandler<R>>, EX, RX | HandlersContext<R, Handlers>>;

  /**
   * Implement the handlers for the procedures in this group.
   */
  toLayer<Handlers extends HandlersFrom<R>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Layer.Layer<Wrapper.ToHandler<R>, EX, Exclude<RX, Scope> | HandlersContext<R, Handlers>>;

  of<const Handlers extends HandlersFrom<R>>(handlers: Handlers): Handlers;

  /**
   * Implement a single handler from the group.
   */
  toLayerHandler<const Tag extends R["_tag"], Handler extends HandlerFrom<R, Tag>, EX = never, RX = never>(
    tag: Tag,
    build: Handler | Effect.Effect<Handler, EX, RX>
  ): Layer.Layer<Wrapper.Handler<Tag>, EX, Exclude<RX, Scope> | HandlerContext<R, Tag, Handler>>;

  /**
   * Retrieve a handler for a specific procedure in the group.
   */
  accessHandler<const Tag extends R["_tag"]>(
    tag: Tag
  ): Effect.Effect<
    (
      payload: Wrapper.Payload<Extract<R, { readonly _tag: Tag }>>
    ) => Wrapper.ResultFrom<Extract<R, { readonly _tag: Tag }>, never>,
    never,
    Wrapper.Handler<Tag>
  >;

  /**
   * Retrieve multiple handlers for procedures in the group as an object.
   */
  accessHandlers<const Tags extends ReadonlyArray<R["_tag"]>>(
    ...tags: Tags
  ): Effect.Effect<
    {
      readonly [K in Tags[number]]: (
        payload: Wrapper.Payload<Extract<R, { readonly _tag: K }>>
      ) => Wrapper.ResultFrom<Extract<R, { readonly _tag: K }>, never>;
    },
    never,
    Wrapper.Handler<Tags[number]>
  >;

  /**
   * Annotate the group with a value.
   */
  annotate<I, S>(tag: Context.Tag<I, S>, value: S): WrapperGroup<R>;

  /**
   * Annotate the Wrapper's above this point with a value.
   */
  annotateWrappers<I, S>(tag: Context.Tag<I, S>, value: S): WrapperGroup<R>;

  /**
   * Annotate the group with a context object.
   */
  annotateContext<S>(context: Context.Context<S>): WrapperGroup<R>;

  /**
   * Annotate the Wrapper's above this point with a context object.
   */
  annotateWrappersContext<S>(context: Context.Context<S>): WrapperGroup<R>;
}

/**
 * @since 0.1.0
 * @category groups
 */
export interface Any {
  readonly [TypeId]: TypeId;
}

/**
 * @since 0.1.0
 * @category groups
 */
export type HandlersFrom<Wrapper extends Wrapper.Any> = {
  readonly [Current in Wrapper as Current["_tag"]]: Wrapper.ToHandlerFn<Current>;
};

/**
 * @since 0.1.0
 * @category groups
 */
export type HandlerFrom<Wrapper extends Wrapper.Any, Tag extends Wrapper["_tag"]> =
  Extract<Wrapper, { readonly _tag: Tag }> extends infer Current
    ? Current extends Wrapper.Any
      ? Wrapper.ToHandlerFn<Current>
      : never
    : never;

/**
 * @since 0.1.0
 * @category groups
 */
export type HandlersContext<Wrappers extends Wrapper.Any, Handlers> = keyof Handlers extends infer K
  ? K extends keyof Handlers & string
    ? HandlerContext<Wrappers, K, Handlers[K]>
    : never
  : never;

/**
 * @since 0.1.0
 * @category groups
 */
export type HandlerContext<Wrappers extends Wrapper.Any, K extends Wrappers["_tag"], Handler> = [
  Wrapper.IsStream<Wrappers, K>,
] extends [true]
  ? Handler extends (
      ...args: UnsafeTypes.UnsafeAny
    ) =>
      | Stream.Stream<infer _A, infer _E, infer _R>
      | Wrapper.WrapperWrapper<Stream.Stream<infer _A, infer _E, infer _R>>
      | Effect.Effect<ReadonlyMailbox<infer _A, infer _E>, infer _EX, infer _R>
      | Wrapper.WrapperWrapper<Effect.Effect<ReadonlyMailbox<infer _A, infer _E>, infer _EX, infer _R>>
    ? Exclude<Wrapper.ExcludeProvides<_R, Wrappers, K>, Scope>
    : never
  : Handler extends (
        ...args: UnsafeTypes.UnsafeAny
      ) =>
        | Effect.Effect<infer _A, infer _E, infer _R>
        | Wrapper.WrapperWrapper<Effect.Effect<infer _A, infer _E, infer _R>>
    ? Wrapper.ExcludeProvides<_R, Wrappers, K>
    : never;

/**
 * @since 0.1.0
 * @category groups
 */
export type Wrappers<Group> = Group extends WrapperGroup<infer R> ? (string extends R["_tag"] ? never : R) : never;

const WrapperGroupProto = {
  add(this: WrapperGroup<UnsafeTypes.UnsafeAny>, ...rpcs: Array<UnsafeTypes.UnsafeAny>) {
    return makeProto({
      requests: resolveInput(...this.requests.values(), ...rpcs),
      annotations: this.annotations,
    });
  },
  merge(this: WrapperGroup<UnsafeTypes.UnsafeAny>, ...groups: ReadonlyArray<WrapperGroup<UnsafeTypes.UnsafeAny>>) {
    const requests = new Map(this.requests);
    const annotations = new Map(this.annotations.unsafeMap);

    for (const group of groups) {
      for (const [tag, rpc] of group.requests) {
        requests.set(tag, rpc);
      }
      for (const [key, value] of group.annotations.unsafeMap) {
        annotations.set(key, value);
      }
    }

    return makeProto({
      requests,
      annotations: Context.unsafeMake(annotations),
    });
  },
  middleware(this: WrapperGroup<UnsafeTypes.UnsafeAny>, middleware: WrapperMiddleware.TagClassAny) {
    const requests = new Map<string, UnsafeTypes.UnsafeAny>();
    for (const [tag, rpc] of this.requests) {
      requests.set(tag, rpc.middleware(middleware));
    }
    return makeProto({
      requests,
      annotations: this.annotations,
    });
  },
  toHandlersContext(
    this: WrapperGroup<UnsafeTypes.UnsafeAny>,
    build: Effect.Effect<Record<string, (request: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>>
  ) {
    return Effect.gen(this, function* () {
      const context = yield* Effect.context<never>();
      const handlers = Effect.isEffect(build) ? yield* build : build;
      const contextMap = new Map<string, unknown>();
      for (const [tag, handler] of Object.entries(handlers)) {
        const rpc = this.requests.get(tag)!;
        contextMap.set(rpc.key, {
          handler,
          context,
        });
      }
      return Context.unsafeMake(contextMap);
    });
  },
  prefix<const Prefix extends string>(this: WrapperGroup<UnsafeTypes.UnsafeAny>, prefix: Prefix) {
    const requests = new Map<string, UnsafeTypes.UnsafeAny>();
    for (const rpc of this.requests.values()) {
      const newWrapper = rpc.prefix(prefix);
      requests.set(newWrapper._tag, newWrapper);
    }
    return makeProto({
      requests,
      annotations: this.annotations,
    });
  },
  toLayer(
    this: WrapperGroup<UnsafeTypes.UnsafeAny>,
    build: Effect.Effect<Record<string, (request: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>>
  ) {
    return Layer.scopedContext(this.toHandlersContext(build));
  },
  of: identity,
  toLayerHandler(
    this: WrapperGroup<UnsafeTypes.UnsafeAny>,
    tag: string,
    build: Effect.Effect<Record<string, (request: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>>
  ) {
    return Layer.scopedContext(
      Effect.gen(this, function* () {
        const context = yield* Effect.context<never>();
        const handler = Effect.isEffect(build) ? yield* build : build;
        const contextMap = new Map<string, unknown>();
        const rpc = this.requests.get(tag)!;
        contextMap.set(rpc.key, {
          handler,
          context,
        });
        return Context.unsafeMake(contextMap);
      })
    );
  },
  accessHandler(this: WrapperGroup<UnsafeTypes.UnsafeAny>, tag: string) {
    return Effect.contextWith((parentContext: Context.Context<UnsafeTypes.UnsafeAny>) => {
      const rpc = this.requests.get(tag)!;
      const { context, handler } = parentContext.unsafeMap.get(rpc.key) as Wrapper.Handler<UnsafeTypes.UnsafeAny>;
      return (
        payload: Wrapper.Payload<UnsafeTypes.UnsafeAny>,
        options: {
          readonly clientId: number;
        }
      ) => {
        const result = handler(payload, options);
        const effectOrStream = Wrapper.isWrapperWrapper(result) ? result.value : result;
        return Effect.isEffect(effectOrStream)
          ? Effect.provide(effectOrStream, context)
          : Stream.provideContext(effectOrStream, context);
      };
    });
  },
  accessHandlers(this: WrapperGroup<UnsafeTypes.UnsafeAny>, ...tags: ReadonlyArray<string>) {
    return Effect.contextWith((parentContext: Context.Context<UnsafeTypes.UnsafeAny>) => {
      const handlers: Record<string, UnsafeTypes.UnsafeAny> = {};
      for (const tag of tags) {
        const rpc = this.requests.get(tag)!;
        const { context, handler } = parentContext.unsafeMap.get(rpc.key) as Wrapper.Handler<UnsafeTypes.UnsafeAny>;
        handlers[tag] = (
          payload: Wrapper.Payload<UnsafeTypes.UnsafeAny>,
          options: {
            readonly clientId: number;
          }
        ) => {
          const result = handler(payload, options);
          const effectOrStream = Wrapper.isWrapperWrapper(result) ? result.value : result;
          return Effect.isEffect(effectOrStream)
            ? Effect.provide(effectOrStream, context)
            : Stream.provideContext(effectOrStream, context);
        };
      }
      return handlers;
    });
  },
  annotate(
    this: WrapperGroup<UnsafeTypes.UnsafeAny>,
    tag: Context.Tag<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>,
    value: UnsafeTypes.UnsafeAny
  ) {
    return makeProto({
      requests: this.requests,
      annotations: Context.add(this.annotations, tag, value),
    });
  },
  annotateWrappers(
    this: WrapperGroup<UnsafeTypes.UnsafeAny>,
    tag: Context.Tag<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>,
    value: UnsafeTypes.UnsafeAny
  ) {
    return this.annotateWrappersContext(Context.make(tag, value));
  },
  annotateContext(this: WrapperGroup<UnsafeTypes.UnsafeAny>, context: Context.Context<UnsafeTypes.UnsafeAny>) {
    return makeProto({
      requests: this.requests,
      annotations: Context.merge(this.annotations, context),
    });
  },
  annotateWrappersContext(this: WrapperGroup<UnsafeTypes.UnsafeAny>, context: Context.Context<UnsafeTypes.UnsafeAny>) {
    const requests = new Map<string, UnsafeTypes.UnsafeAny>();
    for (const [tag, rpc] of this.requests) {
      requests.set(tag, rpc.annotateContext(Context.merge(context, rpc.annotations)));
    }
    return makeProto({
      requests,
      annotations: this.annotations,
    });
  },
};

const makeProto = <Wrappers extends Wrapper.Any>(options: {
  readonly requests: ReadonlyMap<string, Wrappers>;
  readonly annotations: Context.Context<never>;
}): WrapperGroup<Wrappers> =>
  // biome-ignore lint/complexity/useArrowFunction: needed
  Object.assign(function () {}, WrapperGroupProto, {
    requests: options.requests,
    annotations: options.annotations,
  }) as UnsafeTypes.UnsafeAny;

const resolveInput = <Wrappers extends ReadonlyArray<Wrapper.Any>>(
  ...rpcs: Wrappers
): ReadonlyMap<string, Wrappers[number]> => {
  const requests = new Map<string, Wrappers[number]>();
  for (const rpc of rpcs) {
    requests.set(
      rpc._tag,
      S.isSchema(rpc) ? Wrapper.fromTaggedRequest(rpc as UnsafeTypes.UnsafeAny) : (rpc as UnsafeTypes.UnsafeAny)
    );
  }
  return requests;
};

/**
 * @since 0.1.0
 * @category groups
 */
export const make = <const Wrappers extends ReadonlyArray<Wrapper.Any>>(
  ...rpcs: Wrappers
): WrapperGroup<Wrappers[number]> =>
  makeProto({
    requests: resolveInput(...rpcs),
    annotations: Context.empty(),
  });
