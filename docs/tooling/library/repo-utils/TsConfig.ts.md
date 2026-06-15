---
title: TsConfig.ts
nav_order: 56
parent: "@beep/repo-utils"
---

## TsConfig.ts overview

TypeScript configuration file discovery for monorepo workspaces.

Scans each workspace (and the root) for `tsconfig*.json` files and
returns a mapping of package names to their tsconfig file paths.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [collectTsConfigPaths](#collecttsconfigpaths)
---

# utilities

## collectTsConfigPaths

Collect all `tsconfig*.json` file paths for each workspace and the root.

For every workspace package (plus the monorepo root), this function
globs for files matching `tsconfig*.json` and returns a HashMap
mapping each package name to its array of tsconfig paths.

The root directory is indexed under `"@beep/root"`.

**Example**

```ts
```typescript
import { Effect } from "effect"
import { collectTsConfigPaths } from "@beep/repo-utils/TsConfig"

const program = collectTsConfigPaths(".")
console.log(program)
```
```

**Signature**

```ts
declare const collectTsConfigPaths: (rootDir: string) => Effect.Effect<HashMap.HashMap<string, ReadonlyArray<string>>, NoSuchFileError | DomainError, FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TsConfig.ts#L45)

Since v0.0.0