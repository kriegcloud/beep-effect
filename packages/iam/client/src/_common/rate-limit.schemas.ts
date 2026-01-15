import { RateLimit } from "@beep/iam-domain/entities";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireDate, requireNumber, requireString, toDate } from "./transformation-helpers.ts";

const $I = $IamClientId.create("_common/rate-limit.schemas");

/**
 * Schema representing a Better Auth rate limit object.
 *
 * IMPORTANT: Better Auth's RateLimit schema does NOT extend coreSchema.
 * The native schema only has: key, count, lastRequest
 *
 * However, our database augments these records with id and audit fields.
 * The Record extension captures these database-added fields.
 *
 * Unlike Session, Account, and Verification, the BetterAuthRateLimitSchema
 * only defines the three native fields that Better Auth knows about.
 * All other fields (id, _rowId, version, audit fields) come from the
 * database layer and are accessed via the Record extension.
 */
export const BetterAuthRateLimitSchema = F.pipe(
  S.Struct({
    // Better Auth native fields (these are the ONLY fields Better Auth defines)
    key: S.String,
    count: S.Number,
    lastRequest: S.Number, // Timestamp in milliseconds
  }),
  S.extend(S.Record({ key: S.String, value: S.Unknown })),
  S.annotations(
    $I.annotations("BetterAuthRateLimit", {
      description: "The rate limit object returned from the BetterAuth library.",
    })
  )
);

export type BetterAuthRateLimit = S.Schema.Type<typeof BetterAuthRateLimitSchema>;
export type BetterAuthRateLimitEncoded = S.Schema.Encoded<typeof BetterAuthRateLimitSchema>;

/**
 * Type alias for RateLimit.Model's encoded representation.
 * Used to ensure proper typing in the transformation without type assertions.
 */
type RateLimitModelEncoded = S.Schema.Encoded<typeof RateLimit.Model>;

/**
 * Transforms a Better Auth rate limit object into the domain RateLimit.Model.
 *
 * IMPORTANT: Unlike other entities, Better Auth's RateLimit doesn't have id or
 * audit fields in its native schema. These are added by our database and
 * accessed via the Record extension pattern.
 *
 * This transformation handles:
 * - ID extraction from Record extension (database-generated, NOT from Better Auth)
 * - ID format validation (expects branded ID format "iam_rate_limit__<uuid>")
 * - Mapping Better Auth native fields to RateLimit.Model encoded representation
 * - REQUIRED database fields validated via require* helpers (fail if missing)
 *
 * @remarks
 * Better Auth is configured with `generateId: false`, meaning the database
 * generates IDs in the branded format via EntityId.publicId().
 * For RateLimit, the id comes ONLY from the database - Better Auth never
 * provides it since RateLimit doesn't extend coreSchema.
 *
 * The `lastRequest` field uses BigIntFromNumber in the domain model:
 * - Encoded form: number (timestamp in milliseconds)
 * - Type form: bigint
 *
 * The transformation returns the "encoded" representation of RateLimit.Model.
 * The schema framework then internally decodes this to the Type form.
 * This avoids type assertions by using explicit type annotations.
 */
export const DomainRateLimitFromBetterAuthRateLimit = S.transformOrFail(BetterAuthRateLimitSchema, RateLimit.Model, {
  strict: true,
  decode: (betterAuthRateLimit, _options, ast) =>
    Effect.gen(function* () {
      // =======================================================================
      // ID VALIDATION - Must be present from database (via Record extension)
      // Better Auth's RateLimit schema does NOT include id - it comes from DB
      // =======================================================================

      const id = yield* requireString(betterAuthRateLimit, "id", ast);
      if (id === null) {
        return yield* ParseResult.fail(new ParseResult.Type(ast, id, "RateLimit id is required but was null"));
      }

      const isValidRateLimitId = IamEntityIds.RateLimitId.is(id);
      if (!isValidRateLimitId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, id, `Invalid rate limit ID format: expected "iam_rate_limit__<uuid>", got "${id}"`)
        );
      }

      // =======================================================================
      // REQUIRED FIELDS from database (via Record extension)
      // These use require* helpers that FAIL if the field is missing
      // =======================================================================

      const _rowId = yield* requireNumber(betterAuthRateLimit, "_rowId", ast);
      const version = yield* requireNumber(betterAuthRateLimit, "version", ast);
      const source = yield* requireString(betterAuthRateLimit, "source", ast);
      const createdAtRaw = yield* requireDate(betterAuthRateLimit, "createdAt", ast);
      const updatedAtRaw = yield* requireDate(betterAuthRateLimit, "updatedAt", ast);
      const deletedAt = yield* requireDate(betterAuthRateLimit, "deletedAt", ast);
      const createdBy = yield* requireString(betterAuthRateLimit, "createdBy", ast);
      const updatedBy = yield* requireString(betterAuthRateLimit, "updatedBy", ast);
      const deletedBy = yield* requireString(betterAuthRateLimit, "deletedBy", ast);

      // createdAt and updatedAt are required (M.Generated), so they must not be null
      if (createdAtRaw === null) {
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, createdAtRaw, "RateLimit createdAt is required but was null")
        );
      }
      if (updatedAtRaw === null) {
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, updatedAtRaw, "RateLimit updatedAt is required but was null")
        );
      }
      const createdAt = createdAtRaw;
      const updatedAt = updatedAtRaw;

      // Construct the encoded form of RateLimit.Model
      // Type annotation ensures proper typing without type assertions
      // The schema framework will decode this to RateLimit.Model.Type
      const encodedRateLimit: RateLimitModelEncoded = {
        // Core identity fields (from database via Record extension)
        id,
        _rowId,
        version,

        // Timestamp fields (from database via Record extension)
        createdAt,
        updatedAt,

        // Better Auth native fields
        // Domain uses FieldOptionOmittable, these map directly
        key: betterAuthRateLimit.key,
        count: betterAuthRateLimit.count,
        // lastRequest: BigIntFromNumber expects encoded form as number
        // The domain schema will decode this to bigint
        lastRequest: betterAuthRateLimit.lastRequest,

        // Audit fields (from database via Record extension)
        source,
        deletedAt,
        createdBy,
        updatedBy,
        deletedBy,
      };

      return encodedRateLimit;
    }),

  encode: (rateLimitEncoded, _options, _ast) =>
    Effect.gen(function* () {
      // id might be undefined in the encoded form (has default), handle that
      const id = rateLimitEncoded.id ?? IamEntityIds.RateLimitId.create();

      // Convert dates - these may be DateTime.Utc or Date
      const createdAt = rateLimitEncoded.createdAt ? toDate(rateLimitEncoded.createdAt) : undefined;
      const updatedAt = rateLimitEncoded.updatedAt ? toDate(rateLimitEncoded.updatedAt) : undefined;

      // Return BetterAuthRateLimit form with database fields included via Record
      // This ensures proper round-trip through the transformation
      const betterAuthRateLimit: BetterAuthRateLimit = {
        // Better Auth native fields
        key: rateLimitEncoded.key ?? "",
        count: rateLimitEncoded.count ?? 0,
        // lastRequest: domain model stores as number in encoded form
        // (BigIntFromNumber encoded type is number)
        lastRequest: rateLimitEncoded.lastRequest ?? 0,
        // Include database fields for round-trip (via Record extension)
        id,
        _rowId: rateLimitEncoded._rowId,
        version: rateLimitEncoded.version,
        source: rateLimitEncoded.source ?? undefined,
        createdAt,
        updatedAt,
        deletedAt: rateLimitEncoded.deletedAt ? toDate(rateLimitEncoded.deletedAt) : undefined,
        createdBy: rateLimitEncoded.createdBy ?? undefined,
        updatedBy: rateLimitEncoded.updatedBy ?? undefined,
        deletedBy: rateLimitEncoded.deletedBy ?? undefined,
      };

      return betterAuthRateLimit;
    }),
}).annotations(
  $I.annotations("DomainRateLimitFromBetterAuthRateLimit", {
    description:
      "Transforms a Better Auth rate limit response into the domain RateLimit.Model, handling the unique case where Better Auth doesn't provide id or audit fields (they come from the database).",
  })
);

export declare namespace DomainRateLimitFromBetterAuthRateLimit {
  export type Type = typeof DomainRateLimitFromBetterAuthRateLimit.Type;
  export type Encoded = typeof DomainRateLimitFromBetterAuthRateLimit.Encoded;
}
