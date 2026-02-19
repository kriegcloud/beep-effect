/**
 * @since 1.0.0
 */

import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

/**
 * Represents a handle to the currently executing process.
 *
 * @category service
 * @since 1.0.0
 */
export interface ProcessShape {
  readonly cwd: Effect.Effect<string>
  readonly platform: Effect.Effect<string>
  readonly argv: Effect.Effect<Array<string>>
}

/**
 * @category service
 * @since 1.0.0
 */
export class Process extends Context.Tag("Process")<Process, ProcessShape>() {}

/**
 * @category layer
 * @since 1.0.0
 */
export const layer = Layer.succeed(
  Process,
  Process.of({
    cwd: Effect.sync(() => process.cwd()),
    platform: Effect.sync(() => process.platform),
    argv: Effect.sync(() => process.argv)
  })
)
