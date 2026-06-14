---
title: Sandbox.errors.ts
nav_order: 18
parent: "@beep/sandbox"
---

## Sandbox.errors.ts overview

Errors related to the sandbox capability.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [AgentError (class)](#agenterror-class)
  - [AgentIdleTimeoutError (class)](#agentidletimeouterror-class)
  - [CommitCollectionTimeoutError (class)](#commitcollectiontimeouterror-class)
  - [ConfigDirError (class)](#configdirerror-class)
  - [ContainerStartTimeoutError (class)](#containerstarttimeouterror-class)
  - [CopyError (class)](#copyerror-class)
  - [CopyToWorktreeError (class)](#copytoworktreeerror-class)
  - [CopyToWorktreeTimeoutError (class)](#copytoworktreetimeouterror-class)
  - [CwdError (class)](#cwderror-class)
  - [DockerError (class)](#dockererror-class)
  - [ExecError (class)](#execerror-class)
  - [ExecHostError (class)](#exechosterror-class)
  - [GitSetupTimeoutError (class)](#gitsetuptimeouterror-class)
  - [HookTimeoutError (class)](#hooktimeouterror-class)
  - [InitError (class)](#initerror-class)
  - [MergeToHostTimeoutError (class)](#mergetohosttimeouterror-class)
  - [PodmanError (class)](#podmanerror-class)
  - [PromptError (class)](#prompterror-class)
  - [PromptExpansionTimeoutError (class)](#promptexpansiontimeouterror-class)
  - [SandboxError](#sandboxerror)
  - [SandboxError (type alias)](#sandboxerror-type-alias)
  - [SandboxError (namespace)](#sandboxerror-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
  - [SessionCaptureError (class)](#sessioncaptureerror-class)
  - [SyncError (class)](#syncerror-class)
  - [SyncInTimeoutError (class)](#syncintimeouterror-class)
  - [SyncOutTimeoutError (class)](#syncouttimeouterror-class)
  - [WorktreeError (class)](#worktreeerror-class)
  - [WorktreeTimeoutError (class)](#worktreetimeouterror-class)
---

# errors

## AgentError (class)

AgentError - Agent invocation failed.

**Example**

```ts
import { AgentError } from "@beep/sandbox/Sandbox.errors"

console.log(AgentError)
```

**Signature**

```ts
declare class AgentError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L200)

Since v0.0.0

## AgentIdleTimeoutError (class)

AgentIdleTimeoutError - Run exceeded the configured agent idle timeout.

**Example**

```ts
import { AgentIdleTimeoutError } from "@beep/sandbox/Sandbox.errors"

console.log(AgentIdleTimeoutError)
```

**Signature**

```ts
declare class AgentIdleTimeoutError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L265)

Since v0.0.0

## CommitCollectionTimeoutError (class)

CommitCollectionTimeoutError - Commit collection timed out.

**Example**

```ts
import { CommitCollectionTimeoutError } from "@beep/sandbox/Sandbox.errors"

console.log(CommitCollectionTimeoutError)
```

**Signature**

```ts
declare class CommitCollectionTimeoutError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L510)

Since v0.0.0

## ConfigDirError (class)

ConfigDirError - .sandcastle/ config directory missing.

**Example**

```ts
import { ConfigDirError } from "@beep/sandbox/Sandbox.errors"

console.log(ConfigDirError)
```

**Signature**

```ts
declare class ConfigDirError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L223)

Since v0.0.0

## ContainerStartTimeoutError (class)

ContainerStartTimeoutError - Sandbox container start timed out.

**Example**

```ts
import { ContainerStartTimeoutError } from "@beep/sandbox/Sandbox.errors"

console.log(ContainerStartTimeoutError)
```

**Signature**

```ts
declare class ContainerStartTimeoutError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L314)

Since v0.0.0

## CopyError (class)

CopyError - File copy between host and sandbox failed

**Example**

```ts
import { CopyError } from "@beep/sandbox/Sandbox.errors"

console.log(CopyError)
```

**Signature**

```ts
declare class CopyError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L74)

Since v0.0.0

## CopyToWorktreeError (class)

CopyToWorktreeError - Fallback cp -R to worktree failed.

**Example**

```ts
import { CopyToWorktreeError } from "@beep/sandbox/Sandbox.errors"

console.log(CopyToWorktreeError)
```

**Signature**

```ts
declare class CopyToWorktreeError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L365)

Since v0.0.0

## CopyToWorktreeTimeoutError (class)

CopyToWorktreeTimeoutError - Copying files to worktree timed out.

**Example**

```ts
import { CopyToWorktreeTimeoutError } from "@beep/sandbox/Sandbox.errors"

console.log(CopyToWorktreeTimeoutError)
```

**Signature**

```ts
declare class CopyToWorktreeTimeoutError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L339)

Since v0.0.0

## CwdError (class)

CwdError - The provided `cwd` path does not exist or is not a directory

**Example**

```ts
import { CwdError } from "@beep/sandbox/Sandbox.errors"

console.log(CwdError)
```

**Signature**

```ts
declare class CwdError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L583)

Since v0.0.0

## DockerError (class)

DockerError - Docker infrastructure operation failed

**Example**

```ts
import { DockerError } from "@beep/sandbox/Sandbox.errors"

console.log(DockerError)
```

**Signature**

```ts
declare class DockerError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L95)

Since v0.0.0

## ExecError (class)

ExecError - Command execution failed in the sandbox.

**Example**

```ts
import { ExecError } from "@beep/sandbox/Sandbox.errors"

console.log(ExecError)
```

**Signature**

```ts
declare class ExecError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L28)

Since v0.0.0

## ExecHostError (class)

ExecHostError - Command execution failed on the host.

**Example**

```ts
import { ExecHostError } from "@beep/sandbox/Sandbox.errors"

console.log(ExecHostError)
```

**Signature**

```ts
declare class ExecHostError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L51)

Since v0.0.0

## GitSetupTimeoutError (class)

GitSetupTimeoutError - Git config setup command timed out.

**Example**

```ts
import { GitSetupTimeoutError } from "@beep/sandbox/Sandbox.errors"

console.log(GitSetupTimeoutError)
```

**Signature**

```ts
declare class GitSetupTimeoutError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L460)

Since v0.0.0

## HookTimeoutError (class)

HookTimeoutError - onSandboxReady hook command timed out.

**Example**

```ts
import { HookTimeoutError } from "@beep/sandbox/Sandbox.errors"

console.log(HookTimeoutError)
```

**Signature**

```ts
declare class HookTimeoutError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L436)

Since v0.0.0

## InitError (class)

InitError - Initialization or setup operation failed.

**Example**

```ts
import { InitError } from "@beep/sandbox/Sandbox.errors"

console.log(InitError)
```

**Signature**

```ts
declare class InitError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L244)

Since v0.0.0

## MergeToHostTimeoutError (class)

MergeToHostTimeoutError - Merge-to-host branch timed out.

**Example**

```ts
import { MergeToHostTimeoutError } from "@beep/sandbox/Sandbox.errors"

console.log(MergeToHostTimeoutError)
```

**Signature**

```ts
declare class MergeToHostTimeoutError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L535)

Since v0.0.0

## PodmanError (class)

PodmanError - Podman infrastructure operation failed

**Example**

```ts
import { PodmanError } from "@beep/sandbox/Sandbox.errors"

console.log(PodmanError)
```

**Signature**

```ts
declare class PodmanError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L116)

Since v0.0.0

## PromptError (class)

PromptError - Prompt resolution or preprocessing failed

**Example**

```ts
import { PromptError } from "@beep/sandbox/Sandbox.errors"

console.log(PromptError)
```

**Signature**

```ts
declare class PromptError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L179)

Since v0.0.0

## PromptExpansionTimeoutError (class)

PromptExpansionTimeoutError - Prompt shell expression expansion timed out.

**Example**

```ts
import { PromptExpansionTimeoutError } from "@beep/sandbox/Sandbox.errors"

console.log(PromptExpansionTimeoutError)
```

**Signature**

```ts
declare class PromptExpansionTimeoutError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L484)

Since v0.0.0

## SandboxError

Union of all sandbox capability errors.

**Example**

```ts
import { SandboxError } from "@beep/sandbox/Sandbox.errors"

console.log(SandboxError)
```

**Signature**

```ts
declare const SandboxError: S.Union<readonly [typeof ExecError, typeof ExecHostError, typeof CopyError, typeof DockerError, typeof PodmanError, typeof SyncError, typeof WorktreeError, typeof PromptError, typeof AgentError, typeof ConfigDirError, typeof InitError, typeof AgentIdleTimeoutError, typeof WorktreeTimeoutError, typeof ContainerStartTimeoutError, typeof CopyToWorktreeTimeoutError, typeof CopyToWorktreeError, typeof SyncInTimeoutError, typeof SyncOutTimeoutError, typeof HookTimeoutError, typeof GitSetupTimeoutError, typeof PromptExpansionTimeoutError, typeof CommitCollectionTimeoutError, typeof MergeToHostTimeoutError, typeof SessionCaptureError, typeof CwdError]> & SchemaStatics<S.Union<readonly [typeof ExecError, typeof ExecHostError, typeof CopyError, typeof DockerError, typeof PodmanError, typeof SyncError, typeof WorktreeError, typeof PromptError, typeof AgentError, typeof ConfigDirError, typeof InitError, typeof AgentIdleTimeoutError, typeof WorktreeTimeoutError, typeof ContainerStartTimeoutError, typeof CopyToWorktreeTimeoutError, typeof CopyToWorktreeError, typeof SyncInTimeoutError, typeof SyncOutTimeoutError, typeof HookTimeoutError, typeof GitSetupTimeoutError, typeof PromptExpansionTimeoutError, typeof CommitCollectionTimeoutError, typeof MergeToHostTimeoutError, typeof SessionCaptureError, typeof CwdError]>> & { withTimeout: { <E, A, E2, R>(effect: Effect.Effect<A, E2, R>, timeoutMs: number, onTimeout: () => E): Effect.Effect<A, E | E2, R>; <E>(timeoutMs: number, onTimeout: () => E): <A, E2, R>(effect: Effect.Effect<A, E2, R>) => Effect.Effect<A, E | E2, R>; }; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L606)

Since v0.0.0

## SandboxError (type alias)

Runtime type for `SandboxError`.

**Signature**

```ts
type SandboxError = typeof SandboxError.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L672)

Since v0.0.0

## SandboxError (namespace)

Encoded sandbox error helpers.

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L680)

Since v0.0.0

### Encoded (type alias)

Encoded representation of `SandboxError`.

**Signature**

```ts
type Encoded = typeof SandboxError.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L687)

Since v0.0.0

## SessionCaptureError (class)

SessionCaptureError - Session capture (read, rewrite, or write) failed

**Example**

```ts
import { SessionCaptureError } from "@beep/sandbox/Sandbox.errors"

console.log(SessionCaptureError)
```

**Signature**

```ts
declare class SessionCaptureError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L560)

Since v0.0.0

## SyncError (class)

SyncError - Git sync-in or sync-out operation failed

**Example**

```ts
import { SyncError } from "@beep/sandbox/Sandbox.errors"

console.log(SyncError)
```

**Signature**

```ts
declare class SyncError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L137)

Since v0.0.0

## SyncInTimeoutError (class)

SyncInTimeoutError - Git sync-in for isolated providers timed out.

**Example**

```ts
import { SyncInTimeoutError } from "@beep/sandbox/Sandbox.errors"

console.log(SyncInTimeoutError)
```

**Signature**

```ts
declare class SyncInTimeoutError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L390)

Since v0.0.0

## SyncOutTimeoutError (class)

SyncOutTimeoutError - Git sync-out for isolated providers timed out.

**Example**

```ts
import { SyncOutTimeoutError } from "@beep/sandbox/Sandbox.errors"

console.log(SyncOutTimeoutError)
```

**Signature**

```ts
declare class SyncOutTimeoutError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L413)

Since v0.0.0

## WorktreeError (class)

WorktreeError - Git worktree operation failed

**Example**

```ts
import { WorktreeError } from "@beep/sandbox/Sandbox.errors"

console.log(WorktreeError)
```

**Signature**

```ts
declare class WorktreeError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L158)

Since v0.0.0

## WorktreeTimeoutError (class)

WorktreeTimeoutError - Git worktree create or prune timed out.

**Example**

```ts
import { WorktreeTimeoutError } from "@beep/sandbox/Sandbox.errors"

console.log(WorktreeTimeoutError)
```

**Signature**

```ts
declare class WorktreeTimeoutError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.errors.ts#L289)

Since v0.0.0