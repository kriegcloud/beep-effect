import { $IamClientId } from "@beep/identity/packages";
import type { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import { Organization } from "@beep/shared-domain/entities";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireBoolean, requireNumber, requireString, toDate } from "./transformation-helpers.ts";

const $I = $IamClientId.create("_internal/organization.schemas");

// =============================================================================
// BETTER AUTH SCHEMAS
// =============================================================================

/**
 * Schema representing a Better Auth organization object.
 *
 * This captures the organization structure returned by Better Auth's organization API,
 * including core fields and additionalFields configured in Options.ts.
 *
 * Uses Struct with Record extension to allow unknown properties from Better Auth
 * plugins that may add fields not reflected in TypeScript types.
 */
export const BetterAuthOrganizationSchema = S.Struct(
  {
    id: S.String,
    name: S.String,
    slug: S.String,
    logo: S.optionalWith(S.String, { nullable: true }),
    metadata: S.optional(S.Unknown),
    // Better Auth returns JavaScript Date objects, not ISO strings
    createdAt: S.DateFromSelf,
    // additionalFields (organization-specific, configured in Options.ts)
    type: S.optional(S.String),
    ownerUserId: S.optional(S.String),
    isPersonal: S.Boolean,
    maxMembers: S.optional(S.Number),
    features: S.optional(S.Unknown), // JSON
    settings: S.optional(S.Unknown), // JSON
    subscriptionTier: S.optional(S.String),
    subscriptionStatus: S.optional(S.String),
    // additionalFieldsCommon (audit columns, all entities)
    _rowId: S.optional(S.Number),
    version: S.optional(S.Number),
    source: S.optional(S.NullOr(S.String)),
    createdBy: S.optional(S.NullOr(S.String)),
    updatedBy: S.optional(S.NullOr(S.String)),
    updatedAt: S.optional(S.DateFromSelf),
    deletedAt: S.optional(S.DateFromSelf),
    deletedBy: S.optional(S.NullOr(S.String)),
  },
  S.Record({ key: S.String, value: S.Unknown })
).annotations(
  $I.annotations("BetterAuthOrganization", {
    description: "The organization object returned from Better Auth with plugin extensions.",
  })
);

export type BetterAuthOrganization = S.Schema.Type<typeof BetterAuthOrganizationSchema>;

// =============================================================================
// TRANSFORMATION SCHEMAS
// =============================================================================

/**
 * Type alias for Organization.Model's encoded representation.
 * Used to ensure proper typing in the transformation without type assertions.
 */
type OrganizationModelEncoded = S.Schema.Encoded<typeof Organization.Model>;

/**
 * Transforms a Better Auth organization object into the domain Organization.Model.
 *
 * This transformation handles:
 * - ID format validation (expects branded ID formats from DB-generated IDs)
 * - Mapping Better Auth fields to Organization.Model encoded representation
 * - Type/tier/status validation against branded types
 * - JSON field handling for metadata, features, settings
 *
 * @remarks
 * Better Auth is configured with `generateId: false`, meaning the database
 * generates IDs in the branded format via EntityId.publicId().
 * This transformation validates that IDs match expected formats.
 */
export const DomainOrganizationFromBetterAuthOrganization = S.transformOrFail(
  BetterAuthOrganizationSchema,
  Organization.Model,
  {
    strict: true,
    decode: (ba, _options, ast) =>
      Effect.gen(function* () {
        // Validate branded ID format using type guards
        const isValidOrgId = SharedEntityIds.OrganizationId.is(ba.id);
        if (!isValidOrgId) {
          return yield* ParseResult.fail(
            new ParseResult.Type(
              ast,
              ba,
              `Invalid organization ID format: expected "shared_organization__<uuid>", got "${ba.id}"`
            )
          );
        }

        // Validate ownerUserId if present
        if (ba.ownerUserId !== undefined) {
          const isValidOwnerUserId = SharedEntityIds.UserId.is(ba.ownerUserId);
          if (!isValidOwnerUserId) {
            return yield* ParseResult.fail(
              new ParseResult.Type(
                ast,
                ba.ownerUserId,
                `Invalid ownerUserId format: expected "shared_user__<uuid>", got "${ba.ownerUserId}"`
              )
            );
          }
        }

        // Validate type against OrganizationType branded type (with default)
        let type: Organization.OrganizationType.Type = Organization.OrganizationTypeEnum.individual;
        if (ba.type !== undefined) {
          const typeResult = S.decodeUnknownEither(Organization.OrganizationType)(ba.type);
          if (typeResult._tag === "Left") {
            return yield* ParseResult.fail(
              new ParseResult.Type(
                ast,
                ba.type,
                `Invalid type value: expected one of "individual", "team", "enterprise", got "${ba.type}"`
              )
            );
          }
          type = typeResult.right;
        }

        // Validate subscriptionTier against SubscriptionTier branded type (with default)
        let subscriptionTier: Organization.SubscriptionTier.Type = Organization.SubscriptionTierEnum.free;
        if (ba.subscriptionTier !== undefined) {
          const tierResult = S.decodeUnknownEither(Organization.SubscriptionTier)(ba.subscriptionTier);
          if (tierResult._tag === "Left") {
            return yield* ParseResult.fail(
              new ParseResult.Type(
                ast,
                ba.subscriptionTier,
                `Invalid subscriptionTier value: expected one of "free", "plus", "pro", "enterprise", got "${ba.subscriptionTier}"`
              )
            );
          }
          subscriptionTier = tierResult.right;
        }

        // Validate subscriptionStatus against SubscriptionStatus branded type (with default)
        let subscriptionStatus: Organization.SubscriptionStatus.Type = Organization.SubscriptionStatusEnum.active;
        if (ba.subscriptionStatus !== undefined) {
          const statusResult = S.decodeUnknownEither(Organization.SubscriptionStatus)(ba.subscriptionStatus);
          if (statusResult._tag === "Left") {
            return yield* ParseResult.fail(
              new ParseResult.Type(
                ast,
                ba.subscriptionStatus,
                `Invalid subscriptionStatus value: expected one of "active", "canceled", got "${ba.subscriptionStatus}"`
              )
            );
          }
          subscriptionStatus = statusResult.right;
        }

        // Extract isPersonal (required)
        const isPersonal = yield* requireBoolean(ba, "isPersonal", ast);

        // =======================================================================
        // REQUIRED FIELDS - Must be present in Better Auth response
        // These use require* helpers that FAIL if the field is missing
        // =======================================================================
        const _rowId = yield* requireNumber(ba, "_rowId", ast);
        const version = yield* requireNumber(ba, "version", ast);
        const source = yield* requireString(ba, "source", ast);
        const createdBy = yield* requireString(ba, "createdBy", ast);
        const updatedBy = yield* requireString(ba, "updatedBy", ast);

        // Handle metadata - may be object or string (Better Auth can return either)
        // Domain model uses FieldOptionOmittable(S.String), encoded type is string | null
        let metadata: string | null = null;
        if (ba.metadata !== undefined && ba.metadata !== null) {
          if (typeof ba.metadata === "string") {
            metadata = ba.metadata;
          } else {
            // Serialize object to JSON string for domain model using Effect
            const stringified = yield* Effect.try({
              try: () => JSON.stringify(ba.metadata),
              catch: () => new ParseResult.Type(ast, ba.metadata, "Failed to stringify metadata to JSON"),
            });
            metadata = stringified;
          }
        }

        // Handle features JSON field - domain model uses FieldOptionOmittable(BS.Json)
        // BS.Json encoded type is the JSON value itself
        const features: BS.Json.Type =
          ba.features !== undefined && ba.features !== null ? (ba.features as BS.Json.Type) : {};

        // Handle settings JSON field - domain model uses FieldOptionOmittable(BS.Json)
        const settings: BS.Json.Type =
          ba.settings !== undefined && ba.settings !== null ? (ba.settings as BS.Json.Type) : {};

        // ownerUserId is required in the domain model
        if (!ba.ownerUserId) {
          return yield* ParseResult.fail(
            new ParseResult.Type(ast, ba.ownerUserId, "ownerUserId is required but was null or undefined")
          );
        }

        // Construct the encoded form of Organization.Model
        // FieldOptionOmittable fields use `| null` semantics in encoded form
        const encoded: OrganizationModelEncoded = {
          // Core identity fields
          id: ba.id,
          name: ba.name,
          slug: ba.slug,
          logo: ba.logo ?? null,
          metadata,
          createdAt: toDate(ba.createdAt),

          // Direct mappings from additionalFields (organization-specific)
          type,
          ownerUserId: ba.ownerUserId,
          isPersonal,
          maxMembers: ba.maxMembers ?? null,
          features,
          settings,
          subscriptionTier,
          subscriptionStatus,

          // Audit fields from additionalFieldsCommon (required, validated above)
          _rowId,
          version,
          source,
          createdBy,
          updatedBy,
          updatedAt: ba.updatedAt ? toDate(ba.updatedAt) : toDate(ba.createdAt),
          deletedAt: ba.deletedAt ? toDate(ba.deletedAt) : null,
          deletedBy: ba.deletedBy ?? null,
        };

        return encoded;
      }),
    encode: (organization, _options, _ast) =>
      Effect.succeed({
        // Handle potentially undefined id by creating a new one
        id: organization.id ?? SharedEntityIds.OrganizationId.create(),
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo ?? undefined,
        // Handle metadata - domain model stores as string, Better Auth may expect object
        // Try to parse JSON string back to object, fallback to original value
        metadata: (() => {
          if (organization.metadata === undefined || organization.metadata === null) return undefined;
          try {
            return JSON.parse(organization.metadata);
          } catch {
            return organization.metadata;
          }
        })(),
        createdAt: toDate(organization.createdAt),
        type: organization.type,
        ownerUserId: organization.ownerUserId,
        isPersonal: organization.isPersonal ?? false,
        maxMembers: organization.maxMembers ?? undefined,
        features: organization.features,
        settings: organization.settings,
        subscriptionTier: organization.subscriptionTier,
        subscriptionStatus: organization.subscriptionStatus,
        // Include audit columns for round-trip encoding
        _rowId: organization._rowId,
        version: organization.version,
        source: organization.source ?? undefined,
        createdBy: organization.createdBy ?? undefined,
        updatedBy: organization.updatedBy ?? undefined,
        updatedAt: toDate(organization.updatedAt),
        deletedAt: organization.deletedAt ? toDate(organization.deletedAt) : undefined,
        deletedBy: organization.deletedBy ?? undefined,
      } satisfies BetterAuthOrganization),
  }
).annotations(
  $I.annotations("DomainOrganizationFromBetterAuthOrganization", {
    description: "Transforms Better Auth organization response to domain Organization.Model",
  })
);

export declare namespace DomainOrganizationFromBetterAuthOrganization {
  export type Type = typeof DomainOrganizationFromBetterAuthOrganization.Type;
  export type Encoded = typeof DomainOrganizationFromBetterAuthOrganization.Encoded;
}
