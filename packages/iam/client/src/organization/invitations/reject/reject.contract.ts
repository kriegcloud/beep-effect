import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Invitation } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/invitations/reject");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    invitationId: S.String,
  },
  $I.annotations("Payload", {
    description: "Payload for rejecting an organization invitation.",
  })
) {}

export const Success = Invitation;
