---
title: DependencyIndex.ts
nav_order: 2
parent: "@beep/repo-utils"
---

## DependencyIndex.ts overview

Dependency index for the entire monorepo.

Builds a complete mapping of every workspace package (plus the root)
to its classified dependencies (workspace vs NPM).

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [buildRepoDependencyIndex](#buildrepodependencyindex)
---

# utilities

## buildRepoDependencyIndex

Build a complete dependency index for the entire monorepo.

For every workspace package and the root, reads its `package.json`,
classifies each dependency as workspace-internal or external NPM,
and returns a HashMap mapping each package name to its `WorkspaceDeps`.

The root directory is indexed under `"@beep/root"`.

**Example**

```ts
```typescript
import { Effect } from "effect"
import { buildRepoDependencyIndex } from "@beep/repo-utils/DependencyIndex"

const program = buildRepoDependencyIndex(".")
console.log(program)
```
```

**Signature**

```ts
declare const buildRepoDependencyIndex: (rootDir: string) => Effect.Effect<HashMap.HashMap<string, WorkspaceDeps>, NoSuchFileError | DomainError, FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/DependencyIndex.ts#L52)

Since v0.0.0