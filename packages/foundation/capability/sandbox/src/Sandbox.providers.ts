/**
 * Built-in local sandbox providers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { A, Str, Struct } from "@beep/utils";
import { Clock, Effect, flow, pipe } from "effect";
import * as S from "effect/Schema";
import { CopyError, DockerError, PodmanError } from "./Sandbox.errors.ts";
import { profileSandboxPhase, redactSensitiveText } from "./Sandbox.observability.ts";
import { ProcessCommand, type ProcessResult, SandboxProcess } from "./Sandbox.process.ts";
import type {
  BindMountSandboxHandle,
  BindMountSandboxProvider,
  NoSandboxHandle,
  NoSandboxProvider,
} from "./Sandbox.provider.ts";
import {
  type BindMountCreateOptions,
  createBindMountSandboxProvider,
  ExecResult,
  InteractiveExecResult,
  type SandboxExecOptions,
} from "./Sandbox.provider.ts";

const $I = $SandboxId.create("Sandbox.providers");

const shellEscape = (value: string): string => `'${Str.replaceAll("'", "'\\''")(value)}'`;

const toExecResult = (result: ProcessResult): ExecResult =>
  ExecResult.make({
    exitCode: result.exitCode,
    stderr: result.stderr,
    stdout: result.stdout,
  });

const processResultOutput = (result: ProcessResult): string => redactSensitiveText(result.stderr || result.stdout);

const commandErrorMessage = (runtime: string, action: string, result: ProcessResult): string =>
  `${runtime} ${action} failed with exit code ${result.exitCode}: ${processResultOutput(result)}`;

const profileProviderAction = (provider: string, action: string) =>
  profileSandboxPhase({
    attributes: {
      action,
      provider,
    },
    phase: `sandbox.provider.${Str.replaceAll(" ", ".")(action)}`,
  });

/**
 * Options for the no-sandbox provider.
 *
 * @category models
 * @since 0.0.0
 */
export class NoSandboxOptions extends S.Class<NoSandboxOptions>($I`NoSandboxOptions`)(
  {
    env: S.Record(S.String, S.String).pipe(S.withConstructorDefault(Effect.succeed({}))),
  },
  $I.annote("NoSandboxOptions", {
    description: "Options for the no-sandbox provider.",
  })
) {}

/**
 * Options for Docker and Podman bind-mount providers.
 *
 * @category models
 * @since 0.0.0
 */
export class ContainerProviderOptions extends S.Class<ContainerProviderOptions>($I`ContainerProviderOptions`)(
  {
    containerName: S.optionalKey(S.String),
    env: S.Record(S.String, S.String).pipe(S.withConstructorDefault(Effect.succeed({}))),
    imageName: S.String,
    sandboxHomedir: S.String.pipe(S.withConstructorDefault(Effect.succeed("/home/agent"))),
    workdir: S.String.pipe(S.withConstructorDefault(Effect.succeed("/home/agent/workspace"))),
  },
  $I.annote("ContainerProviderOptions", {
    description: "Options for Docker and Podman bind-mount providers.",
  })
) {}

const processResultOrDockerError = (
  action: string,
  result: ProcessResult
): Effect.Effect<ProcessResult, DockerError> =>
  result.exitCode === 0
    ? Effect.succeed(result)
    : Effect.fail(
        DockerError.make({
          cause: processResultOutput(result),
          message: commandErrorMessage("Docker", action, result),
        })
      );

const processResultOrPodmanError = (
  action: string,
  result: ProcessResult
): Effect.Effect<ProcessResult, PodmanError> =>
  result.exitCode === 0
    ? Effect.succeed(result)
    : Effect.fail(
        PodmanError.make({
          cause: processResultOutput(result),
          message: commandErrorMessage("Podman", action, result),
        })
      );

const processResultOrCopyError = (action: string, result: ProcessResult): Effect.Effect<void, CopyError> =>
  result.exitCode === 0
    ? Effect.void
    : Effect.fail(
        CopyError.make({
          cause: processResultOutput(result),
          message: `${action} failed with exit code ${result.exitCode}: ${processResultOutput(result)}`,
        })
      );

const containerEnvArgs: (env: Readonly<Record<string, string>>) => ReadonlyArray<string> = flow(
  Struct.entries,
  A.flatMap(([key, value]) => ["-e", `${key}=${value}`])
);

const containerMountArgs = (options: BindMountCreateOptions, sandboxWorkdir: string): ReadonlyArray<string> =>
  pipe(
    [
      {
        hostPath: options.worktreePath,
        readonly: false,
        sandboxPath: sandboxWorkdir,
      },
      ...options.mounts,
    ],
    A.flatMap((mount) => ["-v", `${mount.hostPath}:${mount.sandboxPath}${mount.readonly ? ":ro" : ""}`])
  );

const containerExecArgs = (
  containerName: string,
  command: string,
  options: SandboxExecOptions | undefined
): ReadonlyArray<string> => [
  "exec",
  ...(options?.cwd === undefined ? [] : ["-w", options.cwd]),
  "-i",
  containerName,
  "sh",
  "-lc",
  options?.sudo === true ? `sudo sh -lc ${shellEscape(command)}` : command,
];

const makeContainerHandle = (
  runtime: "docker" | "podman",
  containerName: string,
  worktreePath: string
): Effect.Effect<BindMountSandboxHandle<SandboxProcess>, never> =>
  Effect.succeed({
    close: Effect.gen(function* () {
      const process = yield* SandboxProcess;
      const result = yield* process
        .run(
          ProcessCommand.make({
            args: ["rm", "-f", containerName],
            command: runtime,
          })
        )
        .pipe(profileProviderAction(runtime, "container removal"));

      if (runtime === "docker") {
        yield* processResultOrDockerError("container removal", result);
      } else {
        yield* processResultOrPodmanError("container removal", result);
      }
    }).pipe(Effect.withSpan("ContainerHandle.close")),
    copyFileIn: Effect.fn("ContainerHandle.copyFileIn")(function* (hostPath: string, sandboxPath: string) {
      const process = yield* SandboxProcess;
      const result = yield* process
        .run(
          ProcessCommand.make({
            args: ["cp", hostPath, `${containerName}:${sandboxPath}`],
            command: runtime,
          })
        )
        .pipe(profileProviderAction(runtime, "copy in"));

      yield* processResultOrCopyError(`${runtime} copy in`, result);
    }),
    copyFileOut: Effect.fn("ContainerHandle.copyFileOut")(function* (sandboxPath: string, hostPath: string) {
      const process = yield* SandboxProcess;
      const result = yield* process
        .run(
          ProcessCommand.make({
            args: ["cp", `${containerName}:${sandboxPath}`, hostPath],
            command: runtime,
          })
        )
        .pipe(profileProviderAction(runtime, "copy out"));

      yield* processResultOrCopyError(`${runtime} copy out`, result);
    }),
    exec: Effect.fn("ContainerHandle.exec")(function* (command: string, options?: SandboxExecOptions) {
      const process = yield* SandboxProcess;
      const processCommand = ProcessCommand.make({
        args: [...containerExecArgs(containerName, command, options)],
        command: runtime,
        ...(options?.onLine === undefined ? {} : { onLine: options.onLine }),
        ...(options?.stdin === undefined ? {} : { stdin: options.stdin }),
      });
      const result = yield* process.run(processCommand).pipe(profileProviderAction(runtime, "exec"));

      return toExecResult(result);
    }),
    interactiveExec: Effect.fn("ContainerHandle.interactiveExec")(function* (args: ReadonlyArray<string>) {
      const process = yield* SandboxProcess;
      const result = yield* process
        .run(
          ProcessCommand.make({
            args: ["exec", "-it", containerName, ...args],
            command: runtime,
          })
        )
        .pipe(profileProviderAction(runtime, "interactive exec"));

      return InteractiveExecResult.make({ exitCode: result.exitCode });
    }),
    worktreePath,
  });

const createContainerProvider = (
  runtime: "docker" | "podman",
  options: ContainerProviderOptions
): BindMountSandboxProvider<SandboxProcess> =>
  createBindMountSandboxProvider<SandboxProcess>({
    create: Effect.fn("ContainerProvider.create")(function* (createOptions) {
      const process = yield* SandboxProcess;
      const nowMs = yield* Clock.currentTimeMillis;
      const containerName = options.containerName ?? `beep-sandbox-${runtime}-${nowMs.toString(36)}`;
      const env = {
        ...createOptions.env,
        ...options.env,
      };
      const runArgs = [
        "run",
        "-d",
        "--name",
        containerName,
        "-w",
        options.workdir,
        ...containerEnvArgs(env),
        ...containerMountArgs(createOptions, options.workdir),
        options.imageName,
        "tail",
        "-f",
        "/dev/null",
      ];
      const result = yield* process
        .run(ProcessCommand.make({ args: runArgs, command: runtime }))
        .pipe(profileProviderAction(runtime, "container start"));

      if (runtime === "docker") {
        yield* processResultOrDockerError("container start", result);
      } else {
        yield* processResultOrPodmanError("container start", result);
      }

      return yield* makeContainerHandle(runtime, containerName, options.workdir);
    }),
    env: options.env,
    name: runtime,
    sandboxHomedir: options.sandboxHomedir,
  });

/**
 * Create a host-local no-sandbox provider.
 *
 * @category constructors
 * @since 0.0.0
 */
export const noSandbox = (
  options: NoSandboxOptions = NoSandboxOptions.make({})
): NoSandboxProvider<SandboxProcess> => ({
  _tag: "None",
  create: Effect.fn("NoSandboxProvider.create")(function* ({ env, worktreePath }) {
    return {
      close: Effect.void,
      copyFileOut: Effect.fn("NoSandboxHandle.copyFileOut")(function* (sandboxPath: string, hostPath: string) {
        const process = yield* SandboxProcess;
        const result = yield* process
          .runShell(`cp -R ${shellEscape(sandboxPath)} ${shellEscape(hostPath)}`)
          .pipe(profileProviderAction("host", "copy out"));

        yield* processResultOrCopyError("host copy out", result);
      }),
      exec: Effect.fn("NoSandboxHandle.exec")(function* (command: string, execOptions?: SandboxExecOptions) {
        const process = yield* SandboxProcess;
        const result = yield* process
          .runShell(execOptions?.sudo === true ? `sudo sh -lc ${shellEscape(command)}` : command, {
            cwd: execOptions?.cwd ?? worktreePath,
            env: {
              ...env,
              ...options.env,
            },
            ...(execOptions?.onLine === undefined ? {} : { onLine: execOptions.onLine }),
            ...(execOptions?.stdin === undefined ? {} : { stdin: execOptions.stdin }),
          })
          .pipe(profileProviderAction("host", "exec"));

        return toExecResult(result);
      }),
      interactiveExec: Effect.fn("NoSandboxHandle.interactiveExec")(function* (args: ReadonlyArray<string>) {
        const process = yield* SandboxProcess;
        const command = pipe(args, A.map(shellEscape), A.join(" "));
        const result = yield* process
          .runShell(command, {
            cwd: worktreePath,
            env: {
              ...env,
              ...options.env,
            },
          })
          .pipe(profileProviderAction("host", "interactive exec"));

        return InteractiveExecResult.make({ exitCode: result.exitCode });
      }),
      worktreePath,
    } satisfies NoSandboxHandle<SandboxProcess>;
  }),
  env: options.env,
  name: "none",
});

/**
 * Create a Docker bind-mount sandbox provider.
 *
 * @category constructors
 * @since 0.0.0
 */
export const docker = (options: ContainerProviderOptions): BindMountSandboxProvider<SandboxProcess> =>
  createContainerProvider("docker", options);

/**
 * Create a Podman bind-mount sandbox provider.
 *
 * @category constructors
 * @since 0.0.0
 */
export const podman = (options: ContainerProviderOptions): BindMountSandboxProvider<SandboxProcess> =>
  createContainerProvider("podman", options);
