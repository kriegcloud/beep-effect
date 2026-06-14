---
title: Color.scale.ts
nav_order: 16
parent: "@beep/schema"
---

## Color.scale.ts overview

Color scale schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [GenerateAlphaScale (type alias)](#generatealphascale-type-alias)
  - [GenerateNeutralScale (type alias)](#generateneutralscale-type-alias)
  - [GenerateScale (type alias)](#generatescale-type-alias)
  - [HexColorScale12 (type alias)](#hexcolorscale12-type-alias)
- [validation](#validation)
  - [GenerateAlphaScale](#generatealphascale)
  - [GenerateAlphaScaleInput (class)](#generatealphascaleinput-class)
  - [GenerateNeutralScale](#generateneutralscale)
  - [GenerateNeutralScaleInput (class)](#generateneutralscaleinput-class)
  - [GenerateScale](#generatescale)
  - [GenerateScaleInput (class)](#generatescaleinput-class)
  - [HexColorScale12](#hexcolorscale12)
---

# models

## GenerateAlphaScale (type alias)

Type for `GenerateAlphaScale`.

**Signature**

```ts
type GenerateAlphaScale = typeof GenerateAlphaScale.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.scale.ts#L357)

Since v0.0.0

## GenerateNeutralScale (type alias)

Type for `GenerateNeutralScale`.

**Signature**

```ts
type GenerateNeutralScale = typeof GenerateNeutralScale.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.scale.ts#L281)

Since v0.0.0

## GenerateScale (type alias)

Type for `GenerateScale`.

**Signature**

```ts
type GenerateScale = typeof GenerateScale.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.scale.ts#L221)

Since v0.0.0

## HexColorScale12 (type alias)

Type for `HexColorScale12`.

**Signature**

```ts
type HexColorScale12 = typeof HexColorScale12.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.scale.ts#L153)

Since v0.0.0

# validation

## GenerateAlphaScale

One-way schema for generating an alpha-blended 12-step scale.

**Example**

```ts
import { GenerateAlphaScale } from "@beep/schema/Color"
import * as S from "effect/Schema"

const alphaScale = S.decodeUnknownSync(GenerateAlphaScale)({
  scale: [
    "#020617", "#0f172a", "#1e293b", "#334155",
    "#475569", "#64748b", "#94a3b8", "#cbd5e1",
    "#e2e8f0", "#f1f5f9", "#f8fafc", "#ffffff"
  ],
  isDark: true
})

console.log(alphaScale.length)
```

**Signature**

```ts
declare const GenerateAlphaScale: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.$Array<AnnotatedSchema<S.brand<S.String, "HexColor">>>, "HexColorScale12">>, typeof GenerateAlphaScaleInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.scale.ts#L339)

Since v0.0.0

## GenerateAlphaScaleInput (class)

Request schema for generating an alpha-blended 12-step scale.

**Example**

```ts
import { GenerateAlphaScaleInput } from "@beep/schema/Color"
import * as S from "effect/Schema"

const input = S.decodeUnknownSync(GenerateAlphaScaleInput)({
  scale: [
    "#020617", "#0f172a", "#1e293b", "#334155",
    "#475569", "#64748b", "#94a3b8", "#cbd5e1",
    "#e2e8f0", "#f1f5f9", "#f8fafc", "#ffffff"
  ],
  isDark: true
})

console.log(input.scale.length)
```

**Signature**

```ts
declare class GenerateAlphaScaleInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.scale.ts#L306)

Since v0.0.0

## GenerateNeutralScale

One-way schema for generating a neutral 12-step scale.

**Example**

```ts
import { GenerateNeutralScale } from "@beep/schema/Color"
import * as S from "effect/Schema"

const scale = S.decodeUnknownSync(GenerateNeutralScale)({ seed: "#64748b", isDark: true })
console.log(scale.length)
```

**Signature**

```ts
declare const GenerateNeutralScale: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.$Array<AnnotatedSchema<S.brand<S.String, "HexColor">>>, "HexColorScale12">>, typeof GenerateNeutralScaleInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.scale.ts#L263)

Since v0.0.0

## GenerateNeutralScaleInput (class)

Request schema for generating a neutral 12-step scale.

**Example**

```ts
import { GenerateNeutralScaleInput } from "@beep/schema/Color"
import * as S from "effect/Schema"

const input = S.decodeUnknownSync(GenerateNeutralScaleInput)({ seed: "#64748b", isDark: false })
console.log(input.isDark)
```

**Signature**

```ts
declare class GenerateNeutralScaleInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.scale.ts#L238)

Since v0.0.0

## GenerateScale

One-way schema for generating a chromatic 12-step scale.

**Example**

```ts
import { GenerateScale } from "@beep/schema/Color"
import * as S from "effect/Schema"

const scale = S.decodeUnknownSync(GenerateScale)({ seed: "#3b82f6", isDark: false })
console.log(scale.length)
```

**Signature**

```ts
declare const GenerateScale: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.$Array<AnnotatedSchema<S.brand<S.String, "HexColor">>>, "HexColorScale12">>, typeof GenerateScaleInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.scale.ts#L203)

Since v0.0.0

## GenerateScaleInput (class)

Request schema for generating a chromatic 12-step scale.

**Example**

```ts
import { GenerateScaleInput } from "@beep/schema/Color"
import * as S from "effect/Schema"

const input = S.decodeUnknownSync(GenerateScaleInput)({ seed: "#3b82f6", isDark: true })
console.log(input.seed)
```

**Signature**

```ts
declare class GenerateScaleInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.scale.ts#L178)

Since v0.0.0

## HexColorScale12

Fixed-size 12-step canonical hex color scale.

**Example**

```ts
import { HexColorScale12 } from "@beep/schema/Color"
import * as S from "effect/Schema"

const scale = S.decodeUnknownSync(HexColorScale12)([
  "#020617", "#0f172a", "#1e293b", "#334155",
  "#475569", "#64748b", "#94a3b8", "#cbd5e1",
  "#e2e8f0", "#f1f5f9", "#f8fafc", "#ffffff"
])

console.log(scale.length)
```

**Signature**

```ts
declare const HexColorScale12: AnnotatedSchema<S.brand<S.$Array<AnnotatedSchema<S.brand<S.String, "HexColor">>>, "HexColorScale12">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.scale.ts#L138)

Since v0.0.0