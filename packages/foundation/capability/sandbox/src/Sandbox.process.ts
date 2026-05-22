/**
 * Effect-native process execution helpers for sandbox infrastructure.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { Fn } from "@beep/schema";
import { A, Str } from "@beep/utils";
import { Context, Duration, Effect, Layer, Stream } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import { ExecHostError } from "./Sandbox.errors.ts";
import { profileSandboxPhase } from "./Sandbox.observability.ts";

const $I = $SandboxId.create("Sandbox.process");
const textEncoder = new TextEncoder();
const defaultForceKillAfter = Duration.seconds(5);

const collectChunk: (
  acc: { readonly lineBuffer: string; readonly text: string },
  chunk: string,
  onLine?: (line: string) => void
) => Effect.Effect<{ readonly lineBuffer: string; readonly text: string }> = Effect.fnUntraced(function* (
  acc: { readonly lineBuffer: string; readonly text: string },
  chunk: string,
  onLine?: (line: string) => void
) {
  const combined = `${acc.lineBuffer}${chunk}`;
  const lines = Str.split("\n")(combined);
  const chunkEndsLine = Str.endsWith("\n")(combined);
  const lineBuffer = chunkEndsLine ? "" : O.getOrElse(A.last(lines), () => "");
  const completeLines = chunkEndsLine ? lines : A.dropRight(lines, 1);
  const notifyCompleteLines = chunkEndsLine ? A.dropRight(completeLines, 1) : completeLines;
  const notifyLines =
    onLine === undefined
      ? Effect.void
      : Effect.forEach(notifyCompleteLines, (line) => Effect.sync(() => onLine(line)), { discard: true });

  yield* notifyLines;

  return {
    lineBuffer,
    text: `${acc.text}${chunk}`,
  };
});

const collectText = Effect.fnUntraced(function* <E>(
  stream: Stream.Stream<Uint8Array, E>,
  command: string,
  onLine?: (line: string) => void
) {
  const result = yield* stream.pipe(
    Stream.decodeText(),
    Stream.runFoldEffect(
      () => ({ lineBuffer: "", text: "" }),
      (acc, chunk) => collectChunk(acc, chunk, onLine)
    ),
    Effect.mapError(
      (cause) =>
        ExecHostError.make({
          cause,
          command,
          message: `Failed to collect host command output: ${command}`,
        })
    )
  );

  if (onLine !== undefined && result.lineBuffer !== "") {
    yield* Effect.sync(() => onLine(result.lineBuffer));
  }

  return result.text;
});

/**
 * Structured process output.
 *
 * @example
 * ```ts
 * import { ProcessResult } from "@beep/sandbox"
 *
 * const result = ProcessResult.make({ exitCode: 0, stderr: "", stdout: "ok" })
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
 * const command = ProcessCommand.make({ command: "git", args: ["status"] })
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
    forceKillAfter: S.optionalKey(
      S.DurationFromMillis.pipe(S.withConstructorDefault(Effect.succeed(defaultForceKillAfter)))
    ),
    onLine: S.optionalKey(Fn({ input: S.String, output: S.Void })),
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
    options?: Partial<Omit<ProcessCommand, "args" | "command">>
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

const spawnAndCollectProcess = Effect.fn("SandboxProcess.spawnAndCollectProcess")(function* (
  spawner: ChildProcessSpawner.ChildProcessSpawner["Service"],
  command: string,
  child: ChildProcess.Command,
  onLine?: (line: string) => void
) {
  const handle = yield* spawner.spawn(child).pipe(
    Effect.mapError(
      (cause) =>
        ExecHostError.make({
          cause,
          command,
          message: `Failed to spawn host command: ${command}`,
        })
    )
  );
  const result = yield* Effect.all(
    {
      exitCode: handle.exitCode.pipe(
        Effect.mapError(
          (cause) =>
            ExecHostError.make({
              cause,
              command,
              message: `Failed to wait for host command: ${command}`,
            })
        )
      ),
      stderr: collectText(handle.stderr, command),
      stdout: collectText(handle.stdout, command, onLine),
    },
    { concurrency: "unbounded" }
  );

  return ProcessResult.make(result);
});

const makeSandboxProcess = Effect.fn("SandboxProcessLive.make")(function* () {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const service: SandboxProcessShape = SandboxProcess.of({
    run: Effect.fn("SandboxProcess.run")(function* (command) {
      const child = ChildProcess.make(command.command, command.args, {
        cwd: command.cwd,
        env: command.env,
        forceKillAfter: command.forceKillAfter ?? defaultForceKillAfter,
        stdin: command.stdin === undefined ? "inherit" : Stream.make(textEncoder.encode(command.stdin)),
        stdout: "pipe",
        stderr: "pipe",
      });

      return yield* Effect.scoped(spawnAndCollectProcess(spawner, command.command, child, command.onLine)).pipe(
        profileSandboxPhase({
          attributes: {
            command: command.command,
          },
          phase: "sandbox.process.run",
        })
      );
    }),
    runShell: Effect.fn("SandboxProcess.runShell")(function* (command, options = {}) {
      const processCommand = ProcessCommand.make({
        ...options,
        args: ["-lc", command],
        command: "sh",
      });

      return yield* service.run(processCommand);
    }),
  });

  return service;
});

/**
 * Live process service backed by `effect/unstable/process`.
 *
 * @category layers
 * @since 0.0.0
 */
export const SandboxProcessLive: Layer.Layer<SandboxProcess, never, ChildProcessSpawner.ChildProcessSpawner> =
  Layer.effect(SandboxProcess, makeSandboxProcess());
