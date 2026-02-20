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

const DEMO_TOKEN_STORAGE_KEY = "demo-oauth-token";
const DEFAULT_TOKEN_EXPIRY_MS = 3 * 60 * 1000; // frequent expiry for demo tokens

export interface DemoPublicOauthClientOptions {
  autoSignIn?: boolean;
  mockUserId?: string;
  simulateDelay?: boolean;
}

type EventListener = (evt: Event) => void;
// osdk doesn't export Token type.
export type Token = Awaited<ReturnType<PublicOauthClient["signIn"]>>;

export class DemoPublicOauthClient {
  private currentToken: Token | undefined;
  private readonly autoSignIn: boolean;
  private readonly mockUserId: string;
  private readonly simulateDelay: boolean;
  private readonly eventListeners: Map<string, Set<EventListener>>;

  constructor(
    private readonly clientId: string,
    private readonly foundryUrl: string,
    private readonly redirectUrl: string,
    options: DemoPublicOauthClientOptions = {},
  ) {
    this.autoSignIn = options.autoSignIn ?? false;
    this.mockUserId = options.mockUserId ?? "demo-user";
    this.simulateDelay = options.simulateDelay ?? false;
    this.eventListeners = new Map();

    this.loadTokenFromStorage();
    this.handleCallbackIfPresent();
  }

  private handleCallbackIfPresent(): void {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code == null || state == null) {
      return;
    }

    const savedState = sessionStorage.getItem("demo-oauth-state");
    const returnUrl = sessionStorage.getItem("demo-oauth-return-url");

    if (savedState !== state) {
      return;
    }

    sessionStorage.removeItem("demo-oauth-state");
    sessionStorage.removeItem("demo-oauth-code-verifier");
    sessionStorage.removeItem("demo-oauth-return-url");

    const token = this.generateToken();
    this.currentToken = token;
    this.saveTokenToStorage(token);
    this.fireEvent("signIn", new CustomEvent("signIn", { detail: token }));

    if (returnUrl != null) {
      window.history.replaceState({}, "", returnUrl);
    }
  }

  getToken = async (): Promise<string> => {
    const token = this.getTokenOrUndefined();
    if (token != null) {
      return token;
    }

    if (this.autoSignIn) {
      const signedInToken = await this.signIn();
      return signedInToken.access_token;
    }

    throw new Error("Not authenticated. Call signIn() first.");
  };

  getTokenOrUndefined = (): string | undefined => {
    if (this.currentToken == null) {
      return undefined;
    }

    if (this.isTokenExpired(this.currentToken)) {
      this.currentToken = undefined;
      this.clearTokenFromStorage();
      return undefined;
    }

    return this.currentToken.access_token;
  };

  signIn = async (): Promise<Token> => {
    const state = Math.random().toString(36).substring(7);
    const code = Math.random().toString(36).substring(2);

    sessionStorage.setItem("demo-oauth-state", state);
    sessionStorage.setItem("demo-oauth-return-url", window.location.href);

    const callbackUrl = new URL(this.redirectUrl, window.location.origin);
    callbackUrl.searchParams.set("code", code);
    callbackUrl.searchParams.set("state", state);

    window.location.href = callbackUrl.toString();

    return new Promise(() => {});
  };

  signOut = async (): Promise<void> => {
    if (this.simulateDelay) {
      await this.delay(200);
    }

    this.currentToken = undefined;
    this.clearTokenFromStorage();
    this.fireEvent("signOut", new Event("signOut"));
  };

  refresh = async (): Promise<Token | undefined> => {
    if (this.currentToken == null) {
      return undefined;
    }

    if (this.simulateDelay) {
      await this.delay(300);
    }

    const token = this.generateToken();
    this.currentToken = token;
    this.saveTokenToStorage(token);
    this.fireEvent("refresh", new CustomEvent("refresh", { detail: token }));

    return token;
  };

  addEventListener = <T extends "signIn" | "signOut" | "refresh">(
    type: T,
    listener: EventListener | null,
    _options?: boolean | AddEventListenerOptions,
  ): void => {
    if (listener == null) {
      return;
    }

    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }

    this.eventListeners.get(type)!.add(listener);
  };

  removeEventListener = <T extends "signIn" | "signOut" | "refresh">(
    type: T,
    callback: EventListener | null,
    _options?: EventListenerOptions | boolean,
  ): void => {
    if (callback == null) {
      return;
    }

    const listeners = this.eventListeners.get(type);
    if (listeners != null) {
      listeners.delete(callback);
    }
  };

  private generateToken(): Token {
    const now = Date.now();
    const expiresIn = DEFAULT_TOKEN_EXPIRY_MS / 1000;
    const expiresAt = now + DEFAULT_TOKEN_EXPIRY_MS;

    const tokenPayload = {
      exp: Math.floor(expiresAt / 1000),
      iat: Math.floor(now / 1000),
      iss: this.foundryUrl,
      sub: this.mockUserId,
    };

    const encodedPayload = btoa(JSON.stringify(tokenPayload));
    const accessToken = `demo.${encodedPayload}.signature`;

    return {
      access_token: accessToken,
      expires_at: expiresAt,
      expires_in: expiresIn,
      refresh_token: `refresh_${now}`,
    };
  }

  private isTokenExpired(token: Token): boolean {
    return Date.now() >= token.expires_at;
  }

  private fireEvent(type: string, event: Event): void {
    const listeners = this.eventListeners.get(type);
    if (listeners != null) {
      listeners.forEach(listener => listener(event));
    }
  }

  private loadTokenFromStorage(): void {
    try {
      const stored = localStorage.getItem(DEMO_TOKEN_STORAGE_KEY);
      if (stored != null) {
        const token = JSON.parse(stored) as Token;
        if (!this.isTokenExpired(token)) {
          this.currentToken = token;
        } else {
          this.clearTokenFromStorage();
        }
      }
    } catch {
      this.clearTokenFromStorage();
    }
  }

  private saveTokenToStorage(token: Token): void {
    try {
      localStorage.setItem(DEMO_TOKEN_STORAGE_KEY, JSON.stringify(token));
    } catch {
    }
  }

  private clearTokenFromStorage(): void {
    try {
      localStorage.removeItem(DEMO_TOKEN_STORAGE_KEY);
    } catch {
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export interface CreateDemoPublicOauthClientOptions extends DemoPublicOauthClientOptions {
  scopes?: readonly string[];
}

export function createDemoPublicOauthClient(
  clientId: string,
  foundryUrl: string,
  redirectUrl: string,
  options?: CreateDemoPublicOauthClientOptions,
): PublicOauthClient {
  const instance = new DemoPublicOauthClient(clientId, foundryUrl, redirectUrl, options);
  const {
    addEventListener,
    getToken,
    getTokenOrUndefined,
    refresh,
    removeEventListener,
    signIn,
    signOut,
    ...rest
  } = instance;

  // Make sure we don't miss any methods added in the future.
  rest satisfies Record<string, never>;

  return Object.assign(getToken, {
    addEventListener,
    getTokenOrUndefined,
    refresh,
    removeEventListener,
    signIn,
    signOut,
  }) as PublicOauthClient;
}
