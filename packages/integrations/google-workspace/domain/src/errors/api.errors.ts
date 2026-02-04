import { $GoogleWorkspaceDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $GoogleWorkspaceDomainId.create("errors/api");

export class GoogleApiError extends S.TaggedError<GoogleApiError>()(
  "GoogleApiError",
  {
    message: S.String,
    statusCode: S.Number,
    endpoint: S.String,
  },
  $I.annotations("GoogleApiError", {
    description: "Google API request failed",
  })
) {}

export class GoogleRateLimitError extends S.TaggedError<GoogleRateLimitError>()(
  "GoogleRateLimitError",
  {
    message: S.String,
    retryAfter: S.optional(S.Number),
    endpoint: S.String,
  },
  $I.annotations("GoogleRateLimitError", {
    description: "Google API rate limit exceeded",
  })
) {}
