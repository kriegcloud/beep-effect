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

import { type PackAppInternal, type Unsubscribe } from "@palantir/pack.core";
import type { AuthModule } from "../types/AuthModule.js";
import type { AuthStateCallback } from "../types/AuthState.js";
import { AuthState } from "../types/AuthState.js";
import type { BaseAuthService } from "../types/BaseAuthService.js";
import type { TokenChangeCallback } from "../types/TokenChange.js";
import type { UserRef } from "../types/UserRef.js";
import { createUserRef } from "../types/UserRef.js";

export class AuthModuleImpl implements AuthModule {
  readonly #authService: BaseAuthService;
  private readonly app: PackAppInternal;
  private signInPromise?: Promise<void>;

  constructor(app: PackAppInternal, authService: BaseAuthService) {
    this.app = app;
    this.#authService = authService;
  }

  // AuthModule interface implementation
  isAuthenticated(): boolean {
    return this.#authService.isAuthenticated();
  }

  async getToken(): Promise<string> {
    return this.#authService.getToken();
  }

  getTokenOrUndefined(): string | undefined {
    return this.#authService.getTokenOrUndefined();
  }

  async signIn(): Promise<void> {
    if (this.signInPromise) {
      return this.signInPromise;
    }

    this.signInPromise = (async () => {
      try {
        await this.#authService.signIn();
      } finally {
        this.signInPromise = undefined;
      }
    })();

    return this.signInPromise;
  }

  async signOut(): Promise<void> {
    return this.#authService.signOut();
  }

  async refresh(): Promise<void> {
    if (!this.#authService.refresh) {
      throw new Error("Refresh not supported for this auth client type");
    }

    return this.#authService.refresh();
  }

  onAuthStateChange(callback: AuthStateCallback): Unsubscribe {
    return this.#authService.onAuthStateChange(callback);
  }

  onTokenChange(callback: TokenChangeCallback): Unsubscribe {
    return this.#authService.onTokenChange(callback);
  }

  async waitForAuth(): Promise<void> {
    // If already authenticated, resolve immediately
    if (this.isAuthenticated()) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const unsubscribe = this.onAuthStateChange(event => {
        if (event.state === AuthState.Authenticated) {
          unsubscribe();
          resolve();
        } else if (event.state === AuthState.Error) {
          unsubscribe();
          reject(new Error("Authentication failed", { cause: event.error }));
        }
      });
    });
  }

  getCurrentUser(allowUnverified = false): UserRef | undefined {
    const userId = this.#authService.getCurrentUserId(allowUnverified);
    if (userId != null) {
      return createUserRef(this.app, userId);
    }
    return undefined;
  }

  async validateToken(): Promise<boolean> {
    return this.#authService.validateToken();
  }

  async getUserData(userId: string, force?: boolean): Promise<unknown> {
    return this.#authService.getUserData(userId, force);
  }

  dispose(): void {
    this.#authService.dispose();
    this.signInPromise = undefined;
  }
}
