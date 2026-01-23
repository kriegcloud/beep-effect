import { $SharedIntegrationsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $SharedIntegrationsId.create("google/gmail/models/label-list-visibility");

export const LabelListVisibility = BS.StringLiteralKit("labelShow", "labelHide").annotations(
  $I.annotations("LabelListVisibility", {
    description: "Label list visibility",
  })
);

export type LabelListVisibility = typeof LabelListVisibility.Type;
