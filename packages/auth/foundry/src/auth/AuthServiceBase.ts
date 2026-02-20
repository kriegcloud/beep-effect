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

import type { Logger } from "@osdk/api";
import { Users } from "@osdk/foundry.admin";
import {
  AuthState,
  type AuthStateCallback,
  type AuthStateChangeEvent,
  type BaseAuthService,
  type TokenChangeCallback,
} from "@palantir/pack.auth";
import type { PackAppInternal, Unsubscribe } from "@palantir/pack.core";
import { parseJwtToken } from "../utils/jwtUtils.js";

export abstract class AuthServiceBase implements BaseAuthService {
  protected currentState: AuthState;
  protected isTokenValidated = false;
  protected currentUserId: string | undefined;
  protected cachedUserData: unknown;
  private readonly stateCallbacks: Set<AuthStateCallback> = new Set<AuthStateCallback>();
  private readonly tokenChangeCallbacks = new Set<TokenChangeCallback>();
  protected currentToken?: string;
  protected readonly app: PackAppInternal;
  protected readonly logger: Logger;

  constructor(
    app: PackAppInternal,
    logger: Logger,
    initialState: AuthState = AuthState.Unauthenticated,
  ) {
    this.app = app;
    this.logger = logger;
    this.currentState = initialState;
  }

  abstract getToken(): Promise<string>;

  protected clearUserState(): void {
    this.isTokenValidated = false;
    this.currentUserId = undefined;
    this.cachedUserData = undefined;
  }

  isAuthenticated(): boolean {
    return this.getTokenOrUndefined() != null;
  }

  getCurrentUserId(allowUnverified = false): string | undefined {
    if (this.isTokenValidated) {
      return this.currentUserId;
    }

    if (allowUnverified) {
      const token = this.getTokenOrUndefined();
      if (token != null) {
        return parseJwtToken(token)?.userId;
      }
    }

    return undefined;
  }

  abstract getTokenOrUndefined(): string | undefined;

  isValidated(): boolean {
    return this.isTokenValidated;
  }

  async validateToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      this.clearUserState();
      return false;
    }

    try {
      const user = await Users.getCurrent(this.app.config.osdkClient);
      this.isTokenValidated = true;
      this.cachedUserData = user;
      this.currentUserId = user.id;
      return true;
    } catch (error) {
      this.logger.error("Token validation failed", error);
      this.clearUserState();
      return false;
    }
  }

  abstract signIn(): Promise<void>;

  abstract signOut(): Promise<void>;

  refresh?(): Promise<void>;

  onAuthStateChange(callback: AuthStateCallback): Unsubscribe {
    this.stateCallbacks.add(callback);

    try {
      callback({
        state: this.currentState,
      });
    } catch (err) {
      this.logger.error("Error in auth state callback:", err);
    }

    return () => {
      this.stateCallbacks.delete(callback);
    };
  }

  onTokenChange(callback: TokenChangeCallback): Unsubscribe {
    this.tokenChangeCallbacks.add(callback);

    // Immediately notify with current token if available
    const token = this.getTokenOrUndefined();
    if (token != null) {
      const info = parseJwtToken(token) ?? {};
      try {
        callback(token, info);
      } catch (err) {
        this.logger.error("Error in token change callback:", err);
      }
    }

    return () => {
      this.tokenChangeCallbacks.delete(callback);
    };
  }

  getCurrentState(): AuthState {
    return this.currentState;
  }

  async getUserData(userId: string, force?: boolean): Promise<unknown> {
    if (!this.isTokenValidated || !this.currentUserId || this.currentUserId !== userId) {
      throw new Error(`User data not available for userId: ${userId}`);
    }

    if (!force && this.cachedUserData) {
      return this.cachedUserData;
    }

    try {
      // TODO: debounce and use Users.getBatch for efficiency when looking up multiple users
      const user = await Users.get(this.app.config.osdkClient, userId);
      this.cachedUserData = user;
      return user;
    } catch (error) {
      this.logger.error("Failed to refresh user data", error);
      throw new Error("Failed to refresh user data");
    }
  }

  dispose(): void {
    this.stateCallbacks.clear();
    this.tokenChangeCallbacks.clear();
    this.clearUserState();
  }

  protected notifyTokenChange(token: string | undefined): void {
    const info = (token != null ? parseJwtToken(token) : undefined) ?? {};

    this.tokenChangeCallbacks.forEach(callback => {
      try {
        callback(token, info);
      } catch (err) {
        this.logger.error("Error in token change callback:", err);
      }
    });
  }

  protected updateState(newState: AuthState, error?: Error): void {
    const previousState = this.currentState;
    this.currentState = newState;

    const event: AuthStateChangeEvent = {
      previousState,
      state: newState,
      error,
    };

    this.stateCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (err) {
        this.logger.error("Error in auth state callback:", err);
      }
    });
  }
}
