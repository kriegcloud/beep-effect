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

import type { PackAppInternal } from "@palantir/pack.core";
import type { MockedObject } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { AuthModuleImpl, AuthState, type AuthStateCallback } from "../index.js";
import type { BaseAuthService } from "../types/BaseAuthService.js";

function createMockAuthService(
  tokenValue = "mock-token",
  overrides: Partial<BaseAuthService> = {},
): MockedObject<BaseAuthService> {
  const defaultService = {
    dispose: vi.fn(),
    getCurrentState: vi.fn().mockReturnValue(AuthState.Unauthenticated),
    getCurrentUserId: vi.fn().mockReturnValue(undefined),
    getToken: vi.fn().mockResolvedValue(tokenValue),
    getTokenOrUndefined: vi.fn().mockReturnValue(undefined),
    getUserData: vi.fn().mockResolvedValue({}),
    isAuthenticated: vi.fn().mockReturnValue(false),
    isValidated: vi.fn().mockReturnValue(false),
    onAuthStateChange: vi.fn().mockReturnValue(vi.fn()),
    refresh: vi.fn().mockResolvedValue(undefined),
    signIn: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    validateToken: vi.fn().mockResolvedValue(true),
    ...overrides,
  };

  return defaultService as MockedObject<BaseAuthService>;
}

describe("AuthModuleImpl", () => {
  let authModule: AuthModuleImpl;

  afterEach(() => {
    authModule.dispose();
  });

  describe("with static token service", () => {
    let authService: BaseAuthService;

    beforeEach(() => {
      // Create mock service that behaves like static token service
      authService = createMockAuthService("static-token", {
        isAuthenticated: vi.fn().mockReturnValue(true), // Static services start authenticated
        signOut: vi.fn().mockRejectedValue(
          new Error("Sign out not supported for static token providers"),
        ),
        refresh: undefined, // Static services don't support refresh
      });

      const mockApp = mockDeep<PackAppInternal>();

      authModule = new AuthModuleImpl(mockApp, authService);
    });

    it("should be authenticated immediately", () => {
      expect(authModule.isAuthenticated()).toBe(true);
    });

    it("should return token from provider", async () => {
      const token = await authModule.getToken();
      expect(token).toBe("static-token");
      expect(authService.getToken).toHaveBeenCalled();
    });

    it("should return undefined for getTokenOrUndefined initially", () => {
      expect(authModule.getTokenOrUndefined()).toBeUndefined();
    });

    it("should be no-op for signIn", async () => {
      await expect(authModule.signIn()).resolves.toBeUndefined();
    });

    it("should reject signOut for static token providers", async () => {
      await expect(authModule.signOut()).rejects.toThrow(
        "Sign out not supported for static token providers",
      );
    });

    it("should throw for refresh", async () => {
      await expect(authModule.refresh()).rejects.toThrow("Refresh not supported");
    });

    it("should allow state change subscriptions", () => {
      const callback = vi.fn();
      const unsubscribe = authModule.onAuthStateChange(callback);

      expect(typeof unsubscribe).toBe("function");
      unsubscribe();
    });

    it("should resolve waitForAuth immediately when already authenticated", async () => {
      await expect(authModule.waitForAuth()).resolves.toBeUndefined();
    });
  });

  describe("with OAuth service", () => {
    let mockApp: ReturnType<typeof mockDeep<PackAppInternal>>;
    let mockAuthService: MockedObject<BaseAuthService>;

    beforeEach(() => {
      mockAuthService = createMockAuthService("oauth-token");
      mockApp = mockDeep<PackAppInternal>();

      authModule = new AuthModuleImpl(mockApp, mockAuthService);
    });

    it("should delegate isAuthenticated to service", () => {
      expect(authModule.isAuthenticated()).toBe(false);
      expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
    });

    it("should delegate getToken to service", async () => {
      const token = await authModule.getToken();
      expect(token).toBe("oauth-token");
      expect(mockAuthService.getToken).toHaveBeenCalled();
    });

    it("should delegate getTokenOrUndefined to service", () => {
      const token = authModule.getTokenOrUndefined();
      expect(token).toBeUndefined();
      expect(mockAuthService.getTokenOrUndefined).toHaveBeenCalled();
    });

    it("should delegate signIn to service", async () => {
      await authModule.signIn();
      expect(mockAuthService.signIn).toHaveBeenCalled();
    });

    it("should delegate signOut to service", async () => {
      await authModule.signOut();
      expect(mockAuthService.signOut).toHaveBeenCalled();
    });

    it("should delegate refresh to service", async () => {
      await authModule.refresh();
      expect(mockAuthService.refresh).toHaveBeenCalled();
    });

    it("should delegate onAuthStateChange to service", () => {
      const callback = vi.fn();
      authModule.onAuthStateChange(callback);
      expect(mockAuthService.onAuthStateChange).toHaveBeenCalledWith(callback);
    });
  });

  describe("waitForAuth behavior", () => {
    it("should resolve immediately when already authenticated", async () => {
      const mockAuthService = createMockAuthService("test-token", {
        isAuthenticated: vi.fn().mockReturnValue(true),
      });

      const mockApp = mockDeep<PackAppInternal>();

      authModule = new AuthModuleImpl(mockApp, mockAuthService);

      await expect(authModule.waitForAuth()).resolves.toBeUndefined();
      expect(mockAuthService.onAuthStateChange).not.toHaveBeenCalled();
    });

    it("should wait for authentication event when not authenticated", async () => {
      const mockUnsubscribe = vi.fn();
      const mockAuthService = createMockAuthService("test-token", {
        isAuthenticated: vi.fn().mockReturnValue(false),
        onAuthStateChange: vi.fn().mockImplementation((callback: AuthStateCallback) => {
          setTimeout(() => {
            callback({
              state: AuthState.Authenticated,
              previousState: AuthState.Unauthenticated,
            });
          }, 10);
          return mockUnsubscribe;
        }),
      });

      const mockApp = mockDeep<PackAppInternal>();

      authModule = new AuthModuleImpl(mockApp, mockAuthService);

      await expect(authModule.waitForAuth()).resolves.toBeUndefined();
      expect(mockAuthService.onAuthStateChange).toHaveBeenCalled();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it("should reject on authentication error", async () => {
      const mockUnsubscribe = vi.fn();
      const error = new Error("Auth failed");
      const mockAuthService = createMockAuthService("test-token", {
        isAuthenticated: vi.fn().mockReturnValue(false),
        onAuthStateChange: vi.fn().mockImplementation((callback: AuthStateCallback) => {
          setTimeout(() => {
            callback({
              state: AuthState.Error,
              previousState: AuthState.Authenticating,
              error,
            });
          }, 10);
          return mockUnsubscribe;
        }),
      });

      const mockApp = mockDeep<PackAppInternal>();

      authModule = new AuthModuleImpl(mockApp, mockAuthService);

      await expect(authModule.waitForAuth()).rejects.toThrow("Authentication failed");
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe("signIn deduplication", () => {
    it("should deduplicate concurrent signIn calls", async () => {
      const mockAuthService = createMockAuthService("test-token", {
        signIn: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50))),
      });

      const mockApp = mockDeep<PackAppInternal>();

      authModule = new AuthModuleImpl(mockApp, mockAuthService);

      const promises = [
        authModule.signIn(),
        authModule.signIn(),
        authModule.signIn(),
      ];

      await Promise.all(promises);

      expect(mockAuthService.signIn).toHaveBeenCalledTimes(1);
    });
  });
});
