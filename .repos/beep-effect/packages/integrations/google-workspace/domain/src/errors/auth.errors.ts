import { $GoogleWorkspaceDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $GoogleWorkspaceDomainId.create("errors/auth");

export class GoogleAuthenticationError extends S.TaggedError<GoogleAuthenticationError>()(
  "GoogleAuthenticationError",
  {
    message: S.String,
    suggestion: S.optional(S.String),
  },
  $I.annotations("GoogleAuthenticationError", {
    description: "Google authentication error - credentials invalid or missing",
  })
) {}

export class GoogleTokenExpiredError extends S.TaggedError<GoogleTokenExpiredError>()(
  "GoogleTokenExpiredError",
  {
    message: S.String,
    expiryDate: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("GoogleTokenExpiredError", {
    description: "Google OAuth token has expired",
  })
) {}

export class GoogleTokenRefreshError extends S.TaggedError<GoogleTokenRefreshError>()(
  "GoogleTokenRefreshError",
  {
    message: S.String,
    originalError: S.optional(S.String),
  },
  $I.annotations("GoogleTokenRefreshError", {
    description: "Failed to refresh Google OAuth token",
  })
) {}

export class GoogleScopeExpansionRequiredError extends S.TaggedError<GoogleScopeExpansionRequiredError>()(
  "GoogleScopeExpansionRequiredError",
  {
    message: S.String,
    currentScopes: S.Array(S.String),
    requiredScopes: S.Array(S.String),
    missingScopes: S.Array(S.String),
  },
  $I.annotations("GoogleScopeExpansionRequiredError", {
    description: "Additional OAuth scopes required for this operation",
  })
) {}
