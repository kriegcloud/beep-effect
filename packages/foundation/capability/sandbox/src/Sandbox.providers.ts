/**
 * Built-in local sandbox providers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { A, Struct } from "@beep/utils";
import { Effect, pipe } from "effect";
import * as S from "effect/Schema";
import { CopyError, DockerError, PodmanError } from "./Sandbox.errors.ts";
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

const shellEscape = (value: string): string => `'${value.replaceAll("'", "'\\''")}'`;

const toExecResult = (result: ProcessResult): ExecResult =>
  new ExecResult({
    exitCode: result.exitCode,
    stderr: result.stderr,
    stdout: result.stdout,
  });

const commandErrorMessage = (runtime: string, action: string, result: ProcessResult): string =>
  `${runtime} ${action} failed with exit code ${result.exitCode}: ${result.stderr || result.stdout}`;

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
        new DockerError({
          cause: result.stderr || result.stdout,
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
        new PodmanError({
          cause: result.stderr || result.stdout,
          message: commandErrorMessage("Podman", action, result),
        })
      );

const processResultOrCopyError = (action: string, result: ProcessResult): Effect.Effect<void, CopyError> =>
  result.exitCode === 0
    ? Effect.void
    : Effect.fail(
        new CopyError({
          cause: result.stderr || result.stdout,
          message: `${action} failed with exit code ${result.exitCode}: ${result.stderr || result.stdout}`,
        })
      );

const containerEnvArgs = (env: Readonly<Record<string, string>>): ReadonlyArray<string> =>
  pipe(
    env,
    Struct.entries,
    A.flatMap(([key, value]) => ["-e", `${key}=${value}`])
  );

const containerMountArgs = (options: BindMountCreateOptions): ReadonlyArray<string> =>
  pipe(
    [
      {
        hostPath: options.worktreePath,
        readonly: false,
        sandboxPath: "/home/agent/workspace",
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
    close: Effect.fn("ContainerHandle.close")(function* () {
      const process = yield* SandboxProcess;
      const result = yield* process.run(
        new ProcessCommand({
          args: ["rm", "-f", containerName],
          command: runtime,
        })
      );

      if (runtime === "docker") {
        yield* processResultOrDockerError("container removal", result);
      } else {
        yield* processResultOrPodmanError("container removal", result);
      }
    }),
    copyFileIn: Effect.fn("ContainerHandle.copyFileIn")(function* (hostPath: string, sandboxPath: string) {
      const process = yield* SandboxProcess;
      const result = yield* process.run(
        new ProcessCommand({
          args: ["cp", hostPath, `${containerName}:${sandboxPath}`],
          command: runtime,
        })
      );

      yield* processResultOrCopyError(`${runtime} copy in`, result);
    }),
    copyFileOut: Effect.fn("ContainerHandle.copyFileOut")(function* (sandboxPath: string, hostPath: string) {
      const process = yield* SandboxProcess;
      const result = yield* process.run(
        new ProcessCommand({
          args: ["cp", `${containerName}:${sandboxPath}`, hostPath],
          command: runtime,
        })
      );

      yield* processResultOrCopyError(`${runtime} copy out`, result);
    }),
    exec: Effect.fn("ContainerHandle.exec")(function* (command: string, options?: SandboxExecOptions) {
      const process = yield* SandboxProcess;
      const processCommand = new ProcessCommand({
        args: [...containerExecArgs(containerName, command, options)],
        command: runtime,
        ...(options?.stdin === undefined ? {} : { stdin: options.stdin }),
      });
      const result = yield* process.run(processCommand);

      return toExecResult(result);
    }),
    interactiveExec: Effect.fn("ContainerHandle.interactiveExec")(function* (args: ReadonlyArray<string>) {
      const process = yield* SandboxProcess;
      const result = yield* process.run(
        new ProcessCommand({
          args: ["exec", "-it", containerName, ...args],
          command: runtime,
        })
      );

      return new InteractiveExecResult({ exitCode: result.exitCode });
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
      const containerName = options.containerName ?? `beep-sandbox-${runtime}-${Date.now().toString(36)}`;
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
        ...containerMountArgs(createOptions),
        options.imageName,
        "tail",
        "-f",
        "/dev/null",
      ];
      const result = yield* process.run(new ProcessCommand({ args: runArgs, command: runtime }));

      if (runtime === "docker") {
        yield* processResultOrDockerError("container start", result);
      } else {
        yield* processResultOrPodmanError("container start", result);
      }

      return yield* makeContainerHandle(runtime, containerName, createOptions.worktreePath);
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
export const noSandbox = (options: NoSandboxOptions = new NoSandboxOptions({})): NoSandboxProvider<SandboxProcess> => ({
  _tag: "None",
  create: ({ env, worktreePath }) =>
    Effect.succeed({
      close: () => Effect.void,
      copyFileOut: Effect.fn("NoSandboxHandle.copyFileOut")(function* (sandboxPath: string, hostPath: string) {
        const process = yield* SandboxProcess;
        const result = yield* process.runShell(`cp -R ${shellEscape(sandboxPath)} ${shellEscape(hostPath)}`);

        yield* processResultOrCopyError("host copy out", result);
      }),
      exec: Effect.fn("NoSandboxHandle.exec")(function* (command: string, execOptions?: SandboxExecOptions) {
        const process = yield* SandboxProcess;
        const result = yield* process.runShell(
          execOptions?.sudo === true ? `sudo sh -lc ${shellEscape(command)}` : command,
          {
            cwd: execOptions?.cwd ?? worktreePath,
            env: {
              ...env,
              ...options.env,
            },
            ...(execOptions?.stdin === undefined ? {} : { stdin: execOptions.stdin }),
          }
        );

        return toExecResult(result);
      }),
      interactiveExec: Effect.fn("NoSandboxHandle.interactiveExec")(function* (args: ReadonlyArray<string>) {
        const process = yield* SandboxProcess;
        const command = pipe(args, A.map(shellEscape), (parts) => parts.join(" "));
        const result = yield* process.runShell(command, {
          cwd: worktreePath,
          env: {
            ...env,
            ...options.env,
          },
        });

        return new InteractiveExecResult({ exitCode: result.exitCode });
      }),
      worktreePath,
    } satisfies NoSandboxHandle<SandboxProcess>),
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
