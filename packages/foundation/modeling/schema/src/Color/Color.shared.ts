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
export const schemaIssueToError = (cause: S.SchemaError["issue"]): S.SchemaError => new S.SchemaError(cause);

/**
 * Encoded RGB channel payload used by internal color conversions.
 *
 * @internal
 * @category models
 * @since 0.0.0
 */
export type RgbEncoded = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
};

/**
 * Encoded OKLCH coordinate payload used by internal color conversions.
 *
 * @internal
 * @category models
 * @since 0.0.0
 */
export type OklchEncoded = {
  readonly l: number;
  readonly c: number;
  readonly h: number;
};
