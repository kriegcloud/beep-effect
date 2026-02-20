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

import { AuthState } from "@palantir/pack.auth";
import type { PackAppInternal, TokenProvider } from "@palantir/pack.core";
import { AuthServiceBase } from "./AuthServiceBase.js";

export class AuthServiceStatic extends AuthServiceBase {
  private readonly tokenProvider: TokenProvider;
  private latestToken: string | undefined;

  constructor(app: PackAppInternal, tokenProvider: TokenProvider) {
    super(
      app,
      app.config.logger.child({}, { msgPrefix: "AuthServiceStatic" }),
      AuthState.Unauthenticated,
    );
    this.tokenProvider = tokenProvider;
    void this.getToken().catch(() => {});
  }

  override async getToken(): Promise<string> {
    try {
      const token = await this.tokenProvider();

      if (this.latestToken !== token) {
        this.latestToken = token;
        this.notifyTokenChange(token);
        if (this.currentState !== AuthState.Authenticated) {
          this.updateState(AuthState.Authenticated);
        }
      }

      return token;
    } catch (error) {
      if (this.latestToken !== undefined) {
        this.latestToken = undefined;
        this.notifyTokenChange(undefined);
      }
      this.updateState(AuthState.Error, error as Error);
      throw error;
    }
  }

  override getTokenOrUndefined(): string | undefined {
    return this.latestToken;
  }

  override isAuthenticated(): boolean {
    return this.latestToken != null;
  }

  override signIn(): Promise<void> {
    return Promise.resolve();
  }

  override signOut(): Promise<void> {
    this.clearUserState();
    this.latestToken = undefined;
    this.updateState(AuthState.Unauthenticated);
    return Promise.reject(new Error("Sign out not supported for static token providers"));
  }

  override dispose(): void {
    super.dispose();
    this.latestToken = undefined;
  }
}

/**
 * Creates a static token auth service for CLI/service scenarios where a token is provided externally.
 */
export function createStaticTokenService(
  app: PackAppInternal,
  tokenProvider: TokenProvider,
): AuthServiceStatic {
  return new AuthServiceStatic(app, tokenProvider);
}
