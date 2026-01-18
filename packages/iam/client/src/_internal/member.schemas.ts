import { $IamClientId } from "@beep/identity/packages";
import * as Member from "@beep/iam-domain/entities/Member";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireNumber, requireString, toDate } from "./transformation-helpers.ts";

const $I = $IamClientId.create("_internal/member.schemas");

// =============================================================================
// BETTER AUTH SCHEMAS
// =============================================================================

/**
 * Schema representing a Better Auth embedded user object.
 *
 * This captures the minimal user structure returned by Better Auth when
 * embedding user data in FullMember responses. Only includes 4 fields
 * for display purposes - NOT transformable to full User.Model.
 */
export const BetterAuthEmbeddedUserSchema = S.Struct({
  id: S.String,
  name: S.String,
  email: S.String,
  image: S.NullOr(S.String),
}).annotations(
  $I.annotations("BetterAuthEmbeddedUser", {
    description: "Minimal embedded user returned by Better Auth for FullMember responses. Display-only, not transformable to User.Model.",
  })
);

export type BetterAuthEmbeddedUser = S.Schema.Type<typeof BetterAuthEmbeddedUserSchema>;

/**
 * Schema representing a Better Auth member object.
 *
 * This captures the member structure returned by Better Auth's organization API,
 * including core fields and additionalFields configured in Options.ts.
 *
 * Uses Struct with Record extension to allow unknown properties from Better Auth
 * plugins that may add fields not reflected in TypeScript types.
 */
export const BetterAuthMemberSchema = S.Struct(
  {
    id: S.String,
    organizationId: S.String,
    userId: S.String,
    role: S.String,
    // Better Auth returns JavaScript Date objects, not ISO strings
    createdAt: S.DateFromSelf,
    // additionalFields (member-specific, configured in Options.ts)
    status: S.String,
    invitedBy: S.optional(S.String),
    invitedAt: S.optional(S.DateFromSelf),
    joinedAt: S.optional(S.DateFromSelf),
    lastActiveAt: S.optional(S.DateFromSelf),
    permissions: S.optional(S.String),
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
  $I.annotations("BetterAuthMember", {
    description: "The member object returned from Better Auth with plugin extensions.",
  })
);

export type BetterAuthMember = S.Schema.Type<typeof BetterAuthMemberSchema>;

/**
 * Schema representing a Better Auth full member object with embedded user.
 *
 * This captures the member structure returned by Better Auth's listMembers endpoint,
 * which includes an embedded user object for display purposes.
 */
export const BetterAuthFullMemberSchema = S.Struct(
  {
    id: S.String,
    organizationId: S.String,
    userId: S.String,
    role: S.String,
    createdAt: S.DateFromSelf,
    user: BetterAuthEmbeddedUserSchema,
    // additionalFields (member-specific, configured in Options.ts)
    status: S.String,
    invitedBy: S.optional(S.String),
    invitedAt: S.optional(S.DateFromSelf),
    joinedAt: S.optional(S.DateFromSelf),
    lastActiveAt: S.optional(S.DateFromSelf),
    permissions: S.optional(S.String),
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
  $I.annotations("BetterAuthFullMember", {
    description: "The full member object with embedded user returned from Better Auth's listMembers endpoint.",
  })
);

export type BetterAuthFullMember = S.Schema.Type<typeof BetterAuthFullMemberSchema>;

// =============================================================================
// TRANSFORMATION SCHEMAS
// =============================================================================

/**
 * Type alias for Member.Model's encoded representation.
 * Used to ensure proper typing in the transformation without type assertions.
 */
type MemberModelEncoded = S.Schema.Encoded<typeof Member.Model>;

/**
 * Transforms a Better Auth member object into the domain Member.Model.
 *
 * This transformation handles:
 * - ID format validation (expects branded ID formats from DB-generated IDs)
 * - Mapping Better Auth fields to Member.Model encoded representation
 * - Role validation against MemberRole branded type
 * - REQUIRED fields validated via require* helpers (fail if missing)
 *
 * @remarks
 * Better Auth is configured with `generateId: false`, meaning the database
 * generates IDs in the branded format via EntityId.publicId().
 * This transformation validates that IDs match expected formats.
 */
export const DomainMemberFromBetterAuthMember = S.transformOrFail(BetterAuthMemberSchema, Member.Model, {
  strict: true,
  decode: (ba, _options, ast) =>
    Effect.gen(function* () {
      // Validate branded ID format using type guards
      const isValidMemberId = IamEntityIds.MemberId.is(ba.id);
      if (!isValidMemberId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, ba, `Invalid member ID format: expected "iam_member__<uuid>", got "${ba.id}"`)
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

      // Validate user ID format
      const isValidUserId = SharedEntityIds.UserId.is(ba.userId);
      if (!isValidUserId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, ba.userId, `Invalid user ID format: expected "shared_user__<uuid>", got "${ba.userId}"`)
        );
      }

      // Validate role against MemberRole branded type
      const roleResult = S.decodeUnknownEither(Member.MemberRole)(ba.role);
      if (roleResult._tag === "Left") {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            ba.role,
            `Invalid role value: expected "admin", "member", or "owner", got "${ba.role}"`
          )
        );
      }
      const role = roleResult.right;

      // Validate status against MemberStatus branded type
      const statusResult = S.decodeUnknownEither(Member.MemberStatus)(ba.status);
      if (statusResult._tag === "Left") {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            ba.status,
            `Invalid status value: expected one of "active", "inactive", "offline", "suspended", "deleted", "invited", got "${ba.status}"`
          )
        );
      }
      const status = statusResult.right;

      // Validate invitedBy if present
      if (ba.invitedBy !== undefined) {
        const isValidInvitedBy = SharedEntityIds.UserId.is(ba.invitedBy);
        if (!isValidInvitedBy) {
          return yield* ParseResult.fail(
            new ParseResult.Type(
              ast,
              ba.invitedBy,
              `Invalid invitedBy ID format: expected "shared_user__<uuid>", got "${ba.invitedBy}"`
            )
          );
        }
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

      // Construct the encoded form of Member.Model
      // FieldOptionOmittable fields use `| null` semantics in encoded form
      const encoded: MemberModelEncoded = {
        // Core identity fields
        id: ba.id,
        userId: ba.userId,
        organizationId: ba.organizationId,
        role,
        createdAt: toDate(ba.createdAt),

        // Direct mappings from additionalFields (member-specific)
        // Use null for absent optional values per FieldOptionOmittable semantics
        status,
        invitedBy: ba.invitedBy ?? null,
        invitedAt: ba.invitedAt ? toDate(ba.invitedAt) : null,
        joinedAt: ba.joinedAt ? toDate(ba.joinedAt) : null,
        lastActiveAt: ba.lastActiveAt ? toDate(ba.lastActiveAt) : null,
        permissions: ba.permissions ?? null,

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
  encode: (member, _options, _ast) =>
    Effect.gen(function* () {
      // Handle potentially undefined id by creating a new one
      const id = member.id ?? IamEntityIds.MemberId.create();

      const ba: BetterAuthMember = {
        id,
        organizationId: member.organizationId,
        userId: member.userId,
        role: member.role ?? Member.MemberRoleEnum.member,
        createdAt: toDate(member.createdAt),
        status: member.status ?? Member.MemberStatus.Enum.inactive,
        invitedBy: member.invitedBy ?? undefined,
        invitedAt: member.invitedAt ? toDate(member.invitedAt) : undefined,
        joinedAt: member.joinedAt ? toDate(member.joinedAt) : undefined,
        lastActiveAt: member.lastActiveAt ? toDate(member.lastActiveAt) : undefined,
        permissions: member.permissions ?? undefined,
        // Include audit columns for round-trip encoding
        _rowId: member._rowId,
        version: member.version,
        source: member.source ?? undefined,
        createdBy: member.createdBy ?? undefined,
        updatedBy: member.updatedBy ?? undefined,
        updatedAt: toDate(member.updatedAt),
        deletedAt: member.deletedAt ? toDate(member.deletedAt) : undefined,
        deletedBy: member.deletedBy ?? undefined,
      };
      return ba;
    }),
}).annotations(
  $I.annotations("DomainMemberFromBetterAuthMember", {
    description: "Transforms Better Auth member response to domain Member.Model",
  })
);

export declare namespace DomainMemberFromBetterAuthMember {
  export type Type = typeof DomainMemberFromBetterAuthMember.Type;
  export type Encoded = typeof DomainMemberFromBetterAuthMember.Encoded;
}

// =============================================================================
// FULL MEMBER SUCCESS CLASS
// =============================================================================

/**
 * Success schema for list-members endpoint that includes both the transformed
 * member and the raw embedded user for display purposes.
 *
 * The embedded user is NOT transformed to User.Model because Better Auth only
 * returns 4 fields (id, name, email, image). Attempting to transform to
 * User.Model (25+ fields) would require inventing data.
 */
export class FullMemberSuccess extends S.Class<FullMemberSuccess>($I`FullMemberSuccess`)({
  member: DomainMemberFromBetterAuthMember,
  user: BetterAuthEmbeddedUserSchema,
}) {}

export declare namespace FullMemberSuccess {
  export type Type = S.Schema.Type<typeof FullMemberSuccess>;
  export type Encoded = S.Schema.Encoded<typeof FullMemberSuccess>;
}
