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
 * The SearchResult value object.
 *
 * @example
 * ```ts
 * import { SearchResult } from "@beep/govinfo/domain/values/SearchResult/SearchResult.model";
 *
 * console.log(SearchResult.make({}));
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SearchResult extends S.Class<SearchResult>($I`SearchResult`)(
	{
		/** change me */
		collectionCode: S.String.annotateKey({
			description: ""
		}),
		/** change me */
		dateIngested: S.DateTimeUtcFromString.annotateKey({
			description: ""
		}),
		/** change me */
		dateIssued: S.DateTimeUtcFromString.annotateKey({
			description: ""
		}),
		/** change me */
		download: S.Record(S.String, S.String).annotateKey({
			description: "",
			documentation: "The download property on the SearchResult model is typed as object, and it's defined as a free-form object with arbitrary string properties. The TypeScript equivalent would be:"
		}),
		/** change me */
		governmentAuthor: S.String.pipe(
			S.Array,
			S.annotateKey({
			description: ""
		})),
		/** change me */
		granuleId: S.String.annotateKey({
			description: ""
		}),
		/** change me */
		lastModified: S.DateTimeUtcFromString.annotateKey({
			description: ""
		}),
		/** change me */
		packageId: S.String.annotateKey({
			description: ""
		}),
		/** change me */
		resultLink: S.String.annotateKey({
			description: ""
		}),
		/** change me */
		title: S.String.annotateKey({
			description: ""
		}),
	},
	$I.annote("SearchResult", {
		description: "The SearchResult value object.",
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
	 * The compainion encoded type for {@link SearchResult}.
	 *
	 * @example
	 * ```ts
	 * import type { SearchResult } from "@beep/govinfo/domain/values/SearchResult/SearchResult.model";
	 *
	 * const thing: SearchResult.Encoded = SearchResult.make({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof SearchResult.Encoded;
}