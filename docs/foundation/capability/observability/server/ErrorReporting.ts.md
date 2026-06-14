---
title: ErrorReporting.ts
nav_order: 14
parent: "@beep/observability"
---

## ErrorReporting.ts overview

Console-backed server error reporting helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [makeConsoleErrorReporter](#makeconsoleerrorreporter)
- [layers](#layers)
  - [layerErrorReporter](#layererrorreporter)
---

# constructors

## makeConsoleErrorReporter

Create a console-backed error reporter with cause fingerprints and pretty rendering.

**Example**

```ts
```typescript
import { makeConsoleErrorReporter } from "@beep/observability/server"

const reporter = makeConsoleErrorReporter({ includeCause: true })
console.log(reporter)
```
```

**Signature**

```ts
declare const makeConsoleErrorReporter: (options?: { readonly includeCause?: boolean | undefined; }) => ErrorReporter.ErrorReporter
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/ErrorReporting.ts#L30)

Since v0.0.0

# layers

## layerErrorReporter

Register a console-backed error reporter.

**Example**

```ts
```typescript
import { Layer } from "effect"
import { layerErrorReporter } from "@beep/observability/server"

const ErrorReporterLive = layerErrorReporter({ includeCause: true })
console.log(ErrorReporterLive)
```
```

**Signature**

```ts
declare const layerErrorReporter: (options?: { readonly includeCause?: boolean | undefined; readonly mergeWithExisting?: boolean | undefined; }) => Layer<never, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/ErrorReporting.ts#L73)

Since v0.0.0