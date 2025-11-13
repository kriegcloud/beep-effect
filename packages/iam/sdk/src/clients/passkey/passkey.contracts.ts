import { Contract, ContractKit } from "@beep/contract";
import { Passkey } from "@beep/iam-domain/entities";
import { IamError } from "@beep/iam-sdk/errors";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

export class PasskeyView extends S.Class<PasskeyView>("PasskeyView")(
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

export class PasskeyAddPayload extends S.Class<PasskeyAddPayload>("PasskeyAddPayload")(
  S.Struct({
    ...Passkey.Model.insert.pick("name").fields,
    id: IamEntityIds.PasskeyId,
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

export const PasskeyAddContract = Contract.make("add", {
  description: "Registers a new passkey credential for the authenticated user.",
  payload: PasskeyAddPayload.fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Passkey Add Contract")
  .annotate(Contract.Domain, "Passkey")
  .annotate(Contract.Method, "add")
  .annotate(Contract.SupportsAbort, true);

export const PasskeyListContract = Contract.make("list", {
  description: "Lists passkeys that belong to the authenticated user.",
  payload: {},
  failure: IamError,
  success: S.mutable(S.Array(PasskeyView)),
})
  .annotate(Contract.Title, "Passkey List Contract")
  .annotate(Contract.Domain, "Passkey")
  .annotate(Contract.Method, "listUserPasskeys")
  .annotate(Contract.SupportsAbort, true);

export class PasskeyRemovePayload extends S.Class<PasskeyRemovePayload>("PasskeyRemovePayload")(
  {
    passkey: PasskeyView,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/passkey/PasskeyRemovePayload"),
    identifier: "PasskeyRemovePayload",
    title: "Passkey Delete Payload",
    description: "Payload describing the passkey credential to delete.",
  }
) {}

export declare namespace PasskeyRemovePayload {
  export type Type = S.Schema.Type<typeof PasskeyRemovePayload>;
  export type Encoded = S.Schema.Encoded<typeof PasskeyRemovePayload>;
}

export const PasskeyRemoveContract = Contract.make("remove", {
  description: "Deletes a passkey credential by identifier.",
  payload: PasskeyRemovePayload.fields,
  failure: IamError,
  success: S.Null,
})
  .annotate(Contract.Title, "Passkey Remove Contract")
  .annotate(Contract.Domain, "Passkey")
  .annotate(Contract.Method, "remove")
  .annotate(Contract.SupportsAbort, true);

export class PasskeyUpdatePayload extends S.Class<PasskeyUpdatePayload>("PasskeyUpdatePayload")(
  {
    passkey: PasskeyView,
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

export class PasskeyUpdateSuccess extends S.Class<PasskeyUpdateSuccess>("PasskeyUpdateSuccess")(
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

export const PasskeyUpdateContract = Contract.make("update", {
  description: "Updates the metadata of a passkey credential.",
  payload: PasskeyUpdatePayload.fields,
  failure: IamError,
  success: PasskeyUpdateSuccess,
})
  .annotate(Contract.Title, "Passkey Update Contract")
  .annotate(Contract.Domain, "Passkey")
  .annotate(Contract.Method, "update")
  .annotate(Contract.SupportsAbort, true);

export const PasskeyContractKit = ContractKit.make(
  PasskeyAddContract,
  PasskeyListContract,
  PasskeyRemoveContract,
  PasskeyUpdateContract
);
