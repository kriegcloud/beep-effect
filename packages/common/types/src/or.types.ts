/**
 * Adds `undefined` to an existing union to match optional fields.
 *
 * Prefer this helper when modelling optional values in schema-driven code so
 * downstream helpers stay consistent with other `Or.*` aliases.
 *
 * @example
 * import type { Undefined } from "@beep/types/or.types";
 *
 * type MaybeId = Undefined<string>;
 * let example!: MaybeId;
 * void example;
 *
 * @category Types/Unions
 * @since 0.1.0
 */
export type Undefined<T> = T | undefined;

/**
 * Adds `null` to an existing union to model nullable values.
 *
 * Combines cleanly with {@link Undefined} when you need `null | undefined`
 * semantics.
 *
 * @example
 * import type { Null } from "@beep/types/or.types";
 *
 * type MaybeName = Null<string>;
 * let example!: MaybeName;
 * void example;
 *
 * @category Types/Unions
 * @since 0.1.0
 */
export type Null<T> = T | null;
