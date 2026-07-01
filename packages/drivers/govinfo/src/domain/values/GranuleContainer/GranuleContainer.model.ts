/**
 * The GranuleContainer value object module for the `@beep/govinfo` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GovinfoId } from "@beep/identity";
import { Int64 } from "@beep/schema";
import * as S from "effect/Schema";
import { GranuleMetadata } from "../GranuleMetadata/index.ts";

const $I = $GovinfoId.create("domain/values/GranuleContainer/GranuleContainer.model");

/**
 * The GranuleContainer value object.
 *
 * @example
 * ```ts
 * import { GranuleContainer } from "@beep/govinfo/domain/values/GranuleContainer/GranuleContainer.model";
 *
 * console.log(GranuleContainer);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GranuleContainer extends S.Class<GranuleContainer>($I`GranuleContainer`)(
  {
    /** Total number of granules available for the package across all pages. */
    count: Int64.pipe(
      S.annotateKey({
        description: "Total number of granules available for the package across all pages.",
      })
    ),

    /** The current page of granule metadata records returned for the package. */
    granules: GranuleMetadata.pipe(
      S.Array,
      S.annotateKey({
        description: "The current page of granule metadata records returned for the package.",
      })
    ),

    /** Informational or status message returned by the GovInfo granules endpoint. */
    message: S.String.annotateKey({
      description: "Informational or status message returned by the GovInfo granules endpoint.",
    }),

    /** API link to the next page of granule results, present when more results remain. */
    nextPage: S.String.annotateKey({
      description: "API link to the next page of granule results, present when more results remain.",
    }),

    /** Zero-based index of the first granule in this page within the full result set. */
    offset: S.Int.pipe(
      S.check(S.isInt32()),
      S.annotateKey({
        description: "Zero-based index of the first granule in this page within the full result set.",
      })
    ),

    /** Maximum number of granule records returned per page. */
    pageSize: S.Int.pipe(
      S.check(S.isInt32()),
      S.annotateKey({
        description: "Maximum number of granule records returned per page.",
      })
    ),

    /** API link to the previous page of granule results, present when an earlier page exists. */
    previousPage: S.String.annotateKey({
      description: "API link to the previous page of granule results, present when an earlier page exists.",
    }),
  },
  $I.annote("GranuleContainer", {
    description:
      "Paginated container for a GovInfo package's granules response, holding the current page of granule metadata plus total count and pagination cursors.",
  })
) {}

/**
 * The companion namespace for the {@link GranuleContainer} value object.
 *
 * @category namespaces
 * @since 0.0.0
 */
export declare namespace GranuleContainer {
  /**
   * The companion encoded type for {@link GranuleContainer}.
   *
   * @example
   * ```ts
   * import type { GranuleContainer } from "@beep/govinfo/domain/values/GranuleContainer/GranuleContainer.model";
   *
   * const useEncoded = (_value: GranuleContainer.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof GranuleContainer.Encoded;
}
