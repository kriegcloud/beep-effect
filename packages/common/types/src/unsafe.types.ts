import type * as R from "effect/Record";

/* -------------------------------------------------------------------------------------------------
 * ⚠️  Unsafe / escape-hatch aliases (use sparingly)
 * ----------------------------------------------------------------------------------------------- */

/**
 * ⚠️ Arbitrary value of any type.
 *
 * Prefer `unknown` in public APIs; use this only when you explicitly
 * need to disable type checking (e.g., boundary shims, rapid prototyping).
 */
export type UnsafeAny = any;

/**
 * ⚠️ Dictionary with arbitrary string keys and completely untyped values.
 *
 * Equivalent to `Record<string, any>`. Prefer {@link UnknownRecord} in most cases.
 */
export type UnsafeRecord = Record<string, UnsafeAny>;

/**
 * ⚠️ Readonly dictionary with arbitrary string keys and completely untyped values.
 *
 * Equivalent to `Readonly<Record<string, any>>`.
 * Prefer {@link UnknownReadonlyRecord} in most cases.
 */
export type UnsafeReadonlyRecord = R.ReadonlyRecord<string, UnsafeAny>;

/**
 * ⚠️ Mutable array of completely untyped values.
 *
 * Prefer {@link UnknownArray} in most cases.
 */
export type UnsafeArray = Array<UnsafeAny>;

/**
 * ⚠️ Readonly array of completely untyped values.
 *
 * Prefer {@link UnknownReadonlyArray} in most cases.
 */
export type UnsafeReadonlyArray = ReadonlyArray<UnsafeAny>;

/**
 * ⚠️ Function with arbitrary arguments and arbitrary return type.
 *
 * Prefer {@link UnknownFn} when you don’t care about specifics but
 * still want to avoid `any` pollution.
 */
export type UnsafeFn = (...args: UnsafeArray) => UnsafeAny;

/* -------------------------------------------------------------------------------------------------
 * ✅ Safer counterparts (unknown-based)
 * ----------------------------------------------------------------------------------------------- */

/**
 * Record with string keys and unknown values.
 * Good default for untyped JSON-like blobs you’ll refine later.
 */
export type UnknownRecord = Record<string, unknown>;

/** Readonly variant of {@link UnknownRecord}. */
export type UnknownReadonlyRecord = R.ReadonlyRecord<string, unknown>;

/** Mutable array of unknown values. */
export type UnknownArray = Array<unknown>;

/** Readonly array of unknown values. */
export type UnknownReadonlyArray = ReadonlyArray<unknown>;

/**
 * Function with unknown args and unknown return.
 * Useful at boundaries before you narrow with predicates or schema parsing.
 */
export type UnknownFn = (...args: UnknownArray) => unknown;

/* -------------------------------------------------------------------------------------------------
 * Notes & guidance
 * ----------------------------------------------------------------------------------------------- *
 * - Prefer the `Unknown*` types for library/public APIs; they prevent `any` from leaking and
 *   force callers to narrow/parse (e.g., with effect/Schema).
 * - Keep `Unsafe*` aliases for tight internal spots (interop, dynamic glue code), and
 *   confine them to the smallest surface possible.
 * - If you need a “some function” shape but want *callable* and *constructible*,
 *   consider `abstract new (...args: any[]) => any` separately, or define a union.
 */
