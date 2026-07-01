/**
 * The GranuleMetadata value object module for the `@beep/govinfo` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GovinfoId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $GovinfoId.create("domain/values/GranuleMetadata/GranuleMetadata.model");

/**
 * Metadata for a single granule within a GovInfo package, capturing its granule
 * class, identifier, API link, content checksum, and title.
 *
 * @example
 * ```ts
 * import { GranuleMetadata } from "@beep/govinfo/domain/values/GranuleMetadata/GranuleMetadata.model";
 *
 * console.log(GranuleMetadata);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GranuleMetadata extends S.Class<GranuleMetadata>($I`GranuleMetadata`)(
  {
    /** GovInfo granule class categorizing the type of this granule within its package. */
    granuleClass: S.String.annotateKey({
      description: "GovInfo granule class categorizing the type of this granule within its package.",
    }),

    /** Identifier of this granule within its parent GovInfo package. */
    granuleId: S.String.annotateKey({
      description: "Identifier of this granule within its parent GovInfo package.",
    }),

    /** GovInfo API link used to fetch this granule's metadata or content. */
    granuleLink: S.String.annotateKey({
      description: "GovInfo API link used to fetch this granule's metadata or content.",
    }),

    /** MD5 checksum of the granule's content, used to verify download integrity. */
    md5: S.String.annotateKey({
      description: "MD5 checksum of the granule's content, used to verify download integrity.",
    }),

    /** Human-readable title of the granule. */
    title: S.String.annotateKey({
      description: "Human-readable title of the granule.",
    }),
  },
  $I.annote("GranuleMetadata", {
    description:
      "Metadata for a single granule within a GovInfo package, capturing its granule class, identifier, API link, content checksum, and title.",
  })
) {}

/**
 * The companion namespace for the {@link GranuleMetadata} value object.
 *
 * @category namespaces
 * @since 0.0.0
 */
export declare namespace GranuleMetadata {
  /**
   * The companion encoded type for {@link GranuleMetadata}.
   *
   * @example
   * ```ts
   * import type { GranuleMetadata } from "@beep/govinfo/domain/values/GranuleMetadata/GranuleMetadata.model";
   *
   * const useEncoded = (_value: GranuleMetadata.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof GranuleMetadata.Encoded;
}
