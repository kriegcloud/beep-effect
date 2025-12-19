"use client";
import { Contract, ContractKit } from "@beep/contract";
import { IamError } from "@beep/iam-client/errors";
import { Session } from "@beep/iam-domain/entities";
import { User } from "@beep/shared-domain/entities";
import * as S from "effect/Schema";

// =====================================================================================================================
// GetSession
// =====================================================================================================================

export class GetSessionSuccess extends S.Class<GetSessionSuccess>("GetSessionSuccess")(
  {
    session: Session.Model,
    user: User.Model,
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/session/GetSessionSuccess"),
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
  failure: IamError,
  success: GetSessionSuccess,
})
  .annotate(Contract.Title, "Get Session Contract")
  .annotate(Contract.Domain, "Session")
  .annotate(Contract.Method, "getSession");

// =====================================================================================================================
// ListSessions
// =====================================================================================================================
export class ListSessionsSuccess extends S.NonEmptyArray(Session.Model).annotations({
  schemaId: Symbol.for("@beep/iam-client/clients/session/ListSessionsSuccess"),
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
  failure: IamError,
  success: ListSessionsSuccess,
})
  .annotate(Contract.Title, "List Sessions Contract")
  .annotate(Contract.Domain, "Session")
  .annotate(Contract.Method, "listSessions");

// =====================================================================================================================
// RevokeSession
// =====================================================================================================================
export class RevokeSessionPayload extends S.Class<RevokeSessionPayload>("RevokeSessionPayload")(
  Session.Model.select.pick("token")
) {}

export declare namespace RevokeSessionPayload {
  export type Type = S.Schema.Type<typeof RevokeSessionPayload>;
  export type Encoded = S.Schema.Encoded<typeof RevokeSessionPayload>;
}

export const RevokeSessionContract = Contract.make("RevokeSession", {
  description: "Revokes a session for the current user.",
  payload: RevokeSessionPayload.fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Revoke Session Contract")
  .annotate(Contract.Domain, "Session")
  .annotate(Contract.Method, "revokeSession");

// =====================================================================================================================
// RevokeOtherSessions
// =====================================================================================================================
export const RevokeOtherSessionsContract = Contract.make("RevokeOtherSessions", {
  description: "All user sessions except for the users current session.",
  payload: {},
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Revoke Other Sessions Contract")
  .annotate(Contract.Domain, "Session")
  .annotate(Contract.Method, "revokeOtherSessions");

// =====================================================================================================================
// RevokeSessions
// =====================================================================================================================
export const RevokeSessionsContract = Contract.make("RevokeSessions", {
  description: "Revokes all user sessions",
  payload: {},
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Revoke Sessions Contract")
  .annotate(Contract.Domain, "Session")
  .annotate(Contract.Method, "revokeSessions");
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
