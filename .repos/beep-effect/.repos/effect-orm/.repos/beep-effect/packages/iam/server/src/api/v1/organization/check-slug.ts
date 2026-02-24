/**
 * @module organization/check-slug
 *
 * Handler implementation for the check-slug endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAdminEndpoint } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.Organization.CheckSlug.Payload>;

/**
 * Handler for the check-slug endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("CheckSlug")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAdminEndpoint({
    payloadSchema: V1.Organization.CheckSlug.Payload,
    successSchema: V1.Organization.CheckSlug.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.checkOrganizationSlug({
          body,
          headers,
        })
      ),
  });
}, IamAuthError.flowMap("check-slug"));
