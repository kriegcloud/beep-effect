import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { FullMember } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/members/list");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.optional(S.String), // Uses active org if omitted
  },
  $I.annotations("Payload", {
    description: "Payload for listing members of an organization.",
  })
) {}

// Returns members with embedded user data
export const Success = S.Array(FullMember);
