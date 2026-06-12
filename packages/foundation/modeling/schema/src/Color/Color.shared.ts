/**
 * Internal support for color schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

/**
 * Internal identity composer for color schemas.
 *
 * @internal
 * @category symbols
 * @since 0.0.0
 */
export const $I = $SchemaId.create("Color");

/**
 * Convert a schema issue into the package-local schema error type.
 *
 * @internal
 * @category errors
 * @since 0.0.0
 */
export const schemaIssueToError = (cause: S.SchemaError | S.SchemaError["issue"]): S.SchemaError =>
  cause instanceof S.SchemaError ? cause : new S.SchemaError(cause);

/**
 * Encoded RGB channel payload used by internal color conversions.
 *
 * @internal
 * @category models
 * @since 0.0.0
 */
export class RgbEncoded extends S.Class<RgbEncoded>($I`RgbEncoded`)(
  {
    r: S.Finite,
    g: S.Finite,
    b: S.Finite,
  },
  $I.annote("RgbEncoded", {
    description: "Encoded RGB channel payload used by internal color conversions.",
  })
) {}

/**
 * Encoded OKLCH coordinate payload used by internal color conversions.
 *
 * @internal
 * @category models
 * @since 0.0.0
 */
export class OklchEncoded extends S.Class<OklchEncoded>($I`OklchEncoded`)(
  {
    l: S.Finite,
    c: S.Finite,
    h: S.Finite,
  },
  $I.annote("OklchEncoded", {
    description: "Encoded OKLCH coordinate payload used by internal color conversions.",
  })
) {}
