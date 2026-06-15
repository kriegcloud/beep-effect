---
title: HostDependency.model.ts
nav_order: 3
parent: "@beep/installer-domain"
---

## HostDependency.model.ts overview

Host dependency aggregate model.

Since v0.0.0

---
## Exports Grouped by Category
- [aggregates](#aggregates)
  - [HostDependency (class)](#hostdependency-class)
  - [HostDependencyKind](#hostdependencykind)
  - [HostDependencyKind (type alias)](#hostdependencykind-type-alias)
  - [HostDependencyStatus](#hostdependencystatus)
  - [HostDependencyStatus (type alias)](#hostdependencystatus-type-alias)
---

# aggregates

## HostDependency (class)

Host dependency required by the AI stack installer.

**Example**

```ts
import { HostDependency } from "@beep/installer-domain/aggregates/HostDependency"

console.log(HostDependency)
```

**Signature**

```ts
declare class HostDependency
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/HostDependency/HostDependency.model.ts#L82)

Since v0.0.0

## HostDependencyKind

Host dependency family recognized by the dry-run installer.

**Example**

```ts
import { HostDependencyKind } from "@beep/installer-domain/aggregates/HostDependency"

console.log(HostDependencyKind)
```

**Signature**

```ts
declare const HostDependencyKind: AnnotatedSchema<LiteralKit<readonly ["system-package", "desktop-app", "cli-tool", "runtime"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/HostDependency/HostDependency.model.ts#L28)

Since v0.0.0

## HostDependencyKind (type alias)

Runtime type for `HostDependencyKind`.

**Signature**

```ts
type HostDependencyKind = typeof HostDependencyKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/HostDependency/HostDependency.model.ts#L40)

Since v0.0.0

## HostDependencyStatus

Validation status for a host dependency.

**Example**

```ts
import { HostDependencyStatus } from "@beep/installer-domain/aggregates/HostDependency"

console.log(HostDependencyStatus)
```

**Signature**

```ts
declare const HostDependencyStatus: AnnotatedSchema<LiteralKit<readonly ["present", "missing", "unknown"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/HostDependency/HostDependency.model.ts#L55)

Since v0.0.0

## HostDependencyStatus (type alias)

Runtime type for `HostDependencyStatus`.

**Signature**

```ts
type HostDependencyStatus = typeof HostDependencyStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/HostDependency/HostDependency.model.ts#L67)

Since v0.0.0