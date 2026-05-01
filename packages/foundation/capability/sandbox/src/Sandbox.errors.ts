/**
 * Errors related to the sandbox capability.
 *
 * @since 0.0.0
 * @packageDocumentation
 */
import { $SandboxId } from "@beep/identity";
import { CauseTaggedError, LiteralKit, SchemaUtils } from "@beep/schema";
import { Duration, Effect } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

const $I = $SandboxId.create("Sandbox.errors");

/**
 * ExecError - Command execution failed in the sandbox.
 *
 * @category Errors
 * @since 0.0.0
 */
export class ExecError extends CauseTaggedError<ExecError>($I`ExecError`)(
  "ExecError",
  {
    command: S.String,
  },
  $I.annote("ExecError", {
    description: "Command execution failed in the sandbox.",
  })
) {}

/**
 * ExecHostError - Command execution failed on the host.
 *
 * @category Errors
 * @since 0.0.0
 */
export class ExecHostError extends CauseTaggedError<ExecHostError>($I`ExecHostError`)(
  "ExecHostError",
  {
    command: S.String,
  },
  $I.annote("ExecHostError", {
    description: "Command execution failed on the host.",
  })
) {}

/**
 * CopyError - File copy between host and sandbox failed
 *
 * @category Errors
 * @since 0.0.0
 */
export class CopyError extends CauseTaggedError<CopyError>($I`CopyError`)(
  "CopyError",
  {},
  $I.annote("CopyError", {
    description: "File copy between host and sandbox failed",
  })
) {}

/**
 * DockerError - Docker infrastructure operation failed
 *
 * @category Errors
 * @since 0.0.0
 */
export class DockerError extends CauseTaggedError<DockerError>($I`DockerError`)(
  "DockerError",
  {},
  $I.annote("DockerError", {
    description: "Docker infrastructure operation failed",
  })
) {}

/**
 * PodmanError - Podman infrastructure operation failed
 *
 * @category Errors
 * @since 0.0.0
 */
export class PodmanError extends CauseTaggedError<PodmanError>($I`PodmanError`)(
  "PodmanError",
  {},
  $I.annote("PodmanError", {
    description: "Podman infrastructure operation failed",
  })
) {}

/**
 * SyncError - Git sync-in or sync-out operation failed
 *
 * @category Errors
 * @since 0.0.0
 */
export class SyncError extends CauseTaggedError<SyncError>($I`SyncError`)(
  "SyncError",
  {},
  $I.annote("SyncError", {
    description: "Git sync-in or sync-out operation failed",
  })
) {}

/**
 * WorktreeError - Git worktree operation failed
 *
 * @category Errors
 * @since 0.0.0
 */
export class WorktreeError extends CauseTaggedError<WorktreeError>($I`WorktreeError`)(
  "WorktreeError",
  {},
  $I.annote("WorktreeError", {
    description: "Git worktree operation failed",
  })
) {}

/**
 * PromptError - Prompt resolution or preprocessing failed
 *
 * @category Errors
 * @since 0.0.0
 */
export class PromptError extends CauseTaggedError<PromptError>($I`PromptError`)(
  "PromptError",
  {},
  $I.annote("PromptError", {
    description: "Prompt resolution or preprocessing failed",
  })
) {}

/**
 * AgentError - Agent invocation failed.
 *
 * @category Errors
 * @since 0.0.0
 */
export class AgentError extends CauseTaggedError<AgentError>($I`AgentError`)(
  "AgentError",
  {
    preservedWorktreePath: S.optionalKey(S.String),
  },
  $I.annote("AgentError", {
    description: "Agent invocation failed.",
  })
) {}

/**
 * ConfigDirError - .sandcastle/ config directory missing.
 *
 * @category Errors
 * @since 0.0.0
 */
export class ConfigDirError extends CauseTaggedError<ConfigDirError>($I`ConfigDirError`)(
  "ConfigDirError",
  {},
  $I.annote("ConfigDirError", {
    description: ".sandcastle/ config directory missing.",
  })
) {}

/**
 * InitError - Initialization or setup operation failed.
 *
 * @category Errors
 * @since 0.0.0
 */
export class InitError extends CauseTaggedError<InitError>($I`InitError`)(
  "InitError",
  {},
  $I.annote("InitError", {
    description: "Initialization or setup operation failed.",
  })
) {}

/**
 * AgentIdleTimeoutError - Run exceeded the configured agent idle timeout.
 *
 * @category Errors
 * @since 0.0.0
 */
export class AgentIdleTimeoutError extends CauseTaggedError<AgentIdleTimeoutError>($I`AgentIdleTimeoutError`)(
  "AgentIdleTimeoutError",
  {
    preservedWorktreePath: S.optionalKey(S.String),
    timeoutMs: S.DurationFromMillis,
  },
  $I.annote("AgentIdleTimeoutError", {
    description: "Run exceeded the configured agent idle timeout.",
  })
) {}

/**
 * WorktreeTimeoutError - Git worktree create or prune timed out.
 *
 * @category Errors
 * @since 0.0.0
 */
export class WorktreeTimeoutError extends CauseTaggedError<WorktreeTimeoutError>($I`WorktreeTimeoutError`)(
  "WorktreeTimeoutError",
  {
    operation: LiteralKit(["create", "prune"]),
    path: S.String,
    timeoutMs: S.DurationFromMillis,
  },
  $I.annote("WorktreeTimeoutError", {
    description: "Git worktree create or prune timed out.",
  })
) {}

/**
 * ContainerStartTimeoutError - Sandbox container start timed out.
 *
 * @category Errors
 * @since 0.0.0
 */
export class ContainerStartTimeoutError extends CauseTaggedError<ContainerStartTimeoutError>(
  $I`ContainerStartTimeoutError`
)(
  "ContainerStartTimeoutError",
  {
    timeoutMs: S.DurationFromMillis,
  },
  $I.annote("ContainerStartTimeoutError", {
    description: "Sandbox container start timed out.",
  })
) {}

/**
 * CopyToWorktreeTimeoutError - Copying files to worktree timed out.
 *
 * @category Errors
 * @since 0.0.0
 */
export class CopyToWorktreeTimeoutError extends CauseTaggedError<CopyToWorktreeTimeoutError>(
  $I`CopyToWorktreeTimeoutError`
)(
  "CopyToWorktreeTimeoutError",
  {
    paths: S.Array(S.String),
    timeoutMs: S.DurationFromMillis,
  },
  $I.annote("CopyToWorktreeTimeoutError", {
    description: "Copying files to worktree timed out.",
  })
) {}

/**
 * CopyToWorktreeError - Fallback cp -R to worktree failed.
 *
 * @category Errors
 * @since 0.0.0
 */
export class CopyToWorktreeError extends CauseTaggedError<CopyToWorktreeError>($I`CopyToWorktreeError`)(
  "CopyToWorktreeError",
  {
    exitCode: S.NullOr(S.Number),
    path: S.String,
    stderr: S.String,
  },
  $I.annote("CopyToWorktreeError", {
    description: "Fallback cp -R to worktree failed.",
  })
) {}

/**
 * SyncInTimeoutError - Git sync-in for isolated providers timed out.
 *
 * @category Errors
 * @since 0.0.0
 */
export class SyncInTimeoutError extends CauseTaggedError<SyncInTimeoutError>($I`SyncInTimeoutError`)(
  "SyncInTimeoutError",
  {
    timeoutMs: S.DurationFromMillis,
  },
  $I.annote("SyncInTimeoutError", {
    description: "Git sync-in for isolated providers timed out.",
  })
) {}

/**
 * HookTimeoutError - onSandboxReady hook command timed out.
 *
 * @category Errors
 * @since 0.0.0
 */
export class HookTimeoutError extends CauseTaggedError<HookTimeoutError>($I`HookTimeoutError`)(
  "HookTimeoutError",
  {
    command: S.String,
    timeoutMs: S.DurationFromMillis,
  },
  $I.annote("HookTimeoutError", {
    description: "onSandboxReady hook command timed out.",
  })
) {}

/**
 * GitSetupTimeoutError - Git config setup command timed out.
 *
 * @category Errors
 * @since 0.0.0
 */
export class GitSetupTimeoutError extends CauseTaggedError<GitSetupTimeoutError>($I`GitSetupTimeoutError`)(
  "GitSetupTimeoutError",
  {
    command: S.String,
    timeoutMs: S.DurationFromMillis,
  },
  $I.annote("GitSetupTimeoutError", {
    description: "Git config setup command timed out.",
  })
) {}

/**
 * PromptExpansionTimeoutError - Prompt shell expression expansion timed out.
 *
 * @category Errors
 * @since 0.0.0
 */
export class PromptExpansionTimeoutError extends CauseTaggedError<PromptExpansionTimeoutError>(
  $I`PromptExpansionTimeoutError`
)(
  "PromptExpansionTimeoutError",
  {
    expression: S.String,
    timeoutMs: S.DurationFromMillis,
  },
  $I.annote("PromptExpansionTimeoutError", {
    description: "Prompt shell expression expansion timed out.",
  })
) {}

/**
 * CommitCollectionTimeoutError - Commit collection timed out.
 *
 * @category Errors
 * @since 0.0.0
 */
export class CommitCollectionTimeoutError extends CauseTaggedError<CommitCollectionTimeoutError>(
  $I`CommitCollectionTimeoutError`
)(
  "CommitCollectionTimeoutError",
  {
    timeoutMs: S.DurationFromMillis,
  },
  $I.annote("CommitCollectionTimeoutError", {
    description: "Commit collection timed out.",
  })
) {}

/**
 * MergeToHostTimeoutError - Merge-to-host branch timed out.
 *
 * @category Errors
 * @since 0.0.0
 */
export class MergeToHostTimeoutError extends CauseTaggedError<MergeToHostTimeoutError>($I`MergeToHostTimeoutError`)(
  "MergeToHostTimeoutError",
  {
    sourceBranch: S.String,
    targetBranch: S.String,
    timeoutMs: S.DurationFromMillis,
  },
  $I.annote("MergeToHostTimeoutError", {
    description: "Merge-to-host branch timed out.",
  })
) {}

/**
 * SessionCaptureError - Session capture (read, rewrite, or write) failed
 *
 * @category Errors
 * @since 0.0.0
 */
export class SessionCaptureError extends CauseTaggedError<SessionCaptureError>($I`SessionCaptureError`)(
  "SessionCaptureError",
  {
    sessionId: S.String,
  },
  $I.annote("SessionCaptureError", {
    description: "Session capture (read, rewrite, or write) failed",
  })
) {}

/**
 * CwdError - The provided `cwd` path does not exist or is not a directory
 *
 * @category Errors
 * @since 0.0.0
 */
export class CwdError extends CauseTaggedError<CwdError>($I`CwdError`)(
  "CwdError",
  {
    cwd: S.String,
  },
  $I.annote("CwdError", {
    description: "The provided `cwd` path does not exist or is not a directory",
  })
) {}

export const SandboxError = S.Union([
  ExecError,
  ExecHostError,
  CopyError,
  DockerError,
  PodmanError,
  SyncError,
  WorktreeError,
  PromptError,
  AgentError,
  ConfigDirError,
  InitError,
  AgentIdleTimeoutError,
  WorktreeTimeoutError,
  ContainerStartTimeoutError,
  CopyToWorktreeTimeoutError,
  CopyToWorktreeError,
  SyncInTimeoutError,
  HookTimeoutError,
  GitSetupTimeoutError,
  PromptExpansionTimeoutError,
  CommitCollectionTimeoutError,
  MergeToHostTimeoutError,
  SessionCaptureError,
  CwdError,
]).pipe(
  $I.annoteSchema("SandboxError", {
    description: "Errors related to the sandbox capability.",
  }),
  SchemaUtils.withStatics(() => {
    const withTimeout: {
      <E, A, E2, R>(
        effect: Effect.Effect<A, E2, R>,
        timeoutMs: number,
        onTimeout: () => E
      ): Effect.Effect<A, E | E2, R>;
      <E>(
        timeoutMs: number,
        onTimeout: () => E
      ): <A, E2, R>(effect: Effect.Effect<A, E2, R>) => Effect.Effect<A, E | E2, R>;
    } = dual(
      3,
      <E, A, E2, R>(
        effect: Effect.Effect<A, E2, R>,
        timeoutMs: number,
        onTimeout: () => E
      ): Effect.Effect<A, E | E2, R> =>
        Effect.timeoutOrElse(effect, {
          duration: Duration.millis(timeoutMs),
          orElse: () => Effect.fail(onTimeout()),
        })
    );

    return {
      withTimeout,
    };
  }),
  S.toTaggedUnion("_tag")
);

export type SandboxError = typeof SandboxError.Type;

export declare namespace SandboxError {
  export type Encoded = typeof SandboxError.Encoded;
}
