---
title: SourceKind.ts
nav_order: 21
parent: "@beep/shared-domain"
---

## SourceKind.ts overview

Canonical source-kind vocabulary for persisted entities.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [SourceKind (type alias)](#sourcekind-type-alias)
- [schemas](#schemas)
  - [SourceKind](#sourcekind)
---

# models

## SourceKind (type alias)

Runtime type for `SourceKind`.

**Example**

```ts
import type { SourceKind } from "@beep/shared-domain/entity/SourceKind"

const source: SourceKind = "System"
console.log(source)
```

**Signature**

```ts
type SourceKind = typeof SourceKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/SourceKind.ts#L46)

Since v0.0.0

# schemas

## SourceKind

Denormalized source facet used by BaseEntity rows and audit filters.

**Example**

```ts
import { SourceKind } from "@beep/shared-domain/entity/SourceKind"

console.log(SourceKind.is.Agent("Agent"))
```

**Signature**

```ts
declare const SourceKind: AnnotatedSchema<LiteralKit<readonly ["User", "Agent", "Admin", "Application", "System", "Sync", "Connector"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/SourceKind.ts#L26)

Since v0.0.0