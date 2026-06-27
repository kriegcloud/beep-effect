/**
 * Phoenix API driver package.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Runtime configuration exports for the Phoenix driver.
 *
 * @example
 * ```ts
 * import { PhoenixConfigInput } from "@beep/phoenix"
 *
 * const config = PhoenixConfigInput.make({})
 * console.log(config)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./Phoenix.config.ts";
/**
 * Error exports for the Phoenix driver.
 *
 * @example
 * ```ts
 * import { PhoenixError } from "@beep/phoenix"
 *
 * const error = PhoenixError.operation("doctor", "transport")
 * console.log(error.reason)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./Phoenix.errors.ts";
/**
 * Model exports for the Phoenix driver.
 *
 * @example
 * ```ts
 * import { PhoenixDatasetSelector } from "@beep/phoenix"
 *
 * const selector = PhoenixDatasetSelector.make({ kind: "dataset-name", value: "agent-loop-health-v1" })
 * console.log(selector.value)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./Phoenix.models.ts";
/**
 * Service exports for the Phoenix driver.
 *
 * @example
 * ```ts
 * import { Phoenix } from "@beep/phoenix"
 *
 * const layer = Phoenix.layer
 * console.log(layer)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "./Phoenix.service.ts";
