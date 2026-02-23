import { $GoogleWorkspaceDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $GoogleWorkspaceDomainId.create("models/token");

export class GoogleOAuthToken extends S.Class<GoogleOAuthToken>($I`GoogleOAuthToken`)(
  {
    accessToken: S.optionalWith(S.String, {
      as: "Option",
    }).pipe(S.fromKey("access_token")),
    refreshToken: S.optionalWith(S.Redacted(S.String), {
      as: "Option",
    }).pipe(S.fromKey("refresh_token")),
    scope: S.optionalWith(S.String, {
      as: "Option",
    }),
    tokenType: S.optionalWith(S.String, {
      as: "Option",
    }).pipe(S.fromKey("token_type")),
    expiryDate: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, {
      as: "Option",
    }).pipe(S.fromKey("expiry_date")),
  },
  $I.annotations("GoogleOAuthToken", {
    description: "Google OAuth token structure",
  })
) {}
