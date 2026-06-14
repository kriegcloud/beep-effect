---
title: Organization.display.ts
nav_order: 3
parent: "@beep/shared-ui"
---

## Organization.display.ts overview

Browser-safe Organization display contracts.

Since v0.0.0

---
## Exports Grouped by Category
- [getters](#getters)
  - [primaryLabel](#primarylabel)
- [models](#models)
  - [Display (class)](#display-class)
  - [Form (class)](#form-class)
---

# getters

## primaryLabel

Primary display label for an Organization.

**Example**

```ts
import { Effect } from "effect"
import {
  Display,
  primaryLabel,
} from "@beep/shared-ui/entities/Organization/Organization.display"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const display = yield* S.decodeUnknownEffect(Display)({
    id: 1,
    legalName: "Acme Legal LLC",
    licenseTier: "team",
    name: "Acme",
    settings: {
      allowAgentActions: true,
      defaultRetentionDays: 90,
    },
    slug: "acme",
  })
  return primaryLabel(display)
})
console.log(program)
```

**Signature**

```ts
declare const primaryLabel: (organization: Pick<Display, "name">) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/ui/src/entities/Organization/Organization.display.ts#L138)

Since v0.0.0

# models

## Display (class)

Browser-safe Organization display payload.

**Example**

```ts
import { Effect } from "effect"
import { Display } from "@beep/shared-ui/entities/Organization/Organization.display"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const display = yield* S.decodeUnknownEffect(Display)({
    id: 1,
    legalName: "Acme Legal LLC",
    licenseTier: "team",
    name: "Acme",
    settings: {
      allowAgentActions: true,
      defaultRetentionDays: 90,
    },
    slug: "acme",
  })
  return display.name
})
console.log(program)
```

**Signature**

```ts
declare class Display
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/ui/src/entities/Organization/Organization.display.ts#L45)

Since v0.0.0

## Form (class)

Browser-safe Organization form payload.

**Example**

```ts
import { Effect } from "effect"
import { Form } from "@beep/shared-ui/entities/Organization/Organization.display"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const form = yield* S.decodeUnknownEffect(Form)({
    legalName: "Acme Legal LLC",
    licenseTier: "team",
    name: "Acme",
    settings: {
      allowAgentActions: true,
      defaultRetentionDays: 90,
    },
    slug: "acme",
  })
  return form.slug
})
console.log(program)
```

**Signature**

```ts
declare class Form
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/ui/src/entities/Organization/Organization.display.ts#L90)

Since v0.0.0