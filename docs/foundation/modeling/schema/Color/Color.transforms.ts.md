---
title: Color.transforms.ts
nav_order: 18
parent: "@beep/schema"
---

## Color.transforms.ts overview

Color conversion schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [HexToOklch (type alias)](#hextooklch-type-alias)
  - [HexToRgb (type alias)](#hextorgb-type-alias)
  - [OklchToHex (type alias)](#oklchtohex-type-alias)
  - [OklchToRgb (type alias)](#oklchtorgb-type-alias)
  - [RgbToHex (type alias)](#rgbtohex-type-alias)
  - [RgbToOklch (type alias)](#rgbtooklch-type-alias)
- [validation](#validation)
  - [HexToOklch](#hextooklch)
  - [HexToRgb](#hextorgb)
  - [OklchToHex](#oklchtohex)
  - [OklchToRgb](#oklchtorgb)
  - [RgbToHex](#rgbtohex)
  - [RgbToOklch](#rgbtooklch)
---

# models

## HexToOklch (type alias)

Type for `HexToOklch`.

**Signature**

```ts
type HexToOklch = typeof HexToOklch.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.transforms.ts#L201)

Since v0.0.0

## HexToRgb (type alias)

Type for `HexToRgb`.

**Signature**

```ts
type HexToRgb = typeof HexToRgb.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.transforms.ts#L66)

Since v0.0.0

## OklchToHex (type alias)

Type for `OklchToHex`.

**Signature**

```ts
type OklchToHex = typeof OklchToHex.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.transforms.ts#L234)

Since v0.0.0

## OklchToRgb (type alias)

Type for `OklchToRgb`.

**Signature**

```ts
type OklchToRgb = typeof OklchToRgb.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.transforms.ts#L165)

Since v0.0.0

## RgbToHex (type alias)

Type for `RgbToHex`.

**Signature**

```ts
type RgbToHex = typeof RgbToHex.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.transforms.ts#L99)

Since v0.0.0

## RgbToOklch (type alias)

Type for `RgbToOklch`.

**Signature**

```ts
type RgbToOklch = typeof RgbToOklch.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.transforms.ts#L132)

Since v0.0.0

# validation

## HexToOklch

Transformation schema for decoding boundary hex input into canonical OKLCH.

**Example**

```ts
import { HexToOklch } from "@beep/schema/Color"
import * as S from "effect/Schema"

const color = S.decodeUnknownSync(HexToOklch)("#3b82f6")
console.log(color.c)
```

**Signature**

```ts
declare const HexToOklch: AnnotatedSchema<S.decodeTo<typeof OklchColor, S.decodeTo<AnnotatedSchema<S.brand<S.String, "HexColor">>, S.String & SchemaStatics<S.String>, never, never> & SchemaStatics<S.decodeTo<AnnotatedSchema<S.brand<S.String, "HexColor">>, S.String & SchemaStatics<S.String>, never, never>>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.transforms.ts#L182)

Since v0.0.0

## HexToRgb

Transformation schema for decoding boundary hex input into normalized RGB.

**Example**

```ts
import { HexToRgb } from "@beep/schema/Color"
import * as S from "effect/Schema"

const rgb = S.decodeUnknownSync(HexToRgb)("#3b82f6")
console.log(rgb.b)
```

**Signature**

```ts
declare const HexToRgb: AnnotatedSchema<S.decodeTo<typeof Rgb, S.decodeTo<AnnotatedSchema<S.brand<S.String, "HexColor">>, S.String & SchemaStatics<S.String>, never, never> & SchemaStatics<S.decodeTo<AnnotatedSchema<S.brand<S.String, "HexColor">>, S.String & SchemaStatics<S.String>, never, never>>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.transforms.ts#L47)

Since v0.0.0

## OklchToHex

Transformation schema for encoding OKLCH coordinates into canonical hex.

**Example**

```ts
import { OklchToHex } from "@beep/schema/Color"
import * as S from "effect/Schema"

const hex = S.decodeUnknownSync(OklchToHex)({ l: 0.72, c: 0.12, h: 240 })
console.log(hex)
```

**Signature**

```ts
declare const OklchToHex: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.String, "HexColor">>, typeof OklchInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.transforms.ts#L218)

Since v0.0.0

## OklchToRgb

Transformation schema for encoding OKLCH coordinates into RGB input values.

**Example**

```ts
import { OklchToRgb } from "@beep/schema/Color"
import * as S from "effect/Schema"

const rgb = S.decodeUnknownSync(OklchToRgb)({ l: 0.72, c: 0.12, h: 240 })
console.log(rgb.r)
```

**Signature**

```ts
declare const OklchToRgb: AnnotatedSchema<S.decodeTo<typeof RgbInput, typeof OklchInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.transforms.ts#L149)

Since v0.0.0

## RgbToHex

Transformation schema for encoding RGB input into canonical hex.

**Example**

```ts
import { RgbToHex } from "@beep/schema/Color"
import * as S from "effect/Schema"

const hex = S.decodeUnknownSync(RgbToHex)({ r: 0.23, g: 0.51, b: 0.96 })
console.log(hex)
```

**Signature**

```ts
declare const RgbToHex: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.String, "HexColor">>, typeof RgbInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.transforms.ts#L83)

Since v0.0.0

## RgbToOklch

Transformation schema for decoding normalized RGB into canonical OKLCH.

**Example**

```ts
import { RgbToOklch } from "@beep/schema/Color"
import * as S from "effect/Schema"

const oklch = S.decodeUnknownSync(RgbToOklch)({ r: 0.23, g: 0.51, b: 0.96 })
console.log(oklch.h)
```

**Signature**

```ts
declare const RgbToOklch: AnnotatedSchema<S.decodeTo<typeof OklchColor, typeof Rgb, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.transforms.ts#L116)

Since v0.0.0