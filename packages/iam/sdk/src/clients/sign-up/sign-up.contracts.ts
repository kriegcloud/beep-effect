import { Contract, ContractKit } from "@beep/contract";
import { SignUpClientId } from "@beep/iam-sdk/clients/_internal";
import { BS } from "@beep/schema";
import { paths } from "@beep/shared-domain";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

// =====================================================================================================================
// Sign Up Email Contract
// =====================================================================================================================
const Id = SignUpClientId.compose("sign-up.contracts");

export const SignUpEmailPayload = S.Struct({
  email: BS.EmailBase,
  rememberMe: BS.BoolWithDefault(false),
  redirectTo: BS.StringWithDefault(paths.dashboard.root),
  password: BS.PasswordBase,
  passwordConfirm: BS.PasswordBase,
  firstName: S.NonEmptyTrimmedString,
  lastName: S.NonEmptyTrimmedString,
  captchaResponse: S.String,
}).annotations(
  Id.annotations("SignUpEmailPayload", {
    description: "Payload for signing up a new user via email.",
    [BS.DefaultFormValuesAnnotationId]: {
      email: "",
      password: "",
      passwordConfirm: "",
      firstName: "",
      captchaResponse: "",
      lastName: "",
      rememberMe: false,
    },
  })
);

export declare namespace SignUpEmailPayload {
  export type Type = S.Schema.Type<typeof SignUpEmailPayload>;
  export type Encoded = S.Schema.Encoded<typeof SignUpEmailPayload>;
}

export const SignUpEmailContract = Contract.make("SignUpEmail", {
  description: "Signs up a new user using email credentials.",
  failure: IamError,
  success: S.Void,
})
  .setPayload(SignUpEmailPayload)
  .annotate(Contract.Title, "Sign Up Email")
  .annotate(Contract.Domain, "sign-up")
  .annotate(Contract.Method, "signUpEmail");

// =====================================================================================================================
// Sign Up Contract Set
// =====================================================================================================================

export const SignUpContractKit = ContractKit.make(SignUpEmailContract);
