/**
 * @module organization/set-active
 *
 * Handler implementation for the set-active organization endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.Organization.SetActive.Payload>;

/**
 * Handler for the set-active organization endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("SetActiveOrganization")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const body = yield* S.encode(V1.Organization.SetActive.Payload)(payload);

  const response = yield* Effect.tryPromise(() =>
    auth.api.setActiveOrganization({
      body: {
        organizationId: body.organizationId ?? undefined,
        organizationSlug: body.organizationSlug ?? undefined,
      },
      headers: request.headers,
    })
  );

  const decoded = yield* S.decodeUnknown(V1.Organization.SetActive.Success)(response);
  return yield* HttpServerResponse.json(decoded);
}, IamAuthError.flowMap("set-active-organization"));
