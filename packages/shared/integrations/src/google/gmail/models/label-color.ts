import { $SharedIntegrationsId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SharedIntegrationsId.create("google/gmail/models/label-color");

export class LabelColor extends S.Class<LabelColor>($I`LabelColor`)(
  {
    textColor: S.String,
    backgroundColor: S.String,
  },
  $I.annotations("LabelColor", {
    description: "Label color",
  })
) {}
