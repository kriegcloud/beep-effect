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

export type PageFunction<Arg, R> =
  | string
  | ((arg: Unboxed<Arg>) => R | Promise<R>);
