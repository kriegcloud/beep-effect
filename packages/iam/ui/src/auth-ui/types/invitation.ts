import { Invitation } from "@beep/iam-domain/entities";

export const InvitationView = Invitation.Model.select.pick(
  "id",
  "organizationId",
  "email",
  "role",
  "status",
  "inviterId",
  "expiresAt",
  "teamId"
);

export type Invitation = typeof InvitationView.Type;
