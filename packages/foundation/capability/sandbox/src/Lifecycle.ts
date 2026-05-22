/**
 * Sandbox lifecycle setup and merge helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { A, Str } from "@beep/utils";
import { Duration, Effect } from "effect";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { Display } from "./Display.ts";
import {
  ExecError,
  ExecHostError,
  GitSetupTimeoutError,
  HookTimeoutError,
  MergeToHostTimeoutError,
  type SandboxError,
  SyncError,
} from "./Sandbox.errors.ts";
import { ProcessCommand, type ProcessResult, SandboxProcess, type SandboxProcessShape } from "./Sandbox.process.ts";
import { type ExecResult, SandboxExecOptions, type SandboxHandle } from "./Sandbox.provider.ts";

const $I = $SandboxId.create("Lifecycle");
const DEFAULT_GIT_SETUP_TIMEOUT = Duration.millis(10_000);
const DEFAULT_HOOK_TIMEOUT = Duration.millis(60_000);
const DEFAULT_MERGE_TO_HEAD_TIMEOUT = Duration.millis(30_000);

const shellEscape = (value: string): string => `'${Str.replaceAll("'", "'\\''")(value)}'`;

/**
 * Host lifecycle hook command.
 *
 * @category models
 * @since 0.0.0
 */
export class HostLifecycleHookCommand extends S.Class<HostLifecycleHookCommand>($I`HostLifecycleHookCommand`)(
  {
    command: S.String,
    timeoutMs: S.optionalKey(S.DurationFromMillis),
  },
  $I.annote("HostLifecycleHookCommand", {
    description: "Host lifecycle hook command.",
  })
) {}

/**
 * Sandbox lifecycle hook command.
 *
 * @category models
 * @since 0.0.0
 */
export class SandboxLifecycleHookCommand extends S.Class<SandboxLifecycleHookCommand>($I`SandboxLifecycleHookCommand`)(
  {
    command: S.String,
    sudo: S.Boolean.pipe(S.withConstructorDefault(Effect.succeed(false))),
    timeoutMs: S.optionalKey(S.DurationFromMillis),
  },
  $I.annote("SandboxLifecycleHookCommand", {
    description: "Sandbox lifecycle hook command.",
  })
) {}

/**
 * Host lifecycle hook groups.
 *
 * @category models
 * @since 0.0.0
 */
export class HostLifecycleHooks extends S.Class<HostLifecycleHooks>($I`HostLifecycleHooks`)(
  {
    onSandboxReady: HostLifecycleHookCommand.pipe(S.Array, S.optionalKey),
    onWorktreeReady: HostLifecycleHookCommand.pipe(S.Array, S.optionalKey),
  },
  $I.annote("HostLifecycleHooks", {
    description: "Host lifecycle hook groups.",
  })
) {}

/**
 * Sandbox lifecycle hook groups.
 *
 * @category models
 * @since 0.0.0
 */
export class SandboxLifecycleHooks extends S.Class<SandboxLifecycleHooks>($I`SandboxLifecycleHooks`)(
  {
    onSandboxReady: SandboxLifecycleHookCommand.pipe(S.Array, S.optionalKey),
  },
  $I.annote("SandboxLifecycleHooks", {
    description: "Sandbox lifecycle hook groups.",
  })
) {}

/**
 * Lifecycle hooks for a sandbox run.
 *
 * @category models
 * @since 0.0.0
 */
export class SandboxHooks extends S.Class<SandboxHooks>($I`SandboxHooks`)(
  {
    host: S.optionalKey(HostLifecycleHooks),
    sandbox: S.optionalKey(SandboxLifecycleHooks),
  },
  $I.annote("SandboxHooks", {
    description: "Lifecycle hooks for a sandbox run.",
  })
) {}

/**
 * Options for sandbox lifecycle setup.
 *
 * @category models
 * @since 0.0.0
 */
export class SandboxLifecycleSetupOptions extends S.Class<SandboxLifecycleSetupOptions>(
  $I`SandboxLifecycleSetupOptions`
)(
  {
    gitSetupTimeoutMs: S.DurationFromMillis.pipe(S.withConstructorDefault(Effect.succeed(DEFAULT_GIT_SETUP_TIMEOUT))),
    hookTimeoutMs: S.DurationFromMillis.pipe(S.withConstructorDefault(Effect.succeed(DEFAULT_HOOK_TIMEOUT))),
    hooks: S.optionalKey(SandboxHooks),
    hostRepoDir: S.String,
    hostWorktreePath: S.String,
    sandboxRepoDir: S.String,
  },
  $I.annote("SandboxLifecycleSetupOptions", {
    description: "Options for sandbox lifecycle setup.",
  })
) {}

/**
 * Options for merge-to-head lifecycle.
 *
 * @category models
 * @since 0.0.0
 */
export class MergeToHeadOptions extends S.Class<MergeToHeadOptions>($I`MergeToHeadOptions`)(
  {
    baseHead: S.String,
    hostRepoDir: S.String,
    sourceBranch: S.String,
    targetBranch: S.String,
    timeoutMs: S.DurationFromMillis.pipe(S.withConstructorDefault(Effect.succeed(DEFAULT_MERGE_TO_HEAD_TIMEOUT))),
    worktreePath: S.String,
  },
  $I.annote("MergeToHeadOptions", {
    description: "Options for merge-to-head lifecycle.",
  })
) {}

/**
 * Options for running host lifecycle hooks.
 *
 * @category models
 * @since 0.0.0
 */
export class RunHostHooksOptions extends S.Class<RunHostHooksOptions>($I`RunHostHooksOptions`)(
  {
    defaultTimeout: S.DurationFromMillis.pipe(S.withConstructorDefault(Effect.succeed(DEFAULT_HOOK_TIMEOUT))),
  },
  $I.annote("RunHostHooksOptions", {
    description: "Options for running host lifecycle hooks.",
  })
) {}

const commandOutput = (result: Pick<ExecResult | ProcessResult, "stderr" | "stdout">): string =>
  result.stderr === "" ? result.stdout : result.stderr;

const sandboxExecOk = Effect.fn("Lifecycle.sandboxExecOk")(function* <R>(
  sandbox: SandboxHandle<R>,
  command: string,
  options: SandboxExecOptions
) {
  const result = yield* sandbox.exec(command, options);

  if (result.exitCode !== 0) {
    return yield* ExecError.make({
      cause: commandOutput(result),
      command,
      message: `Sandbox command failed with exit ${result.exitCode}: ${command}`,
    });
  }

  return result;
});

const hostProcessOk = Effect.fn("Lifecycle.hostProcessOk")(function* (
  process: SandboxProcessShape,
  command: ProcessCommand
) {
  const result = yield* process.run(command);
  const renderedCommand = A.join([command.command, ...command.args], " ");

  if (result.exitCode !== 0) {
    return yield* ExecHostError.make({
      cause: commandOutput(result),
      command: renderedCommand,
      message: `Host command failed with exit ${result.exitCode}: ${renderedCommand}`,
    });
  }

  return result;
});

const hostShellOk = Effect.fn("Lifecycle.hostShellOk")(function* (
  process: SandboxProcessShape,
  command: string,
  cwd: string
) {
  const result = yield* process.runShell(command, { cwd });

  if (result.exitCode !== 0) {
    return yield* ExecHostError.make({
      cause: commandOutput(result),
      command,
      message: `Host hook failed: ${command}`,
    });
  }

  return result;
});

const hookTimeout = (hook: { readonly timeoutMs?: Duration.Duration }, fallback: Duration.Duration) =>
  hook.timeoutMs ?? fallback;

const runHostHook = Effect.fn("Lifecycle.runHostHook")(function* (
  process: SandboxProcessShape,
  hook: HostLifecycleHookCommand,
  cwd: string,
  defaultTimeout: Duration.Duration
) {
  const timeout = hookTimeout(hook, defaultTimeout);

  yield* hostShellOk(process, hook.command, cwd).pipe(
    Effect.timeoutOrElse({
      duration: timeout,
      orElse: () =>
        Effect.fail(
          HookTimeoutError.new(
            "host hook timeout",
            `Host hook '${hook.command}' timed out after ${Duration.toMillis(timeout)}ms`,
            {
              command: hook.command,
              timeoutMs: timeout,
            }
          )
        ),
    })
  );
});

const runSandboxHook = Effect.fn("Lifecycle.runSandboxHook")(function* <R>(
  sandbox: SandboxHandle<R>,
  hook: SandboxLifecycleHookCommand,
  cwd: string,
  defaultTimeout: Duration.Duration
) {
  const timeout = hookTimeout(hook, defaultTimeout);

  yield* sandboxExecOk(
    sandbox,
    hook.command,
    SandboxExecOptions.make({
      cwd,
      sudo: hook.sudo === true,
    })
  ).pipe(
    Effect.timeoutOrElse({
      duration: timeout,
      orElse: () =>
        Effect.fail(
          HookTimeoutError.new(
            "sandbox hook timeout",
            `Sandbox hook '${hook.command}' timed out after ${Duration.toMillis(timeout)}ms`,
            {
              command: hook.command,
              timeoutMs: timeout,
            }
          )
        ),
    })
  );
});

/**
 * Run host-side lifecycle hook commands sequentially.
 *
 * @category combinators
 * @since 0.0.0
 */
export const runHostHooks: {
  (hooks: ReadonlyArray<HostLifecycleHookCommand>, cwd: string): Effect.Effect<void, SandboxError, SandboxProcess>;
  (
    hooks: ReadonlyArray<HostLifecycleHookCommand>,
    cwd: string,
    options: RunHostHooksOptions
  ): Effect.Effect<void, SandboxError, SandboxProcess>;
  (
    cwd: string,
    options?: RunHostHooksOptions
  ): (hooks: ReadonlyArray<HostLifecycleHookCommand>) => Effect.Effect<void, SandboxError, SandboxProcess>;
} = dual(
  (args) => !P.isString(args[0]),
  Effect.fn("Lifecycle.runHostHooks")(function* (
    hooks: ReadonlyArray<HostLifecycleHookCommand>,
    cwd: string,
    options: RunHostHooksOptions = RunHostHooksOptions.make({})
  ) {
    if (hooks.length === 0) {
      return;
    }

    const process = yield* SandboxProcess;

    yield* Effect.forEach(hooks, (hook) => runHostHook(process, hook, cwd, options.defaultTimeout), {
      concurrency: 1,
      discard: true,
    });
  })
);

const runSandboxReadyHooks = Effect.fn("Lifecycle.runSandboxReadyHooks")(function* <R>(
  sandbox: SandboxHandle<R>,
  hooks: SandboxHooks | undefined,
  hostWorktreePath: string,
  sandboxRepoDir: string,
  defaultTimeout: Duration.Duration
) {
  const hostHooks = hooks?.host?.onSandboxReady ?? [];
  const sandboxHooks = hooks?.sandbox?.onSandboxReady ?? [];

  if (hostHooks.length === 0 && sandboxHooks.length === 0) {
    return;
  }

  const process = yield* SandboxProcess;
  const hostEffects = A.map(hostHooks, (hook) => runHostHook(process, hook, hostWorktreePath, defaultTimeout));
  const sandboxEffects = A.map(sandboxHooks, (hook) => runSandboxHook(sandbox, hook, sandboxRepoDir, defaultTimeout));

  yield* Effect.all([...hostEffects, ...sandboxEffects], {
    concurrency: "unbounded",
    discard: true,
  });
});

const readHostGitConfig = Effect.fn("Lifecycle.readHostGitConfig")(function* (
  process: SandboxProcessShape,
  hostRepoDir: string,
  key: string
) {
  const result = yield* process.run(
    ProcessCommand.make({
      args: ["config", key],
      command: "git",
      cwd: hostRepoDir,
    })
  );

  return result.exitCode === 0 ? Str.trim(result.stdout) : "";
});

const gitSetupCommand = <R>(
  sandbox: SandboxHandle<R>,
  command: string,
  sandboxRepoDir: string,
  timeout: Duration.Duration
): Effect.Effect<ExecResult, SandboxError, R> =>
  sandboxExecOk(
    sandbox,
    command,
    SandboxExecOptions.make({
      cwd: sandboxRepoDir,
    })
  ).pipe(
    Effect.timeoutOrElse({
      duration: timeout,
      orElse: () =>
        Effect.fail(
          GitSetupTimeoutError.new(
            "git setup timeout",
            `Git setup command timed out after ${Duration.toMillis(timeout)}ms: ${command}`,
            {
              command,
              timeoutMs: timeout,
            }
          )
        ),
    })
  );

const runGitSetup = Effect.fn("Lifecycle.runGitSetup")(function* <R>(
  sandbox: SandboxHandle<R>,
  hostRepoDir: string,
  sandboxRepoDir: string,
  timeout: Duration.Duration
) {
  const process = yield* SandboxProcess;
  const hostGitName = yield* readHostGitConfig(process, hostRepoDir, "user.name");
  const hostGitEmail = yield* readHostGitConfig(process, hostRepoDir, "user.email");

  yield* gitSetupCommand(
    sandbox,
    `git config --global --add safe.directory ${shellEscape(sandboxRepoDir)}`,
    sandboxRepoDir,
    timeout
  );

  if (hostGitName !== "") {
    yield* gitSetupCommand(
      sandbox,
      `git config --global user.name ${shellEscape(hostGitName)}`,
      sandboxRepoDir,
      timeout
    );
  }

  if (hostGitEmail !== "") {
    yield* gitSetupCommand(
      sandbox,
      `git config --global user.email ${shellEscape(hostGitEmail)}`,
      sandboxRepoDir,
      timeout
    );
  }
});

/**
 * Run sandbox setup commands and ready hooks before agent work.
 *
 * @category combinators
 * @since 0.0.0
 */
export const prepareSandboxLifecycle: {
  <R>(
    sandbox: SandboxHandle<R>,
    options: SandboxLifecycleSetupOptions
  ): Effect.Effect<void, SandboxError, R | SandboxProcess | Display>;
  <R>(
    options: SandboxLifecycleSetupOptions
  ): (sandbox: SandboxHandle<R>) => Effect.Effect<void, SandboxError, R | SandboxProcess | Display>;
} = dual(
  2,
  Effect.fn("Lifecycle.prepareSandboxLifecycle")(function* <R>(
    sandbox: SandboxHandle<R>,
    options: SandboxLifecycleSetupOptions
  ) {
    const display = yield* Display;

    yield* display.taskLog(
      "Setting up sandbox",
      Effect.fn("Lifecycle.prepareSandboxLifecycle.task")(function* (message) {
        message(`safe.directory ${options.sandboxRepoDir}`);

        for (const hook of options.hooks?.sandbox?.onSandboxReady ?? []) {
          message(hook.sudo === true ? `[sudo] ${hook.command}` : hook.command);
        }

        for (const hook of options.hooks?.host?.onSandboxReady ?? []) {
          message(`[host] ${hook.command}`);
        }

        yield* runGitSetup(sandbox, options.hostRepoDir, options.sandboxRepoDir, options.gitSetupTimeoutMs);
        yield* runSandboxReadyHooks(
          sandbox,
          options.hooks,
          options.hostWorktreePath,
          options.sandboxRepoDir,
          options.hookTimeoutMs
        );
      })
    );
  })
);

const hostGitOk = (
  process: SandboxProcessShape,
  cwd: string,
  args: ReadonlyArray<string>
): Effect.Effect<ProcessResult, ExecHostError> =>
  hostProcessOk(
    process,
    ProcessCommand.make({
      args: [...args],
      command: "git",
      cwd,
    })
  );

const hostGitOutput = Effect.fn("Lifecycle.hostGitOutput")(function* (
  process: SandboxProcessShape,
  cwd: string,
  args: ReadonlyArray<string>
) {
  const result = yield* hostGitOk(process, cwd, args);

  return result.stdout;
});

/**
 * Return the current HEAD SHA for a host repository path.
 *
 * @category getters
 * @since 0.0.0
 */
export const getHostHead = Effect.fn("Lifecycle.getHostHead")(function* (repoDir: string) {
  const process = yield* SandboxProcess;
  const output = yield* hostGitOutput(process, repoDir, ["rev-parse", "HEAD"]);

  return Str.trim(output);
});

const countNewCommits = Effect.fn("Lifecycle.countNewCommits")(function* (
  process: SandboxProcessShape,
  repoDir: string,
  fromRef: string,
  toRef: string
) {
  const output = yield* hostGitOutput(process, repoDir, ["rev-list", `${fromRef}..${toRef}`, "--count"]);
  const count = Number(Str.trim(output));

  return Number.isFinite(count) ? count : 0;
});

/**
 * Merge a temporary worktree branch back to the host head branch.
 *
 * @category combinators
 * @since 0.0.0
 */
export const mergeToHead = Effect.fn("Lifecycle.mergeToHead")(function* (
  options: MergeToHeadOptions
): Effect.fn.Return<boolean, SandboxError, SandboxProcess | Display> {
  const display = yield* Display;
  const process = yield* SandboxProcess;
  const commitCount = yield* countNewCommits(process, options.hostRepoDir, options.baseHead, options.sourceBranch);

  if (commitCount > 0) {
    yield* display.taskLog(`Merging to ${options.targetBranch}`, () =>
      hostGitOk(process, options.hostRepoDir, ["merge", options.sourceBranch]).pipe(
        Effect.timeoutOrElse({
          duration: options.timeoutMs,
          orElse: () =>
            Effect.fail(
              MergeToHostTimeoutError.new(
                "merge to host timeout",
                `Merge of '${options.sourceBranch}' to '${options.targetBranch}' timed out after ${Duration.toMillis(
                  options.timeoutMs
                )}ms`,
                {
                  sourceBranch: options.sourceBranch,
                  targetBranch: options.targetBranch,
                  timeoutMs: options.timeoutMs,
                }
              )
            ),
        }),
        Effect.mapError((error) =>
          P.isTagged(error, "MergeToHostTimeoutError")
            ? error
            : SyncError.make({
                cause: error,
                message: `Merge of '${options.sourceBranch}' onto '${options.targetBranch}' failed. The temporary branch '${options.sourceBranch}' has been preserved.`,
              })
        )
      )
    );
  }

  yield* hostGitOk(process, options.worktreePath, ["checkout", "--detach"]);
  yield* hostGitOk(process, options.hostRepoDir, ["branch", "-D", options.sourceBranch]).pipe(
    Effect.catch(() => Effect.void)
  );

  return commitCount > 0;
});
