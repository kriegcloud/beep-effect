import { $SharedIntegrationsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $SharedIntegrationsId.create("google/gmail/models/message-list-visibility");

export const MessageListVisibility = BS.StringLiteralKit("show", "hide").annotations(
  $I.annotations("MessageListVisibility", {
    description: "Message list visibility",
  })
);

export type MessageListVisibility = typeof MessageListVisibility.Type;
