---
title: Color.oklch.ts
nav_order: 14
parent: "@beep/schema"
---

## Color.oklch.ts overview

OKLCH color schemas and helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [OklchChroma (type alias)](#oklchchroma-type-alias)
  - [OklchCoordinate (type alias)](#oklchcoordinate-type-alias)
  - [OklchHue (type alias)](#oklchhue-type-alias)
  - [OklchLightness (type alias)](#oklchlightness-type-alias)
- [validation](#validation)
  - [OklchChroma](#oklchchroma)
  - [OklchColor (class)](#oklchcolor-class)
  - [OklchCoordinate](#oklchcoordinate)
  - [OklchHue](#oklchhue)
  - [OklchInput (class)](#oklchinput-class)
  - [OklchLightness](#oklchlightness)
---

# models

## OklchChroma (type alias)

Type for `OklchChroma`.

**Signature**

```ts
type OklchChroma = typeof OklchChroma.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.oklch.ts#L215)

Since v0.0.0

## OklchCoordinate (type alias)

Type for `OklchCoordinate`.

**Signature**

```ts
type OklchCoordinate = typeof OklchCoordinate.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.oklch.ts#L153)

Since v0.0.0

## OklchHue (type alias)

Type for `OklchHue`.

**Signature**

```ts
type OklchHue = typeof OklchHue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.oklch.ts#L246)

Since v0.0.0

## OklchLightness (type alias)

Type for `OklchLightness`.

**Signature**

```ts
type OklchLightness = typeof OklchLightness.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.oklch.ts#L184)

Since v0.0.0

# validation

## OklchChroma

Canonical OKLCH chroma component.

**Example**

```ts
import { OklchChroma } from "@beep/schema/Color"
import * as S from "effect/Schema"

const chroma = S.decodeUnknownSync(OklchChroma)(0.12)
console.log(chroma)
```

**Signature**

```ts
declare const OklchChroma: AnnotatedSchema<S.brand<S.brand<S.Finite, "OklchCoordinate">, "OklchChroma">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.oklch.ts#L201)

Since v0.0.0

## OklchColor (class)

Canonical OKLCH color object.

**Example**

```ts
import { OklchColor } from "@beep/schema/Color"
import * as S from "effect/Schema"

const color = S.decodeUnknownSync(OklchColor)({ l: 0.72, c: 0.12, h: 240 })
console.log(color.l)
```

**Signature**

```ts
declare class OklchColor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.oklch.ts#L289)

Since v0.0.0

## OklchCoordinate

Branded finite OKLCH coordinate.

**Example**

```ts
import { OklchCoordinate } from "@beep/schema/Color"
import * as S from "effect/Schema"

const coordinate = S.decodeUnknownSync(OklchCoordinate)(0.42)
console.log(coordinate)
```

**Signature**

```ts
declare const OklchCoordinate: AnnotatedSchema<S.brand<S.Finite, "OklchCoordinate">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.oklch.ts#L140)

Since v0.0.0

## OklchHue

Canonical OKLCH hue component.

**Example**

```ts
import { OklchHue } from "@beep/schema/Color"
import * as S from "effect/Schema"

const hue = S.decodeUnknownSync(OklchHue)(240)
console.log(hue)
```

**Signature**

```ts
declare const OklchHue: AnnotatedSchema<S.brand<S.brand<S.Finite, "OklchCoordinate">, "OklchHue">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.oklch.ts#L232)

Since v0.0.0

## OklchInput (class)

OKLCH object with finite coordinates.

**Example**

```ts
import { OklchInput } from "@beep/schema/Color"
import * as S from "effect/Schema"

const color = S.decodeUnknownSync(OklchInput)({ l: 0.72, c: 0.12, h: 240 })
console.log(color.h)
```

**Signature**

```ts
declare class OklchInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.oklch.ts#L263)

Since v0.0.0

## OklchLightness

Canonical OKLCH lightness component.

**Example**

```ts
import { OklchLightness } from "@beep/schema/Color"
import * as S from "effect/Schema"

const lightness = S.decodeUnknownSync(OklchLightness)(0.72)
console.log(lightness)
```

**Signature**

```ts
declare const OklchLightness: AnnotatedSchema<S.brand<S.brand<S.Finite, "OklchCoordinate">, "OklchLightness">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.oklch.ts#L170)

Since v0.0.0