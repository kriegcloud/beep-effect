---
title: Worktree.ts
nav_order: 29
parent: "@beep/sandbox"
---

## Worktree.ts overview

Git worktree helpers for sandbox runs.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [createWorktreeInfo](#createworktreeinfo)
  - [generateTempBranchName](#generatetempbranchname)
- [getters](#getters)
  - [collectCommitShas](#collectcommitshas)
  - [getCurrentBranch](#getcurrentbranch)
- [models](#models)
  - [CreateWorktreeInfoOptions (class)](#createworktreeinfooptions-class)
  - [WorktreeInfo (class)](#worktreeinfo-class)
- [predicates](#predicates)
  - [hasUncommittedChanges](#hasuncommittedchanges)
- [resource-management](#resource-management)
  - [pruneStaleWorktrees](#prunestaleworktrees)
  - [removeWorktree](#removeworktree)
- [utilities](#utilities)
  - [sanitizeName](#sanitizename)
---

# constructors

## createWorktreeInfo

Create a managed git worktree under `.sandcastle/worktrees`.

**Example**

```ts
import { createWorktreeInfo } from "@beep/sandbox/Worktree"

console.log(createWorktreeInfo)
```

**Signature**

```ts
declare const createWorktreeInfo: (options: CreateWorktreeInfoOptions) => Effect.Effect<WorktreeInfo, WorktreeError | WorktreeTimeoutError, Path.Path | SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Worktree.ts#L193)

Since v0.0.0

## generateTempBranchName

Generate a temporary sandbox branch name.

**Example**

```ts
import { generateTempBranchName } from "@beep/sandbox/Worktree"

console.log(generateTempBranchName)
```

**Signature**

```ts
declare const generateTempBranchName: (name?: string, dateTime?: DateTime.DateTime) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Worktree.ts#L106)

Since v0.0.0

# getters

## collectCommitShas

Collect commit SHAs that are reachable from `fromRef..toRef`.

**Example**

```ts
import { collectCommitShas } from "@beep/sandbox/Worktree"

console.log(collectCommitShas)
```

**Signature**

```ts
declare const collectCommitShas: (repoDir: string, fromRef: string, toRef: string) => Effect.Effect<Array<{ sha: string; }>, WorktreeError, SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Worktree.ts#L313)

Since v0.0.0

## getCurrentBranch

Return the current branch for a repository.

**Example**

```ts
import { getCurrentBranch } from "@beep/sandbox/Worktree"

console.log(getCurrentBranch)
```

**Signature**

```ts
declare const getCurrentBranch: (repoDir: string) => Effect.Effect<string, WorktreeError, SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Worktree.ts#L155)

Since v0.0.0

# models

## CreateWorktreeInfoOptions (class)

Options for creating a managed git worktree.

**Example**

```ts
import { CreateWorktreeInfoOptions } from "@beep/sandbox/Worktree"

console.log(CreateWorktreeInfoOptions)
```

**Signature**

```ts
declare class CreateWorktreeInfoOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Worktree.ts#L66)

Since v0.0.0

## WorktreeInfo (class)

Information about a created git worktree.

**Example**

```ts
import { WorktreeInfo } from "@beep/sandbox/Worktree"

console.log(WorktreeInfo)
```

**Signature**

```ts
declare class WorktreeInfo
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Worktree.ts#L43)

Since v0.0.0

# predicates

## hasUncommittedChanges

Check whether a worktree has uncommitted changes.

**Example**

```ts
import { hasUncommittedChanges } from "@beep/sandbox/Worktree"

console.log(hasUncommittedChanges)
```

**Signature**

```ts
declare const hasUncommittedChanges: (worktreePath: string) => Effect.Effect<boolean, WorktreeError, SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Worktree.ts#L174)

Since v0.0.0

# resource-management

## pruneStaleWorktrees

Prune stale git worktree metadata.

**Example**

```ts
import { pruneStaleWorktrees } from "@beep/sandbox/Worktree"

console.log(pruneStaleWorktrees)
```

**Signature**

```ts
declare const pruneStaleWorktrees: (repoDir: string) => Effect.Effect<void, WorktreeError | WorktreeTimeoutError, SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Worktree.ts#L280)

Since v0.0.0

## removeWorktree

Remove a managed git worktree.

**Example**

```ts
import { removeWorktree } from "@beep/sandbox/Worktree"

console.log(removeWorktree)
```

**Signature**

```ts
declare const removeWorktree: (worktreePath: string) => Effect.Effect<void, WorktreeError, Path.Path | SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Worktree.ts#L260)

Since v0.0.0

# utilities

## sanitizeName

Sanitize text for branch and directory names.

**Example**

```ts
import { sanitizeName } from "@beep/sandbox/Worktree"

console.log(sanitizeName)
```

**Signature**

```ts
declare const sanitizeName: (name: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Worktree.ts#L91)

Since v0.0.0