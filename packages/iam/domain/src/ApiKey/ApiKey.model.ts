import {Common, IamEntityIds} from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * API Key model representing user API keys with rate limiting and security features.
 * Maps to the `apikey` table in the database.
 */
export class Model extends M.Class<Model>(`Apikey.Model`)({
  /** Primary key identifier for the API key */
  id: M.Generated(IamEntityIds.ApiKeyId),

  /** Human-readable name for the API key */
  name: M.FieldOption(
    S.NonEmptyString.annotations({
      description: "Human-readable name for the API key",
      examples: ["Production API", "Development Key", "Mobile App"],
    }),
  ),

  /** First few characters of the key (for display) */
  start: M.FieldOption(
    S.NonEmptyString.annotations({
      description: "First few characters of the API key for identification",
    }),
  ),

  /** Key prefix for categorization */
  prefix: M.FieldOption(
    S.NonEmptyString.annotations({
      description: "Prefix to categorize API keys",
      examples: ["pk_", "sk_", "test_", "live_"],
    }),
  ),

  /** The actual API key (sensitive) */
  key: M.Sensitive(
    S.NonEmptyString.annotations({
      description: "The encrypted API key value",
    }),
  ),

  /** User this API key belongs to */
  userId: IamEntityIds.UserId.annotations({
    description: "ID of the user who owns this API key",
  }),

  /** Rate limit refill interval in milliseconds */
  refillInterval: M.FieldOption(
    S.Int.pipe(S.positive()).annotations({
      description: "Rate limit refill interval in milliseconds",
    }),
  ),

  /** Number of requests to add during refill */
  refillAmount: M.FieldOption(
    S.Int.pipe(S.positive()).annotations({
      description: "Number of requests to add during each refill cycle",
    }),
  ),

  /** When the rate limit was last refilled */
  lastRefillAt: M.FieldOption(
    Common.DateTimeFromDate({
      description: "When the rate limit was last refilled",
    }),
  ),

  /** Whether the API key is enabled */
  enabled: S.Boolean.annotations({
    description: "Whether the API key is currently enabled",
  }),

  /** Whether rate limiting is enabled */
  rateLimitEnabled: S.Boolean.annotations({
    description: "Whether rate limiting is enabled for this key",
  }),

  /** Rate limit time window in milliseconds */
  rateLimitTimeWindow: S.Int.pipe(S.positive()).annotations({
    description: "Rate limit time window in milliseconds (default: 24 hours)",
  }),

  /** Maximum requests allowed in time window */
  rateLimitMax: S.Int.pipe(S.positive()).annotations({
    description: "Maximum number of requests allowed in the time window",
  }),

  /** Total number of requests made */
  requestCount: M.FieldOption(
    S.Int.pipe(S.nonNegative()).annotations({
      description: "Total number of requests made with this key",
    }),
  ),

  /** Remaining requests in current window */
  remaining: M.FieldOption(
    S.Int.pipe(S.nonNegative()).annotations({
      description: "Remaining requests in the current rate limit window",
    }),
  ),

  /** When the last request was made */
  lastRequest: M.FieldOption(
    Common.DateTimeFromDate({
      description: "When the last request was made with this key",
    }),
  ),

  /** When the API key expires */
  expiresAt: M.FieldOption(
    Common.DateTimeFromDate({
      description: "When this API key expires",
    }),
  ),

  /** Permissions granted to this API key */
  permissions: M.FieldOption(
    S.String.annotations({
      description: "JSON string of permissions granted to this API key",
    }),
  ),

  /** Additional metadata for the API key */
  metadata: M.FieldOption(
    S.String.annotations({
      description: "JSON metadata for additional API key configuration",
    }),
  ),

  // Default columns include organizationId
  ...Common.defaultColumns,
}) {
}