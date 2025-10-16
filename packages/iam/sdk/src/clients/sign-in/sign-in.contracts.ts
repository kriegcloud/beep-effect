import { AuthProviderNameValue } from "@beep/constants";
import { Contract, ContractSet } from "@beep/iam-sdk/contractkit";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

// =====================================================================================================================
// SIGN IN EMAIL CONTRACT
// =====================================================================================================================
export class SignInEmailPayload extends BS.Class<SignInEmailPayload>("SignInEmailPayload")(
  {
    email: BS.Email,
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

export namespace SignInEmailPayload {
  export type Type = S.Schema.Type<typeof SignInEmailPayload>;
  export type Encoded = S.Schema.Encoded<typeof SignInEmailPayload>;
}

export const SignInEmailContract = Contract.make("SignInEmailContract", {
  description: "Signs the user in using email",
  parameters: SignInEmailPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

// =====================================================================================================================
// SIGN IN SOCIAL CONTRACT
// =====================================================================================================================
export class SignInSocialPayload extends BS.Class<SignInSocialPayload>("SignInSocialPayload")(
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

export namespace SignInSocialPayload {
  export type Type = S.Schema.Type<typeof SignInSocialPayload>;
  export type Encoded = S.Schema.Encoded<typeof SignInSocialPayload>;
}

export const SignInSocialContract = Contract.make("SignInSocialContract", {
  description: "Contract for signing in a user with a social auth provider.",
  parameters: SignInSocialPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

// =====================================================================================================================
// SIGN IN USERNAME CONTRACT
// =====================================================================================================================
export class SignInUsernamePayload extends BS.Class<SignInUsernamePayload>("SignInUsernamePayload")(
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

export namespace SignInUsernamePayload {
  export type Type = S.Schema.Type<typeof SignInUsernamePayload>;
  export type Encoded = S.Schema.Encoded<typeof SignInUsernamePayload>;
}

export const SignInUsernameContract = Contract.make("SignInUsernameContract", {
  description: "Signs the user in using their username.",
  parameters: SignInUsernamePayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

// =====================================================================================================================
// SIGN IN PHONE NUMBER CONTRACT
// =====================================================================================================================
export class SignInPhoneNumberPayload extends BS.Class<SignInPhoneNumberPayload>("SignInPhoneNumberPayload")(
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

export namespace SignInPhoneNumberPayload {
  export type Type = S.Schema.Type<typeof SignInPhoneNumberPayload>;
  export type Encoded = S.Schema.Encoded<typeof SignInPhoneNumberPayload>;
}

export const SignInPhoneNumberContract = Contract.make("SignInPhoneNumberContract", {
  description: "Signs the user in using their phone number.",
  parameters: SignInPhoneNumberPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

// =====================================================================================================================
// SIGN IN PASSKEY CONTRACT
// =====================================================================================================================
export class SignInPasskeyPayload extends BS.Class<SignInPasskeyPayload>("SignInPasskeyPayload")(
  {},
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SignInPasskeyPayload"),
    identifier: "SignInPasskeyPayload",
    description: "Payload for signing in with a passkey",
    title: "Sign in with passkey",
  }
) {}

export namespace SignInPasskeyPayload {
  export type Type = S.Schema.Type<typeof SignInPasskeyPayload>;
  export type Encoded = S.Schema.Encoded<typeof SignInPasskeyPayload>;
}

export const SignInPasskeyContract = Contract.make("SignInPasskeyContract", {
  description: "Signs the user in using a passkey.",
  parameters: SignInPasskeyPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

// =====================================================================================================================
// Signin OneTap
// =====================================================================================================================
export const SignInOneTapPayload = S.Struct({});
export declare namespace SignInOneTapPayload {
  export type Type = S.Schema.Type<typeof SignInOneTapPayload>;
  export type Encoded = S.Schema.Encoded<typeof SignInOneTapPayload>;
}
export const SignInOneTapContract = Contract.make("SignInOneTapContract", {
  description: "Signs the user in using a one tap.",
  parameters: SignInOneTapPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

export const SignInContractSet = ContractSet.make(
  SignInEmailContract,
  SignInSocialContract,
  SignInUsernameContract,
  SignInPhoneNumberContract,
  SignInPasskeyContract,
  SignInOneTapContract
);
