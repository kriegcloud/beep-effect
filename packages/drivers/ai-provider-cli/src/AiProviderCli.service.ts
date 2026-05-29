/**
 * Effect service for Claude and Codex CLI status probes.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AiProviderCliId } from "@beep/identity";
import { thunkEmptyStr } from "@beep/utils";
import { Context, Effect, Layer, Match, Stream } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import { AiProviderCliError } from "./AiProviderCli.errors.ts";
import { AiProviderCliAuthProbe, AiProviderCliProcessResult } from "./AiProviderCli.models.ts";
import type { AiProviderCliProvider } from "./AiProviderCli.models.ts";

const $I = $AiProviderCliId.create("AiProviderCli.service");

const collectText = <E>(stream: Stream.Stream<Uint8Array, E>): Effect.Effect<string, E> =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(thunkEmptyStr, (acc, chunk) => `${acc}${chunk}`)
  );

/**
 * Product-neutral process runner used by provider CLI probes.
 *
 * @category services
 * @since 0.0.0
 */
export type AiProviderCliRunner = (
  provider: AiProviderCliProvider,
  command: string,
  args: ReadonlyArray<string>
) => Effect.Effect<AiProviderCliProcessResult, AiProviderCliError>;

/**
 * Runtime shape exposed by the provider CLI driver service.
 *
 * @category services
 * @since 0.0.0
 */
interface AiProviderCliShape {
  readonly checkAuth: (provider: AiProviderCliProvider) => Effect.Effect<AiProviderCliAuthProbe, AiProviderCliError>;
}

/**
 * Provider CLI executable configuration.
 *
 * @category models
 * @since 0.0.0
 */
class AiProviderCliPaths extends S.Class<AiProviderCliPaths>($I`AiProviderCliPaths`)(
  {
    claudePath: S.optionalKey(S.String),
    codexPath: S.optionalKey(S.String),
  },
  $I.annote("AiProviderCliPaths", {
    description: "Configuration for the AI provider CLI executable paths",
  })
) {}

const commandFor = (
  paths: AiProviderCliPaths,
  provider: AiProviderCliProvider
): readonly [string, ReadonlyArray<string>] =>
  Match.value(provider).pipe(
    Match.when("claude", () => [paths.claudePath ?? "claude", ["auth", "status"]] as const),
    Match.when("codex", () => [paths.codexPath ?? "codex", ["login", "status"]] as const),
    Match.exhaustive
  );

const runNative = (
  spawner: ChildProcessSpawner.ChildProcessSpawner["Service"],
  commandPath: string,
  args: ReadonlyArray<string>,
  provider: AiProviderCliProvider
): Effect.Effect<AiProviderCliProcessResult, AiProviderCliError> => {
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

      return AiProviderCliProcessResult.make({ exitCode, stderr, stdout });
    })
  ).pipe(
    Effect.mapError(() =>
      AiProviderCliError.make({
        command: commandPath,
        message: "Failed to execute provider CLI status command.",
        operation: "checkAuth",
        provider,
        stderr: "unknown",
      })
    )
  );
};

const makeService = (paths: AiProviderCliPaths, runner: AiProviderCliRunner): AiProviderCliShape => ({
  checkAuth: Effect.fn("AiProviderCli.checkAuth")(function* (provider) {
    const [command, args] = commandFor(paths, provider);
    const result = yield* runner(provider, command, args);

    return AiProviderCliAuthProbe.make({
      command,
      provider,
      status: result.exitCode === 0 ? "authenticated" : "not-authenticated",
    });
  }),
});

/**
 * Effect service for Claude and Codex CLI status checks.
 *
 * @category services
 * @since 0.0.0
 */
export class AiProviderCli extends Context.Service<AiProviderCli, AiProviderCliShape>()($I`AiProviderCli`) {
  /**
   * Build a live provider CLI layer.
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeLayer = (
    paths: AiProviderCliPaths = {}
  ): Layer.Layer<AiProviderCli, never, ChildProcessSpawner.ChildProcessSpawner> =>
    Layer.effect(
      AiProviderCli,
      Effect.gen(function* () {
        const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
        return AiProviderCli.of(
          makeService(paths, (provider, command, args) => runNative(spawner, command, args, provider))
        );
      })
    );

  /**
   * Build a deterministic test layer from an injected command runner.
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeLayerFromRunner = (
    runner: AiProviderCliRunner,
    paths: AiProviderCliPaths = {}
  ): Layer.Layer<AiProviderCli> => Layer.succeed(AiProviderCli, AiProviderCli.of(makeService(paths, runner)));
}
