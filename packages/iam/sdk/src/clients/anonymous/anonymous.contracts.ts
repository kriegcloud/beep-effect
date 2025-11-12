import { Contract, ContractKit } from "@beep/contract";
import { IamError } from "@beep/iam-sdk/errors";
import { User } from "@beep/shared-domain/entities";
import * as S from "effect/Schema";

export class AnonymousSignInSuccess extends S.Class<AnonymousSignInSuccess>("AnonymousSignInSuccess")(
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
  payload: {},
  failure: IamError,
  success: S.NullOr(AnonymousSignInSuccess),
})
  .annotate(Contract.Title, "Anonymous Sign-In")
  .annotate(Contract.Domain, "anonymous")
  .annotate(Contract.Method, "signIn");

export const AnonymousContractKit = ContractKit.make(AnonymousSignInContract);
