/**
 * The shared domain values module - Contains modules for shared value objects.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * ClaimLifecycle - Shared admission lifecycle vocabulary for claims.
 *
 * @example
 * ```ts
 * import { ClaimLifecycle } from "@beep/shared-domain/values"
 *
 * console.log(ClaimLifecycle.ClaimLifecycle.Enum.admitted)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * as ClaimLifecycle from "./ClaimLifecycle/index.ts";
/**
 * LocalDate - Value object representing a local date.
 *
 * @example
 * ```ts
 * import { LocalDate } from "@beep/shared-domain/values"
 *
 * console.log(LocalDate.today().toISOString())
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * as LocalDate from "./LocalDate/index.ts";
/**
 * OnePasswordReference - Typed reference to a 1Password item field.
 *
 * @example
 * ```ts
 * import { OnePasswordReference } from "@beep/shared-domain/values"
 *
 * console.log(OnePasswordReference.OnePasswordReference)
 * ```
 *
 * @since 0.0.0
 * @category value-objects
 */
export * as OnePasswordReference from "./OnePasswordReference/index.ts";
/**
 * Rule effect value object exports.
 *
 * @example
 * ```ts
 * import { Rule } from "@beep/shared-domain/values/Rule/Rule.model"
 *
 * console.log(Rule.ast)
 * ```
 *
 * @since 0.0.0
 * @category value-objects
 */
export * from "./Rule/index.ts";
