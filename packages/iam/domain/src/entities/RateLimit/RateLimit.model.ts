import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/RateLimit/RateLimit.model");

export class Model extends M.Class<Model>($I`RateLimitModel`)(
  makeFields(IamEntityIds.RateLimitId, {
    key: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "The rate limit key identifier",
      })
    ),
    count: BS.FieldOptionOmittable(
      S.Int.annotations({
        description: "Current count of requests within the rate limit window",
      })
    ),
    lastRequest: BS.FieldOptionOmittable(
      S.BigIntFromNumber.annotations({
        description: "Timestamp of the last request in milliseconds",
      })
    ),
  }),
  $I.annotations("RateLimitModel", {
    title: "Rate Limit Model",
    description: "Rate limit model for tracking API usage and rate limiting.",
  })
) {
  static readonly utils = modelKit(Model);
}
