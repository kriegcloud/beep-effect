import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import { Session } from "@beep/shared-domain/entities";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireDate, requireNumber, requireString, toDate } from "./transformation-helpers.ts";

const $I = $IamClientId.create("_common/session.schemas");

/**
 * Schema representing a Better Auth session object.
 *
 * This captures the session structure returned by Better Auth's session API,
 * including core fields and plugin-added fields (organization, team, impersonation).
 *
 * Uses Struct with Record extension to allow unknown properties from Better Auth
 * plugins that may add fields not reflected in TypeScript types.
 */
export const BetterAuthSessionSchema = S.Struct(
  {
    id: S.String,
    // Better Auth returns ISO-like date strings from the API (e.g., "2026-01-18 16:11:25.693+00")
    // but client-side hooks like useSession() may return JavaScript Date objects.
    // Use DateFromAllAcceptable to handle both string and Date inputs.
    createdAt: BS.DateFromAllAcceptable,
    updatedAt: BS.DateFromAllAcceptable,
    userId: S.String,
    expiresAt: BS.DateFromAllAcceptable,
    token: S.String,
    ipAddress: S.optionalWith(S.String, { nullable: true }),
    userAgent: S.optionalWith(S.String, { nullable: true }),
    activeOrganizationId: S.optionalWith(S.String, { nullable: true }),
    activeTeamId: S.optionalWith(S.String, { nullable: true }),
    impersonatedBy: S.optionalWith(S.String, { nullable: true }),
  },
  S.Record({ key: S.String, value: S.Unknown })
).annotations(
  $I.annotations("BetterAuthSession", { description: "The session object returned from the BetterAuth library." })
);

export type BetterAuthSession = S.Schema.Type<typeof BetterAuthSessionSchema>;

/**
 * Type alias for Session.Model's encoded representation.
 * Used to ensure proper typing in the transformation without type assertions.
 */
type SessionModelEncoded = S.Schema.Encoded<typeof Session.Model>;

/**
 * Transforms a Better Auth session object into the domain Session.Model.
 *
 * This transformation handles:
 * - ID format validation (expects branded ID formats from DB-generated IDs)
 * - Mapping Better Auth fields to Session.Model encoded representation
 * - REQUIRED fields validated via require* helpers (fail if missing)
 *
 * @remarks
 * Better Auth is configured with `generateId: false`, meaning the database
 * generates IDs in the branded format via EntityId.publicId().
 * This transformation validates that IDs match expected formats.
 *
 * REQUIRED fields (_rowId, version, source, deletedAt, createdBy, updatedBy, deletedBy)
 * MUST be present in the Better Auth response. If missing, the transformation
 * fails with ParseResult.ParseError to surface configuration issues.
 *
 * The transformation returns the "encoded" representation of Session.Model.
 * The schema framework then internally decodes this to the Type form.
 * This avoids type assertions by using explicit type annotations.
 *
 * The `activeOrganizationId` field is REQUIRED in the domain model, so this
 * transformation will fail if it's missing from the Better Auth session.
 */
export const DomainSessionFromBetterAuthSession = S.transformOrFail(BetterAuthSessionSchema, Session.Model, {
  strict: true,
  decode: Effect.fn(function* (betterAuthSession, _options, ast) {
    // Validate the session ID format
    const isValidSessionId = SharedEntityIds.SessionId.is(betterAuthSession.id);
    if (!isValidSessionId) {
      return yield* ParseResult.fail(
        new ParseResult.Type(
          ast,
          betterAuthSession.id,
          `Invalid session ID format: expected "shared_session__<uuid>", got "${betterAuthSession.id}"`
        )
      );
    }

    // Validate the user ID format
    const isValidUserId = SharedEntityIds.UserId.is(betterAuthSession.userId);
    if (!isValidUserId) {
      return yield* ParseResult.fail(
        new ParseResult.Type(
          ast,
          betterAuthSession.userId,
          `Invalid user ID format: expected "shared_user__<uuid>", got "${betterAuthSession.userId}"`
        )
      );
    }

    // Validate activeOrganizationId is present and valid (REQUIRED field)
    if (!betterAuthSession.activeOrganizationId) {
      return yield* ParseResult.fail(
        new ParseResult.Type(
          ast,
          betterAuthSession.activeOrganizationId,
          "activeOrganizationId is required but was null or undefined"
        )
      );
    }

    const isValidOrgId = SharedEntityIds.OrganizationId.is(betterAuthSession.activeOrganizationId);
    if (!isValidOrgId) {
      return yield* ParseResult.fail(
        new ParseResult.Type(
          ast,
          betterAuthSession.activeOrganizationId,
          `Invalid organization ID format: expected "shared_organization__<uuid>", got "${betterAuthSession.activeOrganizationId}"`
        )
      );
    }

    // Validate activeTeamId if present
    if (betterAuthSession.activeTeamId) {
      const isValidTeamId = SharedEntityIds.TeamId.is(betterAuthSession.activeTeamId);
      if (!isValidTeamId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            betterAuthSession.activeTeamId,
            `Invalid team ID format: expected "shared_team__<uuid>", got "${betterAuthSession.activeTeamId}"`
          )
        );
      }
    }

    // Validate impersonatedBy if present
    if (betterAuthSession.impersonatedBy) {
      const isValidImpersonatorId = SharedEntityIds.UserId.is(betterAuthSession.impersonatedBy);
      if (!isValidImpersonatorId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            betterAuthSession.impersonatedBy,
            `Invalid impersonatedBy ID format: expected "shared_user__<uuid>", got "${betterAuthSession.impersonatedBy}"`
          )
        );
      }
    }

    // =======================================================================
    // REQUIRED FIELDS - Must be present in Better Auth response
    // These use require* helpers that FAIL if the field is missing
    // =======================================================================

    const _rowId = yield* requireNumber(betterAuthSession, "_rowId", ast);
    const version = yield* requireNumber(betterAuthSession, "version", ast);
    const source = yield* requireString(betterAuthSession, "source", ast);
    const deletedAt = yield* requireDate(betterAuthSession, "deletedAt", ast);
    const createdBy = yield* requireString(betterAuthSession, "createdBy", ast);
    const updatedBy = yield* requireString(betterAuthSession, "updatedBy", ast);
    const deletedBy = yield* requireString(betterAuthSession, "deletedBy", ast);

    // Construct the encoded form of Session.Model
    // Type annotation ensures proper typing without type assertions
    // The schema framework will decode this to Session.Model.Type
    const encodedSession: SessionModelEncoded = {
      // Core identity fields
      id: betterAuthSession.id,
      _rowId,
      version,

      // Timestamp fields - Convert Date objects to ISO strings for SessionModelEncoded
      createdAt: toDate(betterAuthSession.createdAt),
      updatedAt: toDate(betterAuthSession.updatedAt),
      expiresAt: toDate(betterAuthSession.expiresAt),

      // Session data from Better Auth
      token: betterAuthSession.token,
      ipAddress: betterAuthSession.ipAddress ?? null,
      userAgent: betterAuthSession.userAgent ?? null,

      // Foreign key references
      userId: betterAuthSession.userId,
      activeOrganizationId: betterAuthSession.activeOrganizationId,

      // Optional fields from plugins
      activeTeamId: betterAuthSession.activeTeamId ?? null,
      impersonatedBy: betterAuthSession.impersonatedBy ?? null,

      // Audit fields - required, validated above
      source,
      deletedAt,
      createdBy,
      updatedBy,
      deletedBy,
    };

    return encodedSession;
  }),
  encode: Effect.fn(function* (sessionEncoded, _options, _ast) {
    // Convert back to BetterAuthSession's format
    const createdAt = toDate(sessionEncoded.createdAt);
    const updatedAt = toDate(sessionEncoded.updatedAt);
    const expiresAt = toDate(sessionEncoded.expiresAt);

    // id might be undefined in the encoded form (has default), handle that
    const id = sessionEncoded.id ?? SharedEntityIds.SessionId.create();

    // Return BetterAuthSession Type form (plain object matching the struct)
    // Include all fields that might have been set, so they round-trip correctly
    const betterAuthSession: BetterAuthSession = {
      id,
      createdAt,
      updatedAt,
      userId: sessionEncoded.userId,
      expiresAt,
      token: sessionEncoded.token,
      // Convert null to undefined for BetterAuthSession's optional fields
      ipAddress: sessionEncoded.ipAddress ?? undefined,
      userAgent: sessionEncoded.userAgent ?? undefined,
      activeOrganizationId: sessionEncoded.activeOrganizationId,
      activeTeamId: sessionEncoded.activeTeamId ?? undefined,
      impersonatedBy: sessionEncoded.impersonatedBy ?? undefined,
      // Include required fields for proper round-trip
      _rowId: sessionEncoded._rowId,
      version: sessionEncoded.version,
      source: sessionEncoded.source ?? undefined,
      deletedAt: sessionEncoded.deletedAt ? toDate(sessionEncoded.deletedAt) : undefined,
      createdBy: sessionEncoded.createdBy ?? undefined,
      updatedBy: sessionEncoded.updatedBy ?? undefined,
      deletedBy: sessionEncoded.deletedBy ?? undefined,
    };

    return betterAuthSession;
  }),
}).annotations(
  $I.annotations("DomainSessionFromBetterAuthSession", {
    description:
      "Transforms a Better Auth session response into the domain Session.Model, handling ID validation, date conversions, and requiring all domain fields to be present.",
  })
);

export declare namespace DomainSessionFromBetterAuthSession {
  export type Type = typeof DomainSessionFromBetterAuthSession.Type;
  export type Encoded = typeof DomainSessionFromBetterAuthSession.Encoded;
}
