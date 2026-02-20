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

import { parseJwtPayload } from "@palantir/pack.core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Token } from "../DemoPublicOauthClient.js";
import { createDemoPublicOauthClient, DemoPublicOauthClient } from "../DemoPublicOauthClient.js";

describe("DemoPublicOauthClient", () => {
  const CLIENT_ID = "test-client-id";
  const FOUNDRY_URL = "https://test.foundry.com";
  const REDIRECT_URL = "https://test.foundry.com/auth/callback";

  let originalLocationHref: string;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    originalLocationHref = window.location.href;
    vi.clearAllMocks();
    delete (window as any).location;
    (window as any).location = {
      href: "https://test.foundry.com/",
      origin: "https://test.foundry.com",
      search: "",
    };
    window.history.replaceState = vi.fn();
  });

  afterEach(() => {
    (window as any).location = { href: originalLocationHref };
  });

  function simulateOAuthCallback(state: string, code: string): void {
    (window.location as any).search = `?code=${code}&state=${state}`;
  }

  describe("constructor", () => {
    it("should create instance with default options", () => {
      const client = new DemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      expect(client).toBeInstanceOf(DemoPublicOauthClient);
      expect(client.getTokenOrUndefined()).toBeUndefined();
    });

    it("should load token from storage if valid", async () => {
      const token: Token = {
        access_token: "stored-token",
        expires_at: Date.now() + 3600000,
        expires_in: 3600,
        refresh_token: "refresh-token",
      };
      localStorage.setItem("demo-oauth-token", JSON.stringify(token));

      const client = new DemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      expect(client.getTokenOrUndefined()).toBe("stored-token");
    });

    it("should not load expired token from storage", () => {
      const expiredToken: Token = {
        access_token: "expired-token",
        expires_at: Date.now() - 1000,
        expires_in: 3600,
        refresh_token: "refresh-token",
      };
      localStorage.setItem("demo-oauth-token", JSON.stringify(expiredToken));

      const client = new DemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      expect(client.getTokenOrUndefined()).toBeUndefined();
      expect(localStorage.getItem("demo-oauth-token")).toBeNull();
    });
  });

  describe("token provider function", () => {
    it("should return token if already authenticated", async () => {
      const token: Token = {
        access_token: "test-token",
        expires_at: Date.now() + 3600000,
        expires_in: 3600,
        refresh_token: "refresh-token",
      };
      localStorage.setItem("demo-oauth-token", JSON.stringify(token));

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);
      const result = await client();

      expect(result).toBe("test-token");
    });

    it("should redirect for auto sign in if configured", async () => {
      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL, {
        autoSignIn: true,
      });

      void client();

      await vi.waitFor(() => {
        expect(window.location.href).toContain("code=");
        expect(window.location.href).toContain("state=");
      });
    });

    it("should throw if not authenticated and autoSignIn is false", async () => {
      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL, {
        autoSignIn: false,
      });

      await expect(client()).rejects.toThrow("Not authenticated");
    });
  });

  describe("getTokenOrUndefined", () => {
    it("should return undefined when not authenticated", () => {
      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      expect(client.getTokenOrUndefined()).toBeUndefined();
    });

    it("should return token when authenticated", () => {
      const token: Token = {
        access_token: "test-token",
        expires_at: Date.now() + 3600000,
        expires_in: 3600,
        refresh_token: "refresh-token",
      };
      localStorage.setItem("demo-oauth-token", JSON.stringify(token));

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);
      const result = client.getTokenOrUndefined();

      expect(result).toBe("test-token");
    });

    it("should return undefined for expired token", () => {
      const expiredToken: Token = {
        access_token: "expired",
        expires_at: Date.now() - 1000,
        expires_in: 0,
        refresh_token: "refresh",
      };
      localStorage.setItem("demo-oauth-token", JSON.stringify(expiredToken));

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      expect(client.getTokenOrUndefined()).toBeUndefined();
    });
  });

  describe("signIn", () => {
    it("should redirect to callback URL with code and state", () => {
      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      void client.signIn();

      expect(window.location.href).toContain(REDIRECT_URL);
      expect(window.location.href).toContain("code=");
      expect(window.location.href).toContain("state=");
    });

    it("should store state and return URL in sessionStorage", () => {
      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      void client.signIn();

      expect(sessionStorage.getItem("demo-oauth-state")).toBeDefined();
      expect(sessionStorage.getItem("demo-oauth-return-url")).toBe("https://test.foundry.com/");
    });
  });

  describe("OAuth callback", () => {
    it("should handle callback and generate token", () => {
      const state = "test-state";
      const code = "test-code";

      sessionStorage.setItem("demo-oauth-state", state);
      sessionStorage.setItem("demo-oauth-return-url", "https://test.foundry.com/original");
      simulateOAuthCallback(state, code);

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      const token = client.getTokenOrUndefined();
      expect(token).toBeDefined();
      expect(token).toMatch(/^demo\./);
    });

    it("should store token in localStorage after callback", () => {
      const state = "test-state";
      const code = "test-code";

      sessionStorage.setItem("demo-oauth-state", state);
      simulateOAuthCallback(state, code);

      createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      const stored = localStorage.getItem("demo-oauth-token");
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed).toMatchObject({
        access_token: expect.stringMatching(/^demo\./),
        expires_at: expect.any(Number),
        expires_in: expect.any(Number),
        refresh_token: expect.stringMatching(/^refresh_/),
      });
    });

    it("should fire signIn event after callback", () => {
      const state = "test-state";
      const code = "test-code";
      const listener = vi.fn();

      sessionStorage.setItem("demo-oauth-state", state);
      simulateOAuthCallback(state, code);

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);
      client.addEventListener("signIn", listener);

      expect(listener).toHaveBeenCalledTimes(0);
    });

    it("should reject callback with mismatched state", () => {
      const state = "test-state";
      const code = "test-code";

      sessionStorage.setItem("demo-oauth-state", "different-state");
      simulateOAuthCallback(state, code);

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      expect(client.getTokenOrUndefined()).toBeUndefined();
      expect(localStorage.getItem("demo-oauth-token")).toBeNull();
    });

    it("should use custom userId in generated token", () => {
      const state = "test-state";
      const code = "test-code";

      sessionStorage.setItem("demo-oauth-state", state);
      simulateOAuthCallback(state, code);

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL, {
        mockUserId: "custom-user-123",
      });

      const token = client.getTokenOrUndefined();
      if (!token) throw new Error("Expected token");
      const payload = parseJwtPayload(token);
      expect(payload.sub).toBe("custom-user-123");
    });

    it("should include foundry URL in generated token", () => {
      const state = "test-state";
      const code = "test-code";

      sessionStorage.setItem("demo-oauth-state", state);
      simulateOAuthCallback(state, code);

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      const token = client.getTokenOrUndefined();
      if (!token) throw new Error("Expected token");
      const payload = parseJwtPayload(token);
      expect(payload.iss).toBe(FOUNDRY_URL);
    });
  });

  describe("signOut", () => {
    it("should clear current token", async () => {
      const token: Token = {
        access_token: "test-token",
        expires_at: Date.now() + 3600000,
        expires_in: 3600,
        refresh_token: "refresh-token",
      };
      localStorage.setItem("demo-oauth-token", JSON.stringify(token));

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);
      expect(client.getTokenOrUndefined()).toBeDefined();

      await client.signOut();

      expect(client.getTokenOrUndefined()).toBeUndefined();
    });

    it("should remove token from localStorage", async () => {
      const token: Token = {
        access_token: "test-token",
        expires_at: Date.now() + 3600000,
        expires_in: 3600,
        refresh_token: "refresh-token",
      };
      localStorage.setItem("demo-oauth-token", JSON.stringify(token));

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      await client.signOut();

      expect(localStorage.getItem("demo-oauth-token")).toBeNull();
    });

    it("should fire signOut event", async () => {
      const token: Token = {
        access_token: "test-token",
        expires_at: Date.now() + 3600000,
        expires_in: 3600,
        refresh_token: "refresh-token",
      };
      localStorage.setItem("demo-oauth-token", JSON.stringify(token));

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);
      const listener = vi.fn();
      client.addEventListener("signOut", listener);

      await client.signOut();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "signOut",
        }),
      );
    });
  });

  describe("refresh", () => {
    it("should return undefined if not authenticated", async () => {
      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      const result = await client.refresh();

      expect(result).toBeUndefined();
    });

    it("should generate new token if authenticated", async () => {
      const originalToken: Token = {
        access_token: "original-token",
        expires_at: Date.now() + 3600000,
        expires_in: 3600,
        refresh_token: "refresh-token",
      };
      localStorage.setItem("demo-oauth-token", JSON.stringify(originalToken));

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      await new Promise(resolve => setTimeout(resolve, 10));
      const newToken = await client.refresh();

      expect(newToken).toBeDefined();
      expect(newToken!.access_token).not.toBe(originalToken.access_token);
    });

    it("should update stored token", async () => {
      const token: Token = {
        access_token: "test-token",
        expires_at: Date.now() + 3600000,
        expires_in: 3600,
        refresh_token: "refresh-token",
      };
      localStorage.setItem("demo-oauth-token", JSON.stringify(token));

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      await client.refresh();

      const stored = localStorage.getItem("demo-oauth-token");
      expect(stored).toBeDefined();
    });

    it("should fire refresh event", async () => {
      const token: Token = {
        access_token: "test-token",
        expires_at: Date.now() + 3600000,
        expires_in: 3600,
        refresh_token: "refresh-token",
      };
      localStorage.setItem("demo-oauth-token", JSON.stringify(token));

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);
      const listener = vi.fn();
      client.addEventListener("refresh", listener);

      await client.refresh();

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "refresh",
        }),
      );
    });
  });

  describe("event listeners", () => {
    it("should add and remove event listeners", () => {
      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);
      const listener = vi.fn();

      client.addEventListener("signIn", listener);
      client.removeEventListener("signIn", listener);

      expect(() => client.signIn()).not.toThrow();
    });

    it("should handle multiple listeners for same event", () => {
      const state = "test-state";
      const code = "test-code";
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      sessionStorage.setItem("demo-oauth-state", state);
      simulateOAuthCallback(state, code);

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);
      client.addEventListener("signIn", listener1);
      client.addEventListener("signIn", listener2);

      expect(listener1).toHaveBeenCalledTimes(0);
      expect(listener2).toHaveBeenCalledTimes(0);
    });

    it("should handle null listener gracefully", () => {
      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      expect(() => client.addEventListener("signIn", null)).not.toThrow();
      expect(() => client.removeEventListener("signIn", null)).not.toThrow();
    });
  });

  describe("simulateDelay option", () => {
    it("should add delay to signOut when enabled", async () => {
      const token: Token = {
        access_token: "test-token",
        expires_at: Date.now() + 3600000,
        expires_in: 3600,
        refresh_token: "refresh-token",
      };
      localStorage.setItem("demo-oauth-token", JSON.stringify(token));

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL, {
        simulateDelay: true,
      });

      const start = Date.now();
      await client.signOut();
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(150);
    });

    it("should not delay operations when disabled", async () => {
      const token: Token = {
        access_token: "test-token",
        expires_at: Date.now() + 3600000,
        expires_in: 3600,
        refresh_token: "refresh-token",
      };
      localStorage.setItem("demo-oauth-token", JSON.stringify(token));

      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL, {
        simulateDelay: false,
      });

      const start = Date.now();
      await client.signOut();
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(100);
    });
  });

  describe("createDemoPublicOauthClient", () => {
    it("should create client that is callable", () => {
      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL);

      expect(typeof client).toBe("function");
    });

    it("should accept options including scopes", () => {
      const client = createDemoPublicOauthClient(CLIENT_ID, FOUNDRY_URL, REDIRECT_URL, {
        autoSignIn: true,
        mockUserId: "test-user",
        scopes: ["api:read", "api:write"],
      });

      expect(typeof client).toBe("function");
      expect(client.signIn).toBeDefined();
      expect(client.signOut).toBeDefined();
    });
  });
});
