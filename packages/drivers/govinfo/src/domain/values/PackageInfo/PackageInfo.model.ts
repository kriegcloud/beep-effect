/**
 * The PackageInfo value object module for the `@beep/govinfo` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GovinfoId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $GovinfoId.create("domain/values/PackageInfo/PackageInfo.model");

/**
 * The PackageInfo value object.
 *
 * @example
 * ```ts
 * import { PackageInfo } from "@beep/govinfo/domain/values/PackageInfo/PackageInfo.model";
 *
 * console.log(PackageInfo.make({}));
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PackageInfo extends S.Class<PackageInfo>($I`PackageInfo`)(
	{
		/** change me */
		congress: S.String.annotateKey({
			description: ""
		}),

		/** change me */
		dateIssued: S.DateTimeUtcFromString.annotateKey({
			description: ""
		}),

		/** change me */
		docClass: S.String.annotateKey({
			description: ""
		}),

		/** change me */
		lastModified: S.DateTimeUtcFromString.annotateKey({
			description: ""
		}),

		/** change me */
		packageLink: S.String.annotateKey({
			description: ""
		}),

		/** change me */
		title: S.String.annotateKey({
			description: ""
		}),
	},
	$I.annote("PackageInfo", {
		description: "The PackageInfo value object.",
	})
) {}


/**
 * The companion namespace for the {@link PackageInfo} value object.
 *
 * @category namespaces
 * @since 0.0.0
 */
export declare namespace PackageInfo {
	/**
	 * The compainion encoded type for {@link PackageInfo}.
	 *
	 * @example
	 * ```ts
	 * import type { PackageInfo } from "@beep/govinfo/domain/values/PackageInfo/PackageInfo.model";
	 *
	 * const thing: PackageInfo.Encoded = PackageInfo.make({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof PackageInfo.Encoded;
}