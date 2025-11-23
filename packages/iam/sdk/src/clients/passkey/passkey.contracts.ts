import { Contract, ContractKit } from "@beep/contract";
import { Passkey } from "@beep/iam-domain/entities";
import { $PasskeyId } from "@beep/iam-sdk/clients/_internal";
import { IamError } from "@beep/iam-sdk/errors";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

export class PasskeyDTO extends S.Class<PasskeyDTO>("PasskeyDTO")(
  BS.mergeFields(Passkey.Model.select.pick("id").fields, {
    name: BS.NameAttribute,
  }),
  $PasskeyId.annotations("PasskeyDTO", {
    description: "Represents a passkey credential managed by Better Auth.",
  })
) {}

export class PasskeyAddPayload extends S.Class<PasskeyAddPayload>("PasskeyAddPayload")(
  {
    ...Passkey.Model.insert.pick("name").fields,
    id: IamEntityIds.PasskeyId,
    authenticatorAttachment: S.optional(S.Literal("platform", "cross-platform")),
    useAutoRegister: S.optional(S.Boolean),
  },
  $PasskeyId.annotations("PasskeyAddPayload", {
    description: "Options for registering a new passkey credential.",
  })
) {
  static readonly toFormSchema = PasskeyAddPayload.pipe(S.pick("name")).annotations(
    $PasskeyId.annotations("PasskeyAddFormPayload", {
      description: "Options for registering a new passkey credential.",
      [BS.DefaultFormValuesAnnotationId]: {
        name: "",
      },
    })
  );
}

export declare namespace PasskeyAddPayload {
  export type Type = S.Schema.Type<typeof PasskeyAddPayload>;
  export type Encoded = S.Schema.Encoded<typeof PasskeyAddPayload>;
}

export const PasskeyAddContract = Contract.make("add", {
  description: "Registers a new passkey credential for the authenticated user.",
  failure: IamError,
  payload: PasskeyAddPayload,
  success: S.Void,
})
  .annotate(Contract.Title, "Passkey Add Contract")
  .annotate(Contract.Domain, "Passkey")
  .annotate(Contract.Method, "add")
  .annotate(Contract.SupportsAbort, true);

export const PasskeyListContract = Contract.make("listUserPasskeys", {
  description: "Lists passkeys that belong to the authenticated user.",
  failure: IamError,
  success: S.mutable(S.Array(PasskeyDTO)),
})
  .annotate(Contract.Title, "Passkey List Contract")
  .annotate(Contract.Domain, "Passkey")
  .annotate(Contract.Method, "listUserPasskeys")
  .annotate(Contract.SupportsAbort, true);

export class PasskeyRemovePayload extends S.Class<PasskeyRemovePayload>("PasskeyRemovePayload")(
  {
    passkey: PasskeyDTO,
  },
  $PasskeyId.annotations("PasskeyRemovePayload", {
    description: "Payload describing the passkey credential to delete.",
  })
) {}

export declare namespace PasskeyRemovePayload {
  export type Type = S.Schema.Type<typeof PasskeyRemovePayload>;
  export type Encoded = S.Schema.Encoded<typeof PasskeyRemovePayload>;
}

export const PasskeyRemoveContract = Contract.make("remove", {
  description: "Deletes a passkey credential by identifier.",
  failure: IamError,
  payload: PasskeyRemovePayload,
  success: S.Null,
})
  .annotate(Contract.Title, "Passkey Remove Contract")
  .annotate(Contract.Domain, "Passkey")
  .annotate(Contract.Method, "remove")
  .annotate(Contract.SupportsAbort, true);

export class PasskeyUpdatePayload extends S.Class<PasskeyUpdatePayload>("PasskeyUpdatePayload")(
  {
    passkey: PasskeyDTO,
  },
  $PasskeyId.annotations("PasskeyUpdatePayload", {
    description: "Payload for updating a passkey credential.",
  })
) {
  static readonly toFormSchema = (defaultValues: Pick<PasskeyUpdatePayload.Type["passkey"], "name">) =>
    PasskeyUpdatePayload.fields.passkey.pipe(S.pick("name")).annotations({
      [BS.DefaultFormValuesAnnotationId]: defaultValues,
    });
}

export declare namespace PasskeyUpdatePayload {
  export type Type = S.Schema.Type<typeof PasskeyUpdatePayload>;
  export type Encoded = S.Schema.Encoded<typeof PasskeyUpdatePayload>;
}

export class PasskeyUpdateSuccess extends S.Class<PasskeyUpdateSuccess>("PasskeyUpdateSuccess")(
  S.Struct({
    passkey: PasskeyDTO,
  }),
  $PasskeyId.annotations("PasskeyUpdateSuccess", {
    description: "Response returned when a passkey credential is updated.",
  })
) {}

export declare namespace PasskeyUpdateSuccess {
  export type Type = S.Schema.Type<typeof PasskeyUpdateSuccess>;
  export type Encoded = S.Schema.Encoded<typeof PasskeyUpdateSuccess>;
}

export const PasskeyUpdateContract = Contract.make("update", {
  description: "Updates the metadata of a passkey credential.",
  payload: PasskeyUpdatePayload,
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
