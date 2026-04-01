/**
 *
 *
 * @module @beep/repo-cli/commands/DocgenV2/Process
 * @since 0.0.0
 */

import {$RepoCliId} from "@beep/identity/packages";
import {Effect, Layer, ServiceMap} from "effect";

const $I = $RepoCliId.create("commands/DocgenV2/Domain");

/**
 * Represents a handle to the currently executing process.
 *
 * @category PortContract
 * @since 1.0.0
 */
export interface ProcessShape {
  readonly argv: Effect.Effect<Array<string>>;
  readonly cwd: Effect.Effect<string>;
  readonly platform: Effect.Effect<string>;
}

export class Process extends ServiceMap.Service<Process, ProcessShape>()($I`Process`) {
}


/**
 * @category UseCase
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

