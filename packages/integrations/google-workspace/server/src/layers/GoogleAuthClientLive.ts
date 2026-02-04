import { GoogleAuthClient, OAuthRefreshResponse } from "@beep/google-workspace-client";
import {
  GoogleAuthenticationError,
  GoogleOAuthToken,
  GoogleScopeExpansionRequiredError,
  GoogleTokenExpiredError,
  GoogleTokenRefreshError,
} from "@beep/google-workspace-domain";
import { IntegrationTokenStore, StoredToken } from "@beep/iam-client";
import * as HttpBody from "@effect/platform/HttpBody";
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";

const GOOGLE_PROVIDER = "google";
const GOOGLE_TOKEN_REFRESH_URL = "https://oauth2.googleapis.com/token";
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

const storedTokenToGoogleToken = (stored: StoredToken): GoogleOAuthToken =>
  new GoogleOAuthToken({
    access_token: O.some(stored.accessToken),
    refresh_token: O.map(stored.refreshToken, Redacted.make),
    expiry_date: O.some(DateTime.unsafeMake(stored.expiresAt)),
    scope: O.some(A.join(stored.scopes, " ")),
    token_type: O.some("Bearer"),
  });

const refreshResponseToStoredToken = (
  response: typeof OAuthRefreshResponse.Type,
  existingRefreshToken: O.Option<string>
): StoredToken =>
  new StoredToken({
    accessToken: response.access_token,
    refreshToken: existingRefreshToken,
    expiresAt: DateTime.unsafeNow().pipe(DateTime.toEpochMillis) + response.expires_in * 1000,
    scopes: A.fromIterable(response.scope.split(" ")),
    provider: GOOGLE_PROVIDER,
  });

const hasRequiredScopes = (currentScopes: ReadonlyArray<string>, requiredScopes: ReadonlyArray<string>): boolean =>
  A.every(requiredScopes, (scope) => A.contains(currentScopes, scope));

export type GoogleAuthClientDeps = IntegrationTokenStore | HttpClient.HttpClient;

export const GoogleAuthClientLive: Layer.Layer<GoogleAuthClient, never, GoogleAuthClientDeps> = Layer.effect(
  GoogleAuthClient,
  Effect.gen(function* () {
    const tokenStore = yield* IntegrationTokenStore;
    const httpClient = yield* HttpClient.HttpClient;

    const getClientCredentials = Effect.sync(() => ({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }));

    const refreshGoogleToken = (
      refreshToken: string,
      existingRefreshToken: O.Option<string>
    ): Effect.Effect<StoredToken, GoogleTokenRefreshError> =>
      Effect.gen(function* () {
        const { clientId, clientSecret } = yield* getClientCredentials;

        if (!clientId || !clientSecret) {
          return yield* Effect.fail(
            new GoogleTokenRefreshError({
              message: "Missing Google OAuth client credentials",
            })
          );
        }

        const formData = new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        });

        const request = HttpClientRequest.post(GOOGLE_TOKEN_REFRESH_URL).pipe(
          HttpClientRequest.setBody(HttpBody.text(formData.toString(), "application/x-www-form-urlencoded"))
        );

        const response = yield* httpClient.execute(request).pipe(
          Effect.flatMap((res) => HttpClientResponse.schemaBodyJson(OAuthRefreshResponse)(res)),
          Effect.catchAll((error) =>
            Effect.fail(
              new GoogleTokenRefreshError({
                message: `Failed to refresh Google token: ${String(error)}`,
                originalError: String(error),
              })
            )
          )
        );

        return refreshResponseToStoredToken(response, existingRefreshToken);
      });

    const getCurrentUserId = Effect.fail(
      new GoogleAuthenticationError({
        message: "User context not available - Phase 3 will add session integration",
        suggestion: "Ensure user is authenticated before accessing Google services",
      })
    );

    return GoogleAuthClient.of({
      getValidToken: (requiredScopes) =>
        Effect.gen(function* () {
          const userId = yield* getCurrentUserId;

          const maybeToken = yield* tokenStore.get(userId, GOOGLE_PROVIDER);

          if (O.isNone(maybeToken)) {
            return yield* Effect.fail(
              new GoogleAuthenticationError({
                message: "No Google OAuth token found for this user",
                suggestion: "User needs to authorize Google Workspace access",
              })
            );
          }

          const storedToken = maybeToken.value;

          if (!hasRequiredScopes(storedToken.scopes, requiredScopes)) {
            return yield* Effect.fail(
              new GoogleScopeExpansionRequiredError({
                message: "Additional Google OAuth scopes are required",
                currentScopes: [...storedToken.scopes],
                requiredScopes: [...requiredScopes],
                missingScopes: A.filter(requiredScopes, (s) => !A.contains(storedToken.scopes, s)),
              })
            );
          }

          const nowMs = DateTime.unsafeNow().pipe(DateTime.toEpochMillis);
          const isExpired = storedToken.expiresAt <= nowMs + TOKEN_EXPIRY_BUFFER_MS;

          if (isExpired) {
            if (O.isNone(storedToken.refreshToken)) {
              return yield* Effect.fail(
                new GoogleTokenExpiredError({
                  message: "Google OAuth token expired and no refresh token available",
                  expiryDate: DateTime.unsafeMake(storedToken.expiresAt),
                })
              );
            }

            const refreshedToken = yield* tokenStore
              .refresh(userId, GOOGLE_PROVIDER, (rt) => refreshGoogleToken(rt, storedToken.refreshToken))
              .pipe(
                Effect.catchTag("TokenRefreshError", (e) =>
                  Effect.fail(
                    new GoogleTokenRefreshError({
                      message: e.message,
                      originalError: e.cause ? String(e.cause) : undefined,
                    })
                  )
                ),
                Effect.catchTag("TokenNotFoundError", () =>
                  Effect.fail(
                    new GoogleAuthenticationError({
                      message: "Token was revoked during refresh attempt",
                      suggestion: "User needs to re-authorize Google Workspace access",
                    })
                  )
                )
              );

            return storedTokenToGoogleToken(refreshedToken);
          }

          return storedTokenToGoogleToken(storedToken);
        }),

      refreshToken: (refreshToken) =>
        Effect.gen(function* () {
          const userId = yield* getCurrentUserId;

          const refreshedToken = yield* refreshGoogleToken(refreshToken, O.some(refreshToken));

          yield* tokenStore.store(userId, GOOGLE_PROVIDER, refreshedToken);

          return storedTokenToGoogleToken(refreshedToken);
        }),
    });
  })
);
