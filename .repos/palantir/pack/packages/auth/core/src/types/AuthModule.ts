/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { PackApp, PackAppInternal, Unsubscribe } from "@palantir/pack.core";
import { assertIsAppInternal } from "@palantir/pack.core";
import { AUTH_MODULE_KEY } from "../constants/AuthModuleKey.js";
import type { AuthStateCallback } from "./AuthState.js";
import type { TokenChangeCallback } from "./TokenChange.js";
import type { UserRef } from "./UserRef.js";

/**
 * AuthModule provides unified authentication services for PACK applications.
 *
 * It wraps OSDK OAuth clients and provides a consistent interface for authentication
 * state management, token access, and auth lifecycle events.
 */
export interface AuthModule {
  /**
   * Get the current user information.
   * Returns undefined if not authenticated or user data not available.
   *
   * @param allowUnverified - If true, will extract userId from token without validation.
   *                          Defaults to false (requires validated token).
   */
  getCurrentUser(allowUnverified?: boolean): UserRef | undefined;

  /**
   * Get an access token, automatically refreshing if needed.
   * Throws if authentication fails or user is not signed in.
   */
  getToken(): Promise<string>;

  /**
   * Get the current access token without refresh, returns undefined if expired or unavailable.
   */
  getTokenOrUndefined(): string | undefined;

  /**
   * Get user data for a specific user ID.
   * @param userId - The user ID to fetch data for
   * @param force - Force refresh of cached data
   * @returns Promise resolving to user data
   */
  getUserData(userId: string, force?: boolean): Promise<unknown>;

  /**
   * Check if the user is currently authenticated with a valid token.
   */
  isAuthenticated(): boolean;

  /**
   * Subscribe to authentication state changes.
   *
   * @param callback Function called when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChange(callback: AuthStateCallback): Unsubscribe;

  /**
   * Subscribe to token changes.
   *
   * @param callback Function called when token changes
   * @returns Unsubscribe function
   */
  onTokenChange(callback: TokenChangeCallback): Unsubscribe;

  /**
   * Manually refresh the access token using the refresh token.
   * Only available for public OAuth clients.
   */
  refresh?(): Promise<void>;

  /**
   * Initiate sign-in flow. For public clients, this redirects to OAuth.
   * For confidential clients, this performs client credentials flow.
   */
  signIn(): Promise<void>;

  /**
   * Sign out the current user and clear tokens.
   */
  signOut(): Promise<void>;

  /**
   * Validate the current token by checking with the platform API.
   * Returns true if the token is valid, false otherwise.
   */
  validateToken(): Promise<boolean>;

  /**
   * Wait for authentication to complete. Resolves when authenticated,
   * rejects if authentication fails or times out.
   */
  waitForAuth(): Promise<void>;
}

/**
 * Get the auth module from an PACK app instance.
 *
 * @param app - PACK app instance
 * @returns The auth module
 */
export function getAuthModule(app: PackApp | PackAppInternal): AuthModule {
  assertIsAppInternal(app);
  return app.getModule(AUTH_MODULE_KEY);
}
