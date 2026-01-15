import { Account } from "@beep/iam-domain/entities";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireDate, requireNumber, requireString, toDate } from "./transformation-helpers.ts";

const $I = $IamClientId.create("_common/account.schemas");

/**
 * Schema representing a Better Auth account object.
 *
 * This captures the account structure returned by Better Auth's account API,
 * including OAuth provider fields and optional credential fields.
 *
 * Uses Struct with Record extension to allow unknown properties from Better Auth
 * plugins that may add fields not reflected in TypeScript types.
 *
 * @remarks
 * Fields like `password` are marked `returned: false` in Better Auth schema but
 * are included here to support the full transformation, as some flows may return
 * partial account data.
 */
export const BetterAuthAccountSchema = F.pipe(
  S.Struct({
    // Core fields from coreSchema
    id: S.String,
    createdAt: S.String,
    updatedAt: S.String,

    // Account identity fields
    providerId: S.String,
    accountId: S.String,
    userId: S.String,

    // OAuth token fields (nullable)
    accessToken: S.optionalWith(S.String, { nullable: true }),
    refreshToken: S.optionalWith(S.String, { nullable: true }),
    idToken: S.optionalWith(S.String, { nullable: true }),

    // Token expiry fields (nullable dates)
    accessTokenExpiresAt: S.optionalWith(S.String, { nullable: true }),
    refreshTokenExpiresAt: S.optionalWith(S.String, { nullable: true }),

    // OAuth scope (nullable)
    scope: S.optionalWith(S.String, { nullable: true }),

    // Password for credential-based accounts (nullable, typically not returned)
    password: S.optionalWith(S.String, { nullable: true }),
  }),
  S.extend(S.Record({ key: S.String, value: S.Unknown })),
  S.annotations(
    $I.annotations("BetterAuthAccount", {
      description: "The account object returned from the BetterAuth library.",
    })
  )
);

export type BetterAuthAccount = S.Schema.Type<typeof BetterAuthAccountSchema>;
export type BetterAuthAccountEncoded = S.Schema.Encoded<typeof BetterAuthAccountSchema>;

/**
 * Type alias for Account.Model's encoded representation.
 * Used to ensure proper typing in the transformation without type assertions.
 */
type AccountModelEncoded = S.Schema.Encoded<typeof Account.Model>;

/**
 * Transforms a Better Auth account object into the domain Account.Model.
 *
 * This transformation handles:
 * - ID format validation (expects branded ID formats from DB-generated IDs)
 * - Mapping Better Auth fields to Account.Model encoded representation
 * - REQUIRED fields validated via require* helpers (fail if missing)
 * - Converting nullable fields to the Option-based encoded format
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
 * The transformation returns the "encoded" representation of Account.Model.
 * The schema framework then internally decodes this to the Type form.
 * This avoids type assertions by using explicit type annotations.
 */
export const DomainAccountFromBetterAuthAccount = S.transformOrFail(BetterAuthAccountSchema, Account.Model, {
  strict: true,
  decode: (betterAuthAccount, _options, ast) =>
    Effect.gen(function* () {
      // Validate the account ID format
      const isValidAccountId = IamEntityIds.AccountId.is(betterAuthAccount.id);
      if (!isValidAccountId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            betterAuthAccount.id,
            `Invalid account ID format: expected "iam_account__<uuid>", got "${betterAuthAccount.id}"`
          )
        );
      }

      // Validate the user ID format
      const isValidUserId = SharedEntityIds.UserId.is(betterAuthAccount.userId);
      if (!isValidUserId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(
            ast,
            betterAuthAccount.userId,
            `Invalid user ID format: expected "shared_user__<uuid>", got "${betterAuthAccount.userId}"`
          )
        );
      }

      // =======================================================================
      // REQUIRED FIELDS - Must be present in Better Auth response
      // These use require* helpers that FAIL if the field is missing
      // =======================================================================

      const _rowId = yield* requireNumber(betterAuthAccount, "_rowId", ast);
      const version = yield* requireNumber(betterAuthAccount, "version", ast);
      const source = yield* requireString(betterAuthAccount, "source", ast);
      const deletedAt = yield* requireDate(betterAuthAccount, "deletedAt", ast);
      const createdBy = yield* requireString(betterAuthAccount, "createdBy", ast);
      const updatedBy = yield* requireString(betterAuthAccount, "updatedBy", ast);
      const deletedBy = yield* requireString(betterAuthAccount, "deletedBy", ast);

      // Construct the encoded form of Account.Model
      // Type annotation ensures proper typing without type assertions
      // The schema framework will decode this to Account.Model.Type
      const encodedAccount: AccountModelEncoded = {
        // Core identity fields
        id: betterAuthAccount.id,
        _rowId,
        version,

        // Timestamp fields - Date passed to schema, will be converted to DateTime.Utc
        createdAt: betterAuthAccount.createdAt,
        updatedAt: betterAuthAccount.updatedAt,

        // Account identity fields from Better Auth
        providerId: betterAuthAccount.providerId,
        accountId: betterAuthAccount.accountId,
        userId: betterAuthAccount.userId,

        // OAuth tokens (nullable -> null for Option encoding)
        // FieldSensitiveOptionOmittable expects null | string for Encoded form
        accessToken: betterAuthAccount.accessToken ?? null,
        refreshToken: betterAuthAccount.refreshToken ?? null,
        idToken: betterAuthAccount.idToken ?? null,

        // Token expiry dates (nullable -> null for Option encoding)
        // FieldOptionOmittable with DateTimeUtc expects null | Date
        accessTokenExpiresAt: betterAuthAccount.accessTokenExpiresAt ?? null,
        refreshTokenExpiresAt: betterAuthAccount.refreshTokenExpiresAt ?? null,

        // OAuth scope
        scope: betterAuthAccount.scope ?? null,

        // Password field (typically not returned by Better Auth API)
        password: betterAuthAccount.password ?? null,

        // Audit fields - required, validated above
        source,
        deletedAt,
        createdBy,
        updatedBy,
        deletedBy,
      };

      return encodedAccount;
    }),

  encode: (accountEncoded, _options, _ast) =>
    Effect.gen(function* () {
      // Convert back to BetterAuthAccount's format
      const createdAt = toDate(accountEncoded.createdAt);
      const updatedAt = toDate(accountEncoded.updatedAt);

      // id might be undefined in the encoded form (has default), handle that
      const id = accountEncoded.id ?? IamEntityIds.AccountId.create();

      // Return BetterAuthAccount Type form (plain object matching the struct)
      // Include all fields that might have been set, so they round-trip correctly
      const betterAuthAccount: BetterAuthAccount = {
        id,
        createdAt,
        updatedAt,
        providerId: accountEncoded.providerId,
        accountId: accountEncoded.accountId,
        userId: accountEncoded.userId,
        // Convert null to undefined for BetterAuthAccount's optional fields
        accessToken: accountEncoded.accessToken ?? undefined,
        refreshToken: accountEncoded.refreshToken ?? undefined,
        idToken: accountEncoded.idToken ?? undefined,
        accessTokenExpiresAt: accountEncoded.accessTokenExpiresAt
          ? toDate(accountEncoded.accessTokenExpiresAt)
          : undefined,
        refreshTokenExpiresAt: accountEncoded.refreshTokenExpiresAt
          ? toDate(accountEncoded.refreshTokenExpiresAt)
          : undefined,
        scope: accountEncoded.scope ?? undefined,
        password: accountEncoded.password ?? undefined,
        // Include required fields for proper round-trip
        _rowId: accountEncoded._rowId,
        version: accountEncoded.version,
        source: accountEncoded.source ?? undefined,
        deletedAt: accountEncoded.deletedAt ? toDate(accountEncoded.deletedAt) : undefined,
        createdBy: accountEncoded.createdBy ?? undefined,
        updatedBy: accountEncoded.updatedBy ?? undefined,
        deletedBy: accountEncoded.deletedBy ?? undefined,
      };

      return betterAuthAccount;
    }),
}).annotations(
  $I.annotations("DomainAccountFromBetterAuthAccount", {
    description:
      "Transforms a Better Auth account response into the domain Account.Model, handling ID validation, date conversions, and requiring all domain fields to be present.",
  })
);

export declare namespace DomainAccountFromBetterAuthAccount {
  export type Type = typeof DomainAccountFromBetterAuthAccount.Type;
  export type Encoded = typeof DomainAccountFromBetterAuthAccount.Encoded;
}
