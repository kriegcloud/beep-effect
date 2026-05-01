/**
 * The LocalDate value object module.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * LocalDate behavior helpers and constructors.
 *
 * @example
 * ```ts
 * import { today } from "@beep/shared-domain/values/LocalDate"
 *
 * console.log(today().toISOString())
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export * from "./LocalDate.behavior.ts";

/**
 * LocalDate model schema.
 *
 * @example
 * ```ts
 * import { Model } from "@beep/shared-domain/values/LocalDate"
 *
 * console.log(Model)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * from "./LocalDate.model.ts";
