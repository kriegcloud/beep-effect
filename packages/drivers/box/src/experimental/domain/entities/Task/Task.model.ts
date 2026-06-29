/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/Task/Task.model");

/**
 *
 * @example
 * ```ts
 * import { Task } from "@beep/box/experimental/domain/values/Task/Task.model";
 *
 * console.log(Task.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Task extends S.Class<Task>($I`Task`)(
	{},
	$I.annote("Task", {
		description: "TODO",
	})
) {}

/**
 * Companion namespace for {@link Task}
 *
 * @since 0.0.0
 */
export declare namespace Task {
	/**
	 * Companion encoded type for {@link Task}.
	 *
	 * @example
	 * ```ts
	 * import {Task} from "@beep/box/experimental/domain/values/Task/Task.model";
	 *
	 * const thing: Task.Encoded = S.encodeUnknownSync(Task)({});
	 * ```
	 *
	 * @category models
	 * @since 0.0.0
	 */
	export type Encoded = typeof Task.Encoded;
}

/**
 * Companion runtime type for {@link Task}.
 *
 * @example
 * ```ts
 * import {Task} from "@beep/box/experimental/domain/values/Task/Task.model";
 *
 * const thing: Task = S.encodeUnknownSync(Task)({});
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Task = typeof Task.Type;