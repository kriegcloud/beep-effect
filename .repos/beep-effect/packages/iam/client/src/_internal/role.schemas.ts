import * as OrganizationRoleModel from "@beep/iam-domain/entities/OrganizationRole";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireNumber, requireString, toDate } from "./transformation-helpers.ts";

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
    id: IamEntityIds.OrganizationRoleId,
    organizationId: SharedEntityIds.OrganizationId,
    role: S.String,
    permission: S.Record({ key: S.String, value: S.Array(S.String) }),
    createdAt: BS.DateTimeUtcFromAllAcceptable,
    updatedAt: S.optional(S.DateFromString),
  },
  $I.annotations("OrganizationRole", {
    description: "Organization role with permissions from Better Auth organization plugin.",
  })
) {}

// =============================================================================
// BETTER AUTH ORGANIZATION ROLE SCHEMA (for transformation)
// =============================================================================

/**
 * Schema representing a Better Auth organization role object.
 *
 * This captures the organization role structure returned by Better Auth's organization plugin,
 * including core fields and additionalFields configured in Options.ts.
 *
 * Uses Struct with Record extension to allow unknown properties from Better Auth
 * plugins that may add fields not reflected in TypeScript types.
 */
export const BetterAuthOrganizationRoleSchema = S.Struct(
  {
    id: S.String,
    organizationId: S.String,
    role: S.String,
    permission: S.Record({ key: S.String, value: S.Array(S.String) }),
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
  $I.annotations("BetterAuthOrganizationRole", {
    description: "The organization role object returned from Better Auth with plugin extensions.",
  })
);

export type BetterAuthOrganizationRole = S.Schema.Type<typeof BetterAuthOrganizationRoleSchema>;

// =============================================================================
// ORGANIZATION ROLE TRANSFORMATION SCHEMA
// =============================================================================

/**
 * Type alias for OrganizationRole.Model's encoded representation.
 * Used to ensure proper typing in the transformation without type assertions.
 */
type OrganizationRoleModelEncoded = S.Schema.Encoded<typeof OrganizationRoleModel.Model>;

/**
 * Transforms a Better Auth organization role object into the domain OrganizationRole.Model.
 *
 * This transformation handles:
 * - ID format validation (expects branded ID formats from DB-generated IDs)
 * - Mapping Better Auth fields to OrganizationRole.Model encoded representation
 * - Permission record to JSON string conversion for storage
 * - REQUIRED fields validated via require* helpers (fail if missing)
 *
 * @remarks
 * Better Auth is configured with `generateId: false`, meaning the database
 * generates IDs in the branded format via EntityId.publicId().
 * This transformation validates that IDs match expected formats.
 */
export const DomainOrganizationRoleFromBetterAuthOrganizationRole = S.transformOrFail(
  BetterAuthOrganizationRoleSchema,
  OrganizationRoleModel.Model,
  {
    strict: true,
    decode: Effect.fn(function* (ba, _options, ast) {
      // Validate organization role ID format
      const isValidOrgRoleId = IamEntityIds.OrganizationRoleId.is(ba.id);
      if (!isValidOrgRoleId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            ba,
            `Invalid organization role ID format: expected "iam_organizationrole__<uuid>", got "${ba.id}"`
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

      // Construct the encoded form of OrganizationRole.Model
      // Permission is stored as JSON string in the domain model
      // Use null for empty permission to avoid PolicyRecord validation issues
      const hasPermissions = Object.keys(ba.permission).length > 0;
      const encoded: OrganizationRoleModelEncoded = {
        // Core identity fields
        id: ba.id,
        organizationId: ba.organizationId,
        role: ba.role,
        permission: hasPermissions ? JSON.stringify(ba.permission) : null,
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
    encode: Effect.fn(function* (orgRole, _options, _ast) {
      // Handle potentially undefined id by creating a new one
      const id = orgRole.id ?? IamEntityIds.OrganizationRoleId.create();

      // Parse JSON string back to object for permission
      const permission = orgRole.permission ? JSON.parse(orgRole.permission) : {};

      const ba: BetterAuthOrganizationRole = {
        id,
        organizationId: orgRole.organizationId,
        role: orgRole.role,
        permission,
        createdAt: toDate(orgRole.createdAt),
        updatedAt: toDate(orgRole.updatedAt),
        // Include audit columns for round-trip encoding
        _rowId: orgRole._rowId,
        version: orgRole.version,
        source: orgRole.source ?? undefined,
        createdBy: orgRole.createdBy ?? undefined,
        updatedBy: orgRole.updatedBy ?? undefined,
        deletedAt: orgRole.deletedAt ? toDate(orgRole.deletedAt) : undefined,
        deletedBy: orgRole.deletedBy ?? undefined,
      };
      return ba;
    }),
  }
).annotations(
  $I.annotations("DomainOrganizationRoleFromBetterAuthOrganizationRole", {
    description: "Transforms Better Auth organization role response to domain OrganizationRole.Model",
  })
);

export declare namespace DomainOrganizationRoleFromBetterAuthOrganizationRole {
  export type Type = typeof DomainOrganizationRoleFromBetterAuthOrganizationRole.Type;
  export type Encoded = typeof DomainOrganizationRoleFromBetterAuthOrganizationRole.Encoded;
}
