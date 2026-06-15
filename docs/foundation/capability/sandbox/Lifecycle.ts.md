---
title: Lifecycle.ts
nav_order: 11
parent: "@beep/sandbox"
---

## Lifecycle.ts overview

Sandbox lifecycle setup and merge helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [mergeToHead](#mergetohead)
  - [prepareSandboxLifecycle](#preparesandboxlifecycle)
  - [runHostHooks](#runhosthooks)
- [getters](#getters)
  - [getHostHead](#gethosthead)
- [models](#models)
  - [HostLifecycleHookCommand (class)](#hostlifecyclehookcommand-class)
  - [HostLifecycleHooks (class)](#hostlifecyclehooks-class)
  - [MergeToHeadOptions (class)](#mergetoheadoptions-class)
  - [RunHostHooksOptions (class)](#runhosthooksoptions-class)
  - [SandboxHooks (class)](#sandboxhooks-class)
  - [SandboxLifecycleHookCommand (class)](#sandboxlifecyclehookcommand-class)
  - [SandboxLifecycleHooks (class)](#sandboxlifecyclehooks-class)
  - [SandboxLifecycleSetupOptions (class)](#sandboxlifecyclesetupoptions-class)
---

# combinators

## mergeToHead

Merge a temporary worktree branch back to the host head branch.

**Example**

```ts
import { mergeToHead } from "@beep/sandbox/Lifecycle"

console.log(mergeToHead)
```

**Signature**

```ts
declare const mergeToHead: (options: MergeToHeadOptions) => Effect.Effect<boolean, InitError | DockerError | PodmanError | ConfigDirError | ExecError | ExecHostError | CopyError | SyncError | WorktreeError | PromptError | AgentError | AgentIdleTimeoutError | WorktreeTimeoutError | ContainerStartTimeoutError | CopyToWorktreeTimeoutError | CopyToWorktreeError | SyncInTimeoutError | SyncOutTimeoutError | HookTimeoutError | GitSetupTimeoutError | PromptExpansionTimeoutError | CommitCollectionTimeoutError | MergeToHostTimeoutError | SessionCaptureError | CwdError, Display | SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Lifecycle.ts#L621)

Since v0.0.0

## prepareSandboxLifecycle

Run sandbox setup commands and ready hooks before agent work.

**Example**

```ts
import { prepareSandboxLifecycle } from "@beep/sandbox/Lifecycle"

console.log(prepareSandboxLifecycle)
```

**Signature**

```ts
declare const prepareSandboxLifecycle: { <R>(sandbox: SandboxHandle<R>, options: SandboxLifecycleSetupOptions): Effect.Effect<void, SandboxError, R | SandboxProcess | Display>; <R>(options: SandboxLifecycleSetupOptions): (sandbox: SandboxHandle<R>) => Effect.Effect<void, SandboxError, R | SandboxProcess | Display>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Lifecycle.ts#L510)

Since v0.0.0

## runHostHooks

Run host-side lifecycle hook commands sequentially.

**Example**

```ts
import { runHostHooks } from "@beep/sandbox/Lifecycle"

console.log(runHostHooks)
```

**Signature**

```ts
declare const runHostHooks: { (hooks: ReadonlyArray<HostLifecycleHookCommand>, cwd: string): Effect.Effect<void, SandboxError, SandboxProcess>; (hooks: ReadonlyArray<HostLifecycleHookCommand>, cwd: string, options: RunHostHooksOptions): Effect.Effect<void, SandboxError, SandboxProcess>; (cwd: string, options?: RunHostHooksOptions): (hooks: ReadonlyArray<HostLifecycleHookCommand>) => Effect.Effect<void, SandboxError, SandboxProcess>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Lifecycle.ts#L361)

Since v0.0.0

# getters

## getHostHead

Return the current HEAD SHA for a host repository path.

**Example**

```ts
import { getHostHead } from "@beep/sandbox/Lifecycle"

console.log(getHostHead)
```

**Signature**

```ts
declare const getHostHead: (repoDir: string) => Effect.Effect<string, ExecHostError, SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Lifecycle.ts#L589)

Since v0.0.0

# models

## HostLifecycleHookCommand (class)

Host lifecycle hook command.

**Example**

```ts
import { HostLifecycleHookCommand } from "@beep/sandbox/Lifecycle"

console.log(HostLifecycleHookCommand)
```

**Signature**

```ts
declare class HostLifecycleHookCommand
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Lifecycle.ts#L49)

Since v0.0.0

## HostLifecycleHooks (class)

Host lifecycle hook groups.

**Example**

```ts
import { HostLifecycleHooks } from "@beep/sandbox/Lifecycle"

console.log(HostLifecycleHooks)
```

**Signature**

```ts
declare class HostLifecycleHooks
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Lifecycle.ts#L96)

Since v0.0.0

## MergeToHeadOptions (class)

Options for merge-to-head lifecycle.

**Example**

```ts
import { MergeToHeadOptions } from "@beep/sandbox/Lifecycle"

console.log(MergeToHeadOptions)
```

**Signature**

```ts
declare class MergeToHeadOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Lifecycle.ts#L193)

Since v0.0.0

## RunHostHooksOptions (class)

Options for running host lifecycle hooks.

**Example**

```ts
import { RunHostHooksOptions } from "@beep/sandbox/Lifecycle"

console.log(RunHostHooksOptions)
```

**Signature**

```ts
declare class RunHostHooksOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Lifecycle.ts#L220)

Since v0.0.0

## SandboxHooks (class)

Lifecycle hooks for a sandbox run.

**Example**

```ts
import { SandboxHooks } from "@beep/sandbox/Lifecycle"

console.log(SandboxHooks)
```

**Signature**

```ts
declare class SandboxHooks
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Lifecycle.ts#L141)

Since v0.0.0

## SandboxLifecycleHookCommand (class)

Sandbox lifecycle hook command.

**Example**

```ts
import { SandboxLifecycleHookCommand } from "@beep/sandbox/Lifecycle"

console.log(SandboxLifecycleHookCommand)
```

**Signature**

```ts
declare class SandboxLifecycleHookCommand
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Lifecycle.ts#L72)

Since v0.0.0

## SandboxLifecycleHooks (class)

Sandbox lifecycle hook groups.

**Example**

```ts
import { SandboxLifecycleHooks } from "@beep/sandbox/Lifecycle"

console.log(SandboxLifecycleHooks)
```

**Signature**

```ts
declare class SandboxLifecycleHooks
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Lifecycle.ts#L119)

Since v0.0.0

## SandboxLifecycleSetupOptions (class)

Options for sandbox lifecycle setup.

**Example**

```ts
import { SandboxLifecycleSetupOptions } from "@beep/sandbox/Lifecycle"

console.log(SandboxLifecycleSetupOptions)
```

**Signature**

```ts
declare class SandboxLifecycleSetupOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Lifecycle.ts#L164)

Since v0.0.0