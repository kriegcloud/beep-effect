import { Contract, ContractSet } from "@beep/iam-sdk/contractkit";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

export class SignOutPayload extends BS.Class<SignOutPayload>("SignOutPayload")(
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

export const SignOutContract = Contract.make("SignOutContract", {
  description: "Signs the current user out of their active session.",
  parameters: SignOutPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

export const SignOutContractSet = ContractSet.make(SignOutContract);
