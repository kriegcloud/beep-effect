import { $RepoUtilsId } from "@beep/identity/packages";
import { DateTime } from "effect";
import * as S from "effect/Schema";

const $I = $RepoUtilsId.create("JSDoc/models/CanonicalJSDocSourceMetadata.model");

/**
 * Metadata for a canonical documentation source used in tag catalogs.
 *
 * @since 0.0.0
 * @category models
 */
export class CanonicalJSDocSourceMetadata extends S.Class<CanonicalJSDocSourceMetadata>(
  $I`CanonicalJSDocSourceMetadata`
)(
  {
    name: S.String,
    url: S.URLFromString,
    retrievedAt: S.DateTimeUtcFromString,
  },
  $I.annote("CanonicalJSDocSourceMetadata", {
    description: "Metadata for a canonical JSDoc source.",
  })
) {}

/**
 * Runtime codec companion types for {@link CanonicalJSDocSourceMetadata}.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace CanonicalJSDocSourceMetadata {
  /**
   * Encoded wire shape for {@link CanonicalJSDocSourceMetadata}.
   *
   * @since 0.0.0
   * @category models
   */
  export type Encoded = typeof CanonicalJSDocSourceMetadata.Encoded;
}

/**
 * Constructs a model instance from its encoded wire representation.
 *
 * @param input - Serialized source metadata payload.
 * @returns A decoded schema instance with strongly typed fields.
 * @since 0.0.0
 * @category constructors
 */
export const make = (input: CanonicalJSDocSourceMetadata.Encoded) =>
  new CanonicalJSDocSourceMetadata({
    name: input.name,
    url: new URL(input.url),
    retrievedAt: DateTime.makeUnsafe(input.retrievedAt),
  });
