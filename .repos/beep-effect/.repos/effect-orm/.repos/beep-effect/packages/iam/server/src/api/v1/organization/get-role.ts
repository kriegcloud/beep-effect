/**
 * @module organization/get-role
 *
 * Handler implementation for the get-role endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, type V1 } from "@beep/iam-domain/api";
import { OrganizationRole } from "@beep/iam-domain/entities";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.UrlParamsHandlerEffect<V1.Organization.GetRole.Query>;

/**
 * Handler for the get-role endpoint.
 *
 * Dynamic Access Control endpoints aren't reflected in Better Auth's base TypeScript types.
 * We use the DynamicAccessControl wrapper functions from BetterAuthBridge.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("GetRole")(
  function* ({ urlParams, request }) {
    const auth = yield* Auth.Service;

    const roleId = F.pipe(urlParams.roleId, O.getOrUndefined);
    if (roleId === undefined) {
      return yield* Effect.fail(
        new IamAuthError({
          message: "Role ID is required.",
        })
      );
    }

    const response = yield* Auth.getOrgRole(auth.api, {
      query: { roleId },
      headers: request.headers,
    });

    const decoded = yield* S.decodeUnknown(OrganizationRole.Model)(response);
    return yield* HttpServerResponse.json(decoded);
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to get role.",
        cause: e,
      })
  )
);
