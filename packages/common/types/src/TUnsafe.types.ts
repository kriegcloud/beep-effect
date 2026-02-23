/**
 * A namespaced collection of unsafe types which are purposefully painful
 *
 * @example
 *
 * import { Unsafe } from "@beep/types";
 *
 * export const youShouldFeelShame = (yeet: Unsafe.Any) => console.log(yeet);
 *
 * @module @beep/types/Unsafe.types
 * @since 0.0.0
 */

/**
 *
 * Hopefully the one any used in the repo.
 *
 * @example
 *
 * import { Unsafe } from "@beep/types";
 *
 * export const youShouldFeelShame = (yeet: Unsafe.Any) => console.log(yeet);
 *
 * @category Unsafe
 * @since 0.0.0
 * biome-ignore lint/suspicious/noExplicitAny: Let this be the only `any` in the repository.
 */
export type Any = any;
