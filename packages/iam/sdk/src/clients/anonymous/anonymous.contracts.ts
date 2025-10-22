import { Contract, ContractKit } from "@beep/iam-sdk/contract-kit";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

export class AnonymousSignInSuccess extends BS.Class<AnonymousSignInSuccess>("AnonymousSignInSuccess")(
  {
    token: S.String,
    user: User.Model,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/anonymous/AnonymousSignInSuccess"),
    identifier: "AnonymousSignInSuccess",
    title: "Anonymous Sign-In Success",
    description: "Payload returned when the anonymous sign-in succeeds.",
  }
) {}

export declare namespace AnonymousSignInSuccess {
  export type Type = S.Schema.Type<typeof AnonymousSignInSuccess>;
  export type Encoded = S.Schema.Encoded<typeof AnonymousSignInSuccess>;
}

export const AnonymousSignInContract = Contract.make("AnonymousSignIn", {
  description: "Signs the current visitor in as an anonymous user.",
  parameters: {},
  failure: S.instanceOf(IamError),
  success: S.NullOr(AnonymousSignInSuccess),
});

export const AnonymousContractKit = ContractKit.make(AnonymousSignInContract);
