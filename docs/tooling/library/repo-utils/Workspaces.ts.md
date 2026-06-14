---
title: Workspaces.ts
nav_order: 65
parent: "@beep/repo-utils"
---

## Workspaces.ts overview

Workspace discovery for monorepo projects.

Expands glob patterns from the root `package.json` `workspaces` field
into a mapping of package names to their absolute directory paths.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [getWorkspaceDir](#getworkspacedir)
  - [resolveWorkspaceDirs](#resolveworkspacedirs)
---

# utilities

## getWorkspaceDir

Look up the absolute directory for a single workspace by package name.

Resolves all workspaces and returns the path for the given name,
or `None` if the workspace is not found.

**Example**

```ts
```typescript
import { Effect } from "effect"
import * as O from "effect/Option"
import { getWorkspaceDir } from "@beep/repo-utils/Workspaces"

const program = getWorkspaceDir(".", "@beep/repo-utils")
console.log(program)
```
```

**Signature**

```ts
declare const getWorkspaceDir: { (rootDir: string, name: string): Effect.Effect<O.Option<string>, NoSuchFileError | DomainError, FsUtils>; (name: string): (rootDir: string) => Effect.Effect<O.Option<string>, NoSuchFileError | DomainError, FsUtils>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Workspaces.ts#L187)

Since v0.0.0

## resolveWorkspaceDirs

Resolve all workspace directories declared in the root `package.json`.

Reads the `workspaces` array from the root `package.json`, expands each
glob pattern, reads each matching directory's `package.json` to extract
the package name, and returns a `HashMap<PackageName, AbsoluteDirectory>`.

**Example**

```ts
```typescript
import { Effect } from "effect"
import { resolveWorkspaceDirs } from "@beep/repo-utils/Workspaces"

const program = resolveWorkspaceDirs(".")
console.log(program)
```
```

**Signature**

```ts
declare const resolveWorkspaceDirs: (rootDir: string) => Effect.Effect<HashMap.HashMap<string, string>, NoSuchFileError | DomainError, FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Workspaces.ts#L84)

Since v0.0.0