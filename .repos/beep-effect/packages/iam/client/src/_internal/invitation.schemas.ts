import * as Invitation from "@beep/iam-domain/entities/Invitation";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireNumber, requireString, toDate } from "./transformation-helpers.ts";

const $I = $IamClientId.create("_internal/invitation.schemas");

// =============================================================================
// BETTER AUTH SCHEMAS
// =============================================================================

/**
 * Schema representing a Better Auth invitation object.
 *
 * This captures the invitation structure returned by Better Auth's organization API,
 * including core fields and additionalFieldsCommon configured in Options.ts.
 *
 * Uses Struct with Record extension to allow unknown properties from Better Auth
 * plugins that may add fields not reflected in TypeScript types.
 */
export const BetterAuthInvitationSchema = S.Struct(
  {
    id: S.String,
    organizationId: S.String,
    email: BS.EmailEncoded,
    role: S.String,
    status: S.String,
    teamId: S.optionalWith(S.String, { nullable: true }),
    inviterId: S.String,
    // Better Auth returns JavaScript Date objects, not ISO strings
    expiresAt: S.DateFromSelf,
    createdAt: S.DateFromSelf,
    // additionalFieldsCommon (audit columns, all entities)
    _rowId: S.optional(S.Number),
    version: S.optional(S.Number),
    source: S.optionalWith(S.String, { nullable: true }),
    createdBy: S.optionalWith(S.String, { nullable: true }),
    updatedBy: S.optionalWith(S.String, { nullable: true }),
    updatedAt: S.optional(S.DateFromSelf),
    deletedAt: S.optional(S.DateFromSelf),
    deletedBy: S.optionalWith(S.String, { nullable: true }),
  },
  S.Record({ key: S.String, value: S.Unknown })
).annotations(
  $I.annotations("BetterAuthInvitation", {
    description: "The invitation object returned from Better Auth with plugin extensions.",
  })
);

export type BetterAuthInvitation = S.Schema.Type<typeof BetterAuthInvitationSchema>;

// =============================================================================
// TRANSFORMATION SCHEMAS
// =============================================================================

/**
 * Type alias for Invitation.Model's encoded representation.
 * Used to ensure proper typing in the transformation without type assertions.
 */
type InvitationModelEncoded = S.Schema.Encoded<typeof Invitation.Model>;

/**
 * Transforms a Better Auth invitation object into the domain Invitation.Model.
 *
 * This transformation handles:
 * - ID format validation (expects branded ID formats from DB-generated IDs)
 * - Mapping Better Auth fields to Invitation.Model encoded representation
 * - Status validation against InvitationStatus branded type
 * - REQUIRED fields validated via require* helpers (fail if missing)
 *
 * @remarks
 * Better Auth is configured with `generateId: false`, meaning the database
 * generates IDs in the branded format via EntityId.publicId().
 * This transformation validates that IDs match expected formats.
 *
 * Note: The `email` field uses M.Sensitive in the domain model, but we assign
 * directly - M.Sensitive is a type wrapper affecting logging, not data transformation.
 */
export const DomainInvitationFromBetterAuthInvitation = S.transformOrFail(
  BetterAuthInvitationSchema,
  Invitation.Model,
  {
    strict: true,
    decode: (ba, _options, ast) =>
      Effect.gen(function* () {
        // Validate branded ID format using type guards
        const isValidInvitationId = IamEntityIds.InvitationId.is(ba.id);
        if (!isValidInvitationId) {
          return yield* ParseResult.fail(
            new ParseResult.Type(
              ast,
              ba,
              `Invalid invitation ID format: expected "iam_invitation__<uuid>", got "${ba.id}"`
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

        // Validate inviter ID format
        const isValidInviterId = SharedEntityIds.UserId.is(ba.inviterId);
        if (!isValidInviterId) {
          return yield* ParseResult.fail(
            new ParseResult.Type(
              ast,
              ba.inviterId,
              `Invalid inviter ID format: expected "shared_user__<uuid>", got "${ba.inviterId}"`
            )
          );
        }

        // Validate teamId if present
        if (ba.teamId !== undefined && ba.teamId !== null) {
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
        }

        // Validate status against InvitationStatus branded type
        const statusResult = S.decodeUnknownEither(Invitation.InvitationStatus)(ba.status);
        if (statusResult._tag === "Left") {
          return yield* ParseResult.fail(
            new ParseResult.Type(
              ast,
              ba.status,
              `Invalid status value: expected one of "pending", "rejected", "cancelled", "accepted", got "${ba.status}"`
            )
          );
        }
        const status = statusResult.right;

        // =======================================================================
        // REQUIRED FIELDS - Must be present in Better Auth response
        // These use require* helpers that FAIL if the field is missing
        // =======================================================================
        const _rowId = yield* requireNumber(ba, "_rowId", ast);
        const version = yield* requireNumber(ba, "version", ast);
        const source = yield* requireString(ba, "source", ast);
        const createdBy = yield* requireString(ba, "createdBy", ast);
        const updatedBy = yield* requireString(ba, "updatedBy", ast);

        // Construct the encoded form of Invitation.Model
        // FieldOptionOmittable fields use `| null` semantics in encoded form
        const encoded: InvitationModelEncoded = {
          // Core identity fields
          id: ba.id,
          organizationId: ba.organizationId,
          email: ba.email,
          role: ba.role,
          teamId: ba.teamId ?? null,
          status,
          expiresAt: toDate(ba.expiresAt),
          inviterId: ba.inviterId,
          createdAt: toDate(ba.createdAt),

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
    encode: (invitation, _options, _ast) =>
      Effect.gen(function* () {
        // Handle potentially undefined id by creating a new one
        const id = invitation.id ?? IamEntityIds.InvitationId.create();

        const ba: BetterAuthInvitation = {
          id,
          organizationId: invitation.organizationId ?? "",
          email: invitation.email,
          role: invitation.role ?? "member",
          status: invitation.status ?? Invitation.InvitationStatusEnum.pending,
          teamId: invitation.teamId ?? undefined,
          inviterId: invitation.inviterId,
          expiresAt: toDate(invitation.expiresAt),
          createdAt: toDate(invitation.createdAt),
          // Include audit columns for round-trip encoding
          _rowId: invitation._rowId,
          version: invitation.version,
          source: invitation.source ?? undefined,
          createdBy: invitation.createdBy ?? undefined,
          updatedBy: invitation.updatedBy ?? undefined,
          updatedAt: toDate(invitation.updatedAt),
          deletedAt: invitation.deletedAt ? toDate(invitation.deletedAt) : undefined,
          deletedBy: invitation.deletedBy ?? undefined,
        };
        return ba;
      }),
  }
).annotations(
  $I.annotations("DomainInvitationFromBetterAuthInvitation", {
    description: "Transforms Better Auth invitation response to domain Invitation.Model",
  })
);

export declare namespace DomainInvitationFromBetterAuthInvitation {
  export type Type = typeof DomainInvitationFromBetterAuthInvitation.Type;
  export type Encoded = typeof DomainInvitationFromBetterAuthInvitation.Encoded;
}
