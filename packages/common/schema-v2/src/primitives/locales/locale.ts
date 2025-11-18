/**
 * Locale schemas and literal kits backed by the generated `ALL_LOCALES` catalog.
 *
 * Provides BCP 47 validation for infrastructure config, runtime preferences, and UI dropdowns.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Locale } from "@beep/schema-v2/primitives/locales/locale";
 *
 * const locale = S.decodeSync(Locale)("en-GB");
 *
 * @category Primitives/Locales
 * @since 0.1.0
 */

import type * as S from "effect/Schema";
import { stringLiteralKit } from "../../derived/kits/string-literal-kit";
import { Id } from "./_id";
import { ALL_LOCALES } from "./all-locales-generated";

/**
 * Locale literal kit built from the generated {@link ALL_LOCALES} catalog.
 *
 * Provides `Schema`, `Enum`, and `Options` so UI dropdowns and runtime validators can share the same values.
 *
 * @example
 * import { LocaleKit } from "@beep/schema-v2/primitives/locales/locale";
 *
 * const languages = LocaleKit.Options;
 *
 * @category Primitives/Locales
 * @since 0.1.0
 */
export const LocaleKit = stringLiteralKit(...ALL_LOCALES);

/**
 * Schema enforcing BCP 47 locale identifiers.
 *
 * Useful for formatting helpers, preference storage, and adapter configuration where locales must match generated values.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Locale } from "@beep/schema-v2/primitives/locales/locale";
 *
 * const locale = S.decodeSync(Locale)("en-GB");
 *
 * @category Primitives/Locales
 * @since 0.1.0
 */
export class Locale extends LocaleKit.Schema.annotations(
  Id.annotations("Locale", {
    description: "Represents a BCP 47 locale identifier.",
  })
) {
  /**
   * Readonly list of locale string options.
   *
   * @category Primitives/Locales
   * @since 0.1.0
   */
  static readonly Options = LocaleKit.Options;
  /**
   * Enum map keyed by locale-friendly identifiers.
   *
   * @category Primitives/Locales
   * @since 0.1.0
   */
  static readonly Enum = LocaleKit.Enum;
}

/**
 * Namespace exposing helper types for {@link Locale}.
 *
 * @example
 * import type { Locale } from "@beep/schema-v2/primitives/locales/locale";
 *
 * let locale: Locale.Type;
 *
 * @category Primitives/Locales
 * @since 0.1.0
 */
export declare namespace Locale {
  /**
   * Runtime type of the {@link Locale} schema.
   *
   * @example
   * import type { Locale } from "@beep/schema-v2/primitives/locales/locale";
   *
   * let locale: Locale.Type;
   *
   * @category Primitives/Locales
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof Locale>;
  /**
   * Encoded representation of the {@link Locale} schema.
   *
   * @example
   * import type { Locale } from "@beep/schema-v2/primitives/locales/locale";
   *
   * let encoded: Locale.Encoded;
   *
   * @category Primitives/Locales
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof Locale>;
}
