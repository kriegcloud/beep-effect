---
title: OperationPlanExecution.ts
nav_order: 11
parent: "@beep/repo-cli"
---

## OperationPlanExecution.ts overview

Architecture operation-plan filesystem execution.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [applyCanonicalSliceOperationPlan](#applycanonicalsliceoperationplan)
  - [checkCanonicalSliceOperationPlan](#checkcanonicalsliceoperationplan)
---

# utilities

## applyCanonicalSliceOperationPlan

Apply a decoded operation plan with failsafe conflict behavior.

**Example**

```ts
import {
  applyCanonicalSliceOperationPlan,
  makeCanonicalSliceOperationPlan,
} from "@beep/repo-cli/commands/Architecture/index"

const program = applyCanonicalSliceOperationPlan("/workspace/beep-effect", makeCanonicalSliceOperationPlan())
console.log(program)
```

**Signature**

```ts
declare const applyCanonicalSliceOperationPlan: { (plan: CanonicalSliceOperationPlan): (rootDir: string) => Effect.Effect<OperationPlanApplyResult, DomainError, FileSystem.FileSystem | Path.Path>; (rootDir: string, plan: CanonicalSliceOperationPlan): Effect.Effect<OperationPlanApplyResult, DomainError, FileSystem.FileSystem | Path.Path>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlanExecution.ts#L266)

Since v0.0.0

## checkCanonicalSliceOperationPlan

Validate a decoded operation plan against a repository root.

**Example**

```ts
import {
  checkCanonicalSliceOperationPlan,
  makeCanonicalSliceOperationPlan,
} from "@beep/repo-cli/commands/Architecture/index"

const program = checkCanonicalSliceOperationPlan("/workspace/beep-effect", makeCanonicalSliceOperationPlan())
console.log(program)
```

**Signature**

```ts
declare const checkCanonicalSliceOperationPlan: { (plan: CanonicalSliceOperationPlan): (rootDir: string) => Effect.Effect<OperationPlanCheckResult, DomainError, FileSystem.FileSystem | Path.Path>; (rootDir: string, plan: CanonicalSliceOperationPlan): Effect.Effect<OperationPlanCheckResult, DomainError, FileSystem.FileSystem | Path.Path>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/OperationPlanExecution.ts#L174)

Since v0.0.0