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
import type { createConfidentialOauthClient } from "@osdk/oauth";
import { AuthState, type BaseAuthService } from "@palantir/pack.auth";
import type { PackAppInternal } from "@palantir/pack.core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockProxy } from "vitest-mock-extended";
import { mock } from "vitest-mock-extended";
import { createConfidentialOauthService } from "../auth/AuthServiceConfidential.js";

type ConfidentialOauthClient = ReturnType<typeof createConfidentialOauthClient>;

describe("ConfidentialOauthService", () => {
  let mockOauthClient: ConfidentialOauthClient;
  let mockApp: PackAppInternal;
  let mockLogger: MockProxy<Logger>;
  let service: BaseAuthService;
  let eventListeners: Record<string, (() => void)[]>;

  // Store references to mocks for easy access in tests
  let mockGetTokenOrUndefined: ReturnType<typeof vi.fn>;
  let mockSignIn: ReturnType<typeof vi.fn>;
  let mockSignOut: ReturnType<typeof vi.fn>;
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
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    }) as ConfidentialOauthClient;

    service = createConfidentialOauthService(mockApp, mockOauthClient);
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
    it("should start in unauthenticated state", () => {
      expect(service.getCurrentState()).toBe(AuthState.Unauthenticated);
      expect(service.isAuthenticated()).toBe(false);
    });

    it("should start authenticated if token exists", () => {
      const getTokenOrUndefined = vi.fn().mockReturnValue("existing-token");
      const tokenProvider = vi.fn().mockResolvedValue("oauth-token");
      const signIn = vi.fn().mockResolvedValue({
        access_token: "test-token",
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
      });
      const signOut = vi.fn().mockResolvedValue(undefined);
      const addEventListener = vi.fn();
      const removeEventListener = vi.fn();

      const authenticatedClient = Object.assign(tokenProvider, {
        getTokenOrUndefined,
        signIn,
        signOut,
        addEventListener,
        removeEventListener,
      }) as ConfidentialOauthClient;

      const authenticatedService = createConfidentialOauthService(mockApp, authenticatedClient);
      expect(authenticatedService.getCurrentState()).toBe(AuthState.Authenticated);
      expect(authenticatedService.isAuthenticated()).toBe(true);
    });

    it("should setup event listeners (no refresh for confidential)", () => {
      expect(mockAddEventListener).toHaveBeenCalledWith("signIn", expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith(
        "signOut",
        expect.any(Function),
      );
      expect(mockAddEventListener).not.toHaveBeenCalledWith(
        "refresh",
        expect.any(Function),
      );
    });
  });

  describe("TokenProvider interface", () => {
    it("should be callable and return token", async () => {
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

    it("should not have refresh capability", () => {
      expect(service.refresh).toBeUndefined();
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
    it("should update state on signIn event", () => {
      const callback = vi.fn();
      service.onAuthStateChange(callback);

      triggerEvent("signIn");

      expect(service.getCurrentState()).toBe(AuthState.Authenticated);
      expect(callback).toHaveBeenCalledWith({
        previousState: AuthState.Unauthenticated,
        state: AuthState.Authenticated,
      });
    });

    it("should update state on signOut event", () => {
      // Start authenticated
      triggerEvent("signIn");
      const callback = vi.fn();
      service.onAuthStateChange(callback);

      triggerEvent("signOut");

      expect(service.getCurrentState()).toBe(AuthState.Unauthenticated);
      expect(callback).toHaveBeenCalledWith({
        previousState: AuthState.Authenticated,
        state: AuthState.Unauthenticated,
      });
    });

    it("should not respond to refresh events (confidential clients don't have refresh)", () => {
      const callback = vi.fn();
      service.onAuthStateChange(callback);

      // Clear the initial callback that fires immediately
      callback.mockClear();

      // Trigger a refresh event (should be ignored)
      triggerEvent("refresh");

      expect(service.getCurrentState()).toBe(AuthState.Unauthenticated);
      expect(callback).not.toHaveBeenCalled();
    });

    it("should update state to authenticating during signIn", async () => {
      const callback = vi.fn();
      service.onAuthStateChange(callback);

      const signInPromise = service.signIn();

      expect(callback).toHaveBeenCalledWith({
        previousState: AuthState.Unauthenticated,
        state: AuthState.Authenticating,
      });

      await signInPromise;
    });

    it("should update state to error on signIn failure", async () => {
      const error = new Error("Sign in failed");
      mockSignIn.mockRejectedValue(error);

      const callback = vi.fn();
      service.onAuthStateChange(callback);

      await expect(service.signIn()).rejects.toThrow("Sign in failed");

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
        }) as unknown,
      });
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

      // Should not try to remove refresh listener for confidential clients
      expect(mockRemoveEventListener).not.toHaveBeenCalledWith(
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

  describe("confidential client specific behavior", () => {
    it("should handle client credentials flow via signIn", async () => {
      // For confidential clients, signIn typically performs client credentials grant
      await service.signIn();

      expect(mockSignIn).toHaveBeenCalled();
      expect(service.getCurrentState()).toBe(AuthState.Authenticating); // Should be in authenticating state during the call
    });

    it("should not have refresh functionality", () => {
      expect(service.refresh).toBeUndefined();
      expect(typeof service.refresh).toBe("undefined");
    });

    it("should work with server-side authentication patterns", async () => {
      // Simulate successful client credentials flow
      mockGetTokenOrUndefined
        .mockReturnValueOnce(undefined) // Initial state
        .mockReturnValue("server-token"); // After sign in

      expect(service.isAuthenticated()).toBe(false);

      await service.signIn();
      triggerEvent("signIn"); // Simulate the event being fired

      expect(service.getCurrentState()).toBe(AuthState.Authenticated);
      expect(service.isAuthenticated()).toBe(true);
    });
  });
});
