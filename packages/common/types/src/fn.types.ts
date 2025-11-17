/**
 * Function-focused helper types that wrap Effect predicates.
 *
 * @example
 * import type { Guard } from "@beep/types/fn.types";
 *
 * const isString: Guard<unknown, string> = (value): value is string => typeof value === "string";
 * void isString;
 *
 * @category Types/Functions
 * @since 0.1.0
 */
import type * as P from "effect/Predicate";

/**
 * Predicate signature that narrows from `A` to the refined subtype `B`.
 *
 * Re-exported so call-sites do not pull `effect/Predicate` directly when
 * defining guards for effectful helpers.
 *
 * @example
 * import type { Guard } from "@beep/types/fn.types";
 *
 * const isString: Guard<unknown, string> = (value): value is string => typeof value === "string";
 * void isString;
 *
 * @category Types/Functions
 * @since 0.1.0
 */
export type Guard<A, B extends A> = P.Refinement<A, B>;

/**
 * Higher-order helper that builds the logical negation of a guard.
 *
 * You can pipe an existing guard into `NotGuard` to derive `isNotFoo`
 * predicates without manually duplicating refinements.
 *
 * @example
 * import type { Guard, NotGuard } from "@beep/types/fn.types";
 *
 * const isString: Guard<unknown, string> = (value): value is string => typeof value === "string";
 * const invert: NotGuard<unknown, string> = (guard) => (value): value is number => !guard(value);
 * void invert;
 *
 * @category Types/Functions
 * @since 0.1.0
 */
export type NotGuard<A, B extends A> = (g: Guard<A, B>) => (x: A) => x is Exclude<A, B>;
