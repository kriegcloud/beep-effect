/**
 * Internal schema definitions and literal domains for Chalk.
 *
 * @module
 * @since 0.0.0
 */

import { $ChalkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ChalkId.create("Domain");

/**
 * Supported numeric color support levels.
 *
 * @example
 * ```ts
 * import { colorSupportLevelValues } from "@beep/chalk/Chalk"
 *
 * const truecolorLevel = colorSupportLevelValues[3]
 * console.log(truecolorLevel)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const colorSupportLevelValues = [0, 1, 2, 3] as const;

/**
 * Supported modifier style names.
 *
 * @example
 * ```ts
 * import { modifierNameValues } from "@beep/chalk/Chalk"
 *
 * const bold = modifierNameValues[1]
 * console.log(bold)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const modifierNameValues = [
  "reset",
  "bold",
  "dim",
  "italic",
  "underline",
  "overline",
  "inverse",
  "hidden",
  "strikethrough",
] as const;

/**
 * Supported foreground color names.
 *
 * @example
 * ```ts
 * import { foregroundColorNameValues } from "@beep/chalk/Chalk"
 *
 * const red = foregroundColorNameValues[1]
 * console.log(red)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const foregroundColorNameValues = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "gray",
  "grey",
  "blackBright",
  "redBright",
  "greenBright",
  "yellowBright",
  "blueBright",
  "magentaBright",
  "cyanBright",
  "whiteBright",
] as const;

/**
 * Supported background color names.
 *
 * @example
 * ```ts
 * import { backgroundColorNameValues } from "@beep/chalk/Chalk"
 *
 * const red = backgroundColorNameValues[1]
 * console.log(red)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const backgroundColorNameValues = [
  "bgBlack",
  "bgRed",
  "bgGreen",
  "bgYellow",
  "bgBlue",
  "bgMagenta",
  "bgCyan",
  "bgWhite",
  "bgGray",
  "bgGrey",
  "bgBlackBright",
  "bgRedBright",
  "bgGreenBright",
  "bgYellowBright",
  "bgBlueBright",
  "bgMagentaBright",
  "bgCyanBright",
  "bgWhiteBright",
] as const;

/**
 * Supported foreground and background color names.
 *
 * @example
 * ```ts
 * import { colorNameValues } from "@beep/chalk/Chalk"
 *
 * const colorName = colorNameValues[0]
 * console.log(colorName)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const colorNameValues = [...foregroundColorNameValues, ...backgroundColorNameValues] as const;

/**
 * Supported Chalk color support levels.
 *
 * @example
 * ```ts
 * import { ColorSupportLevel } from "@beep/chalk"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ColorSupportLevel)
 * console.log(decode(3))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ColorSupportLevel = LiteralKit(colorSupportLevelValues).pipe(
  $I.annoteSchema("ColorSupportLevel", {
    description:
      "Supported terminal color support levels: 0 disables colors, 1 enables ANSI colors, 2 enables ANSI256, and 3 enables truecolor.",
  })
);

/**
 * Runtime type for {@link ColorSupportLevel}.
 *
 * @example
 * ```ts
 * import type { ColorSupportLevel } from "@beep/chalk"
 *
 * const level: ColorSupportLevel = 2
 * void level
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ColorSupportLevel = typeof ColorSupportLevel.Type;

/**
 * Color support metadata for an enabled Chalk output stream.
 *
 * @example
 * ```ts
 * import { ColorSupport } from "@beep/chalk"
 *
 * const support = new ColorSupport({ has16m: true, has256: true, hasBasic: true, level: 3 })
 * console.log(support.level)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ColorSupport extends S.Class<ColorSupport>($I`ColorSupport`)(
  {
    level: ColorSupportLevel,
    hasBasic: S.Boolean,
    has256: S.Boolean,
    has16m: S.Boolean,
  },
  $I.annote("ColorSupport", {
    description: "Detected terminal color support metadata for a Chalk output stream.",
  })
) {}

/**
 * Schema for exported Chalk color support info values.
 *
 * @example
 * ```ts
 * import { ColorInfo } from "@beep/chalk"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ColorInfo)
 * console.log(decode(false))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ColorInfo = S.Union([ColorSupport, S.Literal(false)]).pipe(
  $I.annoteSchema("ColorInfo", {
    description: "Detected terminal color support information, or `false` when color output is disabled.",
  })
);

/**
 * Runtime type for {@link ColorInfo}.
 *
 * @example
 * ```ts
 * import type { ColorInfo } from "@beep/chalk"
 *
 * const info: ColorInfo = false
 * void info
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ColorInfo = typeof ColorInfo.Type;

/**
 * Constructor options for isolated Chalk instances.
 *
 * @example
 * ```ts
 * import { ChalkOptions } from "@beep/chalk"
 *
 * const options = new ChalkOptions({ level: 3 })
 * console.log(options.level)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ChalkOptions extends S.Class<ChalkOptions>($I`ChalkOptions`)(
  {
    level: S.optionalKey(ColorSupportLevel),
  },
  $I.annote("ChalkOptions", {
    description: "Configuration for constructing an isolated Chalk instance with an explicit color support level.",
  })
) {}

/**
 * Supported Chalk modifier names.
 *
 * @example
 * ```ts
 * import { ModifierName } from "@beep/chalk"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ModifierName)
 * console.log(decode("bold"))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ModifierName = LiteralKit(modifierNameValues).pipe(
  $I.annoteSchema("ModifierName", {
    description: "Supported Chalk modifier names.",
  })
);

/**
 * Runtime type for {@link ModifierName}.
 *
 * @example
 * ```ts
 * import type { ModifierName } from "@beep/chalk"
 *
 * const name: ModifierName = "italic"
 * void name
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ModifierName = typeof ModifierName.Type;

/**
 * Supported Chalk foreground color names.
 *
 * @example
 * ```ts
 * import { ForegroundColorName } from "@beep/chalk"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ForegroundColorName)
 * console.log(decode("green"))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ForegroundColorName = LiteralKit(foregroundColorNameValues).pipe(
  $I.annoteSchema("ForegroundColorName", {
    description: "Supported Chalk foreground color names.",
  })
);

/**
 * Runtime type for {@link ForegroundColorName}.
 *
 * @example
 * ```ts
 * import type { ForegroundColorName } from "@beep/chalk"
 *
 * const name: ForegroundColorName = "cyan"
 * void name
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ForegroundColorName = typeof ForegroundColorName.Type;

/**
 * Supported Chalk background color names.
 *
 * @example
 * ```ts
 * import { BackgroundColorName } from "@beep/chalk"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(BackgroundColorName)
 * console.log(decode("bgBlue"))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const BackgroundColorName = LiteralKit(backgroundColorNameValues).pipe(
  $I.annoteSchema("BackgroundColorName", {
    description: "Supported Chalk background color names.",
  })
);

/**
 * Runtime type for {@link BackgroundColorName}.
 *
 * @example
 * ```ts
 * import type { BackgroundColorName } from "@beep/chalk"
 *
 * const name: BackgroundColorName = "bgMagenta"
 * void name
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BackgroundColorName = typeof BackgroundColorName.Type;

/**
 * Supported Chalk color names.
 *
 * @example
 * ```ts
 * import { ColorName } from "@beep/chalk"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(ColorName)
 * console.log(decode("red"))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ColorName = LiteralKit(colorNameValues).pipe(
  $I.annoteSchema("ColorName", {
    description: "Supported Chalk foreground and background color names.",
  })
);

/**
 * Runtime type for {@link ColorName}.
 *
 * @example
 * ```ts
 * import type { ColorName } from "@beep/chalk"
 *
 * const name: ColorName = "bgYellow"
 * void name
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ColorName = typeof ColorName.Type;
