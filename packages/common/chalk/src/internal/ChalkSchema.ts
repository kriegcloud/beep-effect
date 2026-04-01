import { $ChalkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ChalkId.create("Domain");

export const colorSupportLevelValues = [0, 1, 2, 3] as const;

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

export const colorNameValues = [...foregroundColorNameValues, ...backgroundColorNameValues] as const;

/**
 * Supported Chalk color support levels.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
 */
export type ColorSupportLevel = typeof ColorSupportLevel.Type;

/**
 * Color support metadata for an enabled Chalk output stream.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
 */
export const ColorInfo = S.Union([ColorSupport, S.Literal(false)]).pipe(
  $I.annoteSchema("ColorInfo", {
    description: "Detected terminal color support information, or `false` when color output is disabled.",
  })
);

/**
 * Runtime type for {@link ColorInfo}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ColorInfo = typeof ColorInfo.Type;

/**
 * Constructor options for isolated Chalk instances.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
 */
export const ModifierName = LiteralKit(modifierNameValues).pipe(
  $I.annoteSchema("ModifierName", {
    description: "Supported Chalk modifier names.",
  })
);

/**
 * Runtime type for {@link ModifierName}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ModifierName = typeof ModifierName.Type;

/**
 * Supported Chalk foreground color names.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ForegroundColorName = LiteralKit(foregroundColorNameValues).pipe(
  $I.annoteSchema("ForegroundColorName", {
    description: "Supported Chalk foreground color names.",
  })
);

/**
 * Runtime type for {@link ForegroundColorName}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ForegroundColorName = typeof ForegroundColorName.Type;

/**
 * Supported Chalk background color names.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const BackgroundColorName = LiteralKit(backgroundColorNameValues).pipe(
  $I.annoteSchema("BackgroundColorName", {
    description: "Supported Chalk background color names.",
  })
);

/**
 * Runtime type for {@link BackgroundColorName}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type BackgroundColorName = typeof BackgroundColorName.Type;

/**
 * Supported Chalk color names.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ColorName = LiteralKit(colorNameValues).pipe(
  $I.annoteSchema("ColorName", {
    description: "Supported Chalk foreground and background color names.",
  })
);

/**
 * Runtime type for {@link ColorName}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ColorName = typeof ColorName.Type;
