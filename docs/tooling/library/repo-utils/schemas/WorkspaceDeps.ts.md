---
title: WorkspaceDeps.ts
nav_order: 55
parent: "@beep/repo-utils"
---

## WorkspaceDeps.ts overview

Schema and types for classified workspace dependencies.

Dependencies are split into workspace-internal dependencies (packages
that live within the monorepo) and external NPM dependencies.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [emptyWorkspaceDeps](#emptyworkspacedeps)
- [models](#models)
  - [DependencyRecord](#dependencyrecord)
  - [DependencyRecord (type alias)](#dependencyrecord-type-alias)
  - [WorkspaceDeps (class)](#workspacedeps-class)
---

# constructors

## emptyWorkspaceDeps

Create an empty WorkspaceDeps for a given package name.

**Example**

```ts
import { emptyWorkspaceDeps } from "@beep/repo-utils/schemas/WorkspaceDeps"
const deps = emptyWorkspaceDeps("@beep/example")
console.log(deps.workspace.dependencies)
```

**Signature**

```ts
declare const emptyWorkspaceDeps: (packageName: string) => WorkspaceDeps
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/WorkspaceDeps.ts#L103)

Since v0.0.0

# models

## DependencyRecord

A record mapping package names to version specifiers.

**Example**

```ts
import { DependencyRecord } from "@beep/repo-utils/schemas/WorkspaceDeps"
const isRecord = DependencyRecord
console.log(isRecord)
```

**Signature**

```ts
declare const DependencyRecord: AnnotatedSchema<S.$Record<S.String, S.String>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/WorkspaceDeps.ts#L27)

Since v0.0.0

## DependencyRecord (type alias)

A record mapping package names to version specifiers.

**Example**

```ts
import type { DependencyRecord } from "@beep/repo-utils/schemas/WorkspaceDeps"
const deps: DependencyRecord = {
  effect: "^4.0.0"
}
console.log(deps)
```

**Signature**

```ts
type DependencyRecord = typeof DependencyRecord.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/WorkspaceDeps.ts#L47)

Since v0.0.0

## WorkspaceDeps (class)

Classified dependencies for a single workspace package.

Dependencies are separated into workspace-internal and external (NPM)
categories, each further divided by dependency type (runtime, dev, peer,
optional).

**Example**

```ts
import { emptyWorkspaceDeps } from "@beep/repo-utils/schemas/WorkspaceDeps"
const deps = emptyWorkspaceDeps("@beep/example")
console.log(deps.packageName)
```

**Signature**

```ts
declare class WorkspaceDeps
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/WorkspaceDeps.ts#L77)

Since v0.0.0