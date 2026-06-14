---
title: shacl-engine.ts
nav_order: 6
parent: "@beep/semantic-web"
---

## shacl-engine.ts overview

Local SHACL validation adapter backing.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [BoundedShaclValidationServiceLive](#boundedshaclvalidationservicelive)
  - [ShaclValidationServiceLive](#shaclvalidationservicelive)
---

# layers

## BoundedShaclValidationServiceLive

Bounded SHACL-inspired validation service live layer.

**Example**

```ts
import { BoundedShaclValidationServiceLive } from "@beep/semantic-web/adapters/shacl-engine"

console.log(BoundedShaclValidationServiceLive)
```

**Signature**

```ts
declare const BoundedShaclValidationServiceLive: Layer.Layer<ShaclValidationService, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/shacl-engine.ts#L49)

Since v0.0.0

## ShaclValidationServiceLive

Backward-compatible alias for the bounded v1 SHACL adapter.

**Example**

```ts
import { ShaclValidationServiceLive } from "@beep/semantic-web/adapters/shacl-engine"

console.log(ShaclValidationServiceLive)
```

**Signature**

```ts
declare const ShaclValidationServiceLive: Layer.Layer<ShaclValidationService, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/shacl-engine.ts#L174)

Since v0.0.0