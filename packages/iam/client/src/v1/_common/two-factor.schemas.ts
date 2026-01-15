import { TwoFactor } from "@beep/iam-domain/entities";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireDate, requireNumber, requireString, toDate } from "./transformation-helpers";

const $I = $IamClientId.create("_common/two-factor.schemas");

/**
 * Schema representing a Better Auth two-factor authentication object.
 *
 * This captures the TwoFactor structure from Better Auth, containing
 * authentication secrets and backup codes for TOTP-based 2FA.
 *
 * @remarks
 * IMPORTANT: Better Auth's TwoFactor schema marks ALL plugin-specific fields
 * as `returned: false`:
 * - `secret` - TOTP secret key (never returned by API)
 * - `backupCodes` - Recovery codes (never returned by API)
 * - `userId` - Owner reference (never returned by API)
 *
 * The Struct only includes coreSchema fields (id, createdAt, updatedAt).
 * The Record extension captures sensitive fields when they ARE present
 * (e.g., in internal/admin data flows with full database access).
 *
 * This pattern mirrors RateLimit where Struct has minimal fields but
 * Record extension captures all database-provided fields.
 *
 * Uses Struct with Record extension to allow unknown properties from
 * Better Auth database layer that may add fields not in API responses.
 */
export const BetterAuthTwoFactorSchema = F.pipe(
  S.Struct({
    // Core fields from coreSchema (these ARE returned by API)
    id: S.String,
    createdAt: S.Date,
    updatedAt: S.Date,
    // NOTE: secret, backupCodes, userId have `returned: false` in Better Auth
    // They are NOT included in the Struct, but can be extracted from Record
    // extension when present (internal/admin flows with full database data)
  }),
  S.extend(S.Record({ key: S.String, value: S.Unknown })),
  S.annotations(
    $I.annotations("BetterAuthTwoFactor", {
      description:
        "The two-factor auth object from Better Auth. Struct contains only coreSchema fields; sensitive fields (secret, backupCodes, userId) are marked returned: false and only present in internal data flows via Record extension.",
    })
  )
);

export type BetterAuthTwoFactor = S.Schema.Type<typeof BetterAuthTwoFactorSchema>;
export type BetterAuthTwoFactorEncoded = S.Schema.Encoded<typeof BetterAuthTwoFactorSchema>;

/**
 * Type alias for TwoFactor.Model's encoded representation.
 * Used to ensure proper typing in the transformation without type assertions.
 */
type TwoFactorModelEncoded = S.Schema.Encoded<typeof TwoFactor.Model>;

/**
 * Transforms a Better Auth two-factor object into the domain TwoFactor.Model.
 *
 * This transformation handles:
 * - ID format validation (expects branded ID format from DB-generated IDs)
 * - Mapping Better Auth fields to TwoFactor.Model encoded representation
 * - Extracting sensitive fields (secret, backupCodes, userId) from Record extension
 * - REQUIRED fields validated via require* helpers (fail if missing)
 *
 * @remarks
 * IMPORTANT: This transformation only works when sensitive fields ARE present.
 * Since Better Auth marks secret/backupCodes/userId as `returned: false`, this
 * transformation will FAIL for standard API responses (which lack these fields).
 *
 * Use cases where this transformation works:
 * - Internal/admin data flows with full database access
 * - Database query results (before API serialization)
 * - Testing with mock data that includes all fields
 *
 * The transformation extracts sensitive fields from the Record extension
 * (similar to how RateLimit extracts id/createdAt/updatedAt from Record).
 *
 * Better Auth is configured with `generateId: false`, meaning the database
 * generates IDs in the branded format via EntityId.publicId().
 *
 * REQUIRED fields (_rowId, version, source, deletedAt, createdBy, updatedBy, deletedBy)
 * MUST be present in the data. If missing, the transformation fails with
 * ParseResult.ParseError to surface configuration issues.
 *
 * The transformation returns the "encoded" representation of TwoFactor.Model.
 * The schema framework then internally decodes this to the Type form.
 * This avoids type assertions by using explicit type annotations.
 */
export const DomainTwoFactorFromBetterAuthTwoFactor = S.transformOrFail(BetterAuthTwoFactorSchema, TwoFactor.Model, {
  strict: true,
  decode: (betterAuthTwoFactor, _options, ast) =>
    Effect.gen(function* () {
      // Validate the TwoFactor ID format
      const isValidTwoFactorId = IamEntityIds.TwoFactorId.is(betterAuthTwoFactor.id);
      if (!isValidTwoFactorId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            betterAuthTwoFactor.id,
            `Invalid TwoFactor ID format: expected "iam_two_factor__<uuid>", got "${betterAuthTwoFactor.id}"`
          )
        );
      }

      // =======================================================================
      // SENSITIVE FIELDS - Extracted from Record extension
      // These have `returned: false` in Better Auth and are only present
      // when we have full database data (not from API responses)
      // =======================================================================

      const secretRaw = yield* requireString(betterAuthTwoFactor, "secret", ast);
      if (secretRaw === null) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            secretRaw,
            "secret is required for TwoFactor but was null (field may have returned: false in API response)"
          )
        );
      }
      const secret = secretRaw;

      const backupCodesRaw = yield* requireString(betterAuthTwoFactor, "backupCodes", ast);
      if (backupCodesRaw === null) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            backupCodesRaw,
            "backupCodes is required for TwoFactor but was null (field may have returned: false in API response)"
          )
        );
      }
      const backupCodes = backupCodesRaw;

      // Validate userId is present and has valid format
      const userIdRaw = yield* requireString(betterAuthTwoFactor, "userId", ast);
      if (userIdRaw === null) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            userIdRaw,
            "userId is required for TwoFactor but was null (field may have returned: false in API response)"
          )
        );
      }
      const userId = userIdRaw;

      const isValidUserId = SharedEntityIds.UserId.is(userId);
      if (!isValidUserId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, userId, `Invalid user ID format: expected "shared_user__<uuid>", got "${userId}"`)
        );
      }

      // =======================================================================
      // REQUIRED FIELDS - Must be present in Better Auth response
      // These use require* helpers that FAIL if the field is missing
      // =======================================================================

      const _rowId = yield* requireNumber(betterAuthTwoFactor, "_rowId", ast);
      const version = yield* requireNumber(betterAuthTwoFactor, "version", ast);
      const source = yield* requireString(betterAuthTwoFactor, "source", ast);
      const deletedAt = yield* requireDate(betterAuthTwoFactor, "deletedAt", ast);
      const createdBy = yield* requireString(betterAuthTwoFactor, "createdBy", ast);
      const updatedBy = yield* requireString(betterAuthTwoFactor, "updatedBy", ast);
      const deletedBy = yield* requireString(betterAuthTwoFactor, "deletedBy", ast);

      // Construct the encoded form of TwoFactor.Model
      // Type annotation ensures proper typing without type assertions
      // The schema framework will decode this to TwoFactor.Model.Type
      const encodedTwoFactor: TwoFactorModelEncoded = {
        // Core identity fields
        id: betterAuthTwoFactor.id,
        _rowId,
        version,

        // Timestamp fields - Date passed to schema, will be converted to DateTime.Utc
        createdAt: betterAuthTwoFactor.createdAt,
        updatedAt: betterAuthTwoFactor.updatedAt,

        // Sensitive fields from Better Auth (extracted from Record extension)
        // M.Sensitive encoded form is plain string, schema handles Redacted wrapping
        secret,
        backupCodes,

        // Foreign key reference (validated above)
        userId,

        // Audit fields - required, validated above
        source,
        deletedAt,
        createdBy,
        updatedBy,
        deletedBy,
      };

      return encodedTwoFactor;
    }),

  encode: (twoFactorEncoded, _options, _ast) =>
    Effect.gen(function* () {
      // Convert back to BetterAuthTwoFactor's format
      const createdAt = toDate(twoFactorEncoded.createdAt);
      const updatedAt = toDate(twoFactorEncoded.updatedAt);

      // id might be undefined in the encoded form (has default), handle that
      const id = twoFactorEncoded.id ?? IamEntityIds.TwoFactorId.create();

      // Return BetterAuthTwoFactor Type form (plain object matching the struct)
      // Include all fields that might have been set, so they round-trip correctly
      // Note: secret, backupCodes, userId go into Record extension portion
      const betterAuthTwoFactor: BetterAuthTwoFactor = {
        id,
        createdAt,
        updatedAt,
        // Sensitive fields (go into Record extension)
        // M.Sensitive Type form may be Redacted - if so, would need Redacted.value()
        // For now, assuming encoded form is plain string
        secret: twoFactorEncoded.secret,
        backupCodes: twoFactorEncoded.backupCodes,
        userId: twoFactorEncoded.userId,
        // Include required fields for proper round-trip
        _rowId: twoFactorEncoded._rowId,
        version: twoFactorEncoded.version,
        source: twoFactorEncoded.source ?? undefined,
        deletedAt: twoFactorEncoded.deletedAt ? toDate(twoFactorEncoded.deletedAt) : undefined,
        createdBy: twoFactorEncoded.createdBy ?? undefined,
        updatedBy: twoFactorEncoded.updatedBy ?? undefined,
        deletedBy: twoFactorEncoded.deletedBy ?? undefined,
      };

      return betterAuthTwoFactor;
    }),
}).annotations(
  $I.annotations("DomainTwoFactorFromBetterAuthTwoFactor", {
    description:
      "Transforms a Better Auth TwoFactor record into the domain TwoFactor.Model. Requires sensitive fields (secret, backupCodes, userId) to be present - will fail for API responses where these are omitted.",
  })
);

export declare namespace DomainTwoFactorFromBetterAuthTwoFactor {
  export type Type = typeof DomainTwoFactorFromBetterAuthTwoFactor.Type;
  export type Encoded = typeof DomainTwoFactorFromBetterAuthTwoFactor.Encoded;
}
