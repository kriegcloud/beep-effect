import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Member } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/members/remove");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.optional(S.String), // Uses active org if omitted
    memberIdOrEmail: S.String, // Can use either member ID or email
  },
  $I.annotations("Payload", {
    description: "Payload for removing a member from an organization.",
  })
) {}

export const Success = Member;
