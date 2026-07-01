/**
 * The SearchResult value object module for the `@beep/govinfo` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GovinfoId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $GovinfoId.create("domain/values/SearchResult/SearchResult.model");

/**
 * A single hit from a GovInfo search response, describing one matched package or
 * granule (its collection, dates, authors, identifiers, links, and downloadable renditions).
 *
 * @example
 * ```ts
 * import { SearchResult } from "@beep/govinfo/domain/values/SearchResult/SearchResult.model";
 *
 * console.log(SearchResult);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SearchResult extends S.Class<SearchResult>($I`SearchResult`)(
  {
    /** GovInfo collection abbreviation the hit belongs to (for example `BILLS`, `FR`, or `CREC`). */
    collectionCode: S.String.annotateKey({
      description: "GovInfo collection abbreviation the hit belongs to (for example BILLS, FR, or CREC).",
    }),
    /** Timestamp of when GovInfo ingested this content into its repository. */
    dateIngested: S.DateTimeUtcFromString.annotateKey({
      description: "Timestamp of when GovInfo ingested this content into its repository.",
    }),
    /** Official publication date on which the content was issued. */
    dateIssued: S.DateTimeUtcFromString.annotateKey({
      description: "Official publication date on which the content was issued.",
    }),
    /** Map of rendition/format name to the download URL for that rendition of the result. */
    download: S.Record(S.String, S.String).annotateKey({
      description: "Map of rendition/format name to the download URL for that rendition of the result.",
      documentation:
        "The download property on the SearchResult model is typed as object, and it's defined as a free-form object with arbitrary string properties. The TypeScript equivalent would be:",
    }),
    /** Issuing government authors or agencies responsible for the content. */
    governmentAuthor: S.String.pipe(
      S.Array,
      S.annotateKey({
        description: "Issuing government authors or agencies responsible for the content.",
      })
    ),
    /** Identifier of the granule within its parent GovInfo package, when the hit is a granule. */
    granuleId: S.String.annotateKey({
      description: "Identifier of the granule within its parent GovInfo package, when the hit is a granule.",
    }),
    /** Timestamp of the most recent modification to the content. */
    lastModified: S.DateTimeUtcFromString.annotateKey({
      description: "Timestamp of the most recent modification to the content.",
    }),
    /** GovInfo package identifier that uniquely names the containing package. */
    packageId: S.String.annotateKey({
      description: "GovInfo package identifier that uniquely names the containing package.",
    }),
    /** API link to the package or granule that this result represents. */
    resultLink: S.String.annotateKey({
      description: "API link to the package or granule that this result represents.",
    }),
    /** Human-readable title of the matched package or granule. */
    title: S.String.annotateKey({
      description: "Human-readable title of the matched package or granule.",
    }),
  },
  $I.annote("SearchResult", {
    description:
      "A single hit returned by the GovInfo search endpoint, describing one matched package or granule and how to retrieve its renditions.",
  })
) {}

/**
 * The companion namespace for the {@link SearchResult} value object.
 *
 * @category namespaces
 * @since 0.0.0
 */
export declare namespace SearchResult {
  /**
   * The companion encoded type for {@link SearchResult}.
   *
   * @example
   * ```ts
   * import type { SearchResult } from "@beep/govinfo/domain/values/SearchResult/SearchResult.model";
   *
   * const useEncoded = (_value: SearchResult.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof SearchResult.Encoded;
}
