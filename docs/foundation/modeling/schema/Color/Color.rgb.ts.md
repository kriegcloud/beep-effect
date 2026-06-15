---
title: Color.rgb.ts
nav_order: 15
parent: "@beep/schema"
---

## Color.rgb.ts overview

RGB color schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [RgbChannel (type alias)](#rgbchannel-type-alias)
  - [RgbInputChannel (type alias)](#rgbinputchannel-type-alias)
- [validation](#validation)
  - [Rgb (class)](#rgb-class)
  - [RgbChannel](#rgbchannel)
  - [RgbInput (class)](#rgbinput-class)
  - [RgbInputChannel](#rgbinputchannel)
---

# models

## RgbChannel (type alias)

Type for `RgbChannel`.

**Signature**

```ts
type RgbChannel = typeof RgbChannel.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.rgb.ts#L83)

Since v0.0.0

## RgbInputChannel (type alias)

Type for `RgbInputChannel`.

**Signature**

```ts
type RgbInputChannel = typeof RgbInputChannel.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.rgb.ts#L52)

Since v0.0.0

# validation

## Rgb (class)

RGB object with normalized channels.

**Example**

```ts
import { Rgb } from "@beep/schema/Color"
import * as S from "effect/Schema"

const color = S.decodeUnknownSync(Rgb)({ r: 0.23, g: 0.51, b: 0.96 })
console.log(color.g)
```

**Signature**

```ts
declare class Rgb
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.rgb.ts#L126)

Since v0.0.0

## RgbChannel

Branded normalized RGB channel in the range 0 through 1.

**Example**

```ts
import { RgbChannel } from "@beep/schema/Color"
import * as S from "effect/Schema"

const channel = S.decodeUnknownSync(RgbChannel)(0.5)
console.log(channel)
```

**Signature**

```ts
declare const RgbChannel: AnnotatedSchema<S.brand<S.brand<S.Finite, "RgbInputChannel">, "RgbChannel">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.rgb.ts#L69)

Since v0.0.0

## RgbInput (class)

RGB object with finite channel inputs.

**Example**

```ts
import { RgbInput } from "@beep/schema/Color"
import * as S from "effect/Schema"

const color = S.decodeUnknownSync(RgbInput)({ r: 1.2, g: 0.5, b: -0.1 })
console.log(color.r)
```

**Signature**

```ts
declare class RgbInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.rgb.ts#L100)

Since v0.0.0

## RgbInputChannel

Branded finite RGB input channel.

**Example**

```ts
import { RgbInputChannel } from "@beep/schema/Color"
import * as S from "effect/Schema"

const channel = S.decodeUnknownSync(RgbInputChannel)(1.25)
console.log(channel)
```

**Signature**

```ts
declare const RgbInputChannel: AnnotatedSchema<S.brand<S.Finite, "RgbInputChannel">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.rgb.ts#L39)

Since v0.0.0