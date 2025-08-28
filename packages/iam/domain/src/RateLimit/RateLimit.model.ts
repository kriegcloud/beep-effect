import { Common, IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * Rate limit model for tracking API usage and rate limiting.
 * Maps to the `rate_limit` table in the database.
 */
export class Model extends M.Class<Model>(`RateLimit.Model`)({
  /** Primary key identifier for the rate limit entry */
  id: M.Generated(IamEntityIds.RateLimitId),

  /** Rate limit key identifier */
  key: M.FieldOption(
    S.NonEmptyString.annotations({
      description: "The rate limit key identifier",
    })
  ),

  /** Current count of requests */
  count: M.FieldOption(
    S.Int.annotations({
      description: "Current count of requests within the rate limit window",
    })
  ),

  /** Timestamp of the last request */
  lastRequest: M.FieldOption(
    S.BigIntFromNumber.annotations({
      description: "Timestamp of the last request in milliseconds",
    })
  ),

  // Audit and tracking columns
  ...Common.globalColumns,
}) {}
