/**
 * installer dependencies server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import { BunCli } from "@beep/bun-cli";
import { InstallerDependenciesConfig } from "@beep/installer-dependencies-config/layer";
import {
  BunRuntimeAlreadyHealthy,
  BunRuntimeHealthResult,
  BunRuntimeInspectionFailed,
  BunRuntimeRepairApprovalRequired,
  BunRuntimeRepairFailed,
  BunRuntimeRepairRequest,
  BunRuntimeRepairResult,
  HostDependencyPlan,
  HostDependencyValidationResult,
  P1A_HOST_DEPENDENCY_VERB_INPUTS,
} from "@beep/installer-dependencies-use-cases/public";
import {
  BunRuntimeCommandPort,
  BunRuntimeCommandPortError,
  type BunRuntimeProbe,
  InstallerDependenciesUseCases,
} from "@beep/installer-dependencies-use-cases/server";
import { Effect, Layer, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";

const decodeBunRuntimeRepairRequest = S.decodeUnknownEffect(BunRuntimeRepairRequest);
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

const makeBunDependency = (probe: BunRuntimeProbe, expectedVersion: string) => {
  const detectedVersion = probe.version;
  const state = O.match(detectedVersion, {
    onNone: () => "missing" as const,
    onSome: (version) => (isVersionAtLeast(version, expectedVersion) ? "healthy" : "repair-required"),
  });
  const status = state === "missing" ? "missing" : "present";
  const summary =
    state === "healthy"
      ? `Bun ${renderVersion(detectedVersion)} satisfies the required version ${expectedVersion}.`
      : state === "repair-required"
        ? `Bun ${renderVersion(detectedVersion)} is older than the required version ${expectedVersion}.`
        : `Bun is missing; the focused repair flow currently supports upgrading an existing Bun install.`;

  return new BunRuntimeHealthResult({
    dependency: {
      detectedVersion,
      id: "bun",
      installHint: "Run the focused Bun repair flow from the Stack Installer app.",
      kind: "runtime",
      name: "Bun",
      requiredVersion: O.some(expectedVersion),
      status,
    },
    state,
    summary,
  });
};

const parseSemver = (value: string): O.Option<readonly [number, number, number]> => {
  const match = /^\s*v?(\d+)\.(\d+)\.(\d+)/.exec(value);
  if (match === null) {
    return O.none();
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);

  return Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)
    ? O.none()
    : O.some([major, minor, patch] as const);
};

const compareSemver = (left: readonly [number, number, number], right: readonly [number, number, number]): number => {
  if (left[0] !== right[0]) {
    return left[0] - right[0];
  }
  if (left[1] !== right[1]) {
    return left[1] - right[1];
  }
  return left[2] - right[2];
};

const isVersionAtLeast = (detected: string, expected: string): boolean =>
  O.match(parseSemver(detected), {
    onNone: () => false,
    onSome: (left) =>
      O.match(parseSemver(expected), {
        onNone: () => false,
        onSome: (right) => compareSemver(left, right) >= 0,
      }),
  });

const renderVersion = (version: O.Option<string>): string =>
  O.match(version, {
    onNone: () => "unknown",
    onSome: (value) => value,
  });

const renderInspectionError = (error: BunRuntimeInspectionFailed | S.SchemaError): string =>
  error._tag === "BunRuntimeInspectionFailed" ? error.reason : "Unable to inspect the Bun runtime.";

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

const makeBunRuntimeCommandPort = Effect.fn("InstallerDependenciesServer.makeBunRuntimeCommandPort")(function* () {
  const bunCli = yield* BunCli;

  return BunRuntimeCommandPort.of({
    probe: Effect.fn("BunRuntimeCommandPort.probe")(function* () {
      return yield* bunCli.probe().pipe(
        Effect.map((probe) => ({
          status: probe.status,
          version: probe.version,
        })),
        Effect.mapError(
          (error: { readonly message: string }) =>
            new BunRuntimeCommandPortError({
              message: error.message,
              operation: "probe",
            })
        )
      );
    }),
    upgrade: Effect.fn("BunRuntimeCommandPort.upgrade")(function* () {
      return yield* bunCli.upgrade().pipe(
        Effect.mapError(
          (error: { readonly message: string }) =>
            new BunRuntimeCommandPortError({
              message: error.message,
              operation: "upgrade",
            })
        )
      );
    }),
  });
});

/**
 * Build the deterministic dependency dry-run service.
 *
 * @category layers
 * @since 0.0.0
 */
export const makeInstallerDependenciesServer = Effect.fn("InstallerDependenciesServer.make")(function* () {
  const plan = yield* decodeHostDependencyPlan(p1aHostDependencyPlanInput);
  const bunRuntime = yield* BunRuntimeCommandPort;
  const config = yield* InstallerDependenciesConfig;

  const inspectBunRuntime = Effect.fn("InstallerDependenciesServer.inspectBunRuntime")(function* () {
    const expectedVersion = config.bunRuntime.requiredVersion;
    const probe = yield* bunRuntime.probe().pipe(
      Effect.mapError(
        (error: BunRuntimeCommandPortError) =>
          new BunRuntimeInspectionFailed({
            reason: error.message,
          })
      )
    );

    return makeBunDependency(probe, expectedVersion);
  });

  return {
    inspectBunRuntime,
    previewHostDependencies: () => Effect.succeed(plan),
    repairBunRuntime: Effect.fn("InstallerDependenciesServer.repairBunRuntime")(function* (
      rawRequest: BunRuntimeRepairRequest
    ) {
      const request = yield* decodeBunRuntimeRepairRequest(rawRequest).pipe(
        Effect.mapError(
          () =>
            new BunRuntimeRepairFailed({
              reason: "Repair request payload is invalid.",
            })
        )
      );

      if (!request.approved) {
        return yield* new BunRuntimeRepairApprovalRequired({
          reason: "Explicit user approval is required before mutating the Bun runtime.",
        });
      }

      const before = yield* inspectBunRuntime().pipe(
        Effect.mapError(
          (error) =>
            new BunRuntimeRepairFailed({
              reason: renderInspectionError(error),
            })
        )
      );
      if (before.state === "healthy") {
        return yield* new BunRuntimeAlreadyHealthy({
          reason: "Bun already satisfies the current required version.",
        });
      }
      if (before.state === "missing") {
        return yield* new BunRuntimeRepairFailed({
          reason: "The focused Bun repair flow requires an existing Bun install.",
        });
      }

      yield* bunRuntime.upgrade().pipe(
        Effect.mapError(
          (error: BunRuntimeCommandPortError) =>
            new BunRuntimeRepairFailed({
              reason: error.message,
            })
        )
      );

      const after = yield* inspectBunRuntime().pipe(
        Effect.mapError(
          (error) =>
            new BunRuntimeRepairFailed({
              reason: renderInspectionError(error),
            })
        )
      );

      if (after.state !== "healthy") {
        return yield* new BunRuntimeRepairFailed({
          reason: after.summary,
        });
      }

      return new BunRuntimeRepairResult({
        after,
        before,
        changed: before.summary !== after.summary,
        command: "bun upgrade",
        summary: `Bun repair completed. ${after.summary}`,
      });
    }),
    validateRequiredCommands: Effect.fn("InstallerDependenciesServer.validateRequiredCommands")(function* () {
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
      const [otherProbes, bunProbe] = yield* Effect.all(
        [
          Effect.forEach(
            A.filter(p1CommandProbes, (probe) => probe.name !== "bun"),
            (probe) => probeCommand(spawner, probe),
            { concurrency: 3 }
          ),
          bunRuntime.probe().pipe(
            Effect.catch(() =>
              Effect.succeed({
                status: "missing" as const,
                version: O.none(),
              })
            )
          ),
        ],
        { concurrency: 2 }
      );

      const bunResult = new HostDependencyValidationResult({
        dependency: {
          detectedVersion: bunProbe.version,
          id: "bun",
          installHint: "Run the Stack Installer Bun repair flow before continuing.",
          kind: "runtime",
          name: "bun",
          requiredVersion: O.none(),
          status: bunProbe.status === "present" ? "present" : "missing",
        },
        message:
          bunProbe.status === "present"
            ? `bun command is available${O.isSome(bunProbe.version) ? ` (${bunProbe.version.value})` : ""}.`
            : "bun command is missing or unavailable.",
      });

      return [...otherProbes, bunResult];
    }),
  };
});

/**
 * Live Bun runtime command port adapted from the Bun CLI driver.
 *
 * @category layers
 * @since 0.0.0
 */
export const BunRuntimeCommandPortLive = Layer.effect(BunRuntimeCommandPort, makeBunRuntimeCommandPort());

/**
 * Deterministic dependency server layer for P1A.
 *
 * @category layers
 * @since 0.0.0
 */
export const InstallerDependenciesServerLive = Layer.effect(
  InstallerDependenciesUseCases,
  makeInstallerDependenciesServer()
).pipe(Layer.provideMerge(BunRuntimeCommandPortLive));
