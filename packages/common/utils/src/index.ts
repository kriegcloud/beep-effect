/**
 * Shared runtime utilities for beep.
 *
 * @module @beep/utils
 * @since 0.0.0
 */

/**
 * Array utilities extending `effect/Array` with non-empty variants.
 *
 * @category utilities
 * @since 0.0.0
 */
export * as A from "./Array.ts";

/**
 * Boolean utilities re-exported from `effect/Boolean`.
 *
 * @category utilities
 * @since 0.0.0
 */
export * as Bool from "./Bool.ts";

/**
 * DateTime utilities extending `effect/DateTime`.
 *
 * @category utilities
 * @since 0.0.0
 */
export * as DateTime from "./DateTime.ts";

/**
 * File-system watch helpers built on `effect/FileSystem`.
 *
 * @category utilities
 * @since 0.0.0
 */
export * as FileSystem from "./FileSystem.ts";

/**
 * HTML escaping helpers.
 *
 * @category utilities
 * @since 0.0.0
 */
export * as Html from "./Html.ts";

/**
 * Prototype-pollution guard.
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./isBlockedObjectKey.ts";
/**
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./NodeUrl.ts";
/**
 * Number utilities extending `effect/Number`.
 *
 * @category utilities
 * @since 0.0.0
 */
export * as Num from "./Number.ts";
/**
 * Option utilities extending `effect/Option`.
 *
 * @category utilities
 * @since 0.0.0
 */
export * as O from "./Option.ts";
/**
 * Predicate utilities extending `effect/Predicate`.
 *
 * @category utilities
 * @since 0.0.0
 */
export * as P from "./Predicate.ts";
/**
 * String utilities extending `effect/String` with typed case conversions.
 *
 * @category utilities
 * @since 0.0.0
 */
export * as Str from "./Str.ts";
/**
 * Stream utilities extending `effect/Stream`.
 *
 * @category utilities
 * @since 0.0.0
 */
export * as Stream from "./Stream.ts";
/**
 * Struct utilities extending `effect/Struct` with dot-path access.
 *
 * @category utilities
 * @since 0.0.0
 */
export * as Struct from "./Struct.ts";
/**
 * Plain-text formatting helpers.
 *
 * @category utilities
 * @since 0.0.0
 */
export * as Text from "./Text.ts";
/**
 * thunk constants (`thunkTrue`, `thunkNull`, etc.).
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./thunk.ts";
