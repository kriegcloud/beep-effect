/**
 * @module @beep/utils/Option;
 */

import { Function as Fn } from "effect";
import * as O from "effect/Option";
import type { Get, Paths } from "type-fest";
import type { PathInput } from "./internal/StructPath.ts";
import { unsafeDotGet } from "./internal/StructPath.ts";

/**
 * Retrieves a value from a struct by path and converts missing or nullish
 * results into an `Option`.
 *
 * Mirrors {@link import("./Struct.ts").dotGet} path validation and tuple path
 * support, then applies `Option.fromNullishOr` to the retrieved value.
 *
 * Supports a dual API:
 * - Data-last: `pipe(person, O.propFromNullishOr("age"))`
 * - Data-first: `O.propFromNullishOr(person, "age")`
 * - Tuple paths: `O.propFromNullishOr(person, ["profile", "age"] as const)`
 *
 * @since 0.0.0
 * @category Utility
 */
export const propFromNullishOr: {
  <const P extends string>(
    path: P
  ): <S extends object>(self: P extends Paths<S> ? S : never) => O.Option<NonNullable<Get<S, P>>>;
  <const P extends ReadonlyArray<string>>(path: P): <S extends object>(self: S) => O.Option<NonNullable<Get<S, P>>>;
  <S extends object, const P extends string & Paths<S>>(self: S, path: P): O.Option<NonNullable<Get<S, P>>>;
  <S extends object, const P extends ReadonlyArray<string>>(self: S, path: P): O.Option<NonNullable<Get<S, P>>>;
} = Fn.dual(
  2,
  <S extends object>(self: S, path: PathInput): O.Option<unknown> => O.fromNullishOr(unsafeDotGet(self, path))
) as {
  <const P extends string>(
    path: P
  ): <S extends object>(self: P extends Paths<S> ? S : never) => O.Option<NonNullable<Get<S, P>>>;
  <const P extends ReadonlyArray<string>>(path: P): <S extends object>(self: S) => O.Option<NonNullable<Get<S, P>>>;
  <S extends object, const P extends string & Paths<S>>(self: S, path: P): O.Option<NonNullable<Get<S, P>>>;
  <S extends object, const P extends ReadonlyArray<string>>(self: S, path: P): O.Option<NonNullable<Get<S, P>>>;
};

/**
 * @category ReExport
 * @since 0.0.0
 */
export * from "effect/Option";
