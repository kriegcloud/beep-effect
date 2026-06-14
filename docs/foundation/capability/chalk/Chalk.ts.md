---
title: Chalk.ts
nav_order: 1
parent: "@beep/chalk"
---

## Chalk.ts overview

Chalk-compatible terminal string styling with schema-backed public models.

Provides a chainable builder API for applying ANSI colors, background colors,
and text modifiers to terminal output. All color and modifier names are
validated by Effect Schemas, and isolated instances can be created with
explicit color support levels.

**Example**

```ts
import chalk, { Chalk, chalkStderr } from "@beep/chalk"

// Default shared instance (stdout)
console.log(chalk.red.bold("Error!"))

// Isolated instance with explicit color level
const c = new Chalk({ level: 3 })
console.log(c.hex("#FF8800").underline("Warning"))

// stderr instance
console.log(chalkStderr.yellow("stderr warning"))
```

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [Chalk](#chalk)
- [models](#models)
  - [BackgroundColorName (type alias)](#backgroundcolorname-type-alias)
  - [Chalk (type alias)](#chalk-type-alias)
  - [ChalkConstructorOptions (type alias)](#chalkconstructoroptions-type-alias)
  - [ChalkInstance (interface)](#chalkinstance-interface)
  - [ChalkOptions (type alias)](#chalkoptions-type-alias)
  - [ColorInfo (type alias)](#colorinfo-type-alias)
  - [ColorName (type alias)](#colorname-type-alias)
  - [ColorSupport (type alias)](#colorsupport-type-alias)
  - [ColorSupportLevel (type alias)](#colorsupportlevel-type-alias)
  - [ColorSupportLevelInput (type alias)](#colorsupportlevelinput-type-alias)
  - [ForegroundColorName (type alias)](#foregroundcolorname-type-alias)
  - [ModifierName (type alias)](#modifiername-type-alias)
- [schemas](#schemas)
  - [BackgroundColorName](#backgroundcolorname)
  - [ChalkConstructorOptions](#chalkconstructoroptions)
  - [ChalkOptions](#chalkoptions)
  - [ColorInfo](#colorinfo)
  - [ColorName](#colorname)
  - [ColorSupport](#colorsupport)
  - [ColorSupportLevel](#colorsupportlevel)
  - [ColorSupportLevelInput](#colorsupportlevelinput)
  - [ForegroundColorName](#foregroundcolorname)
  - [ModifierName](#modifiername)
- [utilities](#utilities)
  - [backgroundColorNames](#backgroundcolornames)
  - [backgroundColors](#backgroundcolors)
  - [chalkStderr](#chalkstderr)
  - [colorNames](#colornames)
  - [colors](#colors)
  - [foregroundColorNames](#foregroundcolornames)
  - [foregroundColors](#foregroundcolors)
  - [modifierNames](#modifiernames)
  - [modifiers](#modifiers)
  - [supportsColor](#supportscolor)
  - [supportsColorStderr](#supportscolorstderr)
---

# constructors

## Chalk

Constructor for creating isolated Chalk instances.

Each instance maintains its own `level` so color output can be controlled
independently of the shared default. Pass `{ level: 0 }` to disable colors,
or `{ level: 3 }` for full truecolor support.

**Example**

```ts
import { Chalk } from "@beep/chalk"

// Truecolor instance
const truecolor = new Chalk({ level: 3 })
console.log(truecolor.hex("#FF0000")("red text"))

// Disabled instance (no ANSI output)
const plain = new Chalk({ level: 0 })
console.log(plain.red("no color")) // "no color"

// Default detection
console.log(new Chalk().level)
```

**Signature**

```ts
declare const Chalk: typeof ChalkValue
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L148)

Since v0.0.0

# models

## BackgroundColorName (type alias)

A supported Chalk background color name literal.

**Example**

```ts
import type { BackgroundColorName } from "@beep/chalk"

const bg: BackgroundColorName = "bgRed"
```

**Signature**

```ts
type BackgroundColorName = BackgroundColorNameDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L183)

Since v0.0.0

## Chalk (type alias)

An isolated Chalk instance with its own color support level.

Construct via `new Chalk()` or `new Chalk({ level })` to get an instance
whose `level` is independent from the shared default.

**Example**

```ts
import { Chalk } from "@beep/chalk"

const c: Chalk = new Chalk({ level: 3 })
console.log(c.green.bold("Success"))
```

**Signature**

```ts
type Chalk = ChalkValue
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L120)

Since v0.0.0

## ChalkConstructorOptions (type alias)

Constructor options accepted by `Chalk`.

Derived from the encoded side of `ChalkConstructorOptions`, so object
literals and broad numeric inputs remain compatible with `new Chalk(...)`.

**Example**

```ts
import { Chalk, type ChalkConstructorOptions } from "@beep/chalk"

const options: ChalkConstructorOptions = { level: 3 }
console.log(new Chalk(options).level)
```

**Signature**

```ts
type ChalkConstructorOptions = ChalkConstructorOptionsType
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L222)

Since v0.0.0

## ChalkInstance (interface)

Recursive callable Chalk builder surface.

A `ChalkInstance` is both a callable function and a chainable style builder.
Accessing style properties (e.g. `.red`, `.bold`) returns a new builder with
the style stacked, and calling it as a function applies all stacked styles to
the given text.

**Example**

```ts
import chalk, { type ChalkInstance } from "@beep/chalk"

// Chain styles, then call to apply
const warning: ChalkInstance = chalk.yellow.bold
console.log(warning("Caution!"))

// Inline chaining
console.log(chalk.red.bgWhite.underline("Error"))

// Hex, RGB, and ANSI256
console.log(chalk.hex("#FF8800")("orange text"))
console.log(chalk.rgb(255, 136, 0)("orange text"))
console.log(chalk.ansi256(208)("orange text"))
```

**Signature**

```ts
export interface ChalkInstance extends ChalkInstanceSurface {
  (...text: ReadonlyArray<unknown>): string;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L87)

Since v0.0.0

## ChalkOptions (type alias)

Constructor options for creating an isolated Chalk instance.

**Example**

```ts
import type { ChalkOptions } from "@beep/chalk"

const opts: ChalkOptions = { level: 3 }
```

**Signature**

```ts
type ChalkOptions = ChalkOptionsDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L257)

Since v0.0.0

## ColorInfo (type alias)

Detected color support information, or `false` when color output is disabled.

**Example**

```ts
import type { ColorInfo } from "@beep/chalk"

const info: ColorInfo = false
```

**Signature**

```ts
type ColorInfo = ColorInfoDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L294)

Since v0.0.0

## ColorName (type alias)

A supported Chalk color name literal (foreground or background).

**Example**

```ts
import type { ColorName } from "@beep/chalk"

const name: ColorName = "red"
```

**Signature**

```ts
type ColorName = ColorNameDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L329)

Since v0.0.0

## ColorSupport (type alias)

Detected terminal color support capabilities for an output stream.

**Example**

```ts
import type { ColorSupport } from "@beep/chalk"

const support: ColorSupport = { level: 3, hasBasic: true, has256: true, has16m: true }
```

**Signature**

```ts
type ColorSupport = ColorSupportDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L369)

Since v0.0.0

## ColorSupportLevel (type alias)

A Chalk color support level: `0` | `1` | `2` | `3`.

**Example**

```ts
import type { ColorSupportLevel } from "@beep/chalk"

const level: ColorSupportLevel = 3
```

**Signature**

```ts
type ColorSupportLevel = ColorSupportLevelDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L403)

Since v0.0.0

## ColorSupportLevelInput (type alias)

Broad numeric color support level input accepted by constructor boundaries.

**Example**

```ts
import type { ColorSupportLevelInput } from "@beep/chalk"

const level: ColorSupportLevelInput = 3
```

**Signature**

```ts
type ColorSupportLevelInput = typeof ColorSupportLevelInputDefinition.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L438)

Since v0.0.0

## ForegroundColorName (type alias)

A supported Chalk foreground color name literal.

**Example**

```ts
import type { ForegroundColorName } from "@beep/chalk"

const fg: ForegroundColorName = "cyanBright"
```

**Signature**

```ts
type ForegroundColorName = ForegroundColorNameDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L473)

Since v0.0.0

## ModifierName (type alias)

A supported Chalk text modifier name literal.

**Example**

```ts
import type { ModifierName } from "@beep/chalk"

const mod: ModifierName = "bold"
```

**Signature**

```ts
type ModifierName = ModifierNameDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L508)

Since v0.0.0

# schemas

## BackgroundColorName

Schema for supported Chalk background color names.

A `LiteralKit` schema accepting values like `"bgRed"`, `"bgBlue"`,
`"bgGreenBright"`, etc.

**Example**

```ts
import { BackgroundColorName } from "@beep/chalk"
import * as S from "effect/Schema"

const decode = S.decodeUnknownSync(BackgroundColorName)
console.log(decode("bgRed"))
```

**Signature**

```ts
declare const BackgroundColorName: AnnotatedSchema<LiteralKit<readonly ["bgBlack", "bgRed", "bgGreen", "bgYellow", "bgBlue", "bgMagenta", "bgCyan", "bgWhite", "bgGray", "bgGrey", "bgBlackBright", "bgRedBright", "bgGreenBright", "bgYellowBright", "bgBlueBright", "bgMagentaBright", "bgCyanBright", "bgWhiteBright"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L168)

Since v0.0.0

## ChalkConstructorOptions

Schema for constructor options accepted by `Chalk`.

This schema keeps constructor input plain-object compatible while validating
that `level`, when provided, is an integer from `0` through `3`.

**Example**

```ts
import { ChalkConstructorOptions } from "@beep/chalk"
import * as S from "effect/Schema"

const decode = S.decodeUnknownSync(ChalkConstructorOptions)
console.log(decode({ level: 3 }))
```

**Signature**

```ts
declare const ChalkConstructorOptions: typeof ChalkConstructorOptionsModel
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L203)

Since v0.0.0

## ChalkOptions

Schema for constructor options accepted by `Chalk`.

Contains an optional `level` field that sets the color support level
(`0` through `3`).

**Example**

```ts
import { ChalkOptions } from "@beep/chalk"
import * as S from "effect/Schema"

const decode = S.decodeUnknownSync(ChalkOptions)
console.log(decode({ level: 2 }))
```

**Signature**

```ts
declare const ChalkOptions: typeof ChalkOptionsDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L242)

Since v0.0.0

## ColorInfo

Schema for detected color support information.

Decodes to either a `ColorSupport` object when color output is
available, or `false` when it is disabled.

**Example**

```ts
import { ColorInfo, supportsColor } from "@beep/chalk"

const info: ColorInfo = supportsColor
if (info !== false) {


}
```

**Signature**

```ts
declare const ColorInfo: AnnotatedSchema<Union<readonly [typeof ColorSupportDefinition, Literal<false>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L279)

Since v0.0.0

## ColorName

Schema for all supported Chalk color names (foreground and background).

Union of `ForegroundColorName` and `BackgroundColorName` values.

**Example**

```ts
import { ColorName } from "@beep/chalk"
import * as S from "effect/Schema"

const decode = S.decodeUnknownSync(ColorName)
console.log(decode("red"))
console.log(decode("bgBlue"))
```

**Signature**

```ts
declare const ColorName: AnnotatedSchema<LiteralKit<readonly ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "gray", "grey", "blackBright", "redBright", "greenBright", "yellowBright", "blueBright", "magentaBright", "cyanBright", "whiteBright", "bgBlack", "bgRed", "bgGreen", "bgYellow", "bgBlue", "bgMagenta", "bgCyan", "bgWhite", "bgGray", "bgGrey", "bgBlackBright", "bgRedBright", "bgGreenBright", "bgYellowBright", "bgBlueBright", "bgMagentaBright", "bgCyanBright", "bgWhiteBright"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L314)

Since v0.0.0

## ColorSupport

Schema for terminal color support metadata.

Describes the detected capabilities of an output stream: whether it supports
basic ANSI, 256-color, and truecolor (16 million) modes.

**Example**

```ts
import { ColorSupport } from "@beep/chalk"
import * as S from "effect/Schema"

const decode = S.decodeUnknownSync(ColorSupport)
console.log(decode({
  level: 3,
  hasBasic: true,
  has256: true,
  has16m: true
}))
```

**Signature**

```ts
declare const ColorSupport: typeof ColorSupportDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L354)

Since v0.0.0

## ColorSupportLevel

Schema for Chalk color support levels.

Accepts `0` (disabled), `1` (basic ANSI), `2` (ANSI 256), or `3` (truecolor).

**Example**

```ts
import { ColorSupportLevel } from "@beep/chalk"
import * as S from "effect/Schema"

const decode = S.decodeUnknownSync(ColorSupportLevel)
console.log(decode(3))
```

**Signature**

```ts
declare const ColorSupportLevel: AnnotatedSchema<LiteralKit<readonly [0, 1, 2, 3], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L388)

Since v0.0.0

## ColorSupportLevelInput

Schema for broad numeric color support level input at constructor boundaries.

This accepts `number` at the type level and validates that runtime values are
integer levels from `0` through `3`.

**Example**

```ts
import { ColorSupportLevelInput } from "@beep/chalk"
import * as S from "effect/Schema"

const decode = S.decodeUnknownSync(ColorSupportLevelInput)
console.log(decode(2))
```

**Signature**

```ts
declare const ColorSupportLevelInput: AnnotatedSchema<Int>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L423)

Since v0.0.0

## ForegroundColorName

Schema for supported Chalk foreground color names.

A `LiteralKit` schema accepting values like `"red"`, `"blue"`,
`"greenBright"`, etc.

**Example**

```ts
import { ForegroundColorName } from "@beep/chalk"
import * as S from "effect/Schema"

const decode = S.decodeUnknownSync(ForegroundColorName)
console.log(decode("cyanBright"))
```

**Signature**

```ts
declare const ForegroundColorName: AnnotatedSchema<LiteralKit<readonly ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "gray", "grey", "blackBright", "redBright", "greenBright", "yellowBright", "blueBright", "magentaBright", "cyanBright", "whiteBright"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L458)

Since v0.0.0

## ModifierName

Schema for supported Chalk text modifier names.

A `LiteralKit` schema accepting values like `"bold"`, `"italic"`,
`"underline"`, `"strikethrough"`, etc.

**Example**

```ts
import { ModifierName } from "@beep/chalk"
import * as S from "effect/Schema"

const decode = S.decodeUnknownSync(ModifierName)
console.log(decode("bold"))
```

**Signature**

```ts
declare const ModifierName: AnnotatedSchema<LiteralKit<readonly ["reset", "bold", "dim", "italic", "underline", "overline", "inverse", "hidden", "strikethrough"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L493)

Since v0.0.0

# utilities

## backgroundColorNames

Readonly tuple of all supported background color name strings.

**Example**

```ts
import { backgroundColorNames } from "@beep/chalk"

for (const name of backgroundColorNames) {

}
```

**Signature**

```ts
declare const backgroundColorNames: readonly ["bgBlack", "bgRed", "bgGreen", "bgYellow", "bgBlue", "bgMagenta", "bgCyan", "bgWhite", "bgGray", "bgGrey", "bgBlackBright", "bgRedBright", "bgGreenBright", "bgYellowBright", "bgBlueBright", "bgMagentaBright", "bgCyanBright", "bgWhiteBright"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L559)

Since v0.0.0

## backgroundColors

Alias for `backgroundColorNames` preserved for Chalk API compatibility.

**Example**

```ts
import { backgroundColors } from "@beep/chalk"

console.log(backgroundColors) // same as backgroundColorNames
```

**Signature**

```ts
declare const backgroundColors: readonly ["bgBlack", "bgRed", "bgGreen", "bgYellow", "bgBlue", "bgMagenta", "bgCyan", "bgWhite", "bgGray", "bgGrey", "bgBlackBright", "bgRedBright", "bgGreenBright", "bgYellowBright", "bgBlueBright", "bgMagentaBright", "bgCyanBright", "bgWhiteBright"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L621)

Since v0.0.0

## chalkStderr

Shared Chalk instance configured from stderr color support detection.

Use this when writing styled output to `process.stderr`.

**Example**

```ts
import { chalkStderr } from "@beep/chalk"

process.stderr.write(chalkStderr.red.bold("Error!") + "\n")
```

**Signature**

```ts
declare const chalkStderr: ChalkInstance
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L702)

Since v0.0.0

## colorNames

Readonly tuple of all supported color name strings (foreground and background).

**Example**

```ts
import { colorNames } from "@beep/chalk"

for (const name of colorNames) {

}
```

**Signature**

```ts
declare const colorNames: readonly ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "gray", "grey", "blackBright", "redBright", "greenBright", "yellowBright", "blueBright", "magentaBright", "cyanBright", "whiteBright", "bgBlack", "bgRed", "bgGreen", "bgYellow", "bgBlue", "bgMagenta", "bgCyan", "bgWhite", "bgGray", "bgGrey", "bgBlackBright", "bgRedBright", "bgGreenBright", "bgYellowBright", "bgBlueBright", "bgMagentaBright", "bgCyanBright", "bgWhiteBright"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L576)

Since v0.0.0

## colors

Alias for `colorNames` preserved for Chalk API compatibility.

**Example**

```ts
import { colors } from "@beep/chalk"

console.log(colors) // same as colorNames
```

**Signature**

```ts
declare const colors: readonly ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "gray", "grey", "blackBright", "redBright", "greenBright", "yellowBright", "blueBright", "magentaBright", "cyanBright", "whiteBright", "bgBlack", "bgRed", "bgGreen", "bgYellow", "bgBlue", "bgMagenta", "bgCyan", "bgWhite", "bgGray", "bgGrey", "bgBlackBright", "bgRedBright", "bgGreenBright", "bgYellowBright", "bgBlueBright", "bgMagentaBright", "bgCyanBright", "bgWhiteBright"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L636)

Since v0.0.0

## foregroundColorNames

Readonly tuple of all supported foreground color name strings.

**Example**

```ts
import { foregroundColorNames } from "@beep/chalk"

for (const name of foregroundColorNames) {

}
```

**Signature**

```ts
declare const foregroundColorNames: readonly ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "gray", "grey", "blackBright", "redBright", "greenBright", "yellowBright", "blueBright", "magentaBright", "cyanBright", "whiteBright"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L542)

Since v0.0.0

## foregroundColors

Alias for `foregroundColorNames` preserved for Chalk API compatibility.

**Example**

```ts
import { foregroundColors } from "@beep/chalk"

console.log(foregroundColors) // same as foregroundColorNames
```

**Signature**

```ts
declare const foregroundColors: readonly ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "gray", "grey", "blackBright", "redBright", "greenBright", "yellowBright", "blueBright", "magentaBright", "cyanBright", "whiteBright"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L606)

Since v0.0.0

## modifierNames

Readonly tuple of all supported modifier name strings.

**Example**

```ts
import { modifierNames } from "@beep/chalk"

for (const name of modifierNames) {

}
```

**Signature**

```ts
declare const modifierNames: readonly ["reset", "bold", "dim", "italic", "underline", "overline", "inverse", "hidden", "strikethrough"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L525)

Since v0.0.0

## modifiers

Alias for `modifierNames` preserved for Chalk API compatibility.

**Example**

```ts
import { modifiers } from "@beep/chalk"

console.log(modifiers) // same as modifierNames
```

**Signature**

```ts
declare const modifiers: readonly ["reset", "bold", "dim", "italic", "underline", "overline", "inverse", "hidden", "strikethrough"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L591)

Since v0.0.0

## supportsColor

Color support detected for stdout in the current Node.js runtime.

Returns a `ColorSupport` object when the terminal supports color, or
`false` when color output is not available.

**Example**

```ts
import { supportsColor } from "@beep/chalk"

if (supportsColor !== false) {


}
```

**Signature**

```ts
declare const supportsColor: false | ColorSupportDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L657)

Since v0.0.0

## supportsColorStderr

Color support detected for stderr in the current Node.js runtime.

Returns a `ColorSupport` object when the terminal supports color on
stderr, or `false` when color output is not available.

**Example**

```ts
import { supportsColorStderr } from "@beep/chalk"

if (supportsColorStderr !== false) {

}
```

**Signature**

```ts
declare const supportsColorStderr: false | ColorSupportDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/chalk/src/Chalk.ts#L677)

Since v0.0.0