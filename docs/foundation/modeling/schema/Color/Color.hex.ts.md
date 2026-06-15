---
title: Color.hex.ts
nav_order: 13
parent: "@beep/schema"
---

## Color.hex.ts overview

Hex color schemas and helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [HexColor (type alias)](#hexcolor-type-alias)
  - [HexColorInput (type alias)](#hexcolorinput-type-alias)
  - [NormalizeHexColor (type alias)](#normalizehexcolor-type-alias)
- [validation](#validation)
  - [HexColor](#hexcolor)
  - [HexColorInput](#hexcolorinput)
  - [NormalizeHexColor](#normalizehexcolor)
---

# models

## HexColor (type alias)

Type for `HexColor`.

**Signature**

```ts
type HexColor = typeof HexColor.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.hex.ts#L156)

Since v0.0.0

## HexColorInput (type alias)

Type for `HexColorInput`.

**Signature**

```ts
type HexColorInput = typeof HexColorInput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.hex.ts#L126)

Since v0.0.0

## NormalizeHexColor (type alias)

Type for `NormalizeHexColor`.

**Signature**

```ts
type NormalizeHexColor = typeof NormalizeHexColor.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.hex.ts#L192)

Since v0.0.0

# validation

## HexColor

Canonical lowercase six-digit hex color schema.

**Example**

```ts
import { HexColor } from "@beep/schema/Color"
import * as S from "effect/Schema"

const color = S.decodeUnknownSync(HexColor)("#33bbff")
console.log(color)
```

**Signature**

```ts
declare const HexColor: AnnotatedSchema<S.brand<S.String, "HexColor">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.hex.ts#L143)

Since v0.0.0

## HexColorInput

Boundary schema for hex color input strings.

**Example**

```ts
import { HexColorInput } from "@beep/schema/Color"
import * as S from "effect/Schema"

const input = S.decodeUnknownSync(HexColorInput)("#3bf")
console.log(input)
```

**Signature**

```ts
declare const HexColorInput: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.hex.ts#L114)

Since v0.0.0

## NormalizeHexColor

Canonicalization schema from boundary hex input to canonical hex output.

**Example**

```ts
import { NormalizeHexColor } from "@beep/schema/Color"
import * as S from "effect/Schema"

const color = S.decodeUnknownSync(NormalizeHexColor)("#3bf")
console.log(color)
```

**Signature**

```ts
declare const NormalizeHexColor: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.String, "HexColor">>, S.String & SchemaStatics<S.String>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Color/Color.hex.ts#L173)

Since v0.0.0