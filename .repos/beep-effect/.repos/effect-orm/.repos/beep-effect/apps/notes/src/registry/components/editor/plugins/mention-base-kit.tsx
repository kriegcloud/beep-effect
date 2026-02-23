import { MentionElementStatic } from "@beep/notes/registry/ui/mention-node-static";
import { BaseMentionPlugin } from "@platejs/mention";

export const BaseMentionKit = [BaseMentionPlugin.withComponent(MentionElementStatic)];
