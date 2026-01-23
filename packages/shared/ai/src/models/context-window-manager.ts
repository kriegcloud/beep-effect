import { $SharedAiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $SharedAiId.create("models/context-window-manager");

export class ContextWindowConfigStrategy extends BS.StringLiteralKit("recent", "semantic", "token-based").annotations(
  $I.annotations("ContextWindowConfigStrategy", {
    description: "Context Window Config Strategy",
  })
) {}
