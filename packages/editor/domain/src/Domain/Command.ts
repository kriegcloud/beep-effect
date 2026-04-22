/**
 * @module
 * @since 0.0.0
 */
import { $EditorDomainId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";

const $I = $EditorDomainId.create("Domain/Command");

/**
 * @since 0.0.0
 */
export const CommandTag = LiteralKit(["INSERT_DATETIME_COMMAND"]).pipe(
  $I.annoteSchema("CommandTag", {
    description: "A command tag.",
  })
);
