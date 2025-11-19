/**
 * Locale schemas and literal kits backed by the generated `ALL_LOCALES` catalog.
 *
 * Provides BCP 47 validation for infrastructure config, runtime preferences, and UI dropdowns.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Locale } from "@beep/schema/primitives/locales/locale";
 *
 * const locale = S.decodeSync(Locale)("en-GB");
 *
 * @category Primitives/Locales
 * @since 0.1.0
 */

import type * as S from "effect/Schema";
import { StringLiteralKit } from "../../derived/kits/string-literal-kit";
import { Id } from "./_id";
import { ALL_LOCALES } from "./all-locales-generated";

/**
 * Schema enforcing BCP 47 locale identifiers.
 *
 * Useful for formatting helpers, preference storage, and adapter configuration where locales must match generated values.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Locale } from "@beep/schema/primitives/locales/locale";
 *
 * const locale = S.decodeSync(Locale)("en-GB");
 *
 * @category Primitives/Locales
 * @since 0.1.0
 */
export class Locale extends StringLiteralKit(...ALL_LOCALES).annotations(
  Id.annotations("Locale", {
    description: "Represents a BCP 47 locale identifier.",
  })
) {}

/**
 * Namespace exposing helper types for {@link Locale}.
 *
 * @example
 * import type { Locale } from "@beep/schema/primitives/locales/locale";
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
   * import type { Locale } from "@beep/schema/primitives/locales/locale";
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
   * import type { Locale } from "@beep/schema/primitives/locales/locale";
   *
   * let encoded: Locale.Encoded;
   *
   * @category Primitives/Locales
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof Locale>;
}
