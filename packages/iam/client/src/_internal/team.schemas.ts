import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("_internal/team.schemas");

// =============================================================================
// TEAM SCHEMA
// =============================================================================

/**
 * Team schema returned by Better Auth's team endpoints.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/organization/routes/crud-team.ts
 */
export class Team extends S.Class<Team>($I`Team`)(
  {
    id: S.String,
    name: S.String,
    organizationId: S.String,
    createdAt: S.DateFromString,
    updatedAt: S.optional(S.DateFromString),
  },
  $I.annotations("Team", {
    description: "Team entity from Better Auth organization plugin.",
  })
) {}

// =============================================================================
// TEAM MEMBER SCHEMA
// =============================================================================

/**
 * Team member schema returned by Better Auth's team member endpoints.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/organization/routes/crud-team.ts
 */
export class TeamMember extends S.Class<TeamMember>($I`TeamMember`)(
  {
    id: S.String,
    teamId: S.String,
    userId: S.String,
    createdAt: S.DateFromString,
  },
  $I.annotations("TeamMember", {
    description: "Team member entity from Better Auth organization plugin.",
  })
) {}
