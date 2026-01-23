import { $SharedIntegrationsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $SharedIntegrationsId.create("google/gmail/models/label-type");

export const LabelType = BS.StringLiteralKit("system", "user").annotations(
  $I.annotations("LabelType", {
    description: "Label type",
  })
);

export type LabelType = typeof LabelType.Type;
