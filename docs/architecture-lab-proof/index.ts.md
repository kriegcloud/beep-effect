---
title: index.ts
nav_order: 1
parent: "@beep/architecture-lab-proof"
---

## index.ts overview

Package entry point for `@beep/architecture-lab-proof`.

Since v0.0.0

---
## Exports Grouped by Category
- [workflows](#workflows)
  - [ArchitectureLabProofResult (class)](#architecturelabproofresult-class)
  - [runArchitectureLabProof](#runarchitecturelabproof)
---

# workflows

## ArchitectureLabProofResult (class)

App-level WorkItem proof result.

**Example**

```ts
import { ArchitectureLabProofResult } from "@beep/architecture-lab-proof"

console.log(ArchitectureLabProofResult.ast)
```

**Signature**

```ts
declare class ArchitectureLabProofResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/architecture-lab-proof/src/index.ts#L34)

Since v0.0.0

## runArchitectureLabProof

Execute the architecture lab proof harness against the composed server layer.

**Example**

```ts
import { runArchitectureLabProof } from "@beep/architecture-lab-proof"

console.log(runArchitectureLabProof)
```

**Signature**

```ts
declare const runArchitectureLabProof: Effect.Effect<ArchitectureLabProofResult, WorkItemUseCases.WorkItemActionError, WorkItemServer>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/architecture-lab-proof/src/index.ts#L60)

Since v0.0.0