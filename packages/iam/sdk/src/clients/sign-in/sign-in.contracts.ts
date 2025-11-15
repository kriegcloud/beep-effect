import { AuthProviderNameValue } from "@beep/constants";
import { Contract, ContractKit } from "@beep/contract";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

// =====================================================================================================================
// SIGN IN EMAIL CONTRACT
// =====================================================================================================================
export class SignInEmailPayload extends S.Class<SignInEmailPayload>("SignInEmailPayload")(
  {
    email: User.Model.insert.fields.email,
    password: BS.Password,
    rememberMe: BS.BoolWithDefault(false),
    captchaResponse: S.Redacted(S.String),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SignInEmailPayload"),
    identifier: "SignInEmailPayload",
    description: "Payload for signing in with email and password",
  }
) {}

export declare namespace SignInEmailPayload {
  export type Type = S.Schema.Type<typeof SignInEmailPayload>;
  export type Encoded = S.Schema.Encoded<typeof SignInEmailPayload>;
}

export const SignInEmailContract = Contract.make("SignInEmail", {
  description: "Signs the user in using email",
  payload: SignInEmailPayload.fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Sign In Email Contract")
  .annotate(Contract.Domain, "SignIn")
  .annotate(Contract.Method, "signInEmail");

// =====================================================================================================================
// SIGN IN SOCIAL CONTRACT
// =====================================================================================================================
export class SignInSocialPayload extends S.Class<SignInSocialPayload>("SignInSocialPayload")(
  {
    provider: AuthProviderNameValue,
    callbackURL: S.optional(BS.URLString),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SignInSocialPayload"),
    identifier: "SignInSocialPayload",
    description: "Payload for signing in with a supported social provider",
  }
) {}

export declare namespace SignInSocialPayload {
  export type Type = S.Schema.Type<typeof SignInSocialPayload>;
  export type Encoded = S.Schema.Encoded<typeof SignInSocialPayload>;
}

export const SignInSocialContract = Contract.make("SignInSocial", {
  description: "Contract for signing in a user with a social auth provider.",
  payload: SignInSocialPayload.fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Sign In Social Contract")
  .annotate(Contract.Domain, "SignIn")
  .annotate(Contract.Method, "signInSocial")
  .annotate(Contract.SupportsAbort, true);

// =====================================================================================================================
// SIGN IN USERNAME CONTRACT
// =====================================================================================================================
export class SignInUsernamePayload extends S.Class<SignInUsernamePayload>("SignInUsernamePayload")(
  {
    username: S.NonEmptyTrimmedString,
    password: BS.Password,
    rememberMe: BS.BoolWithDefault(false),
    captchaResponse: S.Redacted(S.String),
    callbackURL: S.optional(BS.URLString),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SignInUsernamePayload"),
    identifier: "SignInUsernamePayload",
    description: "Payload for signing in with username and password",
  }
) {}

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
export class SignInPhoneNumberPayload extends S.Class<SignInPhoneNumberPayload>("SignInPhoneNumberPayload")(
  {
    phoneNumber: BS.Phone,
    password: BS.Password,
    rememberMe: BS.BoolWithDefault(false),
    captchaResponse: S.Redacted(S.String),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SignInPhoneNumberPayload"),
    identifier: "SignInPhoneNumberPayload",
    description: "Payload for signing in with a phone number and password",
  }
) {}

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

// =====================================================================================================================
// SIGN IN PASSKEY CONTRACT
// =====================================================================================================================
export class SignInPasskeyPayload extends S.Class<SignInPasskeyPayload>("SignInPasskeyPayload")(
  {},
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SignInPasskeyPayload"),
    identifier: "SignInPasskeyPayload",
    description: "Payload for signing in with a passkey",
    title: "Sign in with passkey",
  }
) {}

export declare namespace SignInPasskeyPayload {
  export type Type = S.Schema.Type<typeof SignInPasskeyPayload>;
  export type Encoded = S.Schema.Encoded<typeof SignInPasskeyPayload>;
}

export const SignInPasskeyContract = Contract.make("SignInPasskey", {
  description: "Signs the user in using a passkey.",
  payload: SignInPasskeyPayload.fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Sign In Passkey Contract")
  .annotate(Contract.Domain, "SignIn")
  .annotate(Contract.Method, "signInPasskey");

// =====================================================================================================================
// Signin OneTap
// =====================================================================================================================
export const SignInOneTapPayload = S.Struct({});
export declare namespace SignInOneTapPayload {
  export type Type = S.Schema.Type<typeof SignInOneTapPayload>;
  export type Encoded = S.Schema.Encoded<typeof SignInOneTapPayload>;
}
export const SignInOneTapContract = Contract.make("SignInOneTap", {
  description: "Signs the user in using a one tap.",
  payload: SignInOneTapPayload.fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Sign In One Tap Contract")
  .annotate(Contract.Domain, "SignIn")
  .annotate(Contract.Method, "signInOneTap");

// =====================================================================================================================
// Signin OAuth 2
// =====================================================================================================================
export class SignInOAuth2Payload extends S.Class<SignInOAuth2Payload>(
  "@beep/iam-sdk/clients/sign-in/SignInOAuth2Payload"
)({
  providerId: AuthProviderNameValue,
  callbackURL: S.optional(BS.URLString),
  errorCallbackURL: S.optional(BS.URLString),
  newUserCallbackURL: S.optional(BS.URLString),
  disableRedirect: S.optional(S.Boolean),
  requestSignUp: S.optional(S.Boolean),
}) {}

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
