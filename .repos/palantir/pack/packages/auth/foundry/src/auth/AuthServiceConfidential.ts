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

import type { createConfidentialOauthClient } from "@osdk/oauth";
import { AuthState } from "@palantir/pack.auth";
import type { PackAppInternal } from "@palantir/pack.core";
import { AuthServiceBase } from "./AuthServiceBase.js";

type ConfidentialOauthClient = ReturnType<typeof createConfidentialOauthClient>;

export class AuthServiceConfidential extends AuthServiceBase {
  private readonly oauthClient: ConfidentialOauthClient;

  constructor(app: PackAppInternal, oauthClient: ConfidentialOauthClient) {
    const initialState = oauthClient.getTokenOrUndefined()
      ? AuthState.Authenticated
      : AuthState.Unauthenticated;
    super(
      app,
      app.config.logger.child({}, { msgPrefix: "AuthServiceConfidential" }),
      initialState,
    );
    this.oauthClient = oauthClient;

    this.oauthClient.addEventListener("signIn", this.signInHandler);
    this.oauthClient.addEventListener("signOut", this.signOutHandler);
  }

  override async getToken(): Promise<string> {
    return this.oauthClient();
  }

  private readonly signInHandler = () => {
    this.updateState(AuthState.Authenticated);
    const token = this.getTokenOrUndefined();
    this.notifyTokenChange(token);
  };

  private readonly signOutHandler = () => {
    this.updateState(AuthState.Unauthenticated);
    this.notifyTokenChange(undefined);
  };

  override getTokenOrUndefined(): string | undefined {
    return this.oauthClient.getTokenOrUndefined();
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

  override dispose(): void {
    this.oauthClient.removeEventListener("signIn", this.signInHandler);
    this.oauthClient.removeEventListener("signOut", this.signOutHandler);
    super.dispose();
  }
}

/**
 * Creates a confidential OAuth auth service that wraps a ConfidentialOauthClient
 */
export function createConfidentialOauthService(
  app: PackAppInternal,
  oauthClient: ConfidentialOauthClient,
): AuthServiceConfidential {
  return new AuthServiceConfidential(app, oauthClient);
}
