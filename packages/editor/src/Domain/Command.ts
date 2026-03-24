/**
 * @module @beep/editor/Domain/Command
 * @since 0.0.0
 */
import { $EditorId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";

const $I = $EditorId.create("Domain/Command");

export const CommandTag = LiteralKit(
	[
		"INSERT_DATETIME_COMMAND",
	]
).pipe(
	$I.annoteSchema("CommandTag", {
		description: "A command tag."
	})
)