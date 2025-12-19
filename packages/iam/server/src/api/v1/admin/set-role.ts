/**
 * @module set-role
 *
 * Handler implementation for the set-role endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.Admin.SetRole.Payload>;

// Type guard for Better Auth role values
const isValidRole = (role: string): role is "user" | "admin" => role === "user" || role === "admin";

/**
 * Handler for the set-role endpoint.
 *
 * Calls Better Auth `auth.api.setRole` to set a user's role.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("SetRole")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  // Validate role is a valid Better Auth role
  if (!isValidRole(payload.role)) {
    return yield* Effect.fail(
      new IamAuthError({
        message: `Invalid role "${payload.role}". Must be "user" or "admin".`,
      })
    );
  }

  // After validation, store in properly typed variable
  const validatedRole: "user" | "admin" = payload.role;

  const response = yield* Effect.tryPromise(() =>
    auth.api.setRole({
      body: {
        userId: payload.userId,
        role: validatedRole,
      },
      headers: request.headers,
    })
  );

  const decoded = yield* S.decodeUnknown(V1.Admin.SetRole.Success)(response);
  return yield* HttpServerResponse.json(decoded);
}, IamAuthError.flowMap("set-role"));
