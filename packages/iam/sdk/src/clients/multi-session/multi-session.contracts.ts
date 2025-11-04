import { Contract, ContractKit } from "@beep/contract";
import { Session } from "@beep/iam-domain/entities";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import * as S from "effect/Schema";
import { IamError } from "../../errors";
export class MultiSessionSessionView extends BS.Class<MultiSessionSessionView>("MultiSessionSessionView")(
  Session.Model.select.pick(
    "id",
    "token",
    "userId",
    "createdAt",
    "createdBy",
    "updatedAt",
    "expiresAt",
    "ipAddress",
    "userAgent",
    "activeOrganizationId",
    "activeTeamId",
    "impersonatedBy"
  ),
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/multi-session/MultiSessionSessionView"),
    identifier: "MultiSessionSessionView",
    title: "Multi-Session Session View",
    description: "Represents a device session returned by the Better Auth multi-session plugin.",
  }
) {}

export declare namespace MultiSessionSessionView {
  export type Type = S.Schema.Type<typeof MultiSessionSessionView>;
  export type Encoded = S.Schema.Encoded<typeof MultiSessionSessionView>;
}

export class MultiSessionUserView extends BS.Class<MultiSessionUserView>("MultiSessionUserView")(
  User.Model.select.pick("id", "email", "emailVerified", "name", "image", "createdAt", "updatedAt"),
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/multi-session/MultiSessionUserView"),
    identifier: "MultiSessionUserView",
    title: "Multi-Session User View",
    description: "Represents the user associated with a device session from the multi-session plugin.",
  }
) {}

export declare namespace MultiSessionUserView {
  export type Type = S.Schema.Type<typeof MultiSessionUserView>;
  export type Encoded = S.Schema.Encoded<typeof MultiSessionUserView>;
}

export class MultiSessionDeviceRecord extends BS.Class<MultiSessionDeviceRecord>("MultiSessionDeviceRecord")(
  {
    session: MultiSessionSessionView,
    user: MultiSessionUserView,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/multi-session/MultiSessionDeviceRecord"),
    identifier: "MultiSessionDeviceRecord",
    title: "Multi-Session Device Record",
    description: "Combined session and user metadata returned by the multi-session plugin.",
  }
) {}

export declare namespace MultiSessionDeviceRecord {
  export type Type = S.Schema.Type<typeof MultiSessionDeviceRecord>;
  export type Encoded = S.Schema.Encoded<typeof MultiSessionDeviceRecord>;
}

export class MultiSessionTokenPayload extends BS.Class<MultiSessionTokenPayload>("MultiSessionTokenPayload")(
  {
    sessionToken: S.Redacted(S.String),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/multi-session/MultiSessionTokenPayload"),
    identifier: "MultiSessionTokenPayload",
    title: "Multi-Session Token Payload",
    description: "Payload containing a session token used for activation or revocation.",
  }
) {}

export declare namespace MultiSessionTokenPayload {
  export type Type = S.Schema.Type<typeof MultiSessionTokenPayload>;
  export type Encoded = S.Schema.Encoded<typeof MultiSessionTokenPayload>;
}

export class MultiSessionRevokeSuccess extends BS.Class<MultiSessionRevokeSuccess>("MultiSessionRevokeSuccess")(
  {
    status: S.Boolean,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/multi-session/MultiSessionRevokeSuccess"),
    identifier: "MultiSessionRevokeSuccess",
    title: "Multi-Session Revoke Success",
    description: "Indicates whether revoking a device session succeeded.",
  }
) {}

export declare namespace MultiSessionRevokeSuccess {
  export type Type = S.Schema.Type<typeof MultiSessionRevokeSuccess>;
  export type Encoded = S.Schema.Encoded<typeof MultiSessionRevokeSuccess>;
}

export const MultiSessionListContract = Contract.make("MultiSessionList", {
  description: "Lists device sessions available to the signed-in user.",
  payload: {},
  failure: S.instanceOf(IamError),
  success: S.mutable(S.Array(MultiSessionDeviceRecord)),
});

export const MultiSessionSetActiveContract = Contract.make("MultiSessionSetActive", {
  description: "Switches the active session token to another device session.",
  payload: MultiSessionTokenPayload.fields,
  failure: S.instanceOf(IamError),
  success: MultiSessionDeviceRecord,
});

export const MultiSessionRevokeContract = Contract.make("MultiSessionRevoke", {
  description: "Revokes a specific device session for the current user.",
  payload: MultiSessionTokenPayload.fields,
  failure: S.instanceOf(IamError),
  success: MultiSessionRevokeSuccess,
});

export const MultiSessionContractKit = ContractKit.make(
  MultiSessionListContract,
  MultiSessionSetActiveContract,
  MultiSessionRevokeContract
);
