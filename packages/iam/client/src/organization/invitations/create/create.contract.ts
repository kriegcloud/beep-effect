import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Invitation, RoleOrRoles } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/invitations/create");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.optional(S.String), // Uses active org if omitted
    email: S.String,
    role: RoleOrRoles, // "admin" | "member" | "owner" or array of roles
  },
  $I.annotations("Payload", {
    description: "Payload for inviting a member to an organization.",
  })
) {}

export const Success = Invitation;
