import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import { PolicyRecord } from "@beep/shared-domain/Policy";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
export const ApikeyModelSchemaId = Symbol.for("@beep/iam-domain/ApikeyModel");

/**
 * API Key model representing user API keys with rate limiting and security features.
 * Maps to the `apikey` table in the database.
 */
export class Model extends M.Class<Model>(`ApikeyModel`)(
  makeFields(IamEntityIds.ApiKeyId, {
    /** Human-readable name for the API key */
    name: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Human-readable name for the API key",
        examples: ["Production API", "Development Key", "Mobile App"],
      })
    ),

    /** First few characters of the key (for display) */
    start: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "First few characters of the API key for identification",
      })
    ),

    /** Key prefix for categorization */
    prefix: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Prefix to categorize API keys",
        examples: ["pk_", "sk_", "test_", "live_"],
      })
    ),

    /** The actual API key (sensitive) */
    key: BS.FieldSensitiveOptionOmittable(
      S.NonEmptyString.annotations({
        description: "The encrypted API key value",
      })
    ),

    /** User this API key belongs to */
    userId: SharedEntityIds.UserId.annotations({
      description: "ID of the user who owns this API key",
    }),

    /** Rate limit refill interval in milliseconds */
    refillInterval: BS.FieldOptionOmittable(
      S.Int.pipe(S.positive()).annotations({
        description: "Rate limit refill interval in milliseconds",
      })
    ),

    /** Number of requests to add during refill */
    refillAmount: BS.FieldOptionOmittable(
      S.Int.pipe(S.positive()).annotations({
        description: "Number of requests to add during each refill cycle",
      })
    ),

    /** When the rate limit was last refilled */
    lastRefillAt: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "When the rate limit was last refilled",
      })
    ),

    /** Whether the API key is enabled */
    enabled: S.Boolean.pipe(
      S.optional,
      S.withDefaults({
        decoding: () => true,
        constructor: () => true,
      })
    ).annotations({
      description: "Whether the API key is currently enabled",
    }),

    /** Whether rate limiting is enabled */
    rateLimitEnabled: S.Boolean.pipe(
      S.optional,
      S.withDefaults({
        decoding: () => true,
        constructor: () => true,
      })
    ).annotations({
      description: "Whether rate limiting is enabled for this key",
    }),

    /** Rate limit time window in milliseconds */
    rateLimitTimeWindow: S.Int.pipe(
      S.positive(),
      S.optional,
      S.withDefaults({
        constructor: () => 86400000,
        decoding: () => 86400000,
      })
    ).annotations({
      description: "Rate limit time window in milliseconds (default: 24 hours)",
    }),

    /** Maximum requests allowed in time window */
    rateLimitMax: BS.toOptionalWithDefault(S.Int.pipe(S.positive()))(10).annotations({
      description: "Maximum number of requests allowed in the time window",
    }),

    /** Total number of requests made */
    requestCount: BS.FieldOptionOmittable(
      S.Int.pipe(S.nonNegative()).annotations({
        description: "Total number of requests made with this key",
      })
    ),

    /** Remaining requests in current window */
    remaining: BS.FieldOptionOmittable(
      S.Int.pipe(S.nonNegative()).annotations({
        description: "Remaining requests in the current rate limit window",
      })
    ),

    /** When the last request was made */
    lastRequest: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "When the last request was made with this key",
      })
    ),

    /** When the API key expires */
    expiresAt: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "When this API key expires",
      })
    ),

    /** Permissions granted to this API key */
    permissions: BS.JsonFromStringOption(
      PolicyRecord.annotations({
        description: "Permissions granted to this API key",
      })
    ),

    /** Additional metadata for the API key */
    metadata: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "JSON metadata for additional API key configuration",
      })
    ),
    organizationId: BS.FieldOptionOmittable(SharedEntityIds.OrganizationId),
  }),
  {
    title: "API Key Model",
    description: "API Key model representing user API keys with rate limiting and security features.",
    schemaId: ApikeyModelSchemaId,
  }
) {
  static readonly utils = modelKit(Model);
}
