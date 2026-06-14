---
title: createWorktree.ts
nav_order: 4
parent: "@beep/sandbox"
---

## createWorktree.ts overview

Programmatic managed-worktree helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [createWorktree](#createworktree)
  - [createWorktreeScoped](#createworktreescoped)
- [models](#models)
  - [CreateWorktreeOptions (class)](#createworktreeoptions-class)
  - [CreateWorktreeResult (class)](#createworktreeresult-class)
- [services](#services)
  - [Worktree (interface)](#worktree-interface)
---

# constructors

## createWorktree

Create a managed worktree wrapper.

**Example**

```ts
import { createWorktree } from "@beep/sandbox/createWorktree"

console.log(createWorktree)
```

**Signature**

```ts
declare const createWorktree: <R = never>(options: CreateWorktreeOptions) => Effect.Effect<Worktree<R>, InitError | DockerError | PodmanError | ConfigDirError | ExecError | ExecHostError | CopyError | SyncError | WorktreeError | PromptError | AgentError | AgentIdleTimeoutError | WorktreeTimeoutError | ContainerStartTimeoutError | CopyToWorktreeTimeoutError | CopyToWorktreeError | SyncInTimeoutError | SyncOutTimeoutError | HookTimeoutError | GitSetupTimeoutError | PromptExpansionTimeoutError | CommitCollectionTimeoutError | MergeToHostTimeoutError | SessionCaptureError | CwdError, Path.Path | SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/createWorktree.ts#L118)

Since v0.0.0

## createWorktreeScoped

Create a managed worktree whose lifetime is bound to the current Effect scope.

**Example**

```ts
import { createWorktreeScoped } from "@beep/sandbox/createWorktree"

console.log(createWorktreeScoped)
```

**Signature**

```ts
declare const createWorktreeScoped: <R = never>(options: CreateWorktreeOptions) => Effect.Effect<Worktree<R>, InitError | DockerError | PodmanError | ConfigDirError | ExecError | ExecHostError | CopyError | SyncError | WorktreeError | PromptError | AgentError | AgentIdleTimeoutError | WorktreeTimeoutError | ContainerStartTimeoutError | CopyToWorktreeTimeoutError | CopyToWorktreeError | SyncInTimeoutError | SyncOutTimeoutError | HookTimeoutError | GitSetupTimeoutError | PromptExpansionTimeoutError | CommitCollectionTimeoutError | MergeToHostTimeoutError | SessionCaptureError | CwdError, Path.Path | SandboxProcess | Scope.Scope>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/createWorktree.ts#L166)

Since v0.0.0

# models

## CreateWorktreeOptions (class)

Options for creating a managed worktree.

**Example**

```ts
import { CreateWorktreeOptions } from "@beep/sandbox/createWorktree"

console.log(CreateWorktreeOptions)
```

**Signature**

```ts
declare class CreateWorktreeOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/createWorktree.ts#L40)

Since v0.0.0

## CreateWorktreeResult (class)

Worktree creation summary.

**Example**

```ts
import { CreateWorktreeResult } from "@beep/sandbox/createWorktree"

console.log(CreateWorktreeResult)
```

**Signature**

```ts
declare class CreateWorktreeResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/createWorktree.ts#L95)

Since v0.0.0

# services

## Worktree (interface)

Programmatic worktree wrapper.

**Example**

```ts
import type { Worktree } from "@beep/sandbox/createWorktree"

const value = {} as Worktree
console.log(value)
```

**Signature**

```ts
export interface Worktree<R = never> {
  readonly branch: string;
  readonly close: Effect.Effect<void, SandboxError, Path.Path | SandboxProcess>;
  readonly path: string;
  readonly run: <RunEnv = R>(
    options: Omit<RunOptions<RunEnv>, "agent" | "branchStrategy" | "sandbox"> & {
      readonly agent: AgentProvider;
      readonly sandbox: SandboxProvider<RunEnv>;
    }
  ) => Effect.Effect<
    RunResult,
    SandboxError,
    RunEnv | SandboxProcess | FileSystem.FileSystem | Path.Path | Display | AgentStreamEmitter
  >;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/createWorktree.ts#L66)

Since v0.0.0