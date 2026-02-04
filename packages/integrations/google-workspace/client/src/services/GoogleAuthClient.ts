import type {
  GoogleAuthenticationError,
  GoogleOAuthToken,
  GoogleScopeExpansionRequiredError,
} from "@beep/google-workspace-domain";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";

/**
 * GoogleAuthClient provides Effect-based OAuth token management for Google Workspace APIs.
 *
 * This service depends on AuthContext being available in the runtime, which provides
 * the user context and OAuth API methods needed to retrieve and validate tokens.
 */
export class GoogleAuthClient extends Context.Tag("GoogleAuthClient")<
  GoogleAuthClient,
  {
    /**
     * Retrieves a valid Google OAuth token for the current user, validating that
     * all required scopes are present.
     *
     * Returns `GoogleScopeExpansionRequiredError` if the user has authenticated
     * but lacks the required scopes (supports incremental OAuth flows).
     */
    readonly getValidToken: (
      scopes: ReadonlyArray<string>
    ) => Effect.Effect<GoogleOAuthToken, GoogleAuthenticationError | GoogleScopeExpansionRequiredError>;

    /**
     * Explicitly refreshes the OAuth token. Note that `getValidToken` handles
     * automatic refresh, so this method is typically only needed for explicit
     * refresh requests.
     */
    readonly refreshToken: (refreshToken: string) => Effect.Effect<GoogleOAuthToken, GoogleAuthenticationError>;
  }
>() {}
