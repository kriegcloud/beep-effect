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
import type { PublicOauthClient } from "@osdk/oauth";
import { AuthState, type AuthStateChangeEvent, type BaseAuthService } from "@palantir/pack.auth";
import type { PackAppInternal } from "@palantir/pack.core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockProxy } from "vitest-mock-extended";
import { mock } from "vitest-mock-extended";
import { createPublicOauthService } from "../auth/AuthServicePublic.js";

describe("PublicOauthService", () => {
  let mockOauthClient: PublicOauthClient;
  let mockApp: PackAppInternal;
  let mockLogger: MockProxy<Logger>;
  let service: BaseAuthService;
  let eventListeners: Record<string, (() => void)[]>;

  // Store references to mocks for easy access in tests
  let mockGetTokenOrUndefined: ReturnType<typeof vi.fn>;
  let mockSignIn: ReturnType<typeof vi.fn>;
  let mockSignOut: ReturnType<typeof vi.fn>;
  let mockRefresh: ReturnType<typeof vi.fn>;
  let mockAddEventListener: ReturnType<typeof vi.fn>;
  let mockRemoveEventListener: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    eventListeners = {};

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

    const tokenProvider = vi.fn().mockResolvedValue("oauth-token");
    mockGetTokenOrUndefined = vi.fn().mockReturnValue(undefined);
    mockSignIn = vi.fn().mockResolvedValue({
      access_token: "test-token",
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
    });
    mockSignOut = vi.fn().mockResolvedValue(undefined);
    mockRefresh = vi.fn().mockResolvedValue({
      access_token: "refreshed-token",
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
    });
    mockAddEventListener = vi.fn().mockImplementation(
      (event: string, listener: (evt: unknown) => void) => {
        if (!eventListeners[event]) {
          eventListeners[event] = [];
        }
        eventListeners[event].push(() => {
          listener({});
        });
      },
    );
    mockRemoveEventListener = vi.fn().mockImplementation(
      (event: string, listener: (evt: unknown) => void) => {
        if (eventListeners[event]) {
          const index = eventListeners[event].findIndex(storedListener =>
            storedListener.toString() === listener.toString()
          );
          if (index > -1) {
            eventListeners[event].splice(index, 1);
          }
        }
      },
    );

    mockOauthClient = Object.assign(tokenProvider, {
      getTokenOrUndefined: mockGetTokenOrUndefined,
      signIn: mockSignIn,
      signOut: mockSignOut,
      refresh: mockRefresh,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    }) as PublicOauthClient;

    service = createPublicOauthService(mockApp, mockOauthClient);
  });

  // Helper to trigger OAuth events
  const triggerEvent = (eventType: string) => {
    if (eventListeners[eventType]) {
      eventListeners[eventType].forEach(listener => {
        listener();
      });
    }
  };

  describe("initialization", () => {
    it("should start in initializing state", () => {
      expect(service.getCurrentState()).toBe(AuthState.Initializing);
      expect(service.isAuthenticated()).toBe(false);
    });

    it("should start in initializing state even if token exists", () => {
      mockGetTokenOrUndefined.mockReturnValue("existing-token");

      const authenticatedService = createPublicOauthService(mockApp, mockOauthClient);
      expect(authenticatedService.getCurrentState()).toBe(AuthState.Initializing);
      expect(authenticatedService.isAuthenticated()).toBe(true);
    });

    it("should setup event listeners", () => {
      expect(mockAddEventListener).toHaveBeenCalledWith("signIn", expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith(
        "signOut",
        expect.any(Function),
      );
      expect(mockAddEventListener).toHaveBeenCalledWith(
        "refresh",
        expect.any(Function),
      );
    });
  });

  describe("getToken method", () => {
    it("should return token from OAuth client", async () => {
      const token = await service.getToken();
      expect(token).toBe("oauth-token");
      expect(mockOauthClient).toHaveBeenCalled();
    });
  });

  describe("authentication methods", () => {
    it("should delegate to OAuth client for signIn", async () => {
      await service.signIn();
      expect(mockSignIn).toHaveBeenCalled();
    });

    it("should delegate to OAuth client for signOut", async () => {
      await service.signOut();
      expect(mockSignOut).toHaveBeenCalled();
    });

    it("should delegate to OAuth client for refresh", async () => {
      await service.refresh!();
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("should delegate to OAuth client for getTokenOrUndefined", () => {
      mockGetTokenOrUndefined.mockReturnValue("test-token");

      expect(service.getTokenOrUndefined()).toBe("test-token");
      expect(mockGetTokenOrUndefined).toHaveBeenCalled();
    });

    it("should delegate to OAuth client for isAuthenticated", () => {
      mockGetTokenOrUndefined.mockReturnValue("test-token");

      expect(service.isAuthenticated()).toBe(true);

      mockGetTokenOrUndefined.mockReturnValue(undefined);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe("state management", () => {
    it("should update state on signIn event", async () => {
      const callback = vi.fn();
      service.onAuthStateChange(callback);

      // First call is immediate callback with Initializing state
      expect(callback).toHaveBeenNthCalledWith(1, {
        state: AuthState.Initializing,
      });

      // Wait for signIn to be called (lazy initialization)
      await vi.waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });

      // Then authenticating state
      expect(callback).toHaveBeenNthCalledWith(2, {
        previousState: AuthState.Initializing,
        state: AuthState.Authenticating,
      });

      triggerEvent("signIn");

      expect(service.getCurrentState()).toBe(AuthState.Authenticated);
      expect(callback).toHaveBeenCalledWith({
        previousState: AuthState.Authenticating,
        state: AuthState.Authenticated,
      });
    });

    it("should update state on signOut event", () => {
      // Start authenticated
      triggerEvent("signIn");
      const callback = vi.fn();
      service.onAuthStateChange(callback);

      // First call is immediate callback with current state
      expect(callback).toHaveBeenNthCalledWith(1, {
        state: AuthState.Authenticated,
      });

      triggerEvent("signOut");

      expect(service.getCurrentState()).toBe(AuthState.Unauthenticated);
      expect(callback).toHaveBeenNthCalledWith(2, {
        previousState: AuthState.Authenticated,
        state: AuthState.Unauthenticated,
      });
    });

    it("should update state on refresh event", async () => {
      const callback = vi.fn();
      service.onAuthStateChange(callback);

      // First call is immediate callback with Initializing state
      expect(callback).toHaveBeenNthCalledWith(1, {
        state: AuthState.Initializing,
      });

      // Wait for signIn to be called (lazy initialization)
      await vi.waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });

      triggerEvent("refresh");

      expect(service.getCurrentState()).toBe(AuthState.Authenticated);
      expect(callback).toHaveBeenCalledWith({
        previousState: AuthState.Authenticating,
        state: AuthState.Authenticated,
      });
    });

    it("should update state to authenticating during signIn", async () => {
      const callback = vi.fn();
      service.onAuthStateChange(callback);

      // First call is immediate callback
      expect(callback).toHaveBeenNthCalledWith(1, {
        state: AuthState.Initializing,
      });

      // Wait for lazy initialization signIn
      await vi.waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });

      // Should be in Authenticating state
      expect(callback).toHaveBeenCalledWith({
        previousState: AuthState.Initializing,
        state: AuthState.Authenticating,
      });
    });

    it("should update state to error on signIn failure", async () => {
      const error = new Error("Sign in failed");
      mockSignIn.mockRejectedValue(error);

      const callback = vi.fn();
      service.onAuthStateChange(callback);

      // First call is immediate callback
      expect(callback).toHaveBeenNthCalledWith(1, {
        state: AuthState.Initializing,
      });

      // Wait for lazy initialization to fail
      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({
            state: AuthState.Error,
          }),
        );
      });

      expect(callback).toHaveBeenCalledWith({
        previousState: AuthState.Authenticating,
        state: AuthState.Error,
        error,
      });
    });

    it("should handle multiple state change listeners", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      service.onAuthStateChange(callback1);
      service.onAuthStateChange(callback2);

      triggerEvent("signIn");

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it("should allow unsubscribing from state changes", () => {
      const callback = vi.fn();
      const unsubscribe = service.onAuthStateChange(callback);

      // Clear the initial callback that fires immediately
      callback.mockClear();

      unsubscribe();
      triggerEvent("signIn");

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle errors in state change callbacks", () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error("Callback error");
      });
      const goodCallback = vi.fn();

      // Add callbacks - errors should be handled gracefully
      service.onAuthStateChange(errorCallback);
      service.onAuthStateChange(goodCallback);

      // Clear initial calls to test the actual event-triggered behavior
      errorCallback.mockClear();
      goodCallback.mockClear();
      mockLogger.error.mockClear();

      triggerEvent("signIn");

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error in auth state callback:",
        expect.any(Error),
      );
      expect(goodCallback).toHaveBeenCalled(); // Other callbacks should still work
    });

    it("should convert non-Error objects to Error in error state", async () => {
      mockSignIn.mockRejectedValue("string error");

      const callback = vi.fn();
      service.onAuthStateChange(callback);

      await expect(service.signIn()).rejects.toThrow("string error");

      expect(callback).toHaveBeenCalledWith({
        previousState: AuthState.Authenticating,
        state: AuthState.Error,
        error: expect.objectContaining({
          message: "string error",
        }) as Error,
      } as AuthStateChangeEvent);
    });
  });

  describe("cleanup", () => {
    it("should remove event listeners on dispose", () => {
      service.dispose();

      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        "signIn",
        expect.any(Function),
      );
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        "signOut",
        expect.any(Function),
      );
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        "refresh",
        expect.any(Function),
      );
    });

    it("should clear state callbacks on dispose", () => {
      const callback = vi.fn();
      service.onAuthStateChange(callback);

      // Clear the initial callback that fires immediately
      callback.mockClear();

      service.dispose();
      triggerEvent("signIn");

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
