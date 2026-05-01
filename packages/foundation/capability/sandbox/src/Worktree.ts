/**
 * Git worktree helpers for sandbox runs.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { A } from "@beep/utils";
import { Duration, Effect, Path, pipe } from "effect";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { WorktreeError, WorktreeTimeoutError } from "./Sandbox.errors.ts";
import { profileSandboxPhase } from "./Sandbox.observability.ts";
import { ProcessCommand, SandboxProcess } from "./Sandbox.process.ts";

const $I = $SandboxId.create("Worktree");
const WORKTREE_TIMEOUT_MS = 30_000;
const NO_CONFIG_LOCK_FLAGS = ["-c", "branch.autoSetupMerge=false", "-c", "push.autoSetupRemote=false"] as const;

const pad2 = (value: number): string => value.toString().padStart(2, "0");

const formatTimestamp = (date: Date): string =>
  `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}-${pad2(date.getHours())}${pad2(
    date.getMinutes()
  )}${pad2(date.getSeconds())}`;

/**
 * Information about a created git worktree.
 *
 * @category models
 * @since 0.0.0
 */
export class WorktreeInfo extends S.Class<WorktreeInfo>($I`WorktreeInfo`)(
  {
    branch: S.String,
    path: S.String,
  },
  $I.annote("WorktreeInfo", {
    description: "Information about a created git worktree.",
  })
) {}

/**
 * Options for creating a managed git worktree.
 *
 * @category models
 * @since 0.0.0
 */
export class CreateWorktreeInfoOptions extends S.Class<CreateWorktreeInfoOptions>($I`CreateWorktreeInfoOptions`)(
  {
    baseBranch: S.optionalKey(S.String),
    branch: S.optionalKey(S.String),
    name: S.optionalKey(S.String),
    repoDir: S.String,
  },
  $I.annote("CreateWorktreeInfoOptions", {
    description: "Options for creating a managed git worktree.",
  })
) {}

/**
 * Sanitize text for branch and directory names.
 *
 * @category utilities
 * @since 0.0.0
 */
export const sanitizeName = (name: string): string => pipe(Str.toLowerCase(name), Str.replace(/[^a-z0-9]/gu, "-"));

/**
 * Generate a temporary sandbox branch name.
 *
 * @category constructors
 * @since 0.0.0
 */
export const generateTempBranchName = (name?: string, date: Date = new Date()): string => {
  const timestamp = formatTimestamp(date);

  return name === undefined ? `sandcastle/${timestamp}` : `sandcastle/${sanitizeName(name)}/${timestamp}`;
};

const runGitRaw = Effect.fn("Worktree.runGit")(function* (args: ReadonlyArray<string>, cwd: string) {
  const process = yield* SandboxProcess;
  const result = yield* process
    .run(
      new ProcessCommand({
        args: [...args],
        command: "git",
        cwd,
      })
    )
    .pipe(WorktreeError.mapError("Failed to run git command"));

  if (result.exitCode !== 0) {
    return yield* WorktreeError.new(result.stderr || result.stdout, `Git command failed: git ${args.join(" ")}`);
  }

  return result.stdout;
});

const runGit = (args: ReadonlyArray<string>, cwd: string): Effect.Effect<string, WorktreeError, SandboxProcess> =>
  runGitRaw(args, cwd).pipe(
    profileSandboxPhase({
      attributes: {
        command: "git",
        cwd,
      },
      phase: "sandbox.git",
    })
  );

/**
 * Return the current branch for a repository.
 *
 * @category getters
 * @since 0.0.0
 */
export const getCurrentBranch = Effect.fn("Worktree.getCurrentBranch")(function* (repoDir: string) {
  const output = yield* runGit(["rev-parse", "--abbrev-ref", "HEAD"], repoDir);

  return Str.trim(output);
});

/**
 * Check whether a worktree has uncommitted changes.
 *
 * @category predicates
 * @since 0.0.0
 */
export const hasUncommittedChanges = Effect.fn("Worktree.hasUncommittedChanges")(function* (worktreePath: string) {
  const output = yield* runGit(["status", "--porcelain"], worktreePath);

  return Str.trim(output).length > 0;
});

/**
 * Create a managed git worktree under `.sandcastle/worktrees`.
 *
 * @category constructors
 * @since 0.0.0
 */
export const createWorktreeInfo = Effect.fn("Worktree.createWorktreeInfo")(function* (
  options: CreateWorktreeInfoOptions
) {
  const path = yield* Path.Path;
  const worktreesDir = path.join(options.repoDir, ".sandcastle", "worktrees");
  const timestamp = formatTimestamp(new Date());
  const branch =
    options.branch ??
    (options.name === undefined ? `sandcastle/${timestamp}` : `sandcastle/${sanitizeName(options.name)}/${timestamp}`);
  const worktreeName =
    options.branch === undefined
      ? options.name === undefined
        ? `sandcastle-${timestamp}`
        : `sandcastle-${sanitizeName(options.name)}-${timestamp}`
      : Str.replaceAll("/", "-")(options.branch);
  const worktreePath = path.join(worktreesDir, worktreeName);
  const addArgs =
    options.branch === undefined
      ? [...NO_CONFIG_LOCK_FLAGS, "worktree", "add", "-b", branch, worktreePath, "HEAD"]
      : [...NO_CONFIG_LOCK_FLAGS, "worktree", "add", worktreePath, branch];

  const output = yield* runGit(addArgs, options.repoDir).pipe(
    Effect.catch((error) => {
      if (options.branch !== undefined && Str.includes("invalid reference")(error.message)) {
        return runGit(
          [...NO_CONFIG_LOCK_FLAGS, "worktree", "add", "-b", branch, worktreePath, options.baseBranch ?? "HEAD"],
          options.repoDir
        );
      }

      return Effect.fail(error);
    }),
    Effect.timeoutOrElse({
      duration: Duration.millis(WORKTREE_TIMEOUT_MS),
      orElse: () =>
        Effect.fail(
          WorktreeTimeoutError.new(
            "worktree create timeout",
            `Worktree creation timed out after ${WORKTREE_TIMEOUT_MS}ms`,
            {
              operation: "create",
              path: options.repoDir,
              timeoutMs: Duration.millis(WORKTREE_TIMEOUT_MS),
            }
          )
        ),
    })
  );

  void output;

  return new WorktreeInfo({ branch, path: worktreePath });
});

/**
 * Remove a managed git worktree.
 *
 * @category resource management
 * @since 0.0.0
 */
export const removeWorktree = Effect.fn("Worktree.removeWorktree")(function* (worktreePath: string) {
  const path = yield* Path.Path;
  const repoDir = path.join(worktreePath, "..", "..", "..");

  yield* runGit(["worktree", "remove", "--force", worktreePath], repoDir);
});

/**
 * Prune stale git worktree metadata.
 *
 * @category resource management
 * @since 0.0.0
 */
export const pruneStaleWorktrees = Effect.fn("Worktree.pruneStaleWorktrees")(function* (repoDir: string) {
  yield* runGit(["worktree", "prune"], repoDir).pipe(
    Effect.timeoutOrElse({
      duration: Duration.millis(WORKTREE_TIMEOUT_MS),
      orElse: () =>
        Effect.fail(
          WorktreeTimeoutError.new(
            "worktree prune timeout",
            `Worktree prune timed out after ${WORKTREE_TIMEOUT_MS}ms`,
            {
              operation: "prune",
              path: repoDir,
              timeoutMs: Duration.millis(WORKTREE_TIMEOUT_MS),
            }
          )
        ),
    })
  );
});

/**
 * Collect commit SHAs that are reachable from `fromRef..toRef`.
 *
 * @category getters
 * @since 0.0.0
 */
export const collectCommitShas = Effect.fn("Worktree.collectCommitShas")(function* (
  repoDir: string,
  fromRef: string,
  toRef: string
) {
  const output = yield* runGit(["log", "--format=%H", `${fromRef}..${toRef}`], repoDir);

  return pipe(
    Str.split("\n")(output),
    A.map(Str.trim),
    A.filter((line) => line.length > 0),
    A.map((sha) => ({ sha }))
  );
});
