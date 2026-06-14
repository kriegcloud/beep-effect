---
title: Root.ts
nav_order: 45
parent: "@beep/repo-utils"
---

## Root.ts overview

Repository root discovery.

Walks upward from a starting directory looking for repository markers
(`.git` directory or `bun.lock` file) to locate the monorepo root.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [findRepoRoot](#findreporoot)
---

# utilities

## findRepoRoot

Find the repository root by walking upward from the given directory
(or the current working directory) until a root marker is found.

Root markers are `.git` (directory) and `bun.lock` (file).

**Example**

```ts
```typescript
import { Effect } from "effect"
import { findRepoRoot } from "@beep/repo-utils/Root"

const program = findRepoRoot()
console.log(program)
```
```

**Signature**

```ts
declare const findRepoRoot: (startFrom?: undefined | string) => Effect.Effect<string, NoSuchFileError, FileSystem.FileSystem>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Root.ts#L42)

Since v0.0.0