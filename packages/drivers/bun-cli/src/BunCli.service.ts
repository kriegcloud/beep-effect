/**
 * Effect service for the native Bun CLI.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $I as $PackagesId } from "@beep/identity/packages";
import { Context, Effect, Layer, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import { BunCliError } from "./BunCli.errors.ts";
import { BunCliProbe, BunCliProcessResult } from "./BunCli.models.ts";

const $BunCliId = $PackagesId.compose("bun-cli").$BunCliId;
const $I = $BunCliId.create("BunCli.service");

const collectText = <E>(stream: Stream.Stream<Uint8Array, E>): Effect.Effect<string, E> =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(
      () => "",
      (acc, chunk) => `${acc}${chunk}`
    )
  );

/**
 * Product-neutral process runner used by the Bun CLI driver.
 *
 * @category services
 * @since 0.0.0
 */
export type BunCliRunner = (
  command: string,
  args: ReadonlyArray<string>
) => Effect.Effect<BunCliProcessResult, BunCliError>;

/**
 * Runtime shape exposed by the Bun CLI driver service.
 *
 * @category services
 * @since 0.0.0
 */
interface BunCliShape {
  readonly probe: () => Effect.Effect<BunCliProbe>;
  readonly upgrade: () => Effect.Effect<void, BunCliError>;
}

const runNative = (
  spawner: ChildProcessSpawner.ChildProcessSpawner["Service"],
  commandPath: string,
  args: ReadonlyArray<string>
): Effect.Effect<BunCliProcessResult, BunCliError> => {
  const command = ChildProcess.make(commandPath, A.fromIterable(args), {
    stdin: "ignore",
    stderr: "pipe",
    stdout: "pipe",
  });

  return Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* spawner.spawn(command);
      const [stdout, stderr, exitCode] = yield* Effect.all(
        [collectText(handle.stdout), collectText(handle.stderr), handle.exitCode],
        { concurrency: "unbounded" }
      );

      return new BunCliProcessResult({ exitCode, stderr, stdout });
    })
  ).pipe(
    Effect.mapError((cause) =>
      BunCliError.fromUnknown("run", "Failed to execute the Bun CLI.", { cause, command: commandPath })
    )
  );
};

const makeService = (commandPath: string, runner: BunCliRunner): BunCliShape => {
  const probe = Effect.fn("BunCli.probe")(function* () {
    const result = yield* runner(commandPath, ["--version"]).pipe(
      Effect.catch(() =>
        Effect.succeed(
          new BunCliProcessResult({
            exitCode: 1,
            stderr: "",
            stdout: "",
          })
        )
      )
    );

    if (result.exitCode !== 0) {
      return new BunCliProbe({
        command: commandPath,
        status: "missing",
        version: O.none(),
      });
    }

    const version = Str.trim(result.stdout);
    return new BunCliProbe({
      command: commandPath,
      status: Str.isNonEmpty(version) ? "present" : "missing",
      version: Str.isNonEmpty(version) ? O.some(version) : O.none(),
    });
  });

  const upgrade = Effect.fn("BunCli.upgrade")(function* () {
    const result = yield* runner(commandPath, ["upgrade"]);
    if (result.exitCode !== 0) {
      return yield* new BunCliError({
        command: commandPath,
        exitCode: result.exitCode,
        message: "Bun upgrade failed.",
        operation: "upgrade",
        stderr: Str.trim(result.stderr),
        stdout: Str.trim(result.stdout),
      });
    }
  });

  return {
    probe,
    upgrade,
  };
};

/**
 * Effect service for native `bun` execution.
 *
 * @category services
 * @since 0.0.0
 */
export class BunCli extends Context.Service<BunCli, BunCliShape>()($I`BunCli`) {
  /**
   * Build a live Bun CLI layer.
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeLayer = (
    commandPath = "bun"
  ): Layer.Layer<BunCli, never, ChildProcessSpawner.ChildProcessSpawner> =>
    Layer.effect(
      BunCli,
      Effect.gen(function* () {
        const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
        return BunCli.of(makeService(commandPath, (command, args) => runNative(spawner, command, args)));
      })
    );

  /**
   * Build a deterministic test layer from an injected command runner.
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeLayerFromRunner = (runner: BunCliRunner, commandPath = "bun"): Layer.Layer<BunCli> =>
    Layer.succeed(BunCli, BunCli.of(makeService(commandPath, runner)));
}
