/**
 * Effect-native process execution helpers for sandbox infrastructure.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { Context, Effect, Layer, Stream } from "effect";
import * as S from "effect/Schema";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import { ExecHostError } from "./Sandbox.errors.ts";

const $I = $SandboxId.create("Sandbox.process");
const textEncoder = new TextEncoder();

const collectText = <E>(stream: Stream.Stream<Uint8Array, E>): Effect.Effect<string, E> =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(
      () => "",
      (acc, chunk) => `${acc}${chunk}`
    )
  );

/**
 * Structured process output.
 *
 * @example
 * ```ts
 * import { ProcessResult } from "@beep/sandbox"
 *
 * const result = new ProcessResult({ exitCode: 0, stderr: "", stdout: "ok" })
 * console.log(result.stdout)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ProcessResult extends S.Class<ProcessResult>($I`ProcessResult`)(
  {
    exitCode: S.Number,
    stderr: S.String,
    stdout: S.String,
  },
  $I.annote("ProcessResult", {
    description: "Structured process output.",
  })
) {}

/**
 * Command request for {@link SandboxProcess}.
 *
 * @example
 * ```ts
 * import { ProcessCommand } from "@beep/sandbox"
 *
 * const command = new ProcessCommand({ command: "git", args: ["status"] })
 * console.log(command.command)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ProcessCommand extends S.Class<ProcessCommand>($I`ProcessCommand`)(
  {
    args: S.Array(S.String).pipe(S.withConstructorDefault(Effect.succeed([]))),
    command: S.String,
    cwd: S.optionalKey(S.String),
    env: S.optionalKey(S.Record(S.String, S.String)),
    stdin: S.optionalKey(S.String),
  },
  $I.annote("ProcessCommand", {
    description: "Command request for sandbox process execution.",
  })
) {}

/**
 * Process service shape used by sandbox providers and git helpers.
 *
 * @category services
 * @since 0.0.0
 */
export interface SandboxProcessShape {
  readonly run: (command: ProcessCommand) => Effect.Effect<ProcessResult, ExecHostError>;
  readonly runShell: (
    command: string,
    options?: Omit<ProcessCommand, "args" | "command">
  ) => Effect.Effect<ProcessResult, ExecHostError>;
}

/**
 * Process service used by sandbox runtime code.
 *
 * @example
 * ```ts
 * import { SandboxProcess } from "@beep/sandbox"
 *
 * console.log(SandboxProcess.key)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class SandboxProcess extends Context.Service<SandboxProcess, SandboxProcessShape>()($I`SandboxProcess`) {}

/**
 * Live process service backed by `effect/unstable/process`.
 *
 * @category layers
 * @since 0.0.0
 */
export const SandboxProcessLive: Layer.Layer<SandboxProcess, never, ChildProcessSpawner.ChildProcessSpawner> =
  Layer.effect(
    SandboxProcess,
    Effect.gen(function* () {
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

      const service: SandboxProcessShape = SandboxProcess.of({
        run: Effect.fn("SandboxProcess.run")(function* (command) {
          const child = ChildProcess.make(command.command, command.args, {
            cwd: command.cwd,
            env: command.env,
            stdin: command.stdin === undefined ? "inherit" : Stream.make(textEncoder.encode(command.stdin)),
            stdout: "pipe",
            stderr: "pipe",
          });

          return yield* Effect.scoped(
            Effect.gen(function* () {
              const handle = yield* spawner.spawn(child);
              const result = yield* Effect.all(
                {
                  exitCode: handle.exitCode,
                  stderr: collectText(handle.stderr),
                  stdout: collectText(handle.stdout),
                },
                { concurrency: "unbounded" }
              );

              return new ProcessResult(result);
            })
          ).pipe(
            Effect.mapError(
              (cause) =>
                new ExecHostError({
                  cause,
                  command: command.command,
                  message: `Failed to execute host command: ${command.command}`,
                })
            )
          );
        }),
        runShell: Effect.fn("SandboxProcess.runShell")(function* (command, options = {}) {
          const processCommand = new ProcessCommand({
            ...options,
            args: ["-lc", command],
            command: "sh",
          });

          return yield* service.run(processCommand);
        }),
      });

      return service;
    })
  );
