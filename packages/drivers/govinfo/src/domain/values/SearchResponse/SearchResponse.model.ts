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
 * The SearchResponse value object.
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
        description: "Signed 32-bit integers (commonly used integer type).",
      })
    ),
    offsetMark: S.String.annotateKey({
      description: "",
    }),
    results: SearchResult.pipe(
      S.Array,
      S.annotateKey({
        description: "",
      })
    ),
  },
  $I.annote("SearchResponse", {
    description: "The SearchResponse value object.",
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
