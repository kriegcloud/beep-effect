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

import type { PublicOauthClient } from "@osdk/oauth";
import { AuthState, type AuthStateCallback } from "@palantir/pack.auth";
import type { PackAppInternal, Unsubscribe } from "@palantir/pack.core";
import { AuthServiceBase } from "./AuthServiceBase.js";

export class AuthServicePublic extends AuthServiceBase {
  private hasInitialized = false;
  private readonly oauthClient: PublicOauthClient;

  constructor(app: PackAppInternal, oauthClient: PublicOauthClient) {
    super(
      app,
      app.config.logger.child({}, { msgPrefix: "AuthServicePublic" }),
      AuthState.Initializing,
    );
    this.oauthClient = oauthClient;

    this.oauthClient.addEventListener("signIn", this.signInHandler);
    this.oauthClient.addEventListener("signOut", this.signOutHandler);
    this.oauthClient.addEventListener("refresh", this.refreshHandler);
  }

  override async getToken(): Promise<string> {
    return this.oauthClient();
  }

  private readonly signInHandler = () => {
    const token = this.getTokenOrUndefined();
    this.notifyTokenChange(token);
    this.updateState(AuthState.Authenticated);
  };

  private readonly signOutHandler = () => {
    this.notifyTokenChange(undefined);
    this.updateState(AuthState.Unauthenticated);
  };

  private readonly refreshHandler = () => {
    const token = this.getTokenOrUndefined();
    this.notifyTokenChange(token);
    this.updateState(AuthState.Authenticated);
  };

  override getTokenOrUndefined(): string | undefined {
    return this.oauthClient.getTokenOrUndefined();
  }

  override onAuthStateChange(callback: AuthStateCallback): Unsubscribe {
    const unsubscribe = super.onAuthStateChange(callback);

    if (!this.hasInitialized && this.currentState === AuthState.Initializing) {
      this.hasInitialized = true;
      void this.signIn().catch(() => {
        // Don't allow unhandled rejection to bubble up, mostly for testing.
        // Note the signIn method will log errors and throw for promise consumers,
        // but we don't need to handle anything here.
      });
    }

    return unsubscribe;
  }

  override async signIn(): Promise<void> {
    try {
      this.updateState(AuthState.Authenticating);
      await this.oauthClient.signIn();
    } catch (error) {
      this.updateState(AuthState.Error, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  override async signOut(): Promise<void> {
    try {
      this.clearUserState();
      await this.oauthClient.signOut();
    } catch (error) {
      this.updateState(AuthState.Error, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  override async refresh(): Promise<void> {
    try {
      await this.oauthClient.refresh();
    } catch (error) {
      this.updateState(AuthState.Error, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  override dispose(): void {
    this.oauthClient.removeEventListener("signIn", this.signInHandler);
    this.oauthClient.removeEventListener("signOut", this.signOutHandler);
    this.oauthClient.removeEventListener("refresh", this.refreshHandler);
    super.dispose();
  }
}

/**
 * Creates a public OAuth auth service that wraps a PublicOauthClient
 */
export function createPublicOauthService(
  app: PackAppInternal,
  oauthClient: PublicOauthClient,
): AuthServicePublic {
  return new AuthServicePublic(app, oauthClient);
}
