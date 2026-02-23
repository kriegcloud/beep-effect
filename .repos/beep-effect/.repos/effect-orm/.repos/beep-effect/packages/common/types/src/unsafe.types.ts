/**
 * Shared escape-hatch aliases for the rare spots that require `any`.
 *
 * @example
 * import type * as UnsafeTypes from "@beep/types/unsafe.types";
 *
 * const payload: UnsafeTypes.UnsafeRecord = {};
 * void payload;
 *
 * @category Types/Unsafe
 * @since 0.1.0
 */
import type * as R from "effect/Record";

/* -------------------------------------------------------------------------------------------------
 * ⚠️  Unsafe / escape-hatch aliases (use sparingly)
 * ----------------------------------------------------------------------------------------------- */

/**
 * ⚠️ Arbitrary value of any type.
 *
 * Prefer `unknown` in public APIs; use this only when you explicitly
 * need to disable type checking (e.g., boundary shims, rapid prototyping).
 *
 * @example
 * import type * as UnsafeTypes from "@beep/types/unsafe.types";
 *
 * let legacyPayload: UnsafeTypes.UnsafeAny;
 * void legacyPayload;
 *
 * @category Types/Unsafe
 * @since 0.1.0
 */

// biome-ignore lint/suspicious/noExplicitAny: Submit and let this be from here forth the only `any` in this codebase.
export type UnsafeAny = any;

/**
 * ⚠️ Dictionary with arbitrary string keys and completely untyped values.
 *
 * Equivalent to `Record<string, any>`. Prefer {@link UnknownRecord} in most cases.
 *
 * @example
 * import type * as UnsafeTypes from "@beep/types/unsafe.types";
 *
 * const headers: UnsafeTypes.UnsafeRecord = { "x-skip": "1" };
 * void headers;
 *
 * @category Types/Unsafe
 * @since 0.1.0
 */
export type UnsafeRecord = Record<string, UnsafeAny>;

/**
 * ⚠️ Readonly dictionary with arbitrary string keys and completely untyped values.
 *
 * Equivalent to `Readonly<Record<string, any>>`.
 * Prefer {@link UnknownReadonlyRecord} in most cases.
 *
 * @example
 * import type * as UnsafeTypes from "@beep/types/unsafe.types";
 *
 * const payload: UnsafeTypes.UnsafeReadonlyRecord = Object.freeze({ kind: "unknown" });
 * void payload;
 *
 * @category Types/Unsafe
 * @since 0.1.0
 */
export type UnsafeReadonlyRecord = R.ReadonlyRecord<string, UnsafeAny>;

/**
 * ⚠️ Mutable array of completely untyped values.
 *
 * Prefer {@link UnknownArray} in most cases.
 *
 * @example
 * import type * as UnsafeTypes from "@beep/types/unsafe.types";
 *
 * const queue: UnsafeTypes.UnsafeArray = [];
 * queue.push(Math.random());
 *
 * @category Types/Unsafe
 * @since 0.1.0
 */
export type UnsafeArray = Array<UnsafeAny>;

/**
 * ⚠️ Readonly array of completely untyped values.
 *
 * Prefer {@link UnknownReadonlyArray} in most cases.
 *
 * @example
 * import type * as UnsafeTypes from "@beep/types/unsafe.types";
 *
 * const list: UnsafeTypes.UnsafeReadonlyArray = [1, "two"];
 * void list;
 *
 * @category Types/Unsafe
 * @since 0.1.0
 */
export type UnsafeReadonlyArray = ReadonlyArray<UnsafeAny>;

/**
 * ⚠️ Function with arbitrary arguments and arbitrary return type.
 *
 * Prefer {@link UnknownFn} when you don’t care about specifics but
 * still want to avoid `any` pollution.
 *
 * @example
 * import type * as UnsafeTypes from "@beep/types/unsafe.types";
 *
 * const plugin: UnsafeTypes.UnsafeFn = (...args) => console.log(args);
 * void plugin;
 *
 * @category Types/Unsafe
 * @since 0.1.0
 */
export type UnsafeFn = (...args: UnsafeArray) => UnsafeAny;

/* -------------------------------------------------------------------------------------------------
 * ✅ Safer counterparts (unknown-based)
 * ----------------------------------------------------------------------------------------------- */

/**
 * Record with string keys and unknown values.
 * Good default for untyped JSON-like blobs you’ll refine later.
 *
 * @example
 * import type * as UnsafeTypes from "@beep/types/unsafe.types";
 *
 * const blob: UnsafeTypes.UnknownRecord = { ok: true, count: 1 };
 * void blob;
 *
 * @category Types/Unsafe
 * @since 0.1.0
 */
export type UnknownRecord = Record<string, unknown>;

/**
 * Readonly variant of {@link UnknownRecord}.
 *
 * @example
 * import type * as UnsafeTypes from "@beep/types/unsafe.types";
 *
 * const env: UnsafeTypes.UnknownReadonlyRecord = Object.freeze({ FOO: "bar" });
 * void env;
 *
 * @category Types/Unsafe
 * @since 0.1.0
 */
export type UnknownReadonlyRecord = R.ReadonlyRecord<string, unknown>;

/**
 * Mutable array of unknown values.
 *
 * @example
 * import type * as UnsafeTypes from "@beep/types/unsafe.types";
 *
 * const list: UnsafeTypes.UnknownArray = [];
 * void list;
 *
 * @category Types/Unsafe
 * @since 0.1.0
 */
export type UnknownArray = Array<unknown>;

/**
 * Readonly array of unknown values.
 *
 * @example
 * import type * as UnsafeTypes from "@beep/types/unsafe.types";
 *
 * const args: UnsafeTypes.UnknownReadonlyArray = ["x", 1];
 * void args;
 *
 * @category Types/Unsafe
 * @since 0.1.0
 */
export type UnknownReadonlyArray = ReadonlyArray<unknown>;

/**
 * Function with unknown args and unknown return.
 * Useful at boundaries before you narrow with predicates or schema parsing.
 *
 * @example
 * import type * as UnsafeTypes from "@beep/types/unsafe.types";
 *
 * const handler: UnsafeTypes.UnknownFn = (..._args) => undefined;
 * void handler;
 *
 * @category Types/Unsafe
 * @since 0.1.0
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
