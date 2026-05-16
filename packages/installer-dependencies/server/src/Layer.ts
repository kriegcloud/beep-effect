/**
 * installer dependencies server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import {
  HostDependencyPlan,
  HostDependencyValidationResult,
  P1A_HOST_DEPENDENCY_VERB_INPUTS,
} from "@beep/installer-dependencies-use-cases/public";
import { InstallerDependenciesUseCases } from "@beep/installer-dependencies-use-cases/server";
import { Effect, Layer, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";

const decodeHostDependencyPlan = S.decodeUnknownEffect(HostDependencyPlan);

const p1aHostDependencyPlanInput = {
  dependencies: [
    {
      detectedVersion: "1.2.8",
      id: "git",
      installHint: "Use the platform package manager if Git is absent.",
      kind: "cli-tool",
      name: "Git",
      requiredVersion: ">=2.40",
      status: "present",
    },
    {
      id: "one-password-cli",
      installHint: "Install 1Password CLI and sign in before live credential validation.",
      kind: "cli-tool",
      name: "1Password CLI",
      requiredVersion: ">=2.20",
      status: "unknown",
    },
    {
      id: "discord-desktop",
      installHint: "Discord desktop is optional for the dry-run, but v1 validates Discord routing.",
      kind: "desktop-app",
      name: "Discord",
      status: "unknown",
    },
  ],
  notes: ["P1A records dependency intent only; no package manager commands are executed."],
  verbs: P1A_HOST_DEPENDENCY_VERB_INPUTS,
} as const;

type CommandProbe = {
  readonly args: ReadonlyArray<string>;
  readonly id: string;
  readonly installHint: string;
  readonly name: string;
};

const p1CommandProbes = [
  { args: ["--version"], id: "op-cli", installHint: "Install and sign in to the 1Password CLI.", name: "op" },
  {
    args: ["--version"],
    id: "claude-cli",
    installHint: "Install Claude Code and authenticate locally.",
    name: "claude",
  },
  { args: ["--version"], id: "codex-cli", installHint: "Install Codex CLI and authenticate locally.", name: "codex" },
  {
    args: ["--version"],
    id: "bun",
    installHint: "Install Bun before running the Stack Installer proof harness.",
    name: "bun",
  },
] as const satisfies ReadonlyArray<CommandProbe>;

const collectText = <E>(stream: Stream.Stream<Uint8Array, E>): Effect.Effect<string, E> =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(
      () => "",
      (acc, chunk) => `${acc}${chunk}`
    )
  );

const probeCommand = (
  spawner: ChildProcessSpawner.ChildProcessSpawner["Service"],
  probe: CommandProbe
): Effect.Effect<HostDependencyValidationResult> =>
  Effect.scoped(
    Effect.gen(function* () {
      const command = ChildProcess.make(probe.name, A.fromIterable(probe.args), {
        stdin: "ignore",
        stderr: "pipe",
        stdout: "pipe",
      });
      const handle = yield* spawner.spawn(command);
      const [stdout, stderr, exitCode] = yield* Effect.all(
        [collectText(handle.stdout), collectText(handle.stderr), handle.exitCode],
        { concurrency: "unbounded" }
      );
      const output = Str.trim(`${stdout}${stderr}`);
      const present = exitCode === 0;

      return new HostDependencyValidationResult({
        dependency: {
          detectedVersion: present && Str.isNonEmpty(output) ? O.some(output) : O.none(),
          id: probe.id,
          installHint: probe.installHint,
          kind: "cli-tool",
          name: probe.name,
          requiredVersion: O.none(),
          status: present ? "present" : "missing",
        },
        message: present ? `${probe.name} command is available.` : `${probe.name} command is missing or unavailable.`,
      });
    })
  ).pipe(
    Effect.catch(() =>
      Effect.succeed(
        new HostDependencyValidationResult({
          dependency: {
            detectedVersion: O.none(),
            id: probe.id,
            installHint: probe.installHint,
            kind: "cli-tool",
            name: probe.name,
            requiredVersion: O.none(),
            status: "missing",
          },
          message: `${probe.name} command is missing or unavailable.`,
        })
      )
    )
  );

/**
 * Build the deterministic dependency dry-run service.
 *
 * @category layers
 * @since 0.0.0
 */
export const makeInstallerDependenciesServer = Effect.fn("InstallerDependenciesServer.make")(function* () {
  const plan = yield* decodeHostDependencyPlan(p1aHostDependencyPlanInput);
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

  return {
    previewHostDependencies: () => Effect.succeed(plan),
    validateRequiredCommands: () =>
      Effect.forEach(p1CommandProbes, (probe) => probeCommand(spawner, probe), { concurrency: 4 }),
  };
});

/**
 * Deterministic dependency server layer for P1A.
 *
 * @category layers
 * @since 0.0.0
 */
export const InstallerDependenciesServerLive = Layer.effect(
  InstallerDependenciesUseCases,
  makeInstallerDependenciesServer()
);
