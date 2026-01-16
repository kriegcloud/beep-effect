import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { EmbeddedUser } from "./organization.schema.ts";

const $I = $IamClientId.create("organization/_common/member");

/**
 * Organization member entity.
 * Used in addMember, removeMember, updateMemberRole responses.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/organization/routes/crud-members.ts
 */
export class Member extends S.Class<Member>($I`Member`)(
  {
    id: S.String,
    organizationId: S.String,
    userId: S.String,
    role: S.String,
    createdAt: S.DateFromString,
  },
  $I.annotations("Member", {
    description: "Organization member entity from Better Auth organization plugin.",
  })
) {}

/**
 * Organization member with embedded user details.
 * Used in listMembers response and FullOrganization.members.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/organization/routes/crud-members.ts
 */
export class FullMember extends S.Class<FullMember>($I`FullMember`)(
  {
    id: S.String,
    organizationId: S.String,
    userId: S.String,
    role: S.String,
    createdAt: S.DateFromString,
    user: EmbeddedUser,
  },
  $I.annotations("FullMember", {
    description: "Organization member with embedded user details.",
  })
) {}
