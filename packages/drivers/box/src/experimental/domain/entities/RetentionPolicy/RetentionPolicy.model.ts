/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/RetentionPolicy/RetentionPolicy.model");

/**
 *
 * @example
 * ```ts
 * import { RetentionPolicy } from "@beep/box/experimental/domain/values/RetentionPolicy/RetentionPolicy.model";
 *
 * console.log(RetentionPolicy.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RetentionPolicy extends S.Class<RetentionPolicy>($I`RetentionPolicy`)(
	{},
	$I.annote("RetentionPolicy", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link RetentionPolicy}
 *
 * @since 0.0.0
 */
export declare namespace RetentionPolicy {
	/**
	 * Companion encoded type for {@link RetentionPolicy}.
	 *
	 * @example
	 * ```ts
	 * import {RetentionPolicy} from "@beep/box/experimental/domain/values/RetentionPolicy/RetentionPolicy.model";
	 *
	 * const thing: RetentionPolicy.Encoded = S.encodeUnknownSync(RetentionPolicy)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof RetentionPolicy.Encoded;
}

/**
 * Companion runtime type for {@link RetentionPolicy}.
 *
 * @example
 * ```ts
 * import {RetentionPolicy} from "@beep/box/experimental/domain/values/RetentionPolicy/RetentionPolicy.model";
 *
 * const thing: RetentionPolicy = S.encodeUnknownSync(RetentionPolicy)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type RetentionPolicy = typeof RetentionPolicy.Type;