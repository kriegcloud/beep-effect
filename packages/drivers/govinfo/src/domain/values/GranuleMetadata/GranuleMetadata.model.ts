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
 * The GranuleMetadata value object.
 *
 * @example
 * ```ts
 * import { GranuleMetadata } from "@beep/govinfo/domain/values/GranuleMetadata/GranuleMetadata.model";
 *
 * console.log(GranuleMetadata.make({}));
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GranuleMetadata extends S.Class<GranuleMetadata>($I`GranuleMetadata`)(
	{
		/** change me */
		granuleClass: S.String.annotateKey({
			description: ""
		}),

		/** change me */
		granuleId: S.String.annotateKey({
			description: ""
		}),

		/** change me */
		granuleLink: S.String.annotateKey({
			description: ""
		}),

		/** change me */
		md5: S.String.annotateKey({
			description: ""
		}),

		/** change me */
		title: S.String.annotateKey({
			description: ""
		}),
	},
	$I.annote("GranuleMetadata", {
		description: "The GranuleMetadata value object.",
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
	 * The compainion encoded type for {@link GranuleMetadata}.
	 *
	 * @example
	 * ```ts
	 * import type { GranuleMetadata } from "@beep/govinfo/domain/values/GranuleMetadata/GranuleMetadata.model";
	 *
	 * const thing: GranuleMetadata.Encoded = GranuleMetadata.make({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof GranuleMetadata.Encoded;
}