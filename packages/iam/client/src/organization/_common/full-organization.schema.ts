import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Invitation } from "./invitation.schema.ts";
import { FullMember } from "./member.schema.ts";

const $I = $IamClientId.create("organization/_common/full-organization");

/**
 * Full organization with members and invitations.
 * Returned by getFullOrganization endpoint.
 *
 * Note: This is a separate file to avoid circular imports with member.schema.ts
 * which imports EmbeddedUser from organization.schema.ts.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/organization/routes/crud-org.ts
 */
export class FullOrganization extends S.Class<FullOrganization>($I`FullOrganization`)(
  {
    id: S.String,
    name: S.String,
    slug: S.String,
    logo: S.NullOr(S.String),
    metadata: S.optional(S.Unknown),
    createdAt: S.DateFromString,
    members: S.Array(FullMember),
    invitations: S.Array(Invitation),
  },
  $I.annotations("FullOrganization", {
    description: "Full organization with members and invitations from Better Auth organization plugin.",
  })
) {}
