/**
 * The SearchBody value object module for the `@beep/govinfo` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GovinfoId } from "@beep/identity";
import * as S from "effect/Schema";
import { Sort } from "../Sort/index.ts";

const $I = $GovinfoId.create("domain/values/SearchBody/SearchBody.model");

/**
 * The SearchBody value object.
 *
 * @example
 * ```ts
 * import { SearchBody } from "@beep/govinfo/domain/values/SearchBody/SearchBody.model";
 *
 * console.log(SearchBody);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SearchBody extends S.Class<SearchBody>($I`SearchBody`)(
  {
    historical: S.Boolean.annotateKey({
      description: "Whether to include historical or superseded editions alongside current content in the results.",
    }),
    offsetMark: S.String.annotateKey({
      description:
        'Opaque pagination cursor identifying the page of results to return; pass "*" to request the first page.',
    }),
    pageSize: S.Finite.check(S.isInt32()).annotateKey({
      description: "Maximum number of search results to return in a single page.",
    }),
    query: S.String.annotateKey({
      description: "GovInfo search query string, supporting field operators such as collection: and publishdate:.",
    }),
    resultLevel: S.String.annotateKey({
      description: "Granularity at which matching results are reported, such as package-level or granule-level hits.",
    }),
    sorts: S.Array(Sort).annotateKey({
      description: "Ordering directives that control the field and direction used to sort matching results.",
    }),
  },
  $I.annote("SearchBody", {
    description:
      "Request body for the GovInfo POST /search endpoint, carrying the query, pagination cursor, historical scope, result granularity, and ordering of a search.",
  })
) {}

/**
 * The companion namespace for the {@link SearchBody} value object.
 *
 * @category namespaces
 * @since 0.0.0
 */
export declare namespace SearchBody {
  /**
   * The companion encoded type for {@link SearchBody}.
   *
   * @example
   * ```ts
   * import type { SearchBody } from "@beep/govinfo/domain/values/SearchBody/SearchBody.model";
   *
   * const useEncoded = (_value: SearchBody.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof SearchBody.Encoded;
}
