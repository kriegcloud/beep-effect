---
title: Color.ts
nav_order: 19
parent: "@beep/schema"
---

## Color.ts overview

Color adjustment schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [ColorAmount](#coloramount)
  - [Darken](#darken)
  - [DarkenInput](#darkeninput)
  - [GenerateAlphaScale](#generatealphascale)
  - [GenerateAlphaScaleInput](#generatealphascaleinput)
  - [GenerateNeutralScale](#generateneutralscale)
  - [GenerateNeutralScaleInput](#generateneutralscaleinput)
  - [GenerateScale](#generatescale)
  - [GenerateScaleInput](#generatescaleinput)
  - [HexColor](#hexcolor)
  - [HexColorInput](#hexcolorinput)
  - [HexColorScale12](#hexcolorscale12)
  - [HexToOklch](#hextooklch)
  - [HexToRgb](#hextorgb)
  - [Lighten](#lighten)
  - [LightenInput](#lighteninput)
  - [MixColors](#mixcolors)
  - [MixColorsInput](#mixcolorsinput)
  - [NormalizeHexColor](#normalizehexcolor)
  - [OklchChroma](#oklchchroma)
  - [OklchColor](#oklchcolor)
  - [OklchCoordinate](#oklchcoordinate)
  - [OklchHue](#oklchhue)
  - [OklchInput](#oklchinput)
  - [OklchLightness](#oklchlightness)
  - [OklchToHex](#oklchtohex)
  - [OklchToRgb](#oklchtorgb)
  - [Rgb](#rgb)
  - [RgbChannel](#rgbchannel)
  - [RgbInput](#rgbinput)
  - [RgbInputChannel](#rgbinputchannel)
  - [RgbToHex](#rgbtohex)
  - [RgbToOklch](#rgbtooklch)
  - [RgbaColorString](#rgbacolorstring)
  - [WithAlpha](#withalpha)
  - [WithAlphaInput](#withalphainput)
---

# validation

## ColorAmount

Color adjustment schemas.

**Signature**

```ts
declare const ColorAmount: AnnotatedSchema<brand<Finite, "ColorAmount">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L17)

Since v0.0.0

## Darken

Color adjustment schemas.

**Signature**

```ts
declare const Darken: AnnotatedSchema<decodeTo<AnnotatedSchema<brand<String, "HexColor">>, typeof DarkenInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L18)

Since v0.0.0

## DarkenInput

Color adjustment schemas.

**Signature**

```ts
declare const DarkenInput: typeof DarkenInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L19)

Since v0.0.0

## GenerateAlphaScale

Color scale schemas.

**Signature**

```ts
declare const GenerateAlphaScale: AnnotatedSchema<decodeTo<AnnotatedSchema<brand<$Array<AnnotatedSchema<brand<String, "HexColor">>>, "HexColorScale12">>, typeof GenerateAlphaScaleInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L56)

Since v0.0.0

## GenerateAlphaScaleInput

Color scale schemas.

**Signature**

```ts
declare const GenerateAlphaScaleInput: typeof GenerateAlphaScaleInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L57)

Since v0.0.0

## GenerateNeutralScale

Color scale schemas.

**Signature**

```ts
declare const GenerateNeutralScale: AnnotatedSchema<decodeTo<AnnotatedSchema<brand<$Array<AnnotatedSchema<brand<String, "HexColor">>>, "HexColorScale12">>, typeof GenerateNeutralScaleInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L58)

Since v0.0.0

## GenerateNeutralScaleInput

Color scale schemas.

**Signature**

```ts
declare const GenerateNeutralScaleInput: typeof GenerateNeutralScaleInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L59)

Since v0.0.0

## GenerateScale

Color scale schemas.

**Signature**

```ts
declare const GenerateScale: AnnotatedSchema<decodeTo<AnnotatedSchema<brand<$Array<AnnotatedSchema<brand<String, "HexColor">>>, "HexColorScale12">>, typeof GenerateScaleInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L60)

Since v0.0.0

## GenerateScaleInput

Color scale schemas.

**Signature**

```ts
declare const GenerateScaleInput: typeof GenerateScaleInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L61)

Since v0.0.0

## HexColor

Hex color schemas.

**Signature**

```ts
declare const HexColor: AnnotatedSchema<brand<String, "HexColor">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L34)

Since v0.0.0

## HexColorInput

Hex color schemas.

**Signature**

```ts
declare const HexColorInput: AnnotatedSchema<String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L34)

Since v0.0.0

## HexColorScale12

Color scale schemas.

**Signature**

```ts
declare const HexColorScale12: AnnotatedSchema<brand<$Array<AnnotatedSchema<brand<String, "HexColor">>>, "HexColorScale12">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L62)

Since v0.0.0

## HexToOklch

Color conversion schemas.

**Signature**

```ts
declare const HexToOklch: AnnotatedSchema<decodeTo<typeof OklchColor, decodeTo<AnnotatedSchema<brand<String, "HexColor">>, String & SchemaStatics<String>, never, never> & SchemaStatics<decodeTo<AnnotatedSchema<brand<String, "HexColor">>, String & SchemaStatics<String>, never, never>>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L70)

Since v0.0.0

## HexToRgb

Color conversion schemas.

**Signature**

```ts
declare const HexToRgb: AnnotatedSchema<decodeTo<typeof Rgb, decodeTo<AnnotatedSchema<brand<String, "HexColor">>, String & SchemaStatics<String>, never, never> & SchemaStatics<decodeTo<AnnotatedSchema<brand<String, "HexColor">>, String & SchemaStatics<String>, never, never>>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L70)

Since v0.0.0

## Lighten

Color adjustment schemas.

**Signature**

```ts
declare const Lighten: AnnotatedSchema<decodeTo<AnnotatedSchema<brand<String, "HexColor">>, typeof LightenInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L20)

Since v0.0.0

## LightenInput

Color adjustment schemas.

**Signature**

```ts
declare const LightenInput: typeof LightenInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L21)

Since v0.0.0

## MixColors

Color adjustment schemas.

**Signature**

```ts
declare const MixColors: AnnotatedSchema<decodeTo<AnnotatedSchema<brand<String, "HexColor">>, typeof MixColorsInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L22)

Since v0.0.0

## MixColorsInput

Color adjustment schemas.

**Signature**

```ts
declare const MixColorsInput: typeof MixColorsInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L23)

Since v0.0.0

## NormalizeHexColor

Hex color schemas.

**Signature**

```ts
declare const NormalizeHexColor: AnnotatedSchema<decodeTo<AnnotatedSchema<brand<String, "HexColor">>, String & SchemaStatics<String>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L34)

Since v0.0.0

## OklchChroma

OKLCH color schemas.

**Signature**

```ts
declare const OklchChroma: AnnotatedSchema<brand<brand<Finite, "OklchCoordinate">, "OklchChroma">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L41)

Since v0.0.0

## OklchColor

OKLCH color schemas.

**Signature**

```ts
declare const OklchColor: typeof OklchColor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L41)

Since v0.0.0

## OklchCoordinate

OKLCH color schemas.

**Signature**

```ts
declare const OklchCoordinate: AnnotatedSchema<brand<Finite, "OklchCoordinate">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L41)

Since v0.0.0

## OklchHue

OKLCH color schemas.

**Signature**

```ts
declare const OklchHue: AnnotatedSchema<brand<brand<Finite, "OklchCoordinate">, "OklchHue">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L41)

Since v0.0.0

## OklchInput

OKLCH color schemas.

**Signature**

```ts
declare const OklchInput: typeof OklchInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L41)

Since v0.0.0

## OklchLightness

OKLCH color schemas.

**Signature**

```ts
declare const OklchLightness: AnnotatedSchema<brand<brand<Finite, "OklchCoordinate">, "OklchLightness">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L41)

Since v0.0.0

## OklchToHex

Color conversion schemas.

**Signature**

```ts
declare const OklchToHex: AnnotatedSchema<decodeTo<AnnotatedSchema<brand<String, "HexColor">>, typeof OklchInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L70)

Since v0.0.0

## OklchToRgb

Color conversion schemas.

**Signature**

```ts
declare const OklchToRgb: AnnotatedSchema<decodeTo<typeof RgbInput, typeof OklchInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L70)

Since v0.0.0

## Rgb

RGB color schemas.

**Signature**

```ts
declare const Rgb: typeof Rgb
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L48)

Since v0.0.0

## RgbChannel

RGB color schemas.

**Signature**

```ts
declare const RgbChannel: AnnotatedSchema<brand<brand<Finite, "RgbInputChannel">, "RgbChannel">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L48)

Since v0.0.0

## RgbInput

RGB color schemas.

**Signature**

```ts
declare const RgbInput: typeof RgbInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L48)

Since v0.0.0

## RgbInputChannel

RGB color schemas.

**Signature**

```ts
declare const RgbInputChannel: AnnotatedSchema<brand<Finite, "RgbInputChannel">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L48)

Since v0.0.0

## RgbToHex

Color conversion schemas.

**Signature**

```ts
declare const RgbToHex: AnnotatedSchema<decodeTo<AnnotatedSchema<brand<String, "HexColor">>, typeof RgbInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L70)

Since v0.0.0

## RgbToOklch

Color conversion schemas.

**Signature**

```ts
declare const RgbToOklch: AnnotatedSchema<decodeTo<typeof OklchColor, typeof Rgb, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L70)

Since v0.0.0

## RgbaColorString

Color adjustment schemas.

**Signature**

```ts
declare const RgbaColorString: AnnotatedSchema<brand<String, "RgbaColorString">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L24)

Since v0.0.0

## WithAlpha

Color adjustment schemas.

**Signature**

```ts
declare const WithAlpha: AnnotatedSchema<decodeTo<AnnotatedSchema<brand<String, "RgbaColorString">>, typeof WithAlphaInput, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L25)

Since v0.0.0

## WithAlphaInput

Color adjustment schemas.

**Signature**

```ts
declare const WithAlphaInput: typeof WithAlphaInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.ts#L26)

Since v0.0.0