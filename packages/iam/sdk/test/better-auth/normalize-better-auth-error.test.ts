import { normalizeBetterAuthError } from "@beep/iam-sdk/better-auth/errors";
import { IamError } from "@beep/iam-sdk/errors";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

describe("normalizeBetterAuthError", () => {
  it("maps structured Better Auth error payloads", () =>
    Effect.gen(function* () {
      const payload = {
        error: {
          message: "Too many attempts",
          code: "RATE_LIMITED",
          status: 429,
          statusText: "Too Many Requests",
          cause: { retryAfter: 30 },
        },
      } as const;

      const iamError = normalizeBetterAuthError(payload, {
        plugin: "phone",
        method: "otp",
      });

      assert.instanceOf(iamError, IamError);
      assert.strictEqual(iamError.message, "Too many attempts");
      assert.strictEqual(iamError.code, "RATE_LIMITED");
      assert.strictEqual(iamError.status, 429);
      assert.strictEqual(iamError.statusText, "Too Many Requests");
      assert.strictEqual(iamError.plugin, "phone");
      assert.strictEqual(iamError.method, "otp");
      assert.deepStrictEqual(iamError.betterAuthCause, { retryAfter: 30 });
    }));

  it("falls back to metadata when payload is missing", () =>
    Effect.gen(function* () {
      const iamError = normalizeBetterAuthError(null, {
        defaultMessage: "Handler failed",
        code: "UNKNOWN",
        status: 500,
        statusText: "Internal Server Error",
        plugin: "sign-in",
        method: "email",
      });

      assert.strictEqual(iamError.message, "Handler failed");
      assert.strictEqual(iamError.code, "UNKNOWN");
      assert.strictEqual(iamError.status, 500);
      assert.strictEqual(iamError.statusText, "Internal Server Error");
      assert.strictEqual(iamError.plugin, "sign-in");
      assert.strictEqual(iamError.method, "email");
    }));

  it("supports error channel via Effect.flip", () =>
    Effect.gen(function* () {
      const effect = Effect.fail(
        normalizeBetterAuthError(
          {
            error: {
              message: "failure",
            },
          },
          {}
        )
      );

      const error = yield* Effect.flip(effect);
      assert.instanceOf(error, IamError);
      assert.strictEqual(error.message, "failure");
    }));
});
