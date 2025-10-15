import "../setup/client-env.stub";

import { describe } from "bun:test";
import { IamError } from "@beep/iam-sdk/errors";
import { assertInstanceOf, deepStrictEqual, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import { normalizeAuthError } from "../../src/auth-wrapper/errors";

describe("normalizeAuthError", () => {
  effect("maps structured Better Auth error payloads", () =>
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

      const iamError = normalizeAuthError(payload, {
        plugin: "phone",
        method: "otp",
      });

      assertInstanceOf(iamError, IamError);
      strictEqual(iamError.message, "Too many attempts");
      strictEqual(iamError.code, "RATE_LIMITED");
      strictEqual(iamError.status, 429);
      strictEqual(iamError.statusText, "Too Many Requests");
      strictEqual(iamError.plugin, "phone");
      strictEqual(iamError.method, "otp");
      deepStrictEqual(iamError.authCause, { retryAfter: 30 });
    })
  );

  effect("falls back to metadata when payload is missing", () =>
    Effect.gen(function* () {
      const iamError = normalizeAuthError(null, {
        defaultMessage: "Handler failed",
        code: "UNKNOWN",
        status: 500,
        statusText: "Internal Server Error",
        plugin: "sign-in",
        method: "email",
      });

      strictEqual(iamError.message, "Handler failed");
      strictEqual(iamError.code, "UNKNOWN");
      strictEqual(iamError.status, 500);
      strictEqual(iamError.statusText, "Internal Server Error");
      strictEqual(iamError.plugin, "sign-in");
      strictEqual(iamError.method, "email");
    })
  );

  effect("supports error channel via Effect.flip", () =>
    Effect.gen(function* () {
      const effect = Effect.fail(
        normalizeAuthError(
          {
            error: {
              message: "failure",
            },
          },
          {}
        )
      );

      const error = yield* Effect.flip(effect);
      assertInstanceOf(error, IamError);
      strictEqual(error.message, "failure");
    })
  );
});
