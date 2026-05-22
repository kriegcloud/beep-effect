import { HostDependencyServerLive, StackManifestServerLive } from "@beep/installer-server";
import { HostDependencyUseCases, StackManifestUseCases } from "@beep/installer-use-cases/server";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Sink, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const encoder = new TextEncoder();

const makeStream = (text: string) => (text.length === 0 ? Stream.empty : Stream.succeed(encoder.encode(text)));

const makeHandle = (stdout: string, stderr = "", exitCode = 0): ChildProcessSpawner.ChildProcessHandle =>
  ChildProcessSpawner.makeHandle({
    all: Stream.empty,
    exitCode: Effect.succeed(ChildProcessSpawner.ExitCode(exitCode)),
    getInputFd: () => Sink.drain,
    getOutputFd: () => Stream.empty,
    isRunning: Effect.succeed(false),
    kill: () => Effect.void,
    pid: ChildProcessSpawner.ProcessId(1),
    stderr: makeStream(stderr),
    stdin: Sink.drain,
    stdout: makeStream(stdout),
    unref: Effect.succeed(Effect.void),
  });

const TestChildProcessSpawnerLive = Layer.succeed(
  ChildProcessSpawner.ChildProcessSpawner,
  ChildProcessSpawner.ChildProcessSpawner.of(
    ChildProcessSpawner.make((command) => {
      if (!ChildProcess.isStandardCommand(command)) {
        return Effect.succeed(makeHandle("", "unsupported command", 1));
      }

      return Effect.succeed(makeHandle(`${command.command} 1.2.3\n`));
    })
  )
);

describe("Installer workspace dry-run server", () => {
  it.effect(
    "provides a deterministic manifest snapshot",
    Effect.fnUntraced(function* () {
      const workspace = yield* StackManifestUseCases;
      const plan = yield* workspace.previewWorkspace;

      expect(plan.snapshot.manifest.dryRunOnly).toBe(true);
      expect(A.map(plan.snapshot.manifest.providers, (provider) => provider.provider)).toEqual(["claude", "codex"]);
      expect(plan.snapshot.manifest.discordChannel.displayName).toBe("ai-stack-installer");
      expect(plan.snapshot.validationEvents).toHaveLength(4);
    }, provideScopedLayer(StackManifestServerLive))
  );

  it.effect(
    "collects command output without corrupting detected versions",
    Effect.fnUntraced(
      function* () {
        const hostDependencies = yield* HostDependencyUseCases;
        const results = yield* hostDependencies.validateRequiredCommands;

        expect(
          A.map(results, (result) => ({
            id: result.dependency.id,
            version: O.getOrUndefined(result.dependency.detectedVersion),
          }))
        ).toEqual([
          { id: "op-cli", version: "op 1.2.3" },
          { id: "claude-cli", version: "claude 1.2.3" },
          { id: "codex-cli", version: "codex 1.2.3" },
          { id: "bun", version: "bun 1.2.3" },
        ]);
      },
      provideScopedLayer(HostDependencyServerLive.pipe(Layer.provide(TestChildProcessSpawnerLive)))
    )
  );
});
