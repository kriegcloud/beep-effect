/**
 * Programmatic sandbox run API.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { Fn, LiteralKit } from "@beep/schema";
import { A, Str } from "@beep/utils";
import { Duration, Effect, FileSystem, Path } from "effect";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { AgentProvider } from "./Agent.provider.ts";
import { type AgentStreamEmitter, AgentStreamEvent } from "./AgentStreamEmitter.ts";
import { Display, type Severity } from "./Display.ts";
import { MergeProviderEnvOptions, mergeProviderEnv, resolveEnv } from "./Env.ts";
import {
  getHostHead,
  MergeToHeadOptions,
  mergeToHead,
  prepareSandboxLifecycle,
  RunHostHooksOptions,
  runHostHooks,
  type SandboxHooks,
  SandboxLifecycleSetupOptions,
} from "./Lifecycle.ts";
import { CommitSummary, IterationResult, orchestrate } from "./Orchestrator.ts";
import {
  BUILT_IN_PROMPT_ARG_KEY_SET,
  type PromptArgs,
  ResolvePromptOptions,
  resolvePrompt,
  substitutePromptArgs,
  validateNoArgsWithInlinePrompt,
  validateNoBuiltInArgOverride,
} from "./Prompt.ts";
import {
  CommitCollectionTimeoutError,
  CopyToWorktreeError,
  CopyToWorktreeTimeoutError,
  CwdError,
  type SandboxError,
} from "./Sandbox.errors.ts";
import { profileSandboxPhase, redactSensitiveText } from "./Sandbox.observability.ts";
import { ProcessCommand, SandboxProcess, type SandboxProcessShape } from "./Sandbox.process.ts";
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
import {
  CreateWorktreeInfoOptions,
  collectCommitShas,
  createWorktreeInfo,
  getCurrentBranch,
  removeWorktree,
  type WorktreeInfo,
} from "./Worktree.ts";

const $I = $SandboxId.create("Run");

/**
 * Default maximum number of iterations.
 *
 * @category utilities
 * @since 0.0.0
 */
export const DEFAULT_MAX_ITERATIONS = 1 as const;

/**
 * Logging option discriminator.
 *
 * @category schemas
 * @since 0.0.0
 */
export const LoggingOptionKind = LiteralKit(["File", "Stdout"]).annotate(
  $I.annote("LoggingOptionKind", {
    description: "Logging option discriminator.",
  })
);

/**
 * Runtime type for {@link LoggingOptionKind}.
 *
 * @category models
 * @since 0.0.0
 */
export type LoggingOptionKind = typeof LoggingOptionKind.Type;

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
    commitCollectionMs: S.DurationFromMillis.pipe(
      S.withDecodingDefaultKey(Effect.succeed(30_000)),
      S.withConstructorDefault(Effect.succeed(Duration.millis(30_000))),
      S.annotateKey({
        default: Duration.millis(30_000),
        description: "Timeout for collecting commit SHAs after a run.",
      })
    ),
    gitSetupMs: S.DurationFromMillis.pipe(
      S.withDecodingDefaultKey(Effect.succeed(10_000)),
      S.withConstructorDefault(Effect.succeed(Duration.millis(10_000))),
      S.annotateKey({
        default: Duration.millis(10_000),
        description: "Timeout for sandbox git safe-directory and identity setup.",
      })
    ),
    hookMs: S.DurationFromMillis.pipe(
      S.withDecodingDefaultKey(Effect.succeed(60_000)),
      S.withConstructorDefault(Effect.succeed(Duration.millis(60_000))),
      S.annotateKey({
        default: Duration.millis(60_000),
        description: "Default timeout for lifecycle hook commands.",
      })
    ),
    mergeToHeadMs: S.DurationFromMillis.pipe(
      S.withDecodingDefaultKey(Effect.succeed(30_000)),
      S.withConstructorDefault(Effect.succeed(Duration.millis(30_000))),
      S.annotateKey({
        default: Duration.millis(30_000),
        description: "Timeout for merging a temporary branch back to the host head branch.",
      })
    ),
    promptExpansionMs: S.DurationFromMillis.pipe(
      S.withDecodingDefaultKey(Effect.succeed(30_000)),
      S.withConstructorDefault(Effect.succeed(Duration.millis(30_000))),
      S.annotateKey({
        default: Duration.millis(30_000),
        description: "Timeout for prompt shell expression expansion commands.",
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
export class FileLoggingOption extends S.TaggedClass<FileLoggingOption>($I`FileLoggingOption`)(
  "File",
  {
    onAgentStreamEvent: S.optionalKey(Fn({ input: AgentStreamEvent, output: S.Void })),
    path: S.String,
  },
  $I.annote("FileLoggingOption", {
    description: "File logging options.",
  })
) {}

/**
 * Terminal logging options.
 *
 * @category models
 * @since 0.0.0
 */
export class StdoutLoggingOption extends S.TaggedClass<StdoutLoggingOption>($I`StdoutLoggingOption`)(
  "Stdout",
  {},
  $I.annote("StdoutLoggingOption", {
    description: "Terminal logging options.",
  })
) {}

/**
 * Logging mode for a sandbox run.
 *
 * @category schemas
 * @since 0.0.0
 */
export const LoggingOption = S.Union([FileLoggingOption, StdoutLoggingOption]).pipe(
  $I.annoteSchema("LoggingOption", {
    description: "Logging mode for a sandbox run.",
  })
);

/**
 * Runtime type for {@link LoggingOption}.
 *
 * @category models
 * @since 0.0.0
 */
export type LoggingOption = typeof LoggingOption.Type;

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
 * Options for building a sandbox run log filename.
 *
 * @category models
 * @since 0.0.0
 */
export class LogFilenameOptions extends S.Class<LogFilenameOptions>($I`LogFilenameOptions`)(
  {
    name: S.optionalKey(S.String),
    targetBranch: S.optionalKey(S.String),
  },
  $I.annote("LogFilenameOptions", {
    description: "Options for building a sandbox run log filename.",
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
 * @remarks
 * This remains an interface because it carries provider service contracts
 * (`agent` and `sandbox`) whose public surface is function-bearing and generic
 * in the required Effect environment.
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
  readonly hooks?: SandboxHooks;
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
  (resolvedBranch: string): string;
  (resolvedBranch: string, options: LogFilenameOptions): string;
  (options: LogFilenameOptions): (resolvedBranch: string) => string;
} = dual(
  (args) => P.isString(args[0]),
  (resolvedBranch: string, options: LogFilenameOptions = new LogFilenameOptions({})): string => {
    const sanitized = sanitizeBranchForFilename(resolvedBranch);
    const nameSuffix =
      options.name === undefined ? "" : `-${Str.replace(/[^a-z0-9_.-]/gu, "-")(Str.toLowerCase(options.name))}`;

    return options.targetBranch === undefined
      ? `${sanitized}${nameSuffix}.log`
      : `${sanitizeBranchForFilename(options.targetBranch)}-${sanitized}${nameSuffix}.log`;
  }
);

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
export const buildCompletionMessage: {
  (
    completionSignal: string | undefined,
    iterationsRun: number
  ): { readonly message: string; readonly severity: Severity };
  (
    iterationsRun: number
  ): (completionSignal: string | undefined) => {
    readonly message: string;
    readonly severity: Severity;
  };
} = dual(2, (completionSignal: string | undefined, iterationsRun: number) =>
  completionSignal === undefined
    ? {
        message: `Run complete: reached ${iterationsRun} iteration(s) without completion signal.`,
        severity: "Warn",
      }
    : {
        message: `Run complete: agent finished after ${iterationsRun} iteration(s).`,
        severity: "Success",
      }
);

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
      A.appendInPlace(lines, `Context window: ${formatContextWindowSize(iteration.usage)}`);
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

const copyPathToWorktree = Effect.fn("Run.copyPathToWorktree")(function* (
  process: SandboxProcessShape,
  path: Path.Path,
  hostRepoDir: string,
  worktreePath: string,
  relativePath: string
) {
  const normalizedRelativePath = path.normalize(relativePath);

  if (
    path.isAbsolute(relativePath) ||
    normalizedRelativePath === "." ||
    normalizedRelativePath === ".." ||
    Str.startsWith(`..${path.sep}`)(normalizedRelativePath)
  ) {
    return yield* CopyToWorktreeError.new(
      "invalid copy path",
      `copyToWorktree path must stay inside the repository: ${relativePath}`,
      {
        exitCode: null,
        path: relativePath,
        stderr: "",
      }
    );
  }

  const source = path.resolve(hostRepoDir, normalizedRelativePath);
  const destination = path.resolve(worktreePath, normalizedRelativePath);
  const sourceRelative = path.relative(hostRepoDir, source);
  const destinationRelative = path.relative(worktreePath, destination);

  if (
    path.isAbsolute(sourceRelative) ||
    path.isAbsolute(destinationRelative) ||
    sourceRelative === ".." ||
    destinationRelative === ".." ||
    Str.startsWith(`..${path.sep}`)(sourceRelative) ||
    Str.startsWith(`..${path.sep}`)(destinationRelative)
  ) {
    return yield* CopyToWorktreeError.new(
      "copy path escaped repository",
      `copyToWorktree path must stay inside the repository: ${relativePath}`,
      {
        exitCode: null,
        path: relativePath,
        stderr: "",
      }
    );
  }

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
    const errorOutput = redactSensitiveText(result.stderr || result.stdout);

    return yield* CopyToWorktreeError.new(errorOutput, `Failed to copy ${normalizedRelativePath} into worktree`, {
      exitCode: result.exitCode,
      path: normalizedRelativePath,
      stderr: redactSensitiveText(result.stderr),
    });
  }
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
    (relativePath) => copyPathToWorktree(process, path, hostRepoDir, worktreePath, relativePath),
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

const shellEscape = (value: string): string => `'${Str.replaceAll("'", "'\\''")(value)}'`;

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

const collectRunCommits = Effect.fn("Run.collectRunCommits")(function* (
  hostRepoDir: string,
  currentBranch: string,
  worktreeBranch: string,
  timeout: Duration.Duration
) {
  const timeoutMs = Duration.toMillis(timeout);

  return yield* collectCommitShas(hostRepoDir, currentBranch, worktreeBranch).pipe(
    Effect.timeoutOrElse({
      duration: timeout,
      orElse: () =>
        Effect.fail(
          CommitCollectionTimeoutError.new(
            "commit collection timeout",
            `Commit collection timed out after ${timeoutMs}ms`,
            {
              timeoutMs: timeout,
            }
          )
        ),
    })
  );
});

type ResolvedWorktree = Pick<WorktreeInfo, "branch" | "path">;

interface RunInWorktreeOptions<R> {
  readonly baseHead: string;
  readonly branchStrategy: BranchStrategy;
  readonly currentBranch: string;
  readonly env: Record<string, string>;
  readonly hostRepoDir: string;
  readonly maxIterations: number;
  readonly options: RunOptions<R>;
  readonly prompt: string;
  readonly timeouts: Timeouts;
  readonly worktree: ResolvedWorktree;
}

const runInWorktree: <R>(
  options: RunInWorktreeOptions<R>
) => Effect.Effect<
  RunResult,
  SandboxError,
  R | SandboxProcess | FileSystem.FileSystem | Path.Path | Display | AgentStreamEmitter
> = Effect.fn("Run.runInWorktree")(function* <R>(options: RunInWorktreeOptions<R>) {
  const display = yield* Display;
  const runOptions = options.options;

  yield* copyPathsToWorktree(
    options.hostRepoDir,
    options.worktree.path,
    runOptions.copyToWorktree ?? [],
    options.timeouts.copyToWorktreeMs
  );
  yield* runHostHooks(
    runOptions.hooks?.host?.onWorktreeReady ?? [],
    options.worktree.path,
    new RunHostHooksOptions({ defaultTimeout: options.timeouts.hookMs })
  );

  const result = yield* Effect.acquireUseRelease(
    createSandboxHandle(
      runOptions.sandbox,
      options.env,
      options.hostRepoDir,
      options.worktree.path,
      runOptions.mounts ?? []
    ),
    (sandbox) =>
      prepareSandboxLifecycle(
        sandbox,
        new SandboxLifecycleSetupOptions({
          gitSetupTimeoutMs: options.timeouts.gitSetupMs,
          hookTimeoutMs: options.timeouts.hookMs,
          ...(runOptions.hooks === undefined ? {} : { hooks: runOptions.hooks }),
          hostRepoDir: options.hostRepoDir,
          hostWorktreePath: options.worktree.path,
          sandboxRepoDir: sandbox.worktreePath,
        })
      ).pipe(
        Effect.andThen(
          orchestrate({
            branch: options.worktree.branch,
            ...(runOptions.completionSignal === undefined ? {} : { completionSignal: runOptions.completionSignal }),
            iterations: options.maxIterations,
            ...(runOptions.name === undefined ? {} : { name: runOptions.name }),
            prompt: options.prompt,
            promptExpansionTimeoutMs: options.timeouts.promptExpansionMs,
            provider: runOptions.agent,
            sandbox,
            sandboxRepoDir: sandbox.worktreePath,
          })
        )
      ),
    (sandbox) => sandbox.close
  );
  const commits =
    options.branchStrategy._tag === "Head"
      ? result.commits
      : options.branchStrategy._tag === "MergeToHead"
        ? yield* mergeToHead(
            new MergeToHeadOptions({
              baseHead: options.baseHead,
              hostRepoDir: options.hostRepoDir,
              sourceBranch: options.worktree.branch,
              targetBranch: options.currentBranch,
              timeoutMs: options.timeouts.mergeToHeadMs,
              worktreePath: options.worktree.path,
            })
          ).pipe(
            Effect.andThen(
              collectRunCommits(
                options.hostRepoDir,
                options.baseHead,
                options.currentBranch,
                options.timeouts.commitCollectionMs
              )
            )
          )
        : yield* collectRunCommits(
            options.hostRepoDir,
            options.currentBranch,
            options.worktree.branch,
            options.timeouts.commitCollectionMs
          );
  const completion = buildCompletionMessage(result.completionSignal, result.iterations.length);
  const displayRows = buildRunSummaryRows(
    new RunSummaryRowOptions({
      agentName: runOptions.agent.name,
      branch: result.branch,
      maxIterations: options.maxIterations,
      ...(runOptions.name === undefined ? {} : { name: runOptions.name }),
      sandboxName: runOptions.sandbox.name,
    })
  );

  yield* display.summary("Run summary", displayRows);
  yield* display.status(completion.message, completion.severity);

  return new RunResult({
    branch: options.branchStrategy._tag === "MergeToHead" ? options.currentBranch : result.branch,
    commits,
    ...(result.completionSignal === undefined ? {} : { completionSignal: result.completionSignal }),
    iterations: result.iterations,
    ...(runOptions.logging?._tag === "File" ? { logFilePath: runOptions.logging.path } : {}),
    ...(result.preservedWorktreePath === undefined ? {} : { preservedWorktreePath: result.preservedWorktreePath }),
    stdout: result.stdout,
  });
});

/**
 * Run an agent in a sandbox provider.
 *
 * @category combinators
 * @since 0.0.0
 */
export const run: <R>(
  options: RunOptions<R>
) => Effect.Effect<
  RunResult,
  SandboxError,
  R | SandboxProcess | FileSystem.FileSystem | Path.Path | Display | AgentStreamEmitter
> = Effect.fn("Run.runPublic")(function* <R>(options: RunOptions<R>) {
  return yield* runEffect(options).pipe(
    profileSandboxPhase({
      attributes: {
        agent: options.agent.name,
        sandbox: options.sandbox.name,
      },
      phase: "sandbox.run",
    })
  );
});

const runEffect: <R>(
  options: RunOptions<R>
) => Effect.Effect<
  RunResult,
  SandboxError,
  R | SandboxProcess | FileSystem.FileSystem | Path.Path | Display | AgentStreamEmitter
> = Effect.fn("Run.run")(function* <R>(options: RunOptions<R>) {
  const hostRepoDir = yield* resolveCwd(options.cwd);
  const maxIterations = options.maxIterations ?? DEFAULT_MAX_ITERATIONS;
  const branchStrategy = options.branchStrategy ?? defaultBranchStrategy(options.sandbox);
  const currentBranch = yield* getCurrentBranch(hostRepoDir);
  const baseHead = yield* getHostHead(hostRepoDir);
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
        : Str.replace(
            /\.log$/u,
            ""
          )(
            buildLogFilename(
              currentBranch,
              new LogFilenameOptions({
                ...(options.name === undefined ? {} : { name: options.name }),
              })
            )
          );
  const builtInArgs = {
    SOURCE_BRANCH: resolvedBranch,
    TARGET_BRANCH: currentBranch,
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
          BUILT_IN_PROMPT_ARG_KEY_SET
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
  const runOptions = {
    baseHead,
    branchStrategy,
    currentBranch,
    env,
    hostRepoDir,
    maxIterations,
    options,
    prompt,
    timeouts,
  };

  if (branchStrategy._tag === "Head") {
    return yield* runInWorktree({
      ...runOptions,
      worktree: {
        branch: currentBranch,
        path: hostRepoDir,
      },
    });
  }

  return yield* Effect.acquireUseRelease(
    createWorktreeInfo(
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
    ),
    (worktree) =>
      runInWorktree({
        ...runOptions,
        worktree,
      }),
    (worktree) => removeWorktree(worktree.path)
  );
});
