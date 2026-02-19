import * as TeamMemberModel from "@beep/iam-domain/entities/TeamMember";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { Team as DomainTeam } from "@beep/shared-domain/entities";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireNumber, requireString, toDate } from "./transformation-helpers.ts";

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
    id: SharedEntityIds.TeamId,
    name: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    createdAt: BS.DateTimeUtcFromAllAcceptable,
    updatedAt: S.optional(S.DateFromString),
  },
  $I.annotations("Team", {
    description: "Team entity from Better Auth organization plugin.",
  })
) {}

// =============================================================================
// BETTER AUTH TEAM SCHEMA (for transformation)
// =============================================================================

/**
 * Schema representing a Better Auth team object.
 *
 * This captures the team structure returned by Better Auth's organization plugin,
 * including core fields and additionalFields configured in Options.ts.
 *
 * Uses Struct with Record extension to allow unknown properties from Better Auth
 * plugins that may add fields not reflected in TypeScript types.
 */
export const BetterAuthTeamSchema = S.Struct(
  {
    id: S.String,
    name: S.String,
    organizationId: S.String,
    // Better Auth may return Date objects or ISO strings
    createdAt: BS.DateFromAllAcceptable,
    updatedAt: S.optional(BS.DateFromAllAcceptable),
    // Optional fields from domain
    description: S.optionalWith(S.String, { nullable: true }),
    slug: S.optional(S.String),
    metadata: S.optionalWith(S.String, { nullable: true }),
    // additionalFieldsCommon (audit columns, all entities)
    _rowId: S.optional(S.Number),
    version: S.optional(S.Number),
    source: S.optionalWith(S.String, { nullable: true }),
    createdBy: S.optionalWith(S.String, { nullable: true }),
    updatedBy: S.optionalWith(S.String, { nullable: true }),
    deletedAt: S.optional(BS.DateFromAllAcceptable),
    deletedBy: S.optionalWith(S.String, { nullable: true }),
  },
  S.Record({ key: S.String, value: S.Unknown })
).annotations(
  $I.annotations("BetterAuthTeam", {
    description: "The team object returned from Better Auth with plugin extensions.",
  })
);

export type BetterAuthTeam = S.Schema.Type<typeof BetterAuthTeamSchema>;

// =============================================================================
// TEAM TRANSFORMATION SCHEMA
// =============================================================================

/**
 * Type alias for Team.Model's encoded representation.
 * Used to ensure proper typing in the transformation without type assertions.
 */
type TeamModelEncoded = S.Schema.Encoded<typeof DomainTeam.Model>;

/**
 * Transforms a Better Auth team object into the domain Team.Model.
 *
 * This transformation handles:
 * - ID format validation (expects branded ID formats from DB-generated IDs)
 * - Mapping Better Auth fields to Team.Model encoded representation
 * - REQUIRED fields validated via require* helpers (fail if missing)
 *
 * @remarks
 * Better Auth is configured with `generateId: false`, meaning the database
 * generates IDs in the branded format via EntityId.publicId().
 * This transformation validates that IDs match expected formats.
 */
export const DomainTeamFromBetterAuthTeam = S.transformOrFail(BetterAuthTeamSchema, DomainTeam.Model, {
  strict: true,
  decode: Effect.fn(function* (ba, _options, ast) {
    // Validate team ID format
    const isValidTeamId = SharedEntityIds.TeamId.is(ba.id);
    if (!isValidTeamId) {
      return yield* ParseResult.fail(
        new ParseResult.Type(ast, ba, `Invalid team ID format: expected "shared_team__<uuid>", got "${ba.id}"`)
      );
    }

    // Validate organization ID format
    const isValidOrgId = SharedEntityIds.OrganizationId.is(ba.organizationId);
    if (!isValidOrgId) {
      return yield* ParseResult.fail(
        new ParseResult.Type(
          ast,
          ba.organizationId,
          `Invalid organization ID format: expected "shared_organization__<uuid>", got "${ba.organizationId}"`
        )
      );
    }

    // =======================================================================
    // REQUIRED FIELDS - Must be present in Better Auth response
    // These use require* helpers that FAIL if the field is missing
    // =======================================================================
    const _rowId = yield* requireNumber(ba, "_rowId", ast);
    const version = yield* requireNumber(ba, "version", ast);
    const source = yield* requireString(ba, "source", ast);
    const createdBy = yield* requireString(ba, "createdBy", ast);
    const updatedBy = yield* requireString(ba, "updatedBy", ast);

    // Construct the encoded form of Team.Model
    const encoded: TeamModelEncoded = {
      // Core identity fields
      id: ba.id,
      name: ba.name,
      organizationId: ba.organizationId,
      createdAt: toDate(ba.createdAt),
      updatedAt: ba.updatedAt ? toDate(ba.updatedAt) : toDate(ba.createdAt),

      // Optional fields
      description: ba.description ?? null,
      slug: ba.slug ?? ba.name.toLowerCase().replace(/\s+/g, "-"),
      metadata: ba.metadata ?? null,

      // Audit fields from additionalFieldsCommon (required, validated above)
      _rowId,
      version,
      source,
      createdBy,
      updatedBy,
      deletedAt: ba.deletedAt ? toDate(ba.deletedAt) : null,
      deletedBy: ba.deletedBy ?? null,
    };

    return encoded;
  }),
  encode: Effect.fn(function* (team, _options, _ast) {
    // Handle potentially undefined id by creating a new one
    const id = team.id ?? SharedEntityIds.TeamId.create();

    const ba: BetterAuthTeam = {
      id,
      name: team.name,
      organizationId: team.organizationId,
      createdAt: toDate(team.createdAt),
      updatedAt: toDate(team.updatedAt),
      description: team.description ?? undefined,
      slug: team.slug ?? undefined,
      metadata: team.metadata ?? undefined,
      // Include audit columns for round-trip encoding
      _rowId: team._rowId,
      version: team.version,
      source: team.source ?? undefined,
      createdBy: team.createdBy ?? undefined,
      updatedBy: team.updatedBy ?? undefined,
      deletedAt: team.deletedAt ? toDate(team.deletedAt) : undefined,
      deletedBy: team.deletedBy ?? undefined,
    };
    return ba;
  }),
}).annotations(
  $I.annotations("DomainTeamFromBetterAuthTeam", {
    description: "Transforms Better Auth team response to domain Team.Model",
  })
);

export declare namespace DomainTeamFromBetterAuthTeam {
  export type Type = typeof DomainTeamFromBetterAuthTeam.Type;
  export type Encoded = typeof DomainTeamFromBetterAuthTeam.Encoded;
}

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
    id: IamEntityIds.TeamMemberId,
    teamId: SharedEntityIds.TeamId,
    userId: SharedEntityIds.UserId,
    createdAt: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("TeamMember", {
    description: "Team member entity from Better Auth organization plugin.",
  })
) {}

// =============================================================================
// BETTER AUTH TEAM MEMBER SCHEMA (for transformation)
// =============================================================================

/**
 * Schema representing a Better Auth team member object.
 *
 * This captures the team member structure returned by Better Auth's organization plugin,
 * including core fields and additionalFields configured in Options.ts.
 *
 * Uses Struct with Record extension to allow unknown properties from Better Auth
 * plugins that may add fields not reflected in TypeScript types.
 */
export const BetterAuthTeamMemberSchema = S.Struct(
  {
    id: S.String,
    teamId: S.String,
    userId: S.String,
    organizationId: S.String,
    // Better Auth may return Date objects or ISO strings
    createdAt: BS.DateFromAllAcceptable,
    updatedAt: S.optional(BS.DateFromAllAcceptable),
    // additionalFieldsCommon (audit columns, all entities)
    _rowId: S.optional(S.Number),
    version: S.optional(S.Number),
    source: S.optionalWith(S.String, { nullable: true }),
    createdBy: S.optionalWith(S.String, { nullable: true }),
    updatedBy: S.optionalWith(S.String, { nullable: true }),
    deletedAt: S.optional(BS.DateFromAllAcceptable),
    deletedBy: S.optionalWith(S.String, { nullable: true }),
  },
  S.Record({ key: S.String, value: S.Unknown })
).annotations(
  $I.annotations("BetterAuthTeamMember", {
    description: "The team member object returned from Better Auth with plugin extensions.",
  })
);

export type BetterAuthTeamMember = S.Schema.Type<typeof BetterAuthTeamMemberSchema>;

// =============================================================================
// TEAM MEMBER TRANSFORMATION SCHEMA
// =============================================================================

/**
 * Type alias for TeamMember.Model's encoded representation.
 * Used to ensure proper typing in the transformation without type assertions.
 */
type TeamMemberModelEncoded = S.Schema.Encoded<typeof TeamMemberModel.Model>;

/**
 * Transforms a Better Auth team member object into the domain TeamMember.Model.
 *
 * This transformation handles:
 * - ID format validation (expects branded ID formats from DB-generated IDs)
 * - Mapping Better Auth fields to TeamMember.Model encoded representation
 * - REQUIRED fields validated via require* helpers (fail if missing)
 *
 * @remarks
 * Better Auth is configured with `generateId: false`, meaning the database
 * generates IDs in the branded format via EntityId.publicId().
 * This transformation validates that IDs match expected formats.
 */
export const DomainTeamMemberFromBetterAuthTeamMember = S.transformOrFail(
  BetterAuthTeamMemberSchema,
  TeamMemberModel.Model,
  {
    strict: true,
    decode: Effect.fn(function* (ba, _options, ast) {
      // Validate team member ID format
      const isValidTeamMemberId = IamEntityIds.TeamMemberId.is(ba.id);
      if (!isValidTeamMemberId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            ba,
            `Invalid team member ID format: expected "iam_teammember__<uuid>", got "${ba.id}"`
          )
        );
      }

      // Validate team ID format
      const isValidTeamId = SharedEntityIds.TeamId.is(ba.teamId);
      if (!isValidTeamId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            ba.teamId,
            `Invalid team ID format: expected "shared_team__<uuid>", got "${ba.teamId}"`
          )
        );
      }

      // Validate user ID format
      const isValidUserId = SharedEntityIds.UserId.is(ba.userId);
      if (!isValidUserId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            ba.userId,
            `Invalid user ID format: expected "shared_user__<uuid>", got "${ba.userId}"`
          )
        );
      }

      // Validate organization ID format
      const isValidOrgId = SharedEntityIds.OrganizationId.is(ba.organizationId);
      if (!isValidOrgId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            ba.organizationId,
            `Invalid organization ID format: expected "shared_organization__<uuid>", got "${ba.organizationId}"`
          )
        );
      }

      // =======================================================================
      // REQUIRED FIELDS - Must be present in Better Auth response
      // These use require* helpers that FAIL if the field is missing
      // =======================================================================
      const _rowId = yield* requireNumber(ba, "_rowId", ast);
      const version = yield* requireNumber(ba, "version", ast);
      const source = yield* requireString(ba, "source", ast);
      const createdBy = yield* requireString(ba, "createdBy", ast);
      const updatedBy = yield* requireString(ba, "updatedBy", ast);

      // Construct the encoded form of TeamMember.Model
      const encoded: TeamMemberModelEncoded = {
        // Core identity fields
        id: ba.id,
        teamId: ba.teamId,
        userId: ba.userId,
        organizationId: ba.organizationId,
        createdAt: toDate(ba.createdAt),
        updatedAt: ba.updatedAt ? toDate(ba.updatedAt) : toDate(ba.createdAt),

        // Audit fields from additionalFieldsCommon (required, validated above)
        _rowId,
        version,
        source,
        createdBy,
        updatedBy,
        deletedAt: ba.deletedAt ? toDate(ba.deletedAt) : null,
        deletedBy: ba.deletedBy ?? null,
      };

      return encoded;
    }),
    encode: Effect.fn(function* (teamMember, _options, _ast) {
      // Handle potentially undefined id by creating a new one
      const id = teamMember.id ?? IamEntityIds.TeamMemberId.create();

      const ba: BetterAuthTeamMember = {
        id,
        teamId: teamMember.teamId,
        userId: teamMember.userId,
        organizationId: teamMember.organizationId,
        createdAt: toDate(teamMember.createdAt),
        updatedAt: toDate(teamMember.updatedAt),
        // Include audit columns for round-trip encoding
        _rowId: teamMember._rowId,
        version: teamMember.version,
        source: teamMember.source ?? undefined,
        createdBy: teamMember.createdBy ?? undefined,
        updatedBy: teamMember.updatedBy ?? undefined,
        deletedAt: teamMember.deletedAt ? toDate(teamMember.deletedAt) : undefined,
        deletedBy: teamMember.deletedBy ?? undefined,
      };
      return ba;
    }),
  }
).annotations(
  $I.annotations("DomainTeamMemberFromBetterAuthTeamMember", {
    description: "Transforms Better Auth team member response to domain TeamMember.Model",
  })
);

export declare namespace DomainTeamMemberFromBetterAuthTeamMember {
  export type Type = typeof DomainTeamMemberFromBetterAuthTeamMember.Type;
  export type Encoded = typeof DomainTeamMemberFromBetterAuthTeamMember.Encoded;
}
