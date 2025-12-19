/**
 * @module organization/invite-member
 *
 * Handler implementation for the invite-member endpoint.
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

type HandlerEffect = Common.HandlerEffect<V1.Organization.InviteMember.Payload>;

/**
 * Handler for the invite-member endpoint.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("InviteMember")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const body = yield* S.encode(V1.Organization.InviteMember.Payload)(payload);

  // Validate role is provided - Better Auth requires it
  // Default to "member" if not specified. Use type guard for type-safe validation.
  type ValidRole = "admin" | "member" | "owner";
  const isValidRole = (r: string): r is ValidRole => r === "admin" || r === "member" || r === "owner";

  const roleValue = body.role ?? "member";
  const role: ValidRole = isValidRole(roleValue) ? roleValue : "member";

  // Build request body, excluding null/undefined values to satisfy exactOptionalPropertyTypes
  const requestBody = {
    email: body.email,
    role,
    ...(body.organizationId != null && { organizationId: body.organizationId }),
    ...(body.resend != null && { resend: body.resend }),
    ...(body.teamId != null && { teamId: body.teamId }),
  };

  const response = yield* Effect.tryPromise(() =>
    auth.api.createInvitation({
      body: requestBody,
      headers: request.headers,
    })
  );

  const decoded = yield* S.decodeUnknown(V1.Organization.InviteMember.Success)(response);
  return yield* HttpServerResponse.json(decoded);
}, IamAuthError.flowMap("invite-member"));
