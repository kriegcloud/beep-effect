import { $IamClientId } from "@beep/identity/packages";
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
    id: S.String,
    organizationId: S.String,
    email: S.String,
    role: S.String,
    status: InvitationStatus,
    expiresAt: S.DateFromString,
    inviterId: S.String,
  },
  $I.annotations("Invitation", {
    description: "Organization invitation entity from Better Auth organization plugin.",
  })
) {}
