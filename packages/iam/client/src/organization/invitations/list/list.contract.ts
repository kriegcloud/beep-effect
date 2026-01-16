import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Invitation } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/invitations/list");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.optional(S.String), // Uses active org if omitted
  },
  $I.annotations("Payload", {
    description: "Payload for listing organization invitations.",
  })
) {}

export const Success = S.Array(Invitation);
