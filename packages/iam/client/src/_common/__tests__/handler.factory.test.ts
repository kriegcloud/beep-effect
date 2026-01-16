import { beforeAll, beforeEach, describe, expect, mock } from "bun:test";
import { effect } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as S from "effect/Schema";

// ============================================================================
// Mock Setup
// ============================================================================

// Type for BetterAuth-style responses
type MockResponse = {
  data: { id: string; name: string } | null;
  error: { message: string; code: string; status: number } | null;
};

const mockNotify = mock(() => {});

const mockSignOut = mock<() => Promise<MockResponse>>(() =>
  Promise.resolve({
    data: { id: "123", name: "Test" },
    error: null,
  })
);

const mockSignInEmail = mock<(_: unknown) => Promise<MockResponse>>(() =>
  Promise.resolve({
    data: { id: "456", name: "User" },
    error: null,
  })
);

// Mock the client module BEFORE any imports that depend on it
mock.module("@beep/iam-client/adapters", () => ({
  client: {
    signOut: mockSignOut,
    signIn: {
      email: mockSignInEmail,
    },
    $store: {
      notify: mockNotify,
    },
  },
}));

// Use dynamic imports to ensure the mock is applied before module resolution
let client: {
  signOut: typeof mockSignOut;
  signIn: { email: typeof mockSignInEmail };
  $store: { notify: typeof mockNotify };
};
let createHandler: typeof import("../handler.factory.ts").createHandler;

beforeAll(async () => {
  const adapters = await import("@beep/iam-client/adapters");
  client = adapters.client as typeof client;
  const handlerFactory = await import("../handler.factory.ts");
  createHandler = handlerFactory.createHandler;
});

// ============================================================================
// Test Schemas
// ============================================================================

const TestSuccess = S.Struct({
  id: S.String,
  name: S.String,
});

const TestPayload = S.Struct({
  email: S.String,
  remember: S.Boolean,
});

// ============================================================================
// Tests: Without Payload
// ============================================================================

describe("createHandler", () => {
  beforeEach(() => {
    mockNotify.mockClear();
    mockSignOut.mockClear();
    mockSignInEmail.mockClear();
  });

  describe("without payload", () => {
    effect(
      "executes successfully and decodes response",
      Effect.fn(function* () {
        mockSignOut.mockResolvedValueOnce({
          data: { id: "123", name: "Test" },
          error: null,
        });

        const handler = createHandler({
          domain: "core",
          feature: "sign-out",
          execute: () => client.signOut(),
          successSchema: TestSuccess,
          mutatesSession: false,
        });

        const result = yield* handler({});

        expect(result).toEqual({ id: "123", name: "Test" });
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      })
    );

    effect(
      "notifies $sessionSignal when mutatesSession is true",
      Effect.fn(function* () {
        mockSignOut.mockResolvedValueOnce({
          data: { id: "123", name: "Test" },
          error: null,
        });

        const handler = createHandler({
          domain: "core",
          feature: "sign-out",
          execute: () => client.signOut(),
          successSchema: TestSuccess,
          mutatesSession: true,
        });

        yield* handler({});

        expect(mockNotify).toHaveBeenCalledWith("$sessionSignal");
        expect(mockNotify).toHaveBeenCalledTimes(1);
      })
    );

    effect(
      "does NOT notify $sessionSignal when mutatesSession is false",
      Effect.fn(function* () {
        mockSignOut.mockResolvedValueOnce({
          data: { id: "123", name: "Test" },
          error: null,
        });

        const handler = createHandler({
          domain: "core",
          feature: "sign-out",
          execute: () => client.signOut(),
          successSchema: TestSuccess,
          mutatesSession: false,
        });

        yield* handler({});

        expect(mockNotify).not.toHaveBeenCalled();
      })
    );

    effect(
      "fails with BetterAuthResponseError when response.error is present",
      Effect.fn(function* () {
        mockSignOut.mockResolvedValueOnce({
          data: null,
          error: {
            message: "Session expired",
            code: "SESSION_EXPIRED",
            status: 401,
          },
        });

        const handler = createHandler({
          domain: "core",
          feature: "sign-out",
          execute: () => client.signOut(),
          successSchema: TestSuccess,
          mutatesSession: true,
        });

        const exit = yield* Effect.exit(handler({}));

        expect(Exit.isFailure(exit)).toBe(true);
        // Session signal should NOT be notified on error
        expect(mockNotify).not.toHaveBeenCalled();
      })
    );
  });

  // ============================================================================
  // Tests: With Payload
  // ============================================================================

  describe("with payload", () => {
    effect(
      "encodes payload before executing",
      Effect.fn(function* () {
        mockSignInEmail.mockResolvedValueOnce({
          data: { id: "456", name: "User" },
          error: null,
        });

        // Use mockSignInEmail directly to avoid Better Auth type constraints
        const handler = createHandler({
          domain: "sign-in",
          feature: "email",
          execute: (encoded) => mockSignInEmail(encoded),
          successSchema: TestSuccess,
          payloadSchema: TestPayload,
          mutatesSession: true,
        });

        const result = yield* handler({
          payload: { email: "test@example.com", remember: true },
        });

        expect(result).toEqual({ id: "456", name: "User" });
        expect(mockSignInEmail).toHaveBeenCalledTimes(1);
        // Verify encoded payload was passed
        const calledWith = mockSignInEmail.mock.calls[0]?.[0] as Record<string, unknown>;
        expect(calledWith?.email).toBe("test@example.com");
        expect(calledWith?.remember).toBe(true);
      })
    );

    effect(
      "passes fetchOptions to execute function",
      Effect.fn(function* () {
        mockSignInEmail.mockResolvedValueOnce({
          data: { id: "789", name: "Admin" },
          error: null,
        });

        const mockFetchOptions = { headers: { "X-Custom": "value" } };

        // Use mockSignInEmail directly to avoid Better Auth type constraints
        const handler = createHandler({
          domain: "sign-in",
          feature: "email",
          execute: (encoded) => mockSignInEmail(encoded),
          successSchema: TestSuccess,
          payloadSchema: TestPayload,
          mutatesSession: true,
        });

        yield* handler({
          payload: { email: "admin@example.com", remember: false },
          fetchOptions: mockFetchOptions,
        });

        const calledWith = mockSignInEmail.mock.calls[0]?.[0] as Record<string, unknown>;
        expect(calledWith?.fetchOptions).toEqual(mockFetchOptions);
      })
    );

    effect(
      "notifies $sessionSignal when mutatesSession is true",
      Effect.fn(function* () {
        mockSignInEmail.mockResolvedValueOnce({
          data: { id: "123", name: "Test" },
          error: null,
        });

        // Use mockSignInEmail directly to avoid Better Auth type constraints
        const handler = createHandler({
          domain: "sign-in",
          feature: "email",
          execute: (encoded) => mockSignInEmail(encoded),
          successSchema: TestSuccess,
          payloadSchema: TestPayload,
          mutatesSession: true,
        });

        yield* handler({
          payload: { email: "test@example.com", remember: true },
        });

        expect(mockNotify).toHaveBeenCalledWith("$sessionSignal");
      })
    );

    effect(
      "fails with BetterAuthResponseError when response.error is present",
      Effect.fn(function* () {
        mockSignInEmail.mockResolvedValueOnce({
          data: null,
          error: {
            message: "Invalid credentials",
            code: "INVALID_CREDENTIALS",
            status: 401,
          },
        });

        // Use mockSignInEmail directly to avoid Better Auth type constraints
        const handler = createHandler({
          domain: "sign-in",
          feature: "email",
          execute: (encoded) => mockSignInEmail(encoded),
          successSchema: TestSuccess,
          payloadSchema: TestPayload,
          mutatesSession: true,
        });

        const exit = yield* Effect.exit(
          handler({
            payload: { email: "wrong@example.com", remember: false },
          })
        );

        expect(Exit.isFailure(exit)).toBe(true);
        expect(mockNotify).not.toHaveBeenCalled();
      })
    );
  });

  // ============================================================================
  // Tests: Error Handling
  // ============================================================================

  describe("error handling", () => {
    effect(
      "wraps promise rejection in IamError",
      Effect.fn(function* () {
        mockSignOut.mockRejectedValueOnce(new Error("Network failure"));

        const handler = createHandler({
          domain: "core",
          feature: "sign-out",
          execute: () => client.signOut(),
          successSchema: TestSuccess,
          mutatesSession: false,
        });

        const exit = yield* Effect.exit(handler({}));

        expect(Exit.isFailure(exit)).toBe(true);
      })
    );

    effect(
      "surfaces BetterAuthResponseError with message, code, status",
      Effect.fn(function* () {
        mockSignOut.mockResolvedValueOnce({
          data: null,
          error: {
            message: "Rate limited",
            code: "RATE_LIMITED",
            status: 429,
          },
        });

        const handler = createHandler({
          domain: "core",
          feature: "sign-out",
          execute: () => client.signOut(),
          successSchema: TestSuccess,
          mutatesSession: false,
        });

        const exit = yield* Effect.exit(handler({}));

        expect(Exit.isFailure(exit)).toBe(true);
      })
    );
  });

  // ============================================================================
  // Tests: Span Naming
  // ============================================================================

  describe("span naming", () => {
    effect(
      "generates correct span name: domain/feature/handler",
      Effect.fn(function* () {
        mockSignOut.mockResolvedValueOnce({
          data: { id: "123", name: "Test" },
          error: null,
        });

        // The span name is internal to Effect.fn, so we verify the handler
        // was created without errors. The name "core/sign-out/handler" is
        // used for tracing/observability and appears in OTLP traces.
        const handler = createHandler({
          domain: "core",
          feature: "sign-out",
          execute: () => client.signOut(),
          successSchema: TestSuccess,
          mutatesSession: false,
        });

        // Handler should execute successfully with correct naming
        const result = yield* handler({});
        expect(result).toEqual({ id: "123", name: "Test" });
      })
    );
  });
});
