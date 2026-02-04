/**
 * Integration Token Store service interface.
 *
 * Defines the contract for storing and managing OAuth tokens for external integrations
 * (Google Workspace, Microsoft 365, Slack, etc.).
 *
 * @since 0.1.0
 */
import { $IamDomainId } from "@beep/identity/packages";
import type { SharedEntityIds } from "@beep/shared-domain";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("services/IntegrationTokenStore");

/**
 * Represents a stored OAuth token for an external integration.
 *
 * @since 0.1.0
 * @category schemas
 */
export class StoredToken extends S.Class<StoredToken>($I`StoredToken`)({
  accessToken: S.String,
  refreshToken: S.OptionFromNullOr(S.String),
  expiresAt: S.Number,
  scopes: S.Array(S.String),
  provider: S.String,
}) {}

/**
 * Error thrown when token refresh fails.
 *
 * @since 0.1.0
 * @category errors
 */
export class TokenRefreshError extends S.TaggedError<TokenRefreshError>()(
  "TokenRefreshError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  }
) {}

/**
 * Error thrown when a token is not found.
 *
 * @since 0.1.0
 * @category errors
 */
export class TokenNotFoundError extends S.TaggedError<TokenNotFoundError>()(
  "TokenNotFoundError",
  {
    userId: S.String,
    provider: S.String,
  }
) {}

/**
 * Service interface for managing integration OAuth tokens.
 *
 * @since 0.1.0
 * @category services
 */
export interface IntegrationTokenStoreService {
  /**
   * Retrieve a stored token for a user and provider.
   * Returns None if no active token exists.
   */
  readonly get: (
    userId: SharedEntityIds.UserId.Type,
    provider: string
  ) => Effect.Effect<O.Option<StoredToken>>;

  /**
   * Store a new token for a user and provider.
   * Deactivates any existing tokens for the same user/provider.
   */
  readonly store: (
    userId: SharedEntityIds.UserId.Type,
    provider: string,
    token: StoredToken
  ) => Effect.Effect<void>;

  /**
   * Refresh a token using the provided refresh function.
   * Implements distributed locking to prevent concurrent refresh attempts.
   */
  readonly refresh: (
    userId: SharedEntityIds.UserId.Type,
    provider: string,
    refreshFn: (refreshToken: string) => Effect.Effect<StoredToken, Error>
  ) => Effect.Effect<StoredToken, TokenRefreshError | TokenNotFoundError>;

  /**
   * Revoke (soft-delete) a token for a user and provider.
   */
  readonly revoke: (
    userId: SharedEntityIds.UserId.Type,
    provider: string
  ) => Effect.Effect<void>;
}

/**
 * Context tag for the IntegrationTokenStore service.
 *
 * @since 0.1.0
 * @category services
 */
export class IntegrationTokenStore extends Context.Tag(
  $I`IntegrationTokenStore`
)<IntegrationTokenStore, IntegrationTokenStoreService>() {}
