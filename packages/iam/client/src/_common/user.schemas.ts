import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import { User } from "@beep/shared-domain/entities";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import {
  requireBoolean,
  requireDate,
  requireField,
  requireNumber,
  requireString,
  toDate,
} from "./transformation-helpers.ts";

const $I = $IamClientId.create("_common/user.schemas");

/**
 * Schema representing a Better Auth user object.
 *
 * This captures the user structure returned by Better Auth's user API.
 *
 * Uses Struct with Record extension to allow unknown properties from Better Auth
 * plugins that may add fields not reflected in TypeScript types.
 *
 * Core fields are defined explicitly. Plugin-added fields (banned, isAnonymous,
 * phoneNumber, twoFactorEnabled, username, etc.) are captured via the Record
 * extension and extracted using require* helpers that fail if missing.
 */
export const BetterAuthUserSchema = F.pipe(
  S.Struct({
    id: S.String,
    createdAt: S.String,
    updatedAt: S.String,
    email: S.String,
    emailVerified: S.Boolean,
    name: S.String,
    image: S.optionalWith(S.String, { nullable: true }),
  }),
  S.extend(S.Record({ key: S.String, value: S.Unknown })),
  S.annotations(
    $I.annotations("BetterAuthUser", {
      description: "The user object returned from the BetterAuth library.",
    })
  )
);

export type BetterAuthUser = S.Schema.Type<typeof BetterAuthUserSchema>;
export type BetterAuthUserEncoded = S.Schema.Encoded<typeof BetterAuthUserSchema>;

/**
 * Type alias for User.Model's encoded representation.
 * Used to ensure proper typing in the transformation without type assertions.
 */
type UserModelEncoded = S.Schema.Encoded<typeof User.Model>;

/**
 * Transforms a Better Auth user object into the domain User.Model.
 *
 * This transformation handles:
 * - ID format validation (expects `shared_user__${uuid}` format from DB-generated IDs)
 * - Mapping Better Auth fields to User.Model encoded representation
 * - REQUIRED fields validated via require* helpers (fail if missing)
 *
 * @remarks
 * Better Auth is configured with `generateId: false`, meaning the database
 * generates IDs in the `shared_user__${uuid}` format via EntityId.publicId().
 * This transformation validates that the ID matches this expected format.
 *
 * REQUIRED fields (_rowId, version, source, deletedAt, createdBy, updatedBy, deletedBy,
 * and all domain-specific fields) MUST be present in the Better Auth response.
 * If missing, the transformation fails with ParseResult.ParseError to surface
 * configuration issues (e.g., missing plugins).
 *
 * The transformation returns the "encoded" representation of User.Model.
 * The schema framework then internally decodes this to the Type form.
 * This avoids type assertions by using explicit type annotations.
 */
export const DomainUserFromBetterAuthUser = S.transformOrFail(BetterAuthUserSchema, User.Model, {
  strict: true,
  decode: (betterAuthUser, _options, ast) =>
    Effect.gen(function* () {
      // Validate the ID format - Better Auth IDs should already be in shared_user__${uuid} format
      // since the database generates them via EntityId.publicId()
      const isValidId = SharedEntityIds.UserId.is(betterAuthUser.id);
      if (!isValidId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            betterAuthUser.id,
            `Invalid user ID format: expected "shared_user__<uuid>", got "${betterAuthUser.id}"`
          )
        );
      }

      // Validate name is non-empty
      if (betterAuthUser.name.length === 0) {
        return yield* ParseResult.fail(new ParseResult.Type(ast, betterAuthUser.name, "User name cannot be empty"));
      }

      // =======================================================================
      // REQUIRED FIELDS - Must be present in Better Auth response
      // These use require* helpers that FAIL if the field is missing
      // =======================================================================

      // Core audit/tracking fields
      const _rowId = yield* requireNumber(betterAuthUser, "_rowId", ast);
      const version = yield* requireNumber(betterAuthUser, "version", ast);
      const source = yield* requireString(betterAuthUser, "source", ast);
      const deletedAt = yield* requireDate(betterAuthUser, "deletedAt", ast);
      const createdBy = yield* requireString(betterAuthUser, "createdBy", ast);
      const updatedBy = yield* requireString(betterAuthUser, "updatedBy", ast);
      const deletedBy = yield* requireString(betterAuthUser, "deletedBy", ast);

      // Domain-specific fields - must be present via Better Auth plugins
      const uploadLimit = yield* requireNumber(betterAuthUser, "uploadLimit", ast);
      const roleValue = yield* requireField(betterAuthUser, "role", ast);
      // Validate role is a valid UserRole value before using
      if (!S.is(User.UserRole)(roleValue)) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            roleValue,
            `Invalid role value: expected "admin" or "user", got "${String(roleValue)}"`
          )
        );
      }
      const role = roleValue;
      const banned = yield* requireBoolean(betterAuthUser, "banned", ast);
      const banReason = yield* requireString(betterAuthUser, "banReason", ast);
      const banExpires = yield* requireDate(betterAuthUser, "banExpires", ast);
      const isAnonymous = yield* requireBoolean(betterAuthUser, "isAnonymous", ast);
      const phoneNumber = yield* requireString(betterAuthUser, "phoneNumber", ast);
      const phoneNumberVerified = yield* requireBoolean(betterAuthUser, "phoneNumberVerified", ast);
      const twoFactorEnabled = yield* requireBoolean(betterAuthUser, "twoFactorEnabled", ast);
      const username = yield* requireString(betterAuthUser, "username", ast);
      const displayUsername = yield* requireString(betterAuthUser, "displayUsername", ast);
      const stripeCustomerId = yield* requireString(betterAuthUser, "stripeCustomerId", ast);
      const lastLoginMethod = yield* requireString(betterAuthUser, "lastLoginMethod", ast);

      // Construct the encoded form of User.Model
      // Type annotation ensures proper typing without type assertions
      // The schema framework will decode this to User.Model.Type
      const encodedUser: UserModelEncoded = {
        // Core identity fields
        id: betterAuthUser.id,
        _rowId,
        version,

        // Timestamp fields - Date passed to schema, will be converted to DateTime.Utc
        createdAt: betterAuthUser.createdAt,
        updatedAt: betterAuthUser.updatedAt,

        // User data from Better Auth
        name: betterAuthUser.name,
        email: betterAuthUser.email,
        emailVerified: betterAuthUser.emailVerified,
        image: betterAuthUser.image ?? null,

        // Audit tracking fields - required, validated above
        source,
        deletedAt,
        createdBy,
        updatedBy,
        deletedBy,

        // Domain-specific fields - required, validated above
        uploadLimit,
        role,
        banned,
        banReason,
        banExpires,
        isAnonymous,
        phoneNumber,
        phoneNumberVerified,
        twoFactorEnabled,
        username,
        displayUsername,
        stripeCustomerId,
        lastLoginMethod,
      };

      return encodedUser;
    }),

  encode: (userEncoded, _options, _ast) =>
    Effect.gen(function* () {
      // Convert back to BetterAuthUser's format
      const createdAt = toDate(userEncoded.createdAt);
      const updatedAt = toDate(userEncoded.updatedAt);

      // id might be undefined in the encoded form (has default), handle that
      const id = userEncoded.id ?? SharedEntityIds.UserId.create();

      // Return BetterAuthUser Type form (plain object matching the struct)
      // Include all fields that might have been set, so they round-trip correctly
      const betterAuthUser: BetterAuthUser = {
        id,
        createdAt,
        updatedAt,
        email: userEncoded.email,
        emailVerified: userEncoded.emailVerified ?? false,
        name: userEncoded.name,
        // Convert null to undefined for BetterAuthUser's optional image field
        image: userEncoded.image ?? undefined,
        // Include required fields for proper round-trip
        _rowId: userEncoded._rowId,
        version: userEncoded.version,
        source: userEncoded.source ?? undefined,
        deletedAt: userEncoded.deletedAt ? toDate(userEncoded.deletedAt) : undefined,
        createdBy: userEncoded.createdBy ?? undefined,
        updatedBy: userEncoded.updatedBy ?? undefined,
        deletedBy: userEncoded.deletedBy ?? undefined,
        uploadLimit: userEncoded.uploadLimit,
        role: userEncoded.role,
        banned: userEncoded.banned,
        banReason: userEncoded.banReason ?? undefined,
        banExpires: userEncoded.banExpires ? toDate(userEncoded.banExpires) : undefined,
        isAnonymous: userEncoded.isAnonymous,
        phoneNumber: userEncoded.phoneNumber ?? undefined,
        phoneNumberVerified: userEncoded.phoneNumberVerified,
        twoFactorEnabled: userEncoded.twoFactorEnabled,
        username: userEncoded.username ?? undefined,
        displayUsername: userEncoded.displayUsername ?? undefined,
        stripeCustomerId: userEncoded.stripeCustomerId ?? undefined,
        lastLoginMethod: userEncoded.lastLoginMethod ?? undefined,
      };

      return betterAuthUser;
    }),
}).annotations(
  $I.annotations("DomainUserFromBetterAuthUser", {
    description:
      "Transforms a Better Auth user response into the domain User.Model, handling ID validation, date conversions, and requiring all domain fields to be present.",
  })
);

export declare namespace DomainUserFromBetterAuthUser {
  export type Type = typeof DomainUserFromBetterAuthUser.Type;
  export type Encoded = typeof DomainUserFromBetterAuthUser.Encoded;
}
