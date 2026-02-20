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
import type { Client } from "@osdk/client";
import { Users } from "@osdk/foundry.admin";
import { AuthState, type BaseAuthService } from "@palantir/pack.auth";
import type { PackAppInternal, TokenProvider } from "@palantir/pack.core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockProxy } from "vitest-mock-extended";
import { mock } from "vitest-mock-extended";
import { createStaticTokenService } from "../auth/AuthServiceStatic.js";

// Mock the Users module
vi.mock("@osdk/foundry.admin", () => ({
  Users: {
    getCurrent: vi.fn(),
  },
}));

describe("StaticTokenService", () => {
  let mockTokenProvider: TokenProvider;
  let mockApp: PackAppInternal;
  let mockLogger: MockProxy<Logger>;
  let service: BaseAuthService;

  beforeEach(() => {
    mockTokenProvider = vi.fn().mockResolvedValue("static-test-token");
    mockLogger = mock<Logger>();
    mockLogger.child.mockReturnValue(mockLogger);

    const mockOsdkClient = mock<Client>();

    mockApp = {
      config: {
        app: { appId: "test-app" },
        logger: mockLogger,
        ontologyRid: Promise.resolve("ri.ontology...test"),
        osdkClient: mockOsdkClient,
        remote: {
          packWsPath: "/api/v2/packSubscriptions",
          baseUrl: "https://test.example.com",
          fetchFn: globalThis.fetch,
        },
      },
      getModule: vi.fn(),
    };

    // Mock Users.getCurrent to return a mock user
    vi.mocked(Users.getCurrent).mockResolvedValue({
      id: "test-user-id",
      username: "test-user",
      realm: "test-realm",
      attributes: {},
      status: "ACTIVE",
    });

    service = createStaticTokenService(mockApp, mockTokenProvider);
  });

  describe("initialization", () => {
    it("should eagerly fetch token and transition to authenticated", async () => {
      await vi.waitFor(() => {
        expect(service.getCurrentState()).toBe(AuthState.Authenticated);
      });
      expect(service.isAuthenticated()).toBe(true);
      expect(service.getTokenOrUndefined()).toBe("static-test-token");
      expect(mockTokenProvider).toHaveBeenCalled();
    });

    it("should start in un-validated state", () => {
      expect(service.isValidated()).toBe(false);
    });

    it("should return undefined for getCurrentUser before validation", () => {
      expect(service.getCurrentUserId()).toBeUndefined();
    });
  });

  describe("getToken method", () => {
    it("should return token from provider", async () => {
      const token = await service.getToken();
      expect(token).toBe("static-test-token");
      expect(mockTokenProvider).toHaveBeenCalled();
    });

    describe("with custom token providers", () => {
      it("should handle async token provider", async () => {
        const customProvider = vi.fn().mockResolvedValue("async-token");
        const customService = createStaticTokenService(mockApp, customProvider);

        const token = await customService.getToken();
        expect(token).toBe("async-token");
      });

      it("should handle token provider that throws", async () => {
        const error = new Error("Token provider error");
        const failingProvider = vi.fn().mockRejectedValue(error);
        const customService = createStaticTokenService(mockApp, failingProvider);

        await vi.waitFor(() => {
          expect(customService.getCurrentState()).toBe(AuthState.Error);
        });

        await expect(customService.getToken()).rejects.toThrow("Token provider error");
      });
    });
  });

  describe("authentication methods", () => {
    it("should return true for isAuthenticated after eager fetch", async () => {
      await vi.waitFor(() => {
        expect(service.isAuthenticated()).toBe(true);
      });
    });

    it("should return token for getTokenOrUndefined after eager fetch", async () => {
      await vi.waitFor(() => {
        expect(service.getTokenOrUndefined()).toBe("static-test-token");
      });
    });

    it("should be no-op for signIn", async () => {
      await expect(service.signIn()).resolves.toBeUndefined();
    });

    it("should reject signOut for static token providers", async () => {
      await expect(service.signOut()).rejects.toThrow(
        "Sign out not supported for static token providers",
      );
    });

    it("should not have refresh capability", () => {
      expect(service.refresh).toBeUndefined();
    });
  });

  describe("state management", () => {
    it("should fire auth state change event with current state immediately", () => {
      const callback = vi.fn();
      const unsubscribe = service.onAuthStateChange(callback);

      // First call should be immediate callback with current state (no previousState)
      expect(callback).toHaveBeenCalledWith({
        state: AuthState.Authenticated,
      });

      expect(typeof unsubscribe).toBe("function");
    });

    it("should allow unsubscribing from state changes", () => {
      const callback = vi.fn();
      const unsubscribe = service.onAuthStateChange(callback);

      unsubscribe();
      expect(typeof unsubscribe).toBe("function");
    });

    it("should maintain authenticated state after signIn", async () => {
      await vi.waitFor(() => {
        expect(service.getCurrentState()).toBe(AuthState.Authenticated);
      });

      await expect(service.signIn()).resolves.toBeUndefined();
      expect(service.getCurrentState()).toBe(AuthState.Authenticated);
    });
  });

  describe("token validation", () => {
    beforeEach(() => {
      globalThis.fetch = vi.fn();
    });

    it("should validate token successfully with baseUrl", async () => {
      await service.getToken();

      const isValid = await service.validateToken();

      expect(isValid).toBe(true);
      expect(service.isValidated()).toBe(true);
      expect(service.getCurrentUserId()).toBeDefined();
      expect(Users.getCurrent).toHaveBeenCalledWith(mockApp.config.osdkClient);
    });

    it("should handle validation failure", async () => {
      vi.mocked(Users.getCurrent).mockRejectedValueOnce(new Error("Unauthorized"));

      await service.getToken();

      const isValid = await service.validateToken();

      expect(isValid).toBe(false);
      expect(service.isValidated()).toBe(false);
      expect(service.getCurrentUserId()).toBeUndefined();
    });

    it("should handle network errors during validation", async () => {
      vi.mocked(Users.getCurrent).mockRejectedValueOnce(new Error("Network error"));

      await service.getToken();

      const isValid = await service.validateToken();

      expect(isValid).toBe(false);
      expect(service.isValidated()).toBe(false);
      expect(service.getCurrentUserId()).toBeUndefined();
    });

    describe("with mocked Users.getCurrent", () => {
      it("should return true for validation when Users.getCurrent is mocked", async () => {
        vi.clearAllMocks();

        vi.mocked(Users.getCurrent).mockResolvedValue({
          id: "mocked-user-id",
          username: "mocked-user",
          realm: "test-realm",
          attributes: {},
          status: "ACTIVE",
        });

        await service.getToken();

        const isValid = await service.validateToken();

        expect(isValid).toBe(true);
        expect(service.isValidated()).toBe(true);
        expect(service.getCurrentUserId()).toBe("mocked-user-id");
        expect(Users.getCurrent).toHaveBeenCalledOnce();
      });
    });

    it("should reset validation state on signOut", async () => {
      await service.getToken();

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ userId: "test-user" }),
      });
      await service.validateToken();

      expect(service.isValidated()).toBe(true);

      await expect(service.signOut()).rejects.toThrow();

      expect(service.isValidated()).toBe(false);
      expect(service.getCurrentUserId()).toBeUndefined();
    });
  });

  describe("cleanup", () => {
    it("should clear state callbacks on dispose", () => {
      const callback = vi.fn();
      service.onAuthStateChange(callback);

      service.dispose();

      expect(() => {
        service.dispose();
      }).not.toThrow();
    });

    it("should reset validation state on dispose", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ userId: "test-user" }),
      });

      await service.getToken();
      await service.validateToken();

      expect(service.isValidated()).toBe(true);

      service.dispose();

      expect(service.isValidated()).toBe(false);
      expect(service.getCurrentUserId()).toBeUndefined();
    });

    it("should not affect token provider after dispose", async () => {
      await service.getToken();

      service.dispose();

      const token = await service.getToken();
      expect(token).toBe("static-test-token");
    });
  });

  describe("multiple instances", () => {
    it("should create independent services", () => {
      const provider1 = vi.fn().mockResolvedValue("token1");
      const provider2 = vi.fn().mockResolvedValue("token2");

      const service1 = createStaticTokenService(mockApp, provider1);
      const service2 = createStaticTokenService(mockApp, provider2);

      expect(service1).not.toBe(service2);
      expect(service1.getCurrentState()).toBe(AuthState.Unauthenticated);
      expect(service2.getCurrentState()).toBe(AuthState.Unauthenticated);
    });

    it("should handle different token provider behaviors", async () => {
      const syncProvider = () => Promise.resolve("sync-token");
      const asyncProvider = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return "async-token";
      };

      const syncService = createStaticTokenService(mockApp, syncProvider);
      const asyncService = createStaticTokenService(mockApp, asyncProvider);

      const [syncToken, asyncToken] = await Promise.all([
        syncService.getToken(),
        asyncService.getToken(),
      ]);

      expect(syncToken).toBe("sync-token");
      expect(asyncToken).toBe("async-token");
    });
  });
});
