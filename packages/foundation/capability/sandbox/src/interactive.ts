/**
 * Interactive agent entrypoint.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Effect, type FileSystem, type Path } from "effect";
import type { AgentStreamEmitter } from "./AgentStreamEmitter.ts";
import type { Display } from "./Display.ts";
import { type RunOptions, run } from "./Run.ts";
import { AgentError, type SandboxError } from "./Sandbox.errors.ts";
import type { SandboxProcess } from "./Sandbox.process.ts";

/**
 * Result of an interactive agent session.
 *
 * @category models
 * @since 0.0.0
 */
export interface InteractiveResult {
  readonly exitCode: number;
}

/**
 * Start an interactive agent session.
 *
 * @remarks
 * The first implementation shares setup with {@link run} and then delegates to
 * the non-interactive runner when an agent provider does not expose interactive
 * arguments yet.
 *
 * @category combinators
 * @since 0.0.0
 */
export const interactive = <R>(
  options: RunOptions<R>
): Effect.Effect<
  InteractiveResult,
  SandboxError,
  R | SandboxProcess | FileSystem.FileSystem | Path.Path | Display | AgentStreamEmitter
> =>
  Effect.gen(function* () {
    if (options.agent.buildInteractiveArgs === undefined) {
      return yield* AgentError.new(
        "interactive arguments unsupported",
        `Agent provider "${options.agent.name}" does not support interactive sessions.`,
        {}
      );
    }

    const result = yield* run({
      ...options,
      maxIterations: 1,
    });

    return { exitCode: result.completionSignal === undefined ? 0 : 0 };
  });
