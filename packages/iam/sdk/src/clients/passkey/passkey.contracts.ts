import { Contract, ContractKit } from "@beep/contract";
import { Passkey } from "@beep/iam-domain/entities";
import { IamError } from "@beep/iam-sdk/errors";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

export class PasskeyView extends BS.Class<PasskeyView>("PasskeyView")(
  BS.mergeFields(Passkey.Model.select.pick("id").fields, {
    name: BS.NameAttribute,
  }),
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/passkey/PasskeyView"),
    identifier: "PasskeyView",
    title: "Passkey View",
    description: "Represents a passkey credential managed by Better Auth.",
  }
) {}

export declare namespace PasskeyView {
  export type Type = S.Schema.Type<typeof PasskeyView>;
  export type Encoded = S.Schema.Encoded<typeof PasskeyView>;
}

export class PasskeyAddPayload extends BS.Class<PasskeyAddPayload>("PasskeyAddPayload")(
  S.Struct({
    ...Passkey.Model.insert.pick("name", "id").fields,
    authenticatorAttachment: S.optional(S.Literal("platform", "cross-platform")),
    useAutoRegister: S.optional(S.Boolean),
  }),
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/passkey/PasskeyAddPayload"),
    identifier: "PasskeyAddPayload",
    title: "Passkey Add Payload",
    description: "Options for registering a new passkey credential.",
  }
) {}

export declare namespace PasskeyAddPayload {
  export type Type = S.Schema.Type<typeof PasskeyAddPayload>;
  export type Encoded = S.Schema.Encoded<typeof PasskeyAddPayload>;
}

export const PasskeyAddContract = Contract.make("PasskeyAdd", {
  description: "Registers a new passkey credential for the authenticated user.",
  payload: PasskeyAddPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

export const PasskeyListContract = Contract.make("PasskeyList", {
  description: "Lists passkeys that belong to the authenticated user.",
  payload: {},
  failure: S.instanceOf(IamError),
  success: S.mutable(S.Array(PasskeyView)),
});

export class PasskeyDeletePayload extends BS.Class<PasskeyDeletePayload>("PasskeyDeletePayload")(
  {
    id: IamEntityIds.PasskeyId,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/passkey/PasskeyDeletePayload"),
    identifier: "PasskeyDeletePayload",
    title: "Passkey Delete Payload",
    description: "Payload describing the passkey credential to delete.",
  }
) {}

export declare namespace PasskeyDeletePayload {
  export type Type = S.Schema.Type<typeof PasskeyDeletePayload>;
  export type Encoded = S.Schema.Encoded<typeof PasskeyDeletePayload>;
}

export const PasskeyDeleteContract = Contract.make("PasskeyDelete", {
  description: "Deletes a passkey credential by identifier.",
  payload: PasskeyDeletePayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Null,
});

export class PasskeyUpdatePayload extends BS.Class<PasskeyUpdatePayload>("PasskeyUpdatePayload")(
  {
    id: IamEntityIds.PasskeyId,
    name: S.NonEmptyTrimmedString,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/passkey/PasskeyUpdatePayload"),
    identifier: "PasskeyUpdatePayload",
    title: "Passkey Update Payload",
    description: "Payload for updating a passkey credential.",
  }
) {}

export declare namespace PasskeyUpdatePayload {
  export type Type = S.Schema.Type<typeof PasskeyUpdatePayload>;
  export type Encoded = S.Schema.Encoded<typeof PasskeyUpdatePayload>;
}

export class PasskeyUpdateSuccess extends BS.Class<PasskeyUpdateSuccess>("PasskeyUpdateSuccess")(
  S.Struct({
    passkey: PasskeyView,
  }),
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/passkey/PasskeyUpdateSuccess"),
    identifier: "PasskeyUpdateSuccess",
    title: "Passkey Update Success",
    description: "Response returned when a passkey credential is updated.",
  }
) {}

export declare namespace PasskeyUpdateSuccess {
  export type Type = S.Schema.Type<typeof PasskeyUpdateSuccess>;
  export type Encoded = S.Schema.Encoded<typeof PasskeyUpdateSuccess>;
}

export const PasskeyUpdateContract = Contract.make("PasskeyUpdate", {
  description: "Updates the metadata of a passkey credential.",
  payload: PasskeyUpdatePayload.fields,
  failure: S.instanceOf(IamError),
  success: PasskeyUpdateSuccess,
});

export const PasskeyContractKit = ContractKit.make(
  PasskeyAddContract,
  PasskeyListContract,
  PasskeyDeleteContract,
  PasskeyUpdateContract
);
