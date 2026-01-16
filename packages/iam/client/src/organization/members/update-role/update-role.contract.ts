import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Member } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/members/update-role");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.optional(S.String), // Uses active org if omitted
    memberId: S.String,
    role: S.String,
  },
  $I.annotations("Payload", {
    description: "Payload for updating a member's role in an organization.",
  })
) {}

export const Success = Member;
