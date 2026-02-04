import type {
  GoogleAuthenticationError,
  GoogleOAuthToken,
  GoogleTokenExpiredError,
  GoogleTokenRefreshError,
} from "@beep/google-workspace-domain";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";

export class GoogleAuthClient extends Context.Tag("GoogleAuthClient")<
  GoogleAuthClient,
  {
    readonly getValidToken: (
      scopes: ReadonlyArray<string>
    ) => Effect.Effect<GoogleOAuthToken, GoogleAuthenticationError | GoogleTokenExpiredError | GoogleTokenRefreshError>;
    readonly refreshToken: (refreshToken: string) => Effect.Effect<GoogleOAuthToken, GoogleTokenRefreshError>;
  }
>() {}
