import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/_common/invitation");

/**
 * Invitation status enum.
 * Represents the current state of an organization invitation.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/organization/schema.ts
 */
export const InvitationStatus = S.Literal("pending", "accepted", "rejected", "canceled");

/**
 * TypeScript type for InvitationStatus.
 */
export type InvitationStatus = S.Schema.Type<typeof InvitationStatus>;

/**
 * Organization invitation entity.
 * Used in invitation CRUD responses.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/organization/routes/crud-invites.ts
 */
export class Invitation extends S.Class<Invitation>($I`Invitation`)(
  {
    id: IamEntityIds.InvitationId,
    organizationId: SharedEntityIds.OrganizationId,
    email: BS.Email,
    role: S.String,
    status: InvitationStatus,
    expiresAt: S.DateFromString,
    inviterId: SharedEntityIds.UserId,
  },
  $I.annotations("Invitation", {
    description: "Organization invitation entity from Better Auth organization plugin.",
  })
) {}
