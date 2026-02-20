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

import {
  type AuthModule,
  AuthState,
  type AuthStateChangeEvent,
  type TokenChangeCallback,
} from "@palantir/pack.auth";
import type { PackApp } from "@palantir/pack.core";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { useAuthState, useAuthToken } from "../index.js";

type PackAppWithAuth = PackApp & { auth: AuthModule };
type AuthStateCallback = (event: AuthStateChangeEvent) => void;

describe("Auth Hooks", () => {
  let mockApp: PackAppWithAuth;
  let authStateCallback: AuthStateCallback | undefined;
  let tokenCallback: TokenChangeCallback | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApp = mockDeep<PackAppWithAuth>();
    authStateCallback = undefined;
    tokenCallback = undefined;

    vi.mocked(mockApp.auth.getTokenOrUndefined).mockReturnValue(undefined);
    vi.mocked(mockApp.auth.onAuthStateChange).mockImplementation((callback: AuthStateCallback) => {
      authStateCallback = callback;
      callback({ state: AuthState.Unauthenticated });
      return vi.fn();
    });
    vi.mocked(mockApp.auth.onTokenChange).mockImplementation((callback: TokenChangeCallback) => {
      tokenCallback = callback;
      callback(undefined, {});
      return vi.fn();
    });
  });

  describe("useAuthState", () => {
    it("should return initial authentication state", () => {
      const { result } = renderHook(() => useAuthState(mockApp));

      expect(result.current).toBe(AuthState.Unauthenticated);
    });

    it("should return authenticated state when initially authenticated", () => {
      vi.mocked(mockApp.auth.isAuthenticated).mockReturnValue(true);
      vi.mocked(mockApp.auth.onAuthStateChange).mockImplementation(
        (callback: AuthStateCallback) => {
          authStateCallback = callback;
          callback({ state: AuthState.Authenticated });
          return vi.fn();
        },
      );

      const { result } = renderHook(() => useAuthState(mockApp));

      expect(result.current).toBe(AuthState.Authenticated);
    });

    it("should update state when authentication changes", () => {
      const { result } = renderHook(() => useAuthState(mockApp));

      expect(result.current).toBe(AuthState.Unauthenticated);

      act(() => {
        authStateCallback?.({
          previousState: AuthState.Unauthenticated,
          state: AuthState.Authenticated,
        });
      });

      expect(result.current).toBe(AuthState.Authenticated);
    });

    it("should update state when signing out", () => {
      // Start authenticated
      vi.mocked(mockApp.auth.isAuthenticated).mockReturnValue(true);
      vi.mocked(mockApp.auth.onAuthStateChange).mockImplementation(
        (callback: AuthStateCallback) => {
          authStateCallback = callback;
          callback({ state: AuthState.Authenticated });
          return vi.fn();
        },
      );

      const { result } = renderHook(() => useAuthState(mockApp));

      expect(result.current).toBe(AuthState.Authenticated);

      act(() => {
        authStateCallback?.({
          previousState: AuthState.Authenticated,
          state: AuthState.Unauthenticated,
        });
      });

      expect(result.current).toBe(AuthState.Unauthenticated);
    });

    it("should clean up subscription on unmount", () => {
      const { unmount } = renderHook(() => useAuthState(mockApp));

      expect(mockApp.auth.onAuthStateChange).toHaveBeenCalled();

      unmount();

      // The unsubscribe function should have been called
      // This is implicit in the cleanup, we just verify no errors occur
    });

    it("should handle multiple state transitions", () => {
      const { result } = renderHook(() => useAuthState(mockApp));

      expect(result.current).toBe(AuthState.Unauthenticated);

      // Sign in
      act(() => {
        authStateCallback?.({
          previousState: AuthState.Unauthenticated,
          state: AuthState.Authenticating,
        });
      });
      expect(result.current).toBe(AuthState.Authenticating);

      act(() => {
        authStateCallback?.({
          previousState: AuthState.Authenticating,
          state: AuthState.Authenticated,
        });
      });
      expect(result.current).toBe(AuthState.Authenticated);

      // Error state
      act(() => {
        authStateCallback?.({ previousState: AuthState.Authenticated, state: AuthState.Error });
      });
      expect(result.current).toBe(AuthState.Error);
    });
  });

  describe("useAuthToken", () => {
    it("should return undefined when not authenticated", () => {
      const { result } = renderHook(() => useAuthToken(mockApp));

      expect(result.current).toBeUndefined();
    });

    it("should return token when authenticated", () => {
      vi.mocked(mockApp.auth.getTokenOrUndefined).mockReturnValue("test-token");
      vi.mocked(mockApp.auth.onTokenChange).mockImplementation((callback: TokenChangeCallback) => {
        tokenCallback = callback;
        callback("test-token", {});
        return vi.fn();
      });

      const { result } = renderHook(() => useAuthToken(mockApp));

      expect(result.current).toBe("test-token");
    });

    it("should update token when authentication state changes", () => {
      const { result } = renderHook(() => useAuthToken(mockApp));

      expect(result.current).toBeUndefined();

      act(() => {
        tokenCallback?.("authenticated-token", {});
      });

      expect(result.current).toBe("authenticated-token");
    });

    it("should clear token when signing out", () => {
      vi.mocked(mockApp.auth.getTokenOrUndefined).mockReturnValue("initial-token");
      vi.mocked(mockApp.auth.onTokenChange).mockImplementation((callback: TokenChangeCallback) => {
        tokenCallback = callback;
        callback("initial-token", {});
        return vi.fn();
      });

      const { result } = renderHook(() => useAuthToken(mockApp));

      expect(result.current).toBe("initial-token");

      act(() => {
        tokenCallback?.(undefined, {});
      });

      expect(result.current).toBeUndefined();
    });

    it("should update token on refresh", () => {
      vi.mocked(mockApp.auth.getTokenOrUndefined).mockReturnValue("initial-token");
      vi.mocked(mockApp.auth.onTokenChange).mockImplementation((callback: TokenChangeCallback) => {
        tokenCallback = callback;
        callback("initial-token", {});
        return vi.fn();
      });

      const { result } = renderHook(() => useAuthToken(mockApp));

      expect(result.current).toBe("initial-token");

      act(() => {
        tokenCallback?.("refreshed-token", {});
      });

      expect(result.current).toBe("refreshed-token");
    });

    it("should clean up subscription on unmount", () => {
      const { unmount } = renderHook(() => useAuthToken(mockApp));

      expect(mockApp.auth.onTokenChange).toHaveBeenCalled();

      unmount();
    });
  });

  describe("Integration", () => {
    it("should work together for a complete auth flow", () => {
      const authStateCallbacks: AuthStateCallback[] = [];
      const tokenCallbacks: TokenChangeCallback[] = [];

      vi.mocked(mockApp.auth.onAuthStateChange).mockImplementation(
        (callback: AuthStateCallback) => {
          authStateCallbacks.push(callback);
          callback({ state: AuthState.Unauthenticated });
          return vi.fn();
        },
      );

      vi.mocked(mockApp.auth.onTokenChange).mockImplementation((callback: TokenChangeCallback) => {
        tokenCallbacks.push(callback);
        callback(undefined, {});
        return vi.fn();
      });

      const stateHook = renderHook(() => useAuthState(mockApp));
      const tokenHook = renderHook(() => useAuthToken(mockApp));

      expect(stateHook.result.current).toBe(AuthState.Unauthenticated);
      expect(tokenHook.result.current).toBeUndefined();

      act(() => {
        authStateCallbacks.forEach(callback => {
          callback({
            previousState: AuthState.Unauthenticated,
            state: AuthState.Authenticated,
          });
        });
        tokenCallbacks.forEach(callback => {
          callback("authenticated-token", {});
        });
      });

      expect(stateHook.result.current).toBe(AuthState.Authenticated);
      expect(tokenHook.result.current).toBe("authenticated-token");

      act(() => {
        authStateCallbacks.forEach(callback => {
          callback({
            previousState: AuthState.Authenticated,
            state: AuthState.Unauthenticated,
          });
        });
        tokenCallbacks.forEach(callback => {
          callback(undefined, {});
        });
      });

      expect(stateHook.result.current).toBe(AuthState.Unauthenticated);
      expect(tokenHook.result.current).toBeUndefined();
    });
  });
});
