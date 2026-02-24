import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const RateLimitModelSchemaId = Symbol.for("@beep/iam-domain/RateLimitModel");

/**
 * Rate limit model for tracking API usage and rate limiting.
 * Maps to the `rate_limit` table in the database.
 */
export class Model extends M.Class<Model>(`RateLimitModel`)(
  makeFields(IamEntityIds.RateLimitId, {
    /** Rate limit key identifier */
    key: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "The rate limit key identifier",
      })
    ),

    /** Current count of requests */
    count: BS.FieldOptionOmittable(
      S.Int.annotations({
        description: "Current count of requests within the rate limit window",
      })
    ),

    /** Timestamp of the last request */
    lastRequest: BS.FieldOptionOmittable(
      S.BigIntFromNumber.annotations({
        description: "Timestamp of the last request in milliseconds",
      })
    ),
  }),
  {
    title: "Rate Limit Model",
    description: "Rate limit model for tracking API usage and rate limiting.",
    schemaId: RateLimitModelSchemaId,
  }
) {
  static readonly utils = modelKit(Model);
}
