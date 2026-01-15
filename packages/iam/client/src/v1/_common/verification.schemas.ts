import {Verification} from "@beep/iam-domain/entities";
import {$IamClientId} from "@beep/identity/packages";
import {IamEntityIds} from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import {requireDate, requireNumber, requireString, toDate} from "./transformation-helpers";

const $I = $IamClientId.create("_common/verification.schemas");

/**
 * Schema representing a Better Auth verification object.
 *
 * This captures the verification structure returned by Better Auth's verification API,
 * including token fields for email verification, password reset, and magic links.
 *
 * Uses Struct with Record extension to allow unknown properties from Better Auth
 * plugins that may add fields not reflected in TypeScript types.
 *
 * @remarks
 * The `value` field contains the verification token. While sensitive, it is returned
 * by Better Auth's API (not marked `returned: false` in the schema), so it is included
 * here to support full transformation. In practice, verification tokens are short-lived
 * and scoped to specific operations.
 */
export const BetterAuthVerificationSchema = F.pipe(
  S.Struct({
    // Core fields from coreSchema
    id: S.String,
    createdAt: S.String,
    updatedAt: S.String,

    // Verification-specific fields
    identifier: S.String,
    value: S.String,
    expiresAt: S.optionalWith(S.String, { nullable: true}),
  }),
  S.extend(S.Record({key: S.String, value: S.Unknown})),
  S.annotations(
    $I.annotations("BetterAuthVerification", {
      description: "The verification object returned from the BetterAuth library.",
    })
  )
);

export type BetterAuthVerification = S.Schema.Type<typeof BetterAuthVerificationSchema>;
export type BetterAuthVerificationEncoded = S.Schema.Encoded<typeof BetterAuthVerificationSchema>;

/**
 * Type alias for Verification.Model's encoded representation.
 * Used to ensure proper typing in the transformation without type assertions.
 */
type VerificationModelEncoded = S.Schema.Encoded<typeof Verification.Model>;

/**
 * Transforms a Better Auth verification object into the domain Verification.Model.
 *
 * This transformation handles:
 * - ID format validation (expects branded ID formats from DB-generated IDs)
 * - Mapping Better Auth fields to Verification.Model encoded representation
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
 * The transformation returns the "encoded" representation of Verification.Model.
 * The schema framework then internally decodes this to the Type form.
 * This avoids type assertions by using explicit type annotations.
 *
 * Verification tokens are sensitive but short-lived. The `value` field contains
 * the actual token used for verification operations (email confirmation, password
 * reset, magic link authentication).
 */
export const DomainVerificationFromBetterAuthVerification = S.transformOrFail(
  BetterAuthVerificationSchema,
  Verification.Model,
  {
    strict: true,
    decode: (betterAuthVerification, _options, ast) =>
      Effect.gen(function* () {
        // Validate the verification ID format
        const isValidVerificationId = IamEntityIds.VerificationId.is(betterAuthVerification.id);
        if (!isValidVerificationId) {
          return yield* ParseResult.fail(
            new ParseResult.Type(
              ast,
              betterAuthVerification.id,
              `Invalid verification ID format: expected "iam_verification__<uuid>", got "${betterAuthVerification.id}"`
            )
          );
        }

        // =======================================================================
        // REQUIRED FIELDS - Must be present in Better Auth response
        // These use require* helpers that FAIL if the field is missing
        // =======================================================================

        const _rowId = yield* requireNumber(betterAuthVerification, "_rowId", ast);
        const version = yield* requireNumber(betterAuthVerification, "version", ast);
        const source = yield* requireString(betterAuthVerification, "source", ast);
        const deletedAt = yield* requireDate(betterAuthVerification, "deletedAt", ast);
        const createdBy = yield* requireString(betterAuthVerification, "createdBy", ast);
        const updatedBy = yield* requireString(betterAuthVerification, "updatedBy", ast);
        const deletedBy = yield* requireString(betterAuthVerification, "deletedBy", ast);

        // Construct the encoded form of Verification.Model
        // Type annotation ensures proper typing without type assertions
        // The schema framework will decode this to Verification.Model.Type
        const encodedVerification: VerificationModelEncoded = {
          // Core identity fields
          id: betterAuthVerification.id,
          _rowId,
          version,

          // Timestamp fields - Date passed to schema, will be converted to DateTime.Utc
          createdAt: betterAuthVerification.createdAt,
          updatedAt: betterAuthVerification.updatedAt,

          // Verification-specific fields
          identifier: betterAuthVerification.identifier,
          value: betterAuthVerification.value,

          // expiresAt is FieldOptionOmittable so it expects null | Date
          expiresAt: betterAuthVerification.expiresAt ?? null,

          // Audit fields - required, validated above
          source,
          deletedAt,
          createdBy,
          updatedBy,
          deletedBy,
        };

        return encodedVerification;
      }),

    encode: (verificationEncoded, _options, _ast) =>
      Effect.gen(function* () {
        // Convert back to BetterAuthVerification's format
        const createdAt = toDate(verificationEncoded.createdAt);
        const updatedAt = toDate(verificationEncoded.updatedAt);

        // id might be undefined in the encoded form (has default), handle that
        const id = verificationEncoded.id ?? IamEntityIds.VerificationId.create();

        // expiresAt may be null/undefined - convert to Date if present
        const expiresAt = verificationEncoded.expiresAt ? toDate(verificationEncoded.expiresAt) : undefined;

        // Return BetterAuthVerification Type form (plain object matching the struct)
        // Include all fields that might have been set, so they round-trip correctly
        const betterAuthVerification: BetterAuthVerification = {
          id,
          createdAt,
          updatedAt,
          identifier: verificationEncoded.identifier,
          value: verificationEncoded.value,
          expiresAt,
          // Include required fields for proper round-trip
          _rowId: verificationEncoded._rowId,
          version: verificationEncoded.version,
          source: verificationEncoded.source ?? undefined,
          deletedAt: verificationEncoded.deletedAt ? toDate(verificationEncoded.deletedAt) : undefined,
          createdBy: verificationEncoded.createdBy ?? undefined,
          updatedBy: verificationEncoded.updatedBy ?? undefined,
          deletedBy: verificationEncoded.deletedBy ?? undefined,
        };

        return betterAuthVerification;
      }),
  }
).annotations(
  $I.annotations("DomainVerificationFromBetterAuthVerification", {
    description:
      "Transforms a Better Auth verification response into the domain Verification.Model, handling ID validation, date conversions, and requiring all domain fields to be present.",
  })
);

export declare namespace DomainVerificationFromBetterAuthVerification {
  export type Type = typeof DomainVerificationFromBetterAuthVerification.Type;
  export type Encoded = typeof DomainVerificationFromBetterAuthVerification.Encoded;
}
