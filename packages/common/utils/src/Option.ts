/**
 * @module @beep/utils/Option;
 */

import { dual } from "effect/Function";
import type { Option } from "effect/Option";
import { fromNullishOr } from "effect/Option";
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
  ): <S extends object>(self: P extends Paths<S> ? S : never) => Option<NonNullable<Get<S, P>>>;
  <const P extends ReadonlyArray<string>>(path: P): <S extends object>(self: S) => Option<NonNullable<Get<S, P>>>;
  <S extends object, const P extends string & Paths<S>>(self: S, path: P): Option<NonNullable<Get<S, P>>>;
  <S extends object, const P extends ReadonlyArray<string>>(self: S, path: P): Option<NonNullable<Get<S, P>>>;
} = dual(
  2,
  <S extends object>(self: S, path: PathInput): Option<unknown> => fromNullishOr(unsafeDotGet(self, path))
) as {
  <const P extends string>(
    path: P
  ): <S extends object>(self: P extends Paths<S> ? S : never) => Option<NonNullable<Get<S, P>>>;
  <const P extends ReadonlyArray<string>>(path: P): <S extends object>(self: S) => Option<NonNullable<Get<S, P>>>;
  <S extends object, const P extends string & Paths<S>>(self: S, path: P): Option<NonNullable<Get<S, P>>>;
  <S extends object, const P extends ReadonlyArray<string>>(self: S, path: P): Option<NonNullable<Get<S, P>>>;
};

/**
 * @category ReExport
 * @since 0.0.0
 */
export * from "effect/Option";
