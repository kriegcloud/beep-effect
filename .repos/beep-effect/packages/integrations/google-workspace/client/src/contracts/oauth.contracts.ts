import { $GoogleWorkspaceClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $GoogleWorkspaceClientId.create("contracts/oauth");

export class OAuthTokenResponse extends S.Class<OAuthTokenResponse>($I`OAuthTokenResponse`)(
  {
    access_token: S.String,
    refresh_token: S.optional(S.String),
    expires_in: S.Number,
    scope: S.String,
    token_type: S.Literal("Bearer"),
  },
  $I.annotations("OAuthTokenResponse", {
    description: "Google OAuth token response from authorization endpoint",
  })
) {}

export class OAuthRefreshResponse extends S.Class<OAuthRefreshResponse>($I`OAuthRefreshResponse`)(
  {
    access_token: S.String,
    expires_in: S.Number,
    scope: S.String,
    token_type: S.Literal("Bearer"),
  },
  $I.annotations("OAuthRefreshResponse", {
    description: "Google OAuth token refresh response",
  })
) {}

export class OAuthErrorResponse extends S.Class<OAuthErrorResponse>($I`OAuthErrorResponse`)(
  {
    error: S.String,
    error_description: S.optional(S.String),
  },
  $I.annotations("OAuthErrorResponse", {
    description: "Google OAuth error response",
  })
) {}
