/**
 * Shared theme-adjacent color schemas.
 *
 * @since 0.0.0
 * @module @beep/schema/color/ThemeShared
 */

import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SchemaId.create("color/ThemeShared");

const cssVarRefPattern = /^var\(--[^)\s]+\)$/;

const CssVarRefChecks = S.makeFilterGroup(
  [
    S.isPattern(cssVarRefPattern, {
      identifier: $I`CssVarRefPatternCheck`,
      title: "CSS Variable Reference Pattern",
      description: "A CSS variable reference in the form var(--token-name).",
      message: "CSS variable references must look like var(--token-name)",
    }),
  ],
  {
    identifier: $I`CssVarRefChecks`,
    title: "CSS Variable Reference",
    description: "Checks for CSS variable references in var(--token-name) form.",
  }
);

/**
 * CSS variable reference string.
 *
 * @since 0.0.0
 * @category Validation
 */
export const CssVarRef = S.String.check(CssVarRefChecks).pipe(
  S.brand("CssVarRef"),
  S.annotate(
    $I.annote("CssVarRef", {
      description: "A CSS variable reference in the form var(--token-name).",
    })
  )
);

/**
 * Type for {@link CssVarRef}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CssVarRef = typeof CssVarRef.Type;
