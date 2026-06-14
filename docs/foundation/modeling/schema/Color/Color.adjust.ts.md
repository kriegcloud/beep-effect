---
title: Color.adjust.ts
nav_order: 12
parent: "@beep/schema"
---

## Color.adjust.ts overview

Color adjustment schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ColorAmount (type alias)](#coloramount-type-alias)
  - [Darken (type alias)](#darken-type-alias)
  - [Lighten (type alias)](#lighten-type-alias)
  - [MixColors (type alias)](#mixcolors-type-alias)
  - [RgbaColorString (type alias)](#rgbacolorstring-type-alias)
  - [WithAlpha (type alias)](#withalpha-type-alias)
- [validation](#validation)
  - [ColorAmount](#coloramount)
  - [Darken](#darken)
  - [DarkenInput (class)](#darkeninput-class)
  - [Lighten](#lighten)
  - [LightenInput (class)](#lighteninput-class)
  - [MixColors](#mixcolors)
  - [MixColorsInput (class)](#mixcolorsinput-class)
  - [RgbaColorString](#rgbacolorstring)
  - [WithAlpha](#withalpha)
  - [WithAlphaInput (class)](#withalphainput-class)
---

# models

## ColorAmount (type alias)

Type for `ColorAmount`.

**Signature**

```ts
type ColorAmount = typeof ColorAmount.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L133)

Since v0.0.0

## Darken (type alias)

Type for `Darken`.

**Signature**

```ts
type Darken = typeof Darken.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L308)

Since v0.0.0

## Lighten (type alias)

Type for `Lighten`.

**Signature**

```ts
type Lighten = typeof Lighten.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L250)

Since v0.0.0

## MixColors (type alias)

Type for `MixColors`.

**Signature**

```ts
type MixColors = typeof MixColors.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L192)

Since v0.0.0

## RgbaColorString (type alias)

Type for `RgbaColorString`.

**Signature**

```ts
type RgbaColorString = typeof RgbaColorString.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L104)

Since v0.0.0

## WithAlpha (type alias)

Type for `WithAlpha`.

**Signature**

```ts
type WithAlpha = typeof WithAlpha.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L366)

Since v0.0.0

# validation

## ColorAmount

Shared finite amount used by color helper request schemas.

**Example**

```ts
import * as S from "effect/Schema"
import { ColorAmount } from "@beep/schema/Color"

console.log(S.decodeUnknownSync(ColorAmount)(0.25))
```

**Signature**

```ts
declare const ColorAmount: AnnotatedSchema<S.brand<S.Finite, "ColorAmount">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L120)

Since v0.0.0

## Darken

One-way schema for darkening a color.

**Example**

```ts
import * as S from "effect/Schema"
import { Darken } from "@beep/schema/Color"

const color = S.decodeUnknownSync(Darken)({ color: "#336699", amount: 0.1 })
console.log(color)
```

**Signature**

```ts
declare const Darken: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.String, "HexColor">>, typeof DarkenInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L292)

Since v0.0.0

## DarkenInput (class)

Request schema for darkening a color.

**Example**

```ts
import * as S from "effect/Schema"
import { DarkenInput } from "@beep/schema/Color"

const input = S.decodeUnknownSync(DarkenInput)({ color: "#336699", amount: 0.1 })
console.log(input.amount)
```

**Signature**

```ts
declare class DarkenInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L267)

Since v0.0.0

## Lighten

One-way schema for lightening a color.

**Example**

```ts
import * as S from "effect/Schema"
import { Lighten } from "@beep/schema/Color"

const color = S.decodeUnknownSync(Lighten)({ color: "#336699", amount: 0.1 })
console.log(color)
```

**Signature**

```ts
declare const Lighten: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.String, "HexColor">>, typeof LightenInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L234)

Since v0.0.0

## LightenInput (class)

Request schema for lightening a color.

**Example**

```ts
import * as S from "effect/Schema"
import { LightenInput } from "@beep/schema/Color"

const input = S.decodeUnknownSync(LightenInput)({ color: "#336699", amount: 0.1 })
console.log(input.color)
```

**Signature**

```ts
declare class LightenInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L209)

Since v0.0.0

## MixColors

One-way schema for mixing two colors.

**Example**

```ts
import * as S from "effect/Schema"
import { MixColors } from "@beep/schema/Color"

const color = S.decodeUnknownSync(MixColors)({ color1: "#000000", color2: "#ffffff", amount: 0.5 })
console.log(color)
```

**Signature**

```ts
declare const MixColors: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.String, "HexColor">>, typeof MixColorsInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L176)

Since v0.0.0

## MixColorsInput (class)

Request schema for mixing two colors.

**Example**

```ts
import * as S from "effect/Schema"
import { MixColorsInput } from "@beep/schema/Color"

const input = S.decodeUnknownSync(MixColorsInput)({ color1: "#000000", color2: "#ffffff", amount: 0.5 })
console.log(input.amount)
```

**Signature**

```ts
declare class MixColorsInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L150)

Since v0.0.0

## RgbaColorString

CSS rgba color string produced by with-alpha helpers.

**Example**

```ts
import * as S from "effect/Schema"
import { RgbaColorString } from "@beep/schema/Color"

console.log(S.decodeUnknownSync(RgbaColorString)("rgba(255, 255, 255, 1)"))
```

**Signature**

```ts
declare const RgbaColorString: AnnotatedSchema<S.brand<S.String, "RgbaColorString">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L91)

Since v0.0.0

## WithAlpha

One-way schema for rendering an rgba string.

**Example**

```ts
import * as S from "effect/Schema"
import { WithAlpha } from "@beep/schema/Color"

const rgba = S.decodeUnknownSync(WithAlpha)({ color: "#336699", alpha: 0.5 })
console.log(rgba)
```

**Signature**

```ts
declare const WithAlpha: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.String, "RgbaColorString">>, typeof WithAlphaInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L350)

Since v0.0.0

## WithAlphaInput (class)

Request schema for converting a color plus alpha to an rgba string.

**Example**

```ts
import * as S from "effect/Schema"
import { WithAlphaInput } from "@beep/schema/Color"

const input = S.decodeUnknownSync(WithAlphaInput)({ color: "#336699", alpha: 0.5 })
console.log(input.alpha)
```

**Signature**

```ts
declare class WithAlphaInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.adjust.ts#L325)

Since v0.0.0