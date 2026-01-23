import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/_common/organization");

/**
 * Embedded user data within FullMember.
 * Subset of user fields returned by Better Auth organization plugin.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/organization/routes/crud-members.ts
 */
export class EmbeddedUser extends S.Class<EmbeddedUser>($I`EmbeddedUser`)(
  {
    id: SharedEntityIds.UserId,
    name: S.String,
    email: BS.Email,
    image: S.NullOr(S.String),
  },
  $I.annotations("EmbeddedUser", {
    description: "Embedded user data returned within organization member responses.",
  })
) {}

/**
 * Base Organization entity from Better Auth organization plugin.
 * Used in create, update, list, setActive responses.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/organization/routes/crud-org.ts
 */
export class Organization extends S.Class<Organization>($I`Organization`)(
  {
    id: SharedEntityIds.OrganizationId,
    name: S.String,
    slug: S.String,
    logo: S.NullOr(S.String),
    metadata: S.optional(S.Unknown),
    createdAt: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("Organization", {
    description: "Organization entity from Better Auth organization plugin.",
  })
) {}
