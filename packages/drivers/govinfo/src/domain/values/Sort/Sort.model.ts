/**
 * The Sort value object module for the `@beep/govinfo` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GovinfoId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $GovinfoId.create("domain/values/Sort/Sort.model");

/**
 * The `SortBase` value object.
 *
 * @example
 * ```ts
 * import { SortBase } from "@beep/govinfo/domain/values/Sort/Sort.model";
 *
 * console.log(SortBase.make({}));
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SortBase extends S.Class<SortBase>($I`SortBase`)(
	{
		field: S.NonEmptyString.annotateKey({
			description: ""
		}),
	},
	$I.annote("SortBase", {
		description: "The base `Sort` value object.",
	})
) {}


/**
 * The companion namespace for the {@link SortBase} value object.
 *
 * @category namespaces
 * @since 0.0.0
 */
export declare namespace SortBase {
	/**
	 * The compainion encoded type for {@link SortBase}.
	 *
	 * @example
	 * ```ts
	 * import type { SortBase } from "@beep/govinfo/domain/values/SortBase/SortBase.model";
	 *
	 * const thing: SortBase.Encoded = SortBase.make({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof SortBase.Encoded;
}

/**
 * The Sort value object.
 *
 * @example
 * ```ts
 * import { SortASC } from "@beep/govinfo/domain/values/Sort/Sort.model";
 *
 * console.log(SortASC.make({
 *   field: "name"
 * }));
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SortASC extends SortBase.extend<SortASC>($I`SortASC`)(
	{
		sortOrder: S.tag("ASC").annotateKey({
			description: ""
		})
	},
	$I.annote("SortASC", {
		description: "The `SortASC` value object. Sort in ascending order.",
	})
) {}


/**
 * The companion namespace for the {@link SortASC} value object.
 *
 * @category namespaces
 * @since 0.0.0
 */
export declare namespace SortASC {
	/**
	 * The compainion encoded type for {@link SortASC}.
	 *
	 * @example
	 * ```ts
	 * import type { SortASC } from "@beep/govinfo/domain/values/SortASC/SortASC.model";
	 *
	 * const thing: SortASC.Encoded = SortASC.make({
	 *   field: "name"
	 * });
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof SortASC.Encoded;
}

/**
 * The SortDESC value object.
 *
 * @example
 * ```ts
 * import { SortDESC } from "@beep/govinfo/domain/values/Sort/Sort.model";
 *
 * console.log(SortDESC.make({
 *   field: "name"
 * }));
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SortDESC extends SortBase.extend<SortDESC>($I`SortDESC`)(
	{
		sortOrder: S.tag("DESC").annotateKey({
			description: ""
		})
	},
	$I.annote("SortDESC", {
		description: "The `SortDESC` value object. Sort in ascending order.",
	})
) {}


/**
 * The companion namespace for the {@link SortDESC} value object.
 *
 * @category namespaces
 * @since 0.0.0
 */
export declare namespace SortDESC {
	/**
	 * The compainion encoded type for {@link SortDESC}.
	 *
	 * @example
	 * ```ts
	 * import type { SortDESC } from "@beep/govinfo/domain/values/SortDESC/SortDESC.model";
	 *
	 * const thing: SortDESC.Encoded = SortDESC.make({
	 *   field: "name",
	 * });
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof SortDESC.Encoded;
}

/**
 * The Sort value object.
 *
 * @example
 * ```ts
 * import { Sort } from "@beep/govinfo/domain/values/Sort/Sort.model";
 *
 * console.log(Sort.make({
 *   field: "name"
 * }));
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Sort = S.Union(
	[
		SortASC,
		SortDESC
	]
).pipe(
	S.toTaggedUnion("sortOrder"),
	$I.annoteSchema("Sort", {
		description: "The `Sort` value object. Sort in ascending order.",
	})
)


/**
 * The companion namespace for the {@link Sort} value object.
 *
 * @category namespaces
 * @since 0.0.0
 */
export declare namespace Sort {
	/**
	 * The compainion encoded type for {@link Sort}.
	 *
	 * @example
	 * ```ts
	 * import type { Sort } from "@beep/govinfo/domain/values/Sort/Sort.model";
	 *
	 * const thing: Sort.Encoded = Sort.make({
	 *   field: "name",
	 * });
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof Sort.Encoded;
}