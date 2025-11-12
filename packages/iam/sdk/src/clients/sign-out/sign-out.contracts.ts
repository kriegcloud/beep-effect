import { Contract, ContractKit } from "@beep/contract";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { IamError } from "../../errors";
// =====================================================================================================================
// Sign Out Contract
// =====================================================================================================================
export class SignOutPayload extends S.Class<SignOutPayload>("SignOutPayload")(
  {
    onSuccess: new BS.Fn({
      input: S.Undefined,
      output: S.Void,
    }).Schema,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SignOutPayload"),
    identifier: "SignOutPayload",
    description: "Payload for signing out the current user.",
  }
) {}

export declare namespace SignOutPayload {
  export type Type = S.Schema.Type<typeof SignOutPayload>;
  export type Encoded = S.Schema.Encoded<typeof SignOutPayload>;
}

export const SignOutContract = Contract.make("SignOut", {
  description: "Signs the current user out of their active session.",
  payload: SignOutPayload.fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Sign Out Contract")
  .annotate(Contract.Domain, "Sign Out")
  .annotate(Contract.Method, "signOut");
// =====================================================================================================================
// Sign Out Contract Set
// =====================================================================================================================
export const SignOutContractKit = ContractKit.make(SignOutContract);
