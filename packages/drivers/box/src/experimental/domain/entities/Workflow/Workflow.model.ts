/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/Workflow/Workflow.model");

/**
 *
 * @example
 * ```ts
 * import { Workflow } from "@beep/box/experimental/domain/values/Workflow/Workflow.model";
 *
 * console.log(Workflow.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Workflow extends S.Class<Workflow>($I`Workflow`)(
	{},
	$I.annote("Workflow", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link Workflow}
 *
 * @since 0.0.0
 */
export declare namespace Workflow {
	/**
	 * Companion encoded type for {@link Workflow}.
	 *
	 * @example
	 * ```ts
	 * import {Workflow} from "@beep/box/experimental/domain/values/Workflow/Workflow.model";
	 *
	 * const thing: Workflow.Encoded = S.encodeUnknownSync(Workflow)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof Workflow.Encoded;
}

/**
 * Companion runtime type for {@link Workflow}.
 *
 * @example
 * ```ts
 * import {Workflow} from "@beep/box/experimental/domain/values/Workflow/Workflow.model";
 *
 * const thing: Workflow = S.encodeUnknownSync(Workflow)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Workflow = typeof Workflow.Type;