"use client";
import { Contract, ContractKit } from "@beep/contract";
import { Session } from "@beep/iam-domain/entities";
import { IamError } from "@beep/iam-sdk/errors";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import * as S from "effect/Schema";

// =====================================================================================================================
// GetSession
// =====================================================================================================================

export class GetSessionSuccess extends BS.Class<GetSessionSuccess>("GetSessionSuccess")(
  {
    session: Session.Model.select.pick(
      "activeOrganizationId",
      "activeTeamId",
      "createdAt",
      "createdBy",
      "deletedAt",
      "deletedBy",
      "expiresAt",
      "id",
      "impersonatedBy",
      "ipAddress",
      "source",
      "token",
      "updatedAt",
      "updatedBy",
      "userAgent",
      "userId",
      "version",
      "_rowId"
    ),

    user: User.Model.select.pick(
      "banExpires",
      "banReason",
      "banned",
      "createdAt",
      "createdBy",
      "deletedAt",
      "deletedBy",
      "displayUsername",
      "email",
      "emailVerified",
      "gender",
      "id",
      "image",
      "isAnonymous",
      "name",
      "phoneNumber",
      "phoneNumberVerified",
      "role",
      "source",
      "stripeCustomerId",
      "twoFactorEnabled",
      "updatedAt",
      "updatedBy",
      "username",
      "version",
      "_rowId"
    ),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/session/GetSessionSuccess"),
    identifier: "GetSessionSuccess",
    title: "Get Session Success",
    description: "The result of a successful get session call.",
  }
) {}

export declare namespace GetSessionSuccess {
  export type Type = S.Schema.Type<typeof GetSessionSuccess>;
  export type Encoded = S.Schema.Encoded<typeof GetSessionSuccess>;
}

export const GetSessionContract = Contract.make("GetSession", {
  description: "Retrieves the current session.",
  payload: {},
  failure: S.instanceOf(IamError),
  success: GetSessionSuccess,
});

// =====================================================================================================================
// ListSessions
// =====================================================================================================================
export class ListSessionsSuccess extends S.NonEmptyArray(Session.Model).annotations({
  schemaId: Symbol.for("@beep/iam-sdk/clients/session/ListSessionsSuccess"),
  identifier: "ListSessionsSuccess",
  title: "List Sessions Success",
  description: "The result of a successful list sessions call.",
}) {}

export declare namespace ListSessionsSuccess {
  export type Type = S.Schema.Type<typeof ListSessionsSuccess>;
  export type Encoded = S.Schema.Encoded<typeof ListSessionsSuccess>;
}

export const ListSessionsContract = Contract.make("ListSessions", {
  description: "Lists all sessions for the current user.",
  payload: {},
  failure: S.instanceOf(IamError),
  success: ListSessionsSuccess,
});

// =====================================================================================================================
// RevokeSession
// =====================================================================================================================
export class RevokeSessionPayload extends BS.Class<RevokeSessionPayload>("RevokeSessionPayload")(
  Session.Model.select.pick("token")
) {}

export declare namespace RevokeSessionPayload {
  export type Type = S.Schema.Type<typeof RevokeSessionPayload>;
  export type Encoded = S.Schema.Encoded<typeof RevokeSessionPayload>;
}

export const RevokeSessionContract = Contract.make("RevokeSession", {
  description: "Revokes a session for the current user.",
  payload: RevokeSessionPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

// =====================================================================================================================
// RevokeOtherSessions
// =====================================================================================================================
export const RevokeOtherSessionsContract = Contract.make("RevokeOtherSessions", {
  description: "All user sessions except for the users current session.",
  payload: {},
  failure: S.instanceOf(IamError),
  success: S.Void,
});

// =====================================================================================================================
// RevokeSessions
// =====================================================================================================================
export const RevokeSessionsContract = Contract.make("RevokeSessions", {
  description: "Revokes all user sessions",
  payload: {},
  failure: S.instanceOf(IamError),
  success: S.Void,
});
// =====================================================================================================================
// Session Contract Set
// =====================================================================================================================
export const SessionContractKit = ContractKit.make(
  GetSessionContract,
  ListSessionsContract,
  RevokeSessionContract,
  RevokeOtherSessionsContract,
  RevokeSessionsContract
);
