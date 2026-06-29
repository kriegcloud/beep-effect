/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/IntegrationMapping/IntegrationMapping.model");

/**
 *
 * @example
 * ```ts
 * import { IntegrationMapping } from "@beep/box/experimental/domain/values/IntegrationMapping/IntegrationMapping.model";
 *
 * console.log(IntegrationMapping.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class IntegrationMapping extends S.Class<IntegrationMapping>($I`IntegrationMapping`)(
	{},
	$I.annote("IntegrationMapping", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link IntegrationMapping}
 *
 * @since 0.0.0
 */
export declare namespace IntegrationMapping {
	/**
	 * Companion encoded type for {@link IntegrationMapping}.
	 *
	 * @example
	 * ```ts
	 * import {IntegrationMapping} from "@beep/box/experimental/domain/values/IntegrationMapping/IntegrationMapping.model";
	 *
	 * const thing: IntegrationMapping.Encoded = S.encodeUnknownSync(IntegrationMapping)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof IntegrationMapping.Encoded;
}

/**
 * Companion runtime type for {@link IntegrationMapping}.
 *
 * @example
 * ```ts
 * import {IntegrationMapping} from "@beep/box/experimental/domain/values/IntegrationMapping/IntegrationMapping.model";
 *
 * const thing: IntegrationMapping = S.encodeUnknownSync(IntegrationMapping)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type IntegrationMapping = typeof IntegrationMapping.Type;