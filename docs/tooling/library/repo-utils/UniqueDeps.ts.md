---
title: UniqueDeps.ts
nav_order: 64
parent: "@beep/repo-utils"
---

## UniqueDeps.ts overview

Unique NPM dependency aggregation across the entire monorepo.

Collects all external (non-workspace) dependencies from every workspace
package and the root, deduplicates them, and returns sorted arrays of
unique dependency names.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [UniqueNpmDeps (class)](#uniquenpmdeps-class)
- [utilities](#utilities)
  - [collectUniqueNpmDependencies](#collectuniquenpmdependencies)
---

# models

## UniqueNpmDeps (class)

Result of collecting unique NPM dependencies across the monorepo.

**Example**

```ts
import { UniqueNpmDeps } from "@beep/repo-utils/UniqueDeps"
const deps = UniqueNpmDeps.make({
  dependencies: ["effect"],
  devDependencies: ["vitest"]
})
console.log(deps.dependencies)
```

**Signature**

```ts
declare class UniqueNpmDeps
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/UniqueDeps.ts#L36)

Since v0.0.0

# utilities

## collectUniqueNpmDependencies

Collect all unique external NPM dependency names from every package
in the monorepo.

Scans all workspace packages plus the root, extracts their NPM
(non-workspace) dependencies and devDependencies, deduplicates,
and returns sorted arrays.

Peer and optional dependencies are folded into their respective
categories: peerDependencies are counted as runtime `dependencies`
and optionalDependencies are also counted as runtime `dependencies`.

**Example**

```ts
import { collectUniqueNpmDependencies } from "@beep/repo-utils/UniqueDeps"
const program = collectUniqueNpmDependencies(process.cwd())
console.log(program)
```

**Signature**

```ts
declare const collectUniqueNpmDependencies: (rootDir: string) => Effect.Effect<UniqueNpmDeps, NoSuchFileError | DomainError, FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/UniqueDeps.ts#L69)

Since v0.0.0