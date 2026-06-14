---
title: AllowedDevOrigin.schema.ts
nav_order: 11
parent: "@beep/repo-configs"
---

## AllowedDevOrigin.schema.ts overview

A module containing the AllowedDevOrigin schema for Next.js configuration.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [AllowedDevOrigin (type alias)](#alloweddevorigin-type-alias)
- [schemas](#schemas)
  - [AllowedDevOrigin](#alloweddevorigin)
---

# models

## AllowedDevOrigin (type alias)

Hostname entry for one element of Next.js `allowedDevOrigins`.

**Example**

```ts
import type { AllowedDevOrigin } from "@beep/repo-configs/next"
const origin = "local-origin.dev" as AllowedDevOrigin
console.log(origin)
```

**Signature**

```ts
type AllowedDevOrigin = typeof AllowedDevOrigin.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/AllowedDevOrigin.schema.ts#L57)

Since v0.0.0

# schemas

## AllowedDevOrigin

A hostname or leading-wildcard hostname entry for Next.js `allowedDevOrigins`.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { AllowedDevOrigin } from "@beep/repo-configs/next"
const program = S.decodeUnknownEffect(AllowedDevOrigin)("*.local-origin.dev")
console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare const AllowedDevOrigin: AnnotatedSchema<S.brand<S.Trim, "AllowedDevOrigin">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/AllowedDevOrigin.schema.ts#L29)

Since v0.0.0