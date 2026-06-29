/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/TaskAssignment/TaskAssignment.model");

/**
 *
 * @example
 * ```ts
 * import { TaskAssignment } from "@beep/box/experimental/domain/values/TaskAssignment/TaskAssignment.model";
 *
 * console.log(TaskAssignment.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TaskAssignment extends S.Class<TaskAssignment>($I`TaskAssignment`)(
	{},
	$I.annote("TaskAssignment", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link TaskAssignment}
 *
 * @since 0.0.0
 */
export declare namespace TaskAssignment {
	/**
	 * Companion encoded type for {@link TaskAssignment}.
	 *
	 * @example
	 * ```ts
	 * import {TaskAssignment} from "@beep/box/experimental/domain/values/TaskAssignment/TaskAssignment.model";
	 *
	 * const thing: TaskAssignment.Encoded = S.encodeUnknownSync(TaskAssignment)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof TaskAssignment.Encoded;
}

/**
 * Companion runtime type for {@link TaskAssignment}.
 *
 * @example
 * ```ts
 * import {TaskAssignment} from "@beep/box/experimental/domain/values/TaskAssignment/TaskAssignment.model";
 *
 * const thing: TaskAssignment = S.encodeUnknownSync(TaskAssignment)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type TaskAssignment = typeof TaskAssignment.Type;