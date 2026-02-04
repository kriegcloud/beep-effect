import { GoogleAuthClient } from "@beep/google-workspace-client";
import {
  GoogleAuthenticationError,
  GoogleOAuthToken,
  GoogleScopeExpansionRequiredError,
} from "@beep/google-workspace-domain";
import { AuthContext } from "@beep/shared-domain/Policy";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";

const GOOGLE_PROVIDER = "google";

/**
 * Dependencies for GoogleAuthClientLive.
 *
 * Only requires `AuthContext` which provides user context and OAuth API methods.
 * This keeps integration packages properly scoped without importing from IAM server.
 */
export type GoogleAuthClientDeps = AuthContext;

/**
 * Live implementation of GoogleAuthClient using Better Auth's OAuth capabilities.
 *
 * Better Auth handles:
 * - Token storage (encrypted in account table)
 * - Automatic token refresh when expired
 * - Scope tracking
 *
 * This layer provides:
 * - Effect-based wrapper around Better Auth's getAccessToken API
 * - Scope validation for incremental OAuth flows
 * - Domain error translation
 *
 * Note: AuthContext is captured at layer construction time, so the service
 * methods themselves have no requirements (Effect<..., ..., never>).
 */
export const GoogleAuthClientLive: Layer.Layer<GoogleAuthClient, never, GoogleAuthClientDeps> = Layer.effect(
  GoogleAuthClient,
  Effect.gen(function* () {
    // Capture AuthContext at layer construction time
    const { user, oauth } = yield* AuthContext;

    return GoogleAuthClient.of({
      getValidToken: Effect.fn(function* (requiredScopes) {
        // Use Better Auth's getAccessToken which handles:
        // 1. Token retrieval from account table
        // 2. Automatic refresh if expired
        // 3. Encrypted storage
        const tokenResult = yield* oauth
          .getAccessToken({
            providerId: GOOGLE_PROVIDER,
            userId: user.id,
          })
          .pipe(
            Effect.mapError(
              (e) =>
                new GoogleAuthenticationError({
                  message: e.message,
                  suggestion: "User may need to re-authorize Google Workspace access",
                })
            )
          );

        if (O.isNone(tokenResult)) {
          return yield* new GoogleAuthenticationError({
            message: "No Google OAuth token found for this user",
            suggestion: "User needs to authorize Google Workspace access",
          });
        }

        const { accessToken } = tokenResult.value;

        // Get the account to check scopes
        // Better Auth stores scope in the account table
        const accountResult = yield* oauth
          .getProviderAccount({
            providerId: GOOGLE_PROVIDER,
            userId: user.id,
          })
          .pipe(
            Effect.mapError(
              (e) =>
                new GoogleAuthenticationError({
                  message: e.message,
                  suggestion: "Check Better Auth configuration",
                })
            )
          );

        if (O.isNone(accountResult)) {
          return yield* new GoogleAuthenticationError({
            message: "No Google account linked for this user",
            suggestion: "User needs to link their Google account",
          });
        }

        const account = accountResult.value;
        const scopeString = O.getOrElse(account.scope, () => "");
        const currentScopes = scopeString ? A.fromIterable(scopeString.split(" ")) : [];

        // Validate scopes for incremental OAuth
        const hasAllScopes = A.every(requiredScopes, (scope) => A.contains(currentScopes, scope));

        if (!hasAllScopes) {
          const missingScopes = A.filter(requiredScopes, (s) => !A.contains(currentScopes, s));
          return yield* new GoogleScopeExpansionRequiredError({
            message: "Additional Google OAuth scopes are required",
            currentScopes: [...currentScopes],
            requiredScopes: [...requiredScopes],
            missingScopes: [...missingScopes],
          });
        }

        // Build the token response
        const expiresAt = O.match(account.accessTokenExpiresAt, {
          onNone: () => DateTime.unsafeNow(),
          onSome: (date) => DateTime.unsafeMake(date),
        });

        return new GoogleOAuthToken({
          accessToken: O.some(accessToken),
          refreshToken: O.map(account.refreshToken, Redacted.make),
          expiryDate: O.some(expiresAt),
          scope: O.some(scopeString),
          tokenType: O.some("Bearer"),
        });
      }, Effect.withSpan("GoogleAuthClient.getValidToken")),

      refreshToken: Effect.fn(function* (_refreshToken) {
        // Better Auth handles refresh automatically via getAccessToken
        // This method is provided for explicit refresh requests, but
        // normally callers should just use getValidToken which auto-refreshes
        const tokenResult = yield* oauth
          .getAccessToken({
            providerId: GOOGLE_PROVIDER,
            userId: user.id,
          })
          .pipe(
            Effect.mapError(
              (e) =>
                new GoogleAuthenticationError({
                  message: e.message,
                  suggestion: "User may need to re-authorize Google Workspace access",
                })
            )
          );

        if (O.isNone(tokenResult)) {
          return yield* new GoogleAuthenticationError({
            message: "Failed to refresh Google OAuth token",
            suggestion: "User needs to re-authorize Google Workspace access",
          });
        }

        // Return minimal token info since Better Auth handles storage
        return new GoogleOAuthToken({
          accessToken: O.some(tokenResult.value.accessToken),
          refreshToken: O.none(),
          expiryDate: O.none(),
          scope: O.none(),
          tokenType: O.some("Bearer"),
        });
      }, Effect.withSpan("GoogleAuthClient.refreshToken")),
    });
  })
);
