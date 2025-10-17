import { Contract, ContractSet } from "@beep/iam-sdk/contractkit";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

export class OAuthRegisterPayload extends BS.Class<OAuthRegisterPayload>("OAuthRegisterPayload")(
  {
    client_name: S.NonEmptyTrimmedString,
    redirect_uris: S.mutable(S.Array(BS.Url)),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/OAuthRegisterPayload"),
    identifier: "OAuthRegisterPayload",
    description: "Payload for registering a new OAuth2 client.",
  }
) {}

export declare namespace OAuthRegisterPayload {
  export type Type = S.Schema.Type<typeof OAuthRegisterPayload>;
  export type Encoded = S.Schema.Encoded<typeof OAuthRegisterPayload>;
}

export const OAuthRegisterContract = Contract.make("OAuthRegisterContract", {
  description: "Registers a new OAuth2 application.",
  parameters: OAuthRegisterPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

export const OAuthContractSet = ContractSet.make(OAuthRegisterContract);
