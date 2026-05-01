/**
 * Programmatic sandbox run API.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { Duration, Effect, FileSystem, Path } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { AgentProvider } from "./Agent.provider.ts";
import type { AgentStreamEmitter, AgentStreamEvent } from "./AgentStreamEmitter.ts";
import { Display, type Severity } from "./Display.ts";
import { MergeProviderEnvOptions, mergeProviderEnv, resolveEnv } from "./Env.ts";
import { CommitSummary, IterationResult, orchestrate } from "./Orchestrator.ts";
import {
  BUILT_IN_PROMPT_ARG_KEYS,
  type PromptArgs,
  ResolvePromptOptions,
  resolvePrompt,
  substitutePromptArgs,
  validateNoArgsWithInlinePrompt,
  validateNoBuiltInArgOverride,
} from "./Prompt.ts";
import { CopyToWorktreeError, CopyToWorktreeTimeoutError, CwdError, type SandboxError } from "./Sandbox.errors.ts";
import { ProcessCommand, SandboxProcess } from "./Sandbox.process.ts";
import {
  BindMountCreateOptions,
  type BranchStrategy,
  HeadBranchStrategy,
  IsolatedCreateOptions,
  MergeToHeadBranchStrategy,
  type MountEntry,
  type SandboxHandle,
  type SandboxProvider,
} from "./Sandbox.provider.ts";
import { CreateWorktreeInfoOptions, collectCommitShas, createWorktreeInfo, getCurrentBranch } from "./Worktree.ts";

const $I = $SandboxId.create("Run");

/**
 * Default maximum number of iterations.
 *
 * @category configuration
 * @since 0.0.0
 */
export const DEFAULT_MAX_ITERATIONS = 1 as const;

/**
 * Override default timeouts for built-in lifecycle steps.
 *
 * @category models
 * @since 0.0.0
 */
export class Timeouts extends S.Class<Timeouts>($I`Timeouts`)(
  {
    copyToWorktreeMs: S.DurationFromMillis.pipe(
      S.withDecodingDefaultKey(Effect.succeed(60_000)),
      S.withConstructorDefault(Effect.succeed(Duration.millis(60_000))),
      S.annotateKey({
        default: Duration.millis(60_000),
        description: "Timeout for copying paths into a managed worktree.",
      })
    ),
  },
  $I.annote("Timeouts", {
    description: "Override default timeouts for built-in lifecycle steps.",
  })
) {}

/**
 * File logging options.
 *
 * @category models
 * @since 0.0.0
 */
export interface FileLoggingOption {
  readonly _tag: "File";
  readonly onAgentStreamEvent?: (event: AgentStreamEvent) => void;
  readonly path: string;
}

/**
 * Terminal logging options.
 *
 * @category models
 * @since 0.0.0
 */
export interface StdoutLoggingOption {
  readonly _tag: "Stdout";
}

/**
 * Logging mode for a sandbox run.
 *
 * @category models
 * @since 0.0.0
 */
export type LoggingOption = FileLoggingOption | StdoutLoggingOption;

/**
 * Options for building run summary rows.
 *
 * @category models
 * @since 0.0.0
 */
export class RunSummaryRowOptions extends S.Class<RunSummaryRowOptions>($I`RunSummaryRowOptions`)(
  {
    agentName: S.String,
    branch: S.String,
    maxIterations: S.Number,
    name: S.optionalKey(S.String),
    sandboxName: S.String,
  },
  $I.annote("RunSummaryRowOptions", {
    description: "Options for building run summary rows.",
  })
) {}

/**
 * Startup options for file display mode.
 *
 * @category models
 * @since 0.0.0
 */
export class FileDisplayStartupOptions extends S.Class<FileDisplayStartupOptions>($I`FileDisplayStartupOptions`)(
  {
    agentName: S.optionalKey(S.String),
    branch: S.optionalKey(S.String),
    hostRepoDir: S.optionalKey(S.String),
    logPath: S.String,
  },
  $I.annote("FileDisplayStartupOptions", {
    description: "Startup options for file display mode.",
  })
) {}

/**
 * Result returned by {@link run}.
 *
 * @category models
 * @since 0.0.0
 */
export class RunResult extends S.Class<RunResult>($I`RunResult`)(
  {
    branch: S.String,
    commits: S.Array(CommitSummary),
    completionSignal: S.optionalKey(S.String),
    iterations: S.Array(IterationResult),
    logFilePath: S.optionalKey(S.String),
    preservedWorktreePath: S.optionalKey(S.String),
    stdout: S.String,
  },
  $I.annote("RunResult", {
    description: "Result returned by run.",
  })
) {}

/**
 * Programmatic run options.
 *
 * @category services
 * @since 0.0.0
 */
export interface RunOptions<R = never> {
  readonly agent: AgentProvider;
  readonly branchStrategy?: BranchStrategy;
  readonly completionSignal?: string | ReadonlyArray<string>;
  readonly copyToWorktree?: ReadonlyArray<string>;
  readonly cwd?: string;
  readonly logging?: LoggingOption;
  readonly maxIterations?: number;
  readonly mounts?: ReadonlyArray<MountEntry>;
  readonly name?: string;
  readonly prompt?: string;
  readonly promptArgs?: PromptArgs;
  readonly promptFile?: string;
  readonly sandbox: SandboxProvider<R>;
  readonly timeouts?: Timeouts;
}

/**
 * Replace path-hostile branch characters with dashes.
 *
 * @category utilities
 * @since 0.0.0
 */
export const sanitizeBranchForFilename = (branch: string): string => Str.replace(/[/\\:*?"<>|]/gu, "-")(branch);

/**
 * Build a log filename for a branch/run pair.
 *
 * @category utilities
 * @since 0.0.0
 */
export const buildLogFilename: {
  (targetBranch?: string, name?: string): (resolvedBranch: string) => string;
  (resolvedBranch: string, targetBranch?: string, name?: string): string;
} = dual(3, (resolvedBranch: string, targetBranch?: string, name?: string): string => {
  const sanitized = sanitizeBranchForFilename(resolvedBranch);
  const nameSuffix = name === undefined ? "" : `-${Str.replace(/[^a-z0-9_.-]/gu, "-")(Str.toLowerCase(name))}`;

  return targetBranch === undefined
    ? `${sanitized}${nameSuffix}.log`
    : `${sanitizeBranchForFilename(targetBranch)}-${sanitized}${nameSuffix}.log`;
});

/**
 * Build summary rows for display output.
 *
 * @category utilities
 * @since 0.0.0
 */
export const buildRunSummaryRows = (options: RunSummaryRowOptions): Record<string, string> => ({
  Agent: options.name ?? options.agentName,
  Branch: options.branch,
  "Max iterations": String(options.maxIterations),
  Sandbox: options.sandboxName,
});

/**
 * Build the final run status message.
 *
 * @category utilities
 * @since 0.0.0
 */
export const buildCompletionMessage = (
  completionSignal: string | undefined,
  iterationsRun: number
): { readonly message: string; readonly severity: Severity } =>
  completionSignal === undefined
    ? {
        message: `Run complete: reached ${iterationsRun} iteration(s) without completion signal.`,
        severity: "Warn",
      }
    : {
        message: `Run complete: agent finished after ${iterationsRun} iteration(s).`,
        severity: "Success",
      };

/**
 * Format an iteration context-window size.
 *
 * @category utilities
 * @since 0.0.0
 */
export const formatContextWindowSize = (usage: {
  readonly cacheCreationInputTokens: number;
  readonly cacheReadInputTokens: number;
  readonly inputTokens: number;
}): string => {
  const total = usage.inputTokens + usage.cacheCreationInputTokens + usage.cacheReadInputTokens;

  return `${Math.ceil(total / 1000)}k`;
};

/**
 * Build context-window summary lines.
 *
 * @category utilities
 * @since 0.0.0
 */
export const buildContextWindowLines = (
  iterations: ReadonlyArray<Pick<IterationResult, "usage">>
): ReadonlyArray<string> => {
  const lines: Array<string> = [];

  for (const iteration of iterations) {
    if (iteration.usage !== undefined) {
      lines.push(`Context window: ${formatContextWindowSize(iteration.usage)}`);
    }
  }

  return lines;
};

const resolveCwd = Effect.fn("Run.resolveCwd")(function* (cwd: string | undefined) {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;
  const repoDir = cwd === undefined ? process.cwd() : path.resolve(cwd);
  const info = yield* fs.stat(repoDir).pipe(
    Effect.mapError((cause) =>
      CwdError.new(cause, `The provided cwd does not exist or cannot be read: ${repoDir}`, {
        cwd: repoDir,
      })
    )
  );

  if (info.type !== "Directory") {
    return yield* CwdError.new(
      `cwd is not a directory: ${repoDir}`,
      `The provided cwd is not a directory: ${repoDir}`,
      {
        cwd: repoDir,
      }
    );
  }

  return repoDir;
});

const copyPathsToWorktree = Effect.fn("Run.copyPathsToWorktree")(function* (
  hostRepoDir: string,
  worktreePath: string,
  paths: ReadonlyArray<string>,
  timeout: Duration.Duration
) {
  if (paths.length === 0) {
    return;
  }

  const process = yield* SandboxProcess;
  const path = yield* Path.Path;
  const timeoutMs = Duration.toMillis(timeout);

  yield* Effect.forEach(
    paths,
    (relativePath) =>
      Effect.gen(function* () {
        const source = path.join(hostRepoDir, relativePath);
        const destination = path.join(worktreePath, relativePath);
        const result = yield* process.run(
          new ProcessCommand({
            args: [
              "-lc",
              `mkdir -p ${shellEscape(path.dirname(destination))} && cp -R ${shellEscape(source)} ${shellEscape(destination)}`,
            ],
            command: "sh",
          })
        );

        if (result.exitCode !== 0) {
          return yield* CopyToWorktreeError.new(
            result.stderr || result.stdout,
            `Failed to copy ${relativePath} into worktree`,
            {
              exitCode: result.exitCode,
              path: relativePath,
              stderr: result.stderr,
            }
          );
        }
      }),
    { concurrency: 1, discard: true }
  ).pipe(
    Effect.timeoutOrElse({
      duration: timeout,
      orElse: () =>
        Effect.fail(
          CopyToWorktreeTimeoutError.new(
            "copy to worktree timeout",
            `Copying files to worktree timed out after ${timeoutMs}ms`,
            {
              paths: [...paths],
              timeoutMs: timeout,
            }
          )
        ),
    })
  );
});

const shellEscape = (value: string): string => `'${value.replaceAll("'", "'\\''")}'`;

const defaultBranchStrategy = <R>(provider: SandboxProvider<R>): BranchStrategy =>
  provider._tag === "Isolated" ? new MergeToHeadBranchStrategy({}) : new HeadBranchStrategy({});

const createSandboxHandle = <R>(
  provider: SandboxProvider<R>,
  env: Record<string, string>,
  hostRepoDir: string,
  worktreePath: string,
  mounts: ReadonlyArray<MountEntry>
): Effect.Effect<SandboxHandle<R>, SandboxError, R> => {
  if (provider._tag === "BindMount") {
    return provider.create(
      new BindMountCreateOptions({
        env,
        hostRepoPath: hostRepoDir,
        mounts: [...mounts],
        worktreePath,
      })
    );
  }

  if (provider._tag === "Isolated") {
    return provider.create(new IsolatedCreateOptions({ env }));
  }

  return provider.create({ env, worktreePath });
};

/**
 * Run an agent in a sandbox provider.
 *
 * @category combinators
 * @since 0.0.0
 */
export const run = <R>(
  options: RunOptions<R>
): Effect.Effect<
  RunResult,
  SandboxError,
  R | SandboxProcess | FileSystem.FileSystem | Path.Path | Display | AgentStreamEmitter
> =>
  Effect.gen(function* () {
    const display = yield* Display;
    const hostRepoDir = yield* resolveCwd(options.cwd);
    const maxIterations = options.maxIterations ?? DEFAULT_MAX_ITERATIONS;
    const branchStrategy = options.branchStrategy ?? defaultBranchStrategy(options.sandbox);
    const currentBranch = yield* getCurrentBranch(hostRepoDir);
    const promptArgs = options.promptArgs ?? {};
    const resolvedPrompt = yield* resolvePrompt(
      new ResolvePromptOptions({
        ...(options.prompt === undefined ? {} : { prompt: options.prompt }),
        ...(options.promptFile === undefined ? {} : { promptFile: options.promptFile }),
      })
    );

    yield* validateNoBuiltInArgOverride(promptArgs);
    if (resolvedPrompt.source === "Inline") {
      yield* validateNoArgsWithInlinePrompt(promptArgs);
    }

    const resolvedBranch =
      branchStrategy._tag === "Branch"
        ? branchStrategy.branch
        : branchStrategy._tag === "Head"
          ? currentBranch
          : buildLogFilename(currentBranch, undefined, options.name).replace(/\.log$/u, "");
    const builtInArgs = {
      SOURCE_BRANCH: currentBranch,
      TARGET_BRANCH: resolvedBranch,
    };
    const prompt =
      resolvedPrompt.source === "Inline"
        ? resolvedPrompt.text
        : yield* substitutePromptArgs(
            resolvedPrompt.text,
            {
              ...promptArgs,
              ...builtInArgs,
            },
            new Set(BUILT_IN_PROMPT_ARG_KEYS)
          );
    const resolvedEnv = yield* resolveEnv(hostRepoDir);
    const env = yield* mergeProviderEnv(
      new MergeProviderEnvOptions({
        agentProviderEnv: options.agent.env,
        resolvedEnv,
        sandboxProviderEnv: options.sandbox.env,
      })
    );
    const timeouts = options.timeouts ?? new Timeouts({});
    const worktree =
      branchStrategy._tag === "Head"
        ? { branch: currentBranch, path: hostRepoDir }
        : yield* createWorktreeInfo(
            new CreateWorktreeInfoOptions({
              ...(branchStrategy._tag === "Branch"
                ? {
                    ...(branchStrategy.baseBranch === undefined ? {} : { baseBranch: branchStrategy.baseBranch }),
                    branch: branchStrategy.branch,
                  }
                : {}),
              ...(options.name === undefined ? {} : { name: options.name }),
              repoDir: hostRepoDir,
            })
          );

    yield* copyPathsToWorktree(hostRepoDir, worktree.path, options.copyToWorktree ?? [], timeouts.copyToWorktreeMs);

    const result = yield* Effect.acquireUseRelease(
      createSandboxHandle(options.sandbox, env, hostRepoDir, worktree.path, options.mounts ?? []),
      (sandbox) =>
        orchestrate({
          branch: worktree.branch,
          ...(options.completionSignal === undefined ? {} : { completionSignal: options.completionSignal }),
          iterations: maxIterations,
          ...(options.name === undefined ? {} : { name: options.name }),
          prompt,
          provider: options.agent,
          sandbox,
          sandboxRepoDir: sandbox.worktreePath,
        }),
      (sandbox) => sandbox.close().pipe(Effect.catch(() => Effect.void))
    );
    const completion = buildCompletionMessage(result.completionSignal, result.iterations.length);
    const displayRows = buildRunSummaryRows(
      new RunSummaryRowOptions({
        agentName: options.agent.name,
        branch: result.branch,
        maxIterations,
        ...(options.name === undefined ? {} : { name: options.name }),
        sandboxName: options.sandbox.name,
      })
    );

    yield* display.summary("Run summary", displayRows);
    yield* display.status(completion.message, completion.severity);

    return new RunResult({
      branch: result.branch,
      commits:
        branchStrategy._tag === "Head"
          ? result.commits
          : yield* collectCommitShas(hostRepoDir, currentBranch, worktree.branch).pipe(
              Effect.catch(() => Effect.succeed([]))
            ),
      ...(result.completionSignal === undefined ? {} : { completionSignal: result.completionSignal }),
      iterations: result.iterations,
      ...(options.logging?._tag === "File" ? { logFilePath: options.logging.path } : {}),
      ...(result.preservedWorktreePath === undefined ? {} : { preservedWorktreePath: result.preservedWorktreePath }),
      stdout: result.stdout,
    });
  });
