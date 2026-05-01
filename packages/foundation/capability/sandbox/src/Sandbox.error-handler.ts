import {Match} from "effect";
import type {SandboxError} from "./Sandbox.errors.ts";

/**
 * Formats a tagged SandboxError into a user-friendly message with
 * context-specific hints about what went wrong and how to recover.
 */
export const formatErrorMessage = Match.type<SandboxError>().pipe(Match.tag(
  "AgentIdleTimeoutError",
  "WorktreeTimeoutError",
  "ContainerStartTimeoutError",
  "CopyToWorktreeTimeoutError",
  "CopyToWorktreeError",
  "SyncInTimeoutError",
  "HookTimeoutError",
  "GitSetupTimeoutError",
  "PromptExpansionTimeoutError",
  "CommitCollectionTimeoutError",
  "MergeToHostTimeoutError",
  "SessionCaptureError",
  "CwdError",
  (error) => error.message,
), Match.tagsExhaustive({
  ExecError: (error) => `Command failed in sandbox (${error.command}): ${error.message}`,
  ExecHostError: (error) => `Command failed on host (${error.command}): ${error.message}`,
  CopyError: (error) => `File copy failed: ${error.message}`,
  DockerError: (error) => `Docker operation failed: ${error.message}. Is Docker running?`,
  PodmanError: (error) => `Podman operation failed: ${error.message}. Is Podman running?`,
  SyncError: (error) => `Git sync failed: ${error.message}`,
  WorktreeError: (error) => `Git worktree operation failed: ${error.message}`,
  PromptError: (error) => `Failed to resolve prompt: ${error.message}`,
  AgentError: (error) => `Agent invocation failed: ${error.message}`,
  ConfigDirError: (error) => `${error.message}`,
  InitError: (error) => `${error.message}`,
}));
