/**
 * Schema-first, Effect-first Box technical driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Box driver configuration exports.
 *
 * @example
 * ```ts
 * import { BoxDeveloperTokenConfig } from "@beep/box"
 *
 * console.log(BoxDeveloperTokenConfig)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export * from "./Box.config.ts";
/**
 * Box technical error exports.
 *
 * @example
 * ```ts
 * import { BoxError } from "@beep/box"
 *
 * console.log(BoxError)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export * from "./Box.errors.ts";
/**
 * Box payload and success model exports.
 *
 * @example
 * ```ts
 * import { FilesGetFileByIdPayload } from "@beep/box"
 *
 * console.log(FilesGetFileByIdPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export * from "./Box.models.ts";
/**
 * Box service and Layer exports.
 *
 * @example
 * ```ts
 * import { Box } from "@beep/box"
 *
 * console.log(Box)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export * from "./Box.service.ts";
/**
 * Box byte and event streaming exports.
 *
 * @example
 * ```ts
 * import type { BoxByteStream } from "@beep/box"
 *
 * type Bytes = BoxByteStream
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export * from "./Box.streaming.ts";
