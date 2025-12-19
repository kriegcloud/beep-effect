/**
 * @module has-permission
 *
 * Handler implementation for the has-permission endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.Admin.HasPermission.Payload>;

/**
 * Handler for the has-permission endpoint.
 *
 * Calls Better Auth `auth.api.hasPermission` to check user permissions.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("HasPermission")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  // Better Auth expects either permission or permissions, not both
  const singlePermission = F.pipe(payload.permission, O.getOrUndefined);
  const multiplePermissions = payload.permissions;

  const body = singlePermission != null ? { permission: singlePermission } : { permissions: multiplePermissions };

  const response = yield* Effect.tryPromise(() =>
    auth.api.hasPermission({
      body,
      headers: request.headers,
    })
  );

  const decoded = yield* S.decodeUnknown(V1.Admin.HasPermission.Success)(response);
  return yield* HttpServerResponse.json(decoded);
}, IamAuthError.flowMap("has-permission"));
