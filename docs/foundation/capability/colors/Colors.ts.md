---
title: Colors.ts
nav_order: 1
parent: "@beep/colors"
---

## Colors.ts overview

ANSI color helpers inspired by `picocolors`.

The module exports a shared default formatter set detected from the current runtime,
plus helpers for forcing enabled or disabled formatter instances when you need stable
behavior in tests, browser builds, or log pipelines.

**Example**

```ts
```typescript
import colors from "@beep/colors"

const message = colors.bold(colors.green("ready"))

console.log(message)
```
```

**Example**

```ts
```typescript
import { createColors } from "@beep/colors"

const plain = createColors(false)
const rendered = plain.red("warning")

console.log(rendered) // "warning"
```
```

Since v0.0.0

---
## Exports Grouped by Category
    - [createColors (property)](#createcolors-property)
  - [Formatter](#formatter)
  - [Formatter (type alias)](#formatter-type-alias)
  - [ProcessLike (class)](#processlike-class)
  - [ProcessLikeStdout (class)](#processlikestdout-class)
- [utilities](#utilities)
  - [createColors](#createcolors)
  - [isColorSupported](#iscolorsupported)
  - [supportsColor](#supportscolor)
---

# models

## Colors (class)

A configured set of ANSI color formatter functions.

Instances are immutable and can be reused safely across loggers or render paths.
Use `createColors` to build explicitly enabled or disabled formatter sets.

**Example**

```ts
```typescript
import { Colors, createColors } from "@beep/colors"

const colors = createColors(true)
const isColorsInstance = colors instanceof Colors

console.log(isColorsInstance) // true
```
```

**Signature**

```ts
declare class Colors
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/colors/src/Colors.ts#L251)

Since v0.0.0

### createColors (property)

Recreate a `Colors` formatter set with explicit color support.

**Example**

```ts
```typescript
import { createColors } from "@beep/colors"

const colors = createColors(false)
const enabled = colors.createColors(true)
console.log(enabled.green("ready"))
```
```

**Signature**

```ts
readonly createColors: (enabled?: boolean) => Colors
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/colors/src/Colors.ts#L272)

Since v0.0.0

## Formatter

Schema describing a unary formatter function.

Formatter inputs are normalized with `String(...)`, matching the lightweight coercion
behavior expected from CLI color helpers.

**Example**

```ts
```typescript
import { createColors, type Formatter } from "@beep/colors"

const formatter: Formatter = createColors(true).cyan
const rendered = formatter(42)

console.log(rendered) // "\u001b[36m42\u001b[39m"
```
```

**Signature**

```ts
declare const Formatter: AnnotatedSchema<FnSchemaUnary<AnnotatedSchema<S.UndefinedOr<S.Union<readonly [S.String, S.Finite]>>>, S.String, S.Never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/colors/src/Colors.ts#L146)

Since v0.0.0

## Formatter (type alias)

Runtime type for `Formatter`.

**Example**

```ts
```typescript
import type { Formatter } from "@beep/colors"

const formatter: Formatter = (input) => `${input}`
console.log(formatter("ready"))
```
```

**Signature**

```ts
type Formatter = FormatterType
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/colors/src/Colors.ts#L162)

Since v0.0.0

## ProcessLike (class)

Minimal process-like runtime metadata used by ANSI color support detection.

**Example**

```ts
```typescript
import { ProcessLike, supportsColor } from "@beep/colors"

const processLike = ProcessLike.make({ env: { FORCE_COLOR: "1" } })
console.log(supportsColor(processLike))
```
```

**Signature**

```ts
declare class ProcessLike
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/colors/src/Colors.ts#L78)

Since v0.0.0

## ProcessLikeStdout (class)

Minimal stdout metadata used by ANSI color support detection.

**Example**

```ts
```typescript
import { ProcessLikeStdout } from "@beep/colors"

const stdout = ProcessLikeStdout.make({ isTTY: true })
console.log(stdout.isTTY)
```
```

**Signature**

```ts
declare class ProcessLikeStdout
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/colors/src/Colors.ts#L55)

Since v0.0.0

# utilities

## createColors

Create a formatter set with ANSI escapes either enabled or disabled.

When disabled, every formatter falls back to `String(...)` so downstream code can keep
the same call sites without branching on environment support.

**Example**

```ts
```typescript
import { createColors } from "@beep/colors"

const colors = createColors(false)
const rendered = colors.bold(colors.red("offline"))

console.log(rendered) // "offline"
```
```

**Signature**

```ts
declare const createColors: (enabled?: boolean) => Colors
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/colors/src/Colors.ts#L296)

Since v0.0.0

## isColorSupported

Whether ANSI color output is enabled for the current runtime.

**Example**

```ts
```typescript
import { isColorSupported } from "@beep/colors"

console.log(typeof isColorSupported) // "boolean"
```
```

**Signature**

```ts
declare const isColorSupported: boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/colors/src/Colors.ts#L230)

Since v0.0.0

## supportsColor

Detect whether ANSI color output should be enabled for a process-like runtime.

`NO_COLOR` and `--no-color` always disable colors, even when CI, Windows TTYs,
or `FORCE_COLOR` would otherwise enable them. `FORCE_COLOR="0"` is treated as disabled.

**Example**

```ts
```typescript
import { supportsColor } from "@beep/colors"

const enabled = supportsColor({
  env: { FORCE_COLOR: "1" },
})

console.log(enabled) // true
```
```

**Signature**

```ts
declare const supportsColor: (processLike?: ProcessLike) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/colors/src/Colors.ts#L198)

Since v0.0.0