import { describe, expect } from "bun:test";
import { effect } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { BetterAuthErrorSchema, extractBetterAuthErrorMessage } from "../schema.helpers.ts";

// ============================================================================
// Tests: BetterAuthErrorSchema
// ============================================================================

describe("BetterAuthErrorSchema", () => {
  effect(
    "decodes valid error object with all fields",
    Effect.fn(function* () {
      const input = {
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
        status: 401,
      };

      const result = yield* S.decodeUnknown(BetterAuthErrorSchema)(input);

      expect(result.message).toBe("Invalid credentials");
      expect(result.code).toBe("INVALID_CREDENTIALS");
      expect(result.status).toBe(401);
    })
  );

  effect(
    "handles missing optional fields",
    Effect.fn(function* () {
      const input = { message: "Error" };

      const result = yield* S.decodeUnknown(BetterAuthErrorSchema)(input);

      expect(result.message).toBe("Error");
      expect(result.code).toBe(undefined);
      expect(result.status).toBe(undefined);
    })
  );

  effect(
    "handles completely empty object",
    Effect.fn(function* () {
      const input = {};

      const result = yield* S.decodeUnknown(BetterAuthErrorSchema)(input);

      expect(result.message).toBe(undefined);
      expect(result.code).toBe(undefined);
      expect(result.status).toBe(undefined);
    })
  );

  effect(
    "handles only code field",
    Effect.fn(function* () {
      const input = { code: "RATE_LIMITED" };

      const result = yield* S.decodeUnknown(BetterAuthErrorSchema)(input);

      expect(result.message).toBe(undefined);
      expect(result.code).toBe("RATE_LIMITED");
      expect(result.status).toBe(undefined);
    })
  );

  effect(
    "handles only status field",
    Effect.fn(function* () {
      const input = { status: 500 };

      const result = yield* S.decodeUnknown(BetterAuthErrorSchema)(input);

      expect(result.message).toBe(undefined);
      expect(result.code).toBe(undefined);
      expect(result.status).toBe(500);
    })
  );
});

// ============================================================================
// Tests: extractBetterAuthErrorMessage
// ============================================================================

describe("extractBetterAuthErrorMessage", () => {
  effect(
    "extracts message from error object",
    Effect.fn(function* () {
      const error = {
        message: "Session expired",
        code: "SESSION_EXPIRED",
        status: 401,
      };

      const result = extractBetterAuthErrorMessage(error);

      expect(result).toBe("Session expired");
    })
  );

  effect(
    "returns 'API error' when message is missing",
    Effect.fn(function* () {
      const error = { code: "SOME_ERROR", status: 500 };

      const result = extractBetterAuthErrorMessage(error);

      expect(result).toBe("API error");
    })
  );

  effect(
    "returns 'Unknown API error' for null",
    Effect.fn(function* () {
      const result = extractBetterAuthErrorMessage(null);

      expect(result).toBe("Unknown API error");
    })
  );

  effect(
    "returns 'Unknown API error' for undefined",
    Effect.fn(function* () {
      const result = extractBetterAuthErrorMessage(undefined);

      expect(result).toBe("Unknown API error");
    })
  );

  effect(
    "returns 'Unknown API error' for non-object values",
    Effect.fn(function* () {
      expect(extractBetterAuthErrorMessage("string error")).toBe("Unknown API error");
      expect(extractBetterAuthErrorMessage(123)).toBe("Unknown API error");
      expect(extractBetterAuthErrorMessage(true)).toBe("Unknown API error");
    })
  );

  effect(
    "handles error with only message field",
    Effect.fn(function* () {
      const error = { message: "Something went wrong" };

      const result = extractBetterAuthErrorMessage(error);

      expect(result).toBe("Something went wrong");
    })
  );

  effect(
    "handles error with empty message string",
    Effect.fn(function* () {
      const error = { message: "" };

      const result = extractBetterAuthErrorMessage(error);

      // Empty string is still a valid message
      expect(result).toBe("");
    })
  );
});
