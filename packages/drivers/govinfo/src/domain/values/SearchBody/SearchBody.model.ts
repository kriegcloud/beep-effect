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
      description: "",
    }),
    offsetMark: S.String.annotateKey({
      description: "",
    }),
    pageSize: S.Finite.check(S.isInt32()).annotateKey({
      description: "Signed 32-bit integers (commonly used integer type).",
    }),
    query: S.String.annotateKey({
      description: "",
    }),
    resultLevel: S.String.annotateKey({
      description: "",
    }),
    sorts: S.Array(Sort).annotateKey({
      description: "",
    }),
  },
  $I.annote("SearchBody", {
    description: "The SearchBody value object.",
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
