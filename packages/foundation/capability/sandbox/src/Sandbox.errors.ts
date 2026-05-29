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
 * @example
 * ```ts
 * import { ExecError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(ExecError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { ExecHostError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(ExecHostError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { CopyError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(CopyError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { DockerError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(DockerError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { PodmanError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(PodmanError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { SyncError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(SyncError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { WorktreeError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(WorktreeError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { PromptError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(PromptError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { AgentError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(AgentError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { ConfigDirError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(ConfigDirError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { InitError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(InitError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { AgentIdleTimeoutError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(AgentIdleTimeoutError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { WorktreeTimeoutError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(WorktreeTimeoutError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { ContainerStartTimeoutError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(ContainerStartTimeoutError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { CopyToWorktreeTimeoutError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(CopyToWorktreeTimeoutError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { CopyToWorktreeError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(CopyToWorktreeError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { SyncInTimeoutError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(SyncInTimeoutError)
 * ```
 *
 * @category errors
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
 * SyncOutTimeoutError - Git sync-out for isolated providers timed out.
 *
 * @example
 * ```ts
 * import { SyncOutTimeoutError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(SyncOutTimeoutError)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class SyncOutTimeoutError extends CauseTaggedError<SyncOutTimeoutError>($I`SyncOutTimeoutError`)(
  "SyncOutTimeoutError",
  {
    timeoutMs: S.DurationFromMillis,
  },
  $I.annote("SyncOutTimeoutError", {
    description: "Git sync-out for isolated providers timed out.",
  })
) {}

/**
 * HookTimeoutError - onSandboxReady hook command timed out.
 *
 * @example
 * ```ts
 * import { HookTimeoutError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(HookTimeoutError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { GitSetupTimeoutError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(GitSetupTimeoutError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { PromptExpansionTimeoutError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(PromptExpansionTimeoutError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { CommitCollectionTimeoutError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(CommitCollectionTimeoutError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { MergeToHostTimeoutError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(MergeToHostTimeoutError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { SessionCaptureError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(SessionCaptureError)
 * ```
 *
 * @category errors
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
 * @example
 * ```ts
 * import { CwdError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(CwdError)
 * ```
 *
 * @category errors
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

/**
 * Union of all sandbox capability errors.
 *
 * @example
 * ```ts
 * import { SandboxError } from "@beep/sandbox/Sandbox.errors"
 *
 * console.log(SandboxError)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
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
  SyncOutTimeoutError,
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
  })
);

/**
 * Runtime type for {@link SandboxError}.
 *
 * @category errors
 * @since 0.0.0
 */
export type SandboxError = typeof SandboxError.Type;

/**
 * Encoded sandbox error helpers.
 *
 * @category errors
 * @since 0.0.0
 */
export declare namespace SandboxError {
  /**
   * Encoded representation of {@link SandboxError}.
   *
   * @category errors
   * @since 0.0.0
   */
  export type Encoded = typeof SandboxError.Encoded;
}
