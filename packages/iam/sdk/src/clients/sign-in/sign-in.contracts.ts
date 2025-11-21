import { AuthProviderNameValue } from "@beep/constants";
import { Contract, ContractKit } from "@beep/contract";
import { SignInClientId } from "@beep/iam-sdk/clients/_internal";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

const Id = SignInClientId.compose("sign-in.contracts");
const defaultFormValuesCommon = {
  password: "",
  rememberMe: false,
  captchaResponse: "",
} as const;

// =====================================================================================================================
// SIGN IN EMAIL CONTRACT
// =====================================================================================================================
export const SignInEmailPayload = S.Struct({
  email: BS.EmailBase,
  password: BS.PasswordBase,
  rememberMe: BS.BoolWithDefault(false),
  captchaResponse: S.String,
}).annotations(
  Id.annotations("SignInEmailPayload", {
    description: "Payload for signing in with email and password",
    [BS.DefaultFormValuesAnnotationId]: {
      email: "",
      ...defaultFormValuesCommon,
    },
  })
);

export declare namespace SignInEmailPayload {
  export type Type = S.Schema.Type<typeof SignInEmailPayload>;
  export type Encoded = S.Schema.Encoded<typeof SignInEmailPayload>;
}

export const SignInEmailContract = Contract.make("SignInEmail", {
  description: "Signs the user in using email",
  failure: IamError,
  success: S.Void,
})
  .setPayload(SignInEmailPayload)
  .annotate(Contract.Title, "Sign In Email Contract")
  .annotate(Contract.Domain, "SignIn")
  .annotate(Contract.Method, "signInEmail");

// =====================================================================================================================
// SIGN IN SOCIAL CONTRACT
// =====================================================================================================================
export const SignInSocialPayload = S.Struct({
  provider: AuthProviderNameValue,
}).annotations(
  Id.annotations("SignInSocialPayload", {
    description: "Payload for signing in with a supported social provider",
  })
);

export declare namespace SignInSocialPayload {
  export type Type = S.Schema.Type<typeof SignInSocialPayload>;
  export type Encoded = S.Schema.Encoded<typeof SignInSocialPayload>;
}

export const SignInSocialContract = Contract.make("SignInSocial", {
  description: "Contract for signing in a user with a social auth provider.",
  failure: IamError,
  success: S.Void,
})
  .setPayload(SignInSocialPayload)
  .annotate(Contract.Title, "Sign In Social Contract")
  .annotate(Contract.Domain, "SignIn")
  .annotate(Contract.Method, "signInSocial")
  .annotate(Contract.SupportsAbort, true);

// =====================================================================================================================
// SIGN IN USERNAME CONTRACT
// =====================================================================================================================
export const SignInUsernamePayload = S.Struct({
  username: S.NonEmptyTrimmedString,
  password: BS.PasswordBase,
  rememberMe: BS.BoolWithDefault(false),
  captchaResponse: S.String,
  callbackURL: S.optional(BS.URLString),
}).annotations(
  Id.annotations("SignInUsernamePayload", {
    description: "Payload for signing in with username and password",
    [BS.DefaultFormValuesAnnotationId]: {
      username: "",
      ...defaultFormValuesCommon,
    },
  })
);
export declare namespace SignInUsernamePayload {
  export type Type = S.Schema.Type<typeof SignInUsernamePayload>;
  export type Encoded = S.Schema.Encoded<typeof SignInUsernamePayload>;
}

export const SignInUsernameContract = Contract.make("SignInUsername", {
  description: "Signs the user in using their username.",
  payload: SignInUsernamePayload.fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Sign In Username Contract")
  .annotate(Contract.Domain, "SignIn")
  .annotate(Contract.Method, "signInUsername");

// =====================================================================================================================
// SIGN IN PHONE NUMBER CONTRACT
// =====================================================================================================================
export const SignInPhoneNumberPayload = S.Struct({
  phoneNumber: BS.UnsafePhone,
  password: BS.PasswordBase,
  rememberMe: BS.BoolWithDefault(false),
  captchaResponse: S.String,
}).annotations(
  Id.annotations("SignInPhoneNumberPayload", {
    description: "Payload for signing in with a phone number and password",
    [BS.DefaultFormValuesAnnotationId]: {
      phoneNumber: "",
      ...defaultFormValuesCommon,
    },
  })
);

export declare namespace SignInPhoneNumberPayload {
  export type Type = S.Schema.Type<typeof SignInPhoneNumberPayload>;
  export type Encoded = S.Schema.Encoded<typeof SignInPhoneNumberPayload>;
}

export const SignInPhoneNumberContract = Contract.make("SignInPhoneNumber", {
  description: "Signs the user in using their phone number.",
  payload: SignInPhoneNumberPayload.fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Sign In Phone Number Contract")
  .annotate(Contract.Domain, "SignIn")
  .annotate(Contract.Method, "signInPhoneNumber");

export const SignInPasskeyContract = Contract.make("SignInPasskey", {
  description: "Signs the user in using a passkey.",
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Sign In Passkey Contract")
  .annotate(Contract.Domain, "SignIn")
  .annotate(Contract.Method, "signInPasskey");

// =====================================================================================================================
// Signin OneTap
// =====================================================================================================================

export const SignInOneTapContract = Contract.make("SignInOneTap", {
  description: "Signs the user in using a one tap.",
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Sign In One Tap Contract")
  .annotate(Contract.Domain, "SignIn")
  .annotate(Contract.Method, "signInOneTap");

// =====================================================================================================================
// Signin OAuth 2
// =====================================================================================================================
export const SignInOAuth2Payload = S.Struct({
  providerId: AuthProviderNameValue,
  callbackURL: S.optional(BS.URLString),
  errorCallbackURL: S.optional(BS.URLString),
  newUserCallbackURL: S.optional(BS.URLString),
  disableRedirect: S.optional(S.Boolean),
  requestSignUp: S.optional(S.Boolean),
}).annotations(
  Id.annotations("SignInOAuth2Payload", {
    description: "Payload for signing in with an OAuth 2 provider",
  })
);

export declare namespace SignInOAuth2Payload {
  export type Type = S.Schema.Type<typeof SignInOAuth2Payload>;
  export type Encoded = S.Schema.Encoded<typeof SignInOAuth2Payload>;
}

export const SignInOAuth2Contract = Contract.make("SignInOAuth2", {
  description: "Signs the user in using an OAuth 2 provider.",
  payload: SignInOAuth2Payload.fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Sign In OAuth 2 Contract")
  .annotate(Contract.Domain, "SignIn")
  .annotate(Contract.Method, "signInOAuth2");

export class AnonymousSignInSuccess extends S.Class<AnonymousSignInSuccess>("AnonymousSignInSuccess")(
  {
    token: S.String,
    user: User.Model,
  },
  Id.annotations("AnonymousSignInSuccess", { description: "Payload returned when the anonymous sign-in succeeds." })
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

// =====================================================================================================================
// SignIn Contract Set
// =====================================================================================================================
export const SignInContractKit = ContractKit.make(
  SignInEmailContract,
  SignInSocialContract,
  SignInUsernameContract,
  SignInPhoneNumberContract,
  SignInPasskeyContract,
  SignInOneTapContract,
  SignInOAuth2Contract,
  AnonymousSignInContract
);
