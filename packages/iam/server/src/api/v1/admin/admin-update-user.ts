/**
 * @module admin-update-user
 *
 * Handler implementation for the admin-update-user endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.Admin.AdminUpdateUser.Payload>;

/**
 * Handler for the admin-update-user endpoint.
 *
 * Calls Better Auth `auth.api.adminUpdateUser` to update a user as admin.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("AdminUpdateUser")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  // Transform the data object to handle Option fields
  // For fields with { as: "Option", exact: true }, Option<T> means field present/absent
  // For fields with { as: "Option", nullable: true }, Option<T | null> means field present/absent with nullable value
  const data: Record<string, unknown> = {};
  const payloadData = payload.data;

  if (O.isSome(payloadData.name)) {
    data.name = payloadData.name.value;
  }
  if (O.isSome(payloadData.email)) {
    data.email = payloadData.email.value;
  }
  if (O.isSome(payloadData.role)) {
    data.role = payloadData.role.value;
  }
  if (O.isSome(payloadData.banned)) {
    data.banned = payloadData.banned.value;
  }
  // For nullable fields, the value is already `string | null` (not Option<string>)
  if (O.isSome(payloadData.banReason)) {
    data.banReason = payloadData.banReason.value; // value is string | null
  }
  if (O.isSome(payloadData.banExpires)) {
    data.banExpires = payloadData.banExpires.value; // value is number | null
  }
  if (O.isSome(payloadData.image)) {
    data.image = payloadData.image.value; // value is string | null
  }

  const response = yield* Effect.tryPromise(() =>
    auth.api.adminUpdateUser({
      body: {
        userId: payload.userId,
        data,
      },
      headers: request.headers,
    })
  );

  const decoded = yield* S.decodeUnknown(V1.Admin.AdminUpdateUser.Success)({ user: response });
  return yield* HttpServerResponse.json(decoded);
}, IamAuthError.flowMap("admin-update-user"));
