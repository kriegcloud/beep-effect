import { Common, IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const RateLimitModelSchemaId = Symbol.for("@beep/iam-domain/RateLimitModel");

/**
 * Rate limit model for tracking API usage and rate limiting.
 * Maps to the `rate_limit` table in the database.
 */
export class Model extends M.Class<Model>(`RateLimitModel`)(
  {
    /** Primary key identifier for the rate limit entry */
    id: M.Generated(IamEntityIds.RateLimitId),
    _rowId: M.Generated(IamEntityIds.RateLimitId.privateSchema),
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
  },
  {
    title: "Rate Limit Model",
    description: "Rate limit model for tracking API usage and rate limiting.",
    schemaId: RateLimitModelSchemaId,
  }
) {}
export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
