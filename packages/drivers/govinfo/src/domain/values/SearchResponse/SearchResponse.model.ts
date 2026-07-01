/**
 * The SearchResponse value object module for the `@beep/govinfo` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GovinfoId } from "@beep/identity";
import * as S from "effect/Schema";
import { SearchResult } from "../SearchResult/index.ts";

const $I = $GovinfoId.create("domain/values/SearchResponse/SearchResponse.model");

/**
 * The response body returned by the GovInfo `POST /search` endpoint: the total
 * number of matching results, the cursor for the next page, and the page of
 * search result hits.
 *
 * @example
 * ```ts
 * import { SearchResponse } from "@beep/govinfo/domain/values/SearchResponse/SearchResponse.model";
 *
 * console.log(SearchResponse);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SearchResponse extends S.Class<SearchResponse>($I`SearchResponse`)(
  {
    count: S.Int.pipe(
      S.check(S.makeFilterGroup([S.isInt32(), S.isFinite(), S.isGreaterThanOrEqualTo(0)])),
      S.annotateKey({
        description: "Total number of results across all pages that match the search query.",
      })
    ),
    offsetMark: S.String.annotateKey({
      description:
        "Opaque pagination cursor identifying where the next page of results begins; pass it back as the request offsetMark to page forward.",
    }),
    results: SearchResult.pipe(
      S.Array,
      S.annotateKey({
        description: "The page of individual search result hits returned for this request.",
      })
    ),
  },
  $I.annote("SearchResponse", {
    description:
      "Result payload of a GovInfo search: the total match count, the next-page cursor, and this page's search result hits.",
  })
) {}

/**
 * The companion namespace for the {@link SearchResponse} value object.
 *
 * @category namespaces
 * @since 0.0.0
 */
export declare namespace SearchResponse {
  /**
   * The companion encoded type for {@link SearchResponse}.
   *
   * @example
   * ```ts
   * import type { SearchResponse } from "@beep/govinfo/domain/values/SearchResponse/SearchResponse.model";
   *
   * const useEncoded = (_value: SearchResponse.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof SearchResponse.Encoded;
}
