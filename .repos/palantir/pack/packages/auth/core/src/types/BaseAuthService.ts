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

import type { Unsubscribe } from "@palantir/pack.core";
import type { AuthState, AuthStateCallback } from "./AuthState.js";
import type { TokenChangeCallback } from "./TokenChange.js";

/**
 * Base interface for auth services that wrap different OAuth client implementations.
 *
 * This provides necessary functionality for other pack modules to seamlessly handle
 * authentication flow & token management events such as initial login or token refresh.
 */
export interface BaseAuthService {
  dispose(): void;
  getCurrentState(): AuthState;
  getCurrentUserId(allowUnverified?: boolean): string | undefined;
  getToken(): Promise<string>;
  getTokenOrUndefined(): string | undefined;
  getUserData(userId: string, force?: boolean): Promise<unknown>;
  isAuthenticated(): boolean;
  isValidated(): boolean;
  onAuthStateChange(callback: AuthStateCallback): Unsubscribe;
  onTokenChange(callback: TokenChangeCallback): Unsubscribe;
  refresh?(): Promise<void>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
  validateToken(): Promise<boolean>;
}
