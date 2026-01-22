import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("_internal/role.schemas");

// =============================================================================
// PERMISSION SCHEMA
// =============================================================================

/**
 * Permission record schema for organization roles.
 * Maps permission names to arrays of allowed actions.
 *
 * Example: { "posts": ["create", "read"], "users": ["read"] }
 */
export const Permission = S.Record({ key: S.String, value: S.mutable(S.Array(S.String)) });
export type Permission = S.Schema.Type<typeof Permission>;

// =============================================================================
// ORGANIZATION ROLE SCHEMA
// =============================================================================

/**
 * Organization role schema returned by Better Auth's access control endpoints.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/organization/routes/crud-access-control.ts
 */
export class OrganizationRole extends S.Class<OrganizationRole>($I`OrganizationRole`)(
  {
    id: S.String,
    organizationId: S.String,
    role: S.String,
    permission: S.Record({ key: S.String, value: S.Array(S.String) }),
    createdAt: S.DateFromString,
    updatedAt: S.optional(S.DateFromString),
  },
  $I.annotations("OrganizationRole", {
    description: "Organization role with permissions from Better Auth organization plugin.",
  })
) {}
