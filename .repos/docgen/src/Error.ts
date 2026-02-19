/**
 * @since 1.0.0
 */

import * as Data from "effect/Data"

/**
 * @category symbol
 * @since 1.0.0
 */
export const DocgenErrorTypeId = Symbol.for("@effect/docgen/DocgenError")

/**
 * @category symbol
 * @since 1.0.0
 */
export type DocgenErrorTypeId = typeof DocgenErrorTypeId

/**
 * @category model
 * @since 1.0.0
 */
export class DocgenError extends Data.TaggedError("DocgenError")<{
  readonly message: string
}> {
}
