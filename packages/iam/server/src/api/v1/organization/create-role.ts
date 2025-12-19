/**
 * @module organization/create-role
 *
 * Handler implementation for the create-role endpoint.
 *
 * Dynamic Access Control endpoints aren't reflected in Better Auth's base TypeScript types.
 * We use the DynamicAccessControl wrapper functions from BetterAuthBridge.
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

type HandlerEffect = Common.HandlerEffect<V1.Organization.CreateRole.Payload>;

/**
 * Handler for the create-role endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("CreateRole")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const body = yield* S.encode(V1.Organization.CreateRole.Payload)(payload);

  // Transform permission JSON string to permissions array
  // The domain stores permissions as a JSON-encoded string, but Better Auth expects string[]
  const permissionsArray: readonly string[] = body.permission
    ? (() => {
        try {
          const parsed = JSON.parse(body.permission);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })()
    : [];

  const response = yield* Auth.createOrgRole(auth.api, {
    body: {
      role: body.role,
      permissions: permissionsArray,
      ...(body.organizationId != null && { organizationId: body.organizationId }),
    },
    headers: request.headers,
  });

  const decoded = yield* S.decodeUnknown(V1.Organization.CreateRole.Success)(response);
  return yield* HttpServerResponse.json(decoded);
}, IamAuthError.flowMap("create-role"));
