/**
 * Theme and token schemas built from canonical color domains.
 *
 * @since 0.0.0
 * @module @beep/schema/color/Theme
 */

import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { TrimmedNonEmptyText } from "../CommonTextSchemas.ts";
import { LiteralKit } from "../LiteralKit.ts";
import { NormalizeHexColor } from "./Color.ts";
import { CssVarRef as CssVarRefSchema } from "./ThemeShared.ts";

const $I = $SchemaId.create("color/Theme");

/**
 * Theme token category literal domain.
 *
 * @since 0.0.0
 * @category Validation
 */
export const TokenCategory = LiteralKit([
  "background",
  "surface",
  "text",
  "border",
  "icon",
  "input",
  "button",
  "syntax",
  "markdown",
  "diff",
  "avatar",
] as const).annotate(
  $I.annote("TokenCategory", {
    description: "Theme token categories used to group UI color tokens.",
  })
);

/**
 * Type for {@link TokenCategory}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TokenCategory = typeof TokenCategory.Type;

/**
 * Canonical theme token key.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ThemeToken = TrimmedNonEmptyText.pipe(
  S.brand("ThemeToken"),
  S.annotate(
    $I.annote("ThemeToken", {
      description: "A trimmed non-empty theme token key.",
    })
  )
);

/**
 * Type for {@link ThemeToken}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ThemeToken = typeof ThemeToken.Type;

/**
 * Canonical theme identifier.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ThemeId = ThemeToken.pipe(
  S.brand("ThemeId"),
  S.annotate(
    $I.annote("ThemeId", {
      description: "A trimmed non-empty theme identifier.",
    })
  )
);

/**
 * Type for {@link ThemeId}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ThemeId = typeof ThemeId.Type;

/**
 * Canonical theme display name.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ThemeName = ThemeToken.pipe(
  S.brand("ThemeName"),
  S.annotate(
    $I.annote("ThemeName", {
      description: "A trimmed non-empty theme display name.",
    })
  )
);

/**
 * Type for {@link ThemeName}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ThemeName = typeof ThemeName.Type;

/**
 * Color value used by theme overrides and resolved tokens.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ColorValue = S.Union([NormalizeHexColor, CssVarRefSchema]).annotate(
  $I.annote("ColorValue", {
    description: "A canonical hex color or CSS variable reference.",
  })
);

/**
 * Type for {@link ColorValue}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ColorValue = typeof ColorValue.Type;

/**
 * Theme seed colors used to derive a variant palette.
 *
 * @since 0.0.0
 * @category Validation
 */
export class ThemeSeedColors extends S.Class<ThemeSeedColors>($I`ThemeSeedColors`)(
  {
    neutral: NormalizeHexColor.annotateKey({ description: "Neutral seed color." }),
    primary: NormalizeHexColor.annotateKey({ description: "Primary seed color." }),
    success: NormalizeHexColor.annotateKey({ description: "Success seed color." }),
    warning: NormalizeHexColor.annotateKey({ description: "Warning seed color." }),
    error: NormalizeHexColor.annotateKey({ description: "Error seed color." }),
    info: NormalizeHexColor.annotateKey({ description: "Info seed color." }),
    interactive: NormalizeHexColor.annotateKey({ description: "Interactive seed color." }),
    diffAdd: NormalizeHexColor.annotateKey({ description: "Diff-add seed color." }),
    diffDelete: NormalizeHexColor.annotateKey({ description: "Diff-delete seed color." }),
  },
  $I.annote("ThemeSeedColors", {
    description: "Canonical seed colors used to derive a theme variant.",
  })
) {}

/**
 * Theme variant containing seeds and optional overrides.
 *
 * @since 0.0.0
 * @category Validation
 */
export class ThemeVariant extends S.Class<ThemeVariant>($I`ThemeVariant`)(
  {
    seeds: ThemeSeedColors.annotateKey({ description: "Seed colors for the theme variant." }),
    overrides: S.optionalKey(S.Record(ThemeToken, ColorValue)).annotateKey({
      description: "Optional theme token overrides.",
    }),
  },
  $I.annote("ThemeVariant", {
    description: "A light or dark theme variant built from seed colors and optional token overrides.",
  })
) {}

/**
 * Full desktop theme schema.
 *
 * @since 0.0.0
 * @category Validation
 */
export class DesktopTheme extends S.Class<DesktopTheme>($I`DesktopTheme`)(
  {
    $schema: S.optionalKey(S.String).annotateKey({ description: "Optional schema URI." }),
    name: ThemeName.annotateKey({ description: "Theme display name." }),
    id: ThemeId.annotateKey({ description: "Stable theme identifier." }),
    light: ThemeVariant.annotateKey({ description: "Light theme variant." }),
    dark: ThemeVariant.annotateKey({ description: "Dark theme variant." }),
  },
  $I.annote("DesktopTheme", {
    description: "A full desktop theme with light and dark variants.",
  })
) {}

/**
 * Resolved theme token map.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ResolvedTheme = S.Record(ThemeToken, ColorValue).annotate(
  $I.annote("ResolvedTheme", {
    description: "A resolved map of theme tokens to canonical color values.",
  })
);

/**
 * Type for {@link ResolvedTheme}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ResolvedTheme = typeof ResolvedTheme.Type;

/**
 * Compatibility export for {@link CssVarRef}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const CssVarRef = CssVarRefSchema;

/**
 * Type for {@link CssVarRef}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CssVarRef = typeof CssVarRef.Type;
