---
title: index.ts
nav_order: 2
parent: "@beep/infra"
---

## index.ts overview

Canonical project name for this repository's infrastructure workspace.

**Example**

```ts
import { infraProjectName } from "@beep/infra"

console.log(infraProjectName)
```

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [infraProjectName](#infraprojectname)
- [resources](#resources)
  - ["./AIMetrics.js" (namespace export)](#aimetricsjs-namespace-export)
  - ["./OipWeb.js" (namespace export)](#oipwebjs-namespace-export)
  - ["./Storybook.js" (namespace export)](#storybookjs-namespace-export)
---

# constants

## infraProjectName

Canonical project name for this repository's infrastructure workspace.

**Example**

```ts
import { infraProjectName } from "@beep/infra"

console.log(infraProjectName)
```

**Signature**

```ts
declare const infraProjectName: "beep-effect"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/index.ts#L28)

Since v0.0.0

# resources

## "./AIMetrics.js" (namespace export)

Re-exports all named exports from the "./AIMetrics.js" module.

**Example**

```ts
import { AIMetricsStack } from "@beep/infra"

console.log(AIMetricsStack)
```

**Signature**

```ts
export * from "./AIMetrics.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/index.ts#L43)

Since v0.0.0

## "./OipWeb.js" (namespace export)

Re-exports all named exports from the "./OipWeb.js" module.

**Example**

```ts
import { OipWebStack } from "@beep/infra"

console.log(OipWebStack)
```

**Signature**

```ts
export * from "./OipWeb.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/index.ts#L57)

Since v0.0.0

## "./Storybook.js" (namespace export)

Re-exports all named exports from the "./Storybook.js" module.

**Example**

```ts
import { StorybookStack } from "@beep/infra"

console.log(StorybookStack)
```

**Signature**

```ts
export * from "./Storybook.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/index.ts#L71)

Since v0.0.0