/**
 * @module organization/list-roles
 *
 * Handler implementation for the list-roles endpoint.
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
import * as BetterAuthBridge from "../../../adapters/better-auth/BetterAuthBridge";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<undefined>;

/**
 * Handler for the list-roles endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("ListRoles")(
  function* () {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    // Use BetterAuthBridge wrapper for dynamicAccessControl endpoints
    const response = yield* BetterAuthBridge.listOrgRoles(auth.api as Record<string, unknown>, {
      headers: request.headers,
    });

    const decoded = yield* S.decodeUnknown(V1.Organization.ListRoles.Success)(response);
    return yield* HttpServerResponse.json(decoded);
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to list roles.",
        cause: e,
      })
  )
);
