/**
 * A namespaced collection of unsafe types which are purposefully painful
 *
 * @example
 *
 * import { Unsafe } from "@beep/types";
 *
 * export const youShouldFeelShame = (beepBopUnsafeValue: Unsafe.Any) => console.log(beepBopUnsafeValue);
 *
 * @module @beep/types/Unsafe.types
 * @since 0.0.0
 */

/**
 *
 * Hopefully the only any used in the repo.
 *
 * @example
 *
 * import { Unsafe } from "@beep/types";
 *
 * export const youShouldFeelShame = (beepBopUnsafeValue: Unsafe.Any) => console.log(beepBopUnsafeValue);
 *
 * @category CrossCutting
 * @since 0.0.0
 * biome-ignore lint/suspicious/noExplicitAny: Let this be the only `any` in the repository.
 */
export type Any = any;
