---
title: Sanity.config.ts
nav_order: 2
parent: "@beep/sanity"
---

## Sanity.config.ts overview

Runtime configuration models for the Sanity driver.

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [SANITY_API_VERSION](#sanity_api_version)
- [models](#models)
  - [SanityConfigInput (class)](#sanityconfiginput-class)
---

# constants

## SANITY_API_VERSION

Default Sanity API version used when callers do not provide one.

**Example**

```ts
import { SANITY_API_VERSION } from "@beep/sanity"

console.log(SANITY_API_VERSION) // "2025-05-14"
```

**Signature**

```ts
declare const SANITY_API_VERSION: "2025-05-14"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/sanity/src/Sanity.config.ts#L44)

Since v0.0.0

# models

## SanityConfigInput (class)

Runtime configuration accepted by `Sanity.makeLayer`.

**Example**

```ts
import { SANITY_API_VERSION, SanityConfigInput } from "@beep/sanity"

const config = SanityConfigInput.make({
  apiVersion: SANITY_API_VERSION,
  dataset: "production",
  projectId: "content-project"
})

console.log(config.dataset) // "production"
```

**Signature**

```ts
declare class SanityConfigInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/sanity/src/Sanity.config.ts#L65)

Since v0.0.0