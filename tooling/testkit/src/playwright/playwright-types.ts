import type { ElementHandle, JSHandle } from "playwright-core";

/**
 * Extracted from `playwright-core/types/structs.d.ts` because it is not exported over the package boundary.
 * These types are necessary to correctly type `evaluate` functions that unwrap handles.
 */

export type NoHandles<Arg> = Arg extends JSHandle
  ? never
  : Arg extends object
    ? { [Key in keyof Arg]: NoHandles<Arg[Key]> }
    : Arg;

export type Unboxed<Arg> =
  Arg extends ElementHandle<infer T>
    ? T
    : Arg extends JSHandle<infer T>
      ? T
      : Arg extends NoHandles<Arg>
        ? Arg
        : Arg extends [infer A0]
          ? [Unboxed<A0>]
          : Arg extends [infer A0, infer A1]
            ? [Unboxed<A0>, Unboxed<A1>]
            : Arg extends [infer A0, infer A1, infer A2]
              ? [Unboxed<A0>, Unboxed<A1>, Unboxed<A2>]
              : Arg extends [infer A0, infer A1, infer A2, infer A3]
                ? [Unboxed<A0>, Unboxed<A1>, Unboxed<A2>, Unboxed<A3>]
                : Arg extends Array<infer T>
                  ? Array<Unboxed<T>>
                  : Arg extends object
                    ? { [Key in keyof Arg]: Unboxed<Arg[Key]> }
                    : Arg;

export type PageFunction<Arg, R> = string | ((arg: Unboxed<Arg>) => R | Promise<R>);

/**
 * A type helper to patch the `on`, `off`, and `once` methods of a Playwright object
 * to support a specific set of events with correctly typed listeners.
 *
 * This is useful because Playwright's event methods are often overloaded,
 * making them difficult to use in generic contexts or with custom event maps.
 *
 * @internal
 */
export type PatchedEvents<Original, Events> = Original & {
  on<K extends keyof Events>(event: K, listener: (arg: Events[K]) => void): PatchedEvents<Original, Events>;
  off<K extends keyof Events>(event: K, listener: (arg: Events[K]) => void): PatchedEvents<Original, Events>;
  once<K extends keyof Events>(event: K, listener: (arg: Events[K]) => void): PatchedEvents<Original, Events>;
};
