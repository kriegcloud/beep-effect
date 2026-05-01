/**
 * Error formatting helpers for sandbox failures.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { Match, pipe } from "effect";
import type { SandboxError } from "./Sandbox.errors.ts";
import { redactSensitiveText } from "./Sandbox.observability.ts";

/**
 * Formats a tagged SandboxError into a user-friendly message with
 * context-specific hints about what went wrong and how to recover.
 *
 * @category error handling
 * @since 0.0.0
 */
const formatErrorMessageUnsafe = Match.type<SandboxError>().pipe(
  Match.tag(
    "AgentIdleTimeoutError",
    "WorktreeTimeoutError",
    "ContainerStartTimeoutError",
    "CopyToWorktreeTimeoutError",
    "CopyToWorktreeError",
    "SyncInTimeoutError",
    "SyncOutTimeoutError",
    "HookTimeoutError",
    "GitSetupTimeoutError",
    "PromptExpansionTimeoutError",
    "CommitCollectionTimeoutError",
    "MergeToHostTimeoutError",
    "SessionCaptureError",
    "CwdError",
    (error) => error.message
  ),
  Match.tagsExhaustive({
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
  })
);

/**
 * Format a sandbox error with secret-shaped text redacted.
 *
 * @category error handling
 * @since 0.0.0
 */
export const formatErrorMessage = (error: SandboxError): string =>
  pipe(error, formatErrorMessageUnsafe, redactSensitiveText);
