import { AuthProviderNameValue } from "@beep/constants";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
//----------------------------------------------------------------------------------------------------------------------
// SIGN IN EMAIL CONTRACT
//----------------------------------------------------------------------------------------------------------------------

export class SignInEmailContract extends BS.Class<SignInEmailContract>("SignInEmailContract")(
  {
    email: BS.Email,
    password: BS.Password,
    rememberMe: BS.BoolWithDefault(false),
    captchaResponse: S.Redacted(S.String),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SignInEmailContract"),
    identifier: "SignInEmailContract",
    description: "Contract for signing in with email and password",
  }
) {}

export namespace SignInEmailContract {
  export type Type = typeof SignInEmailContract.Type;
  export type Encoded = typeof SignInEmailContract.Encoded;
}

//----------------------------------------------------------------------------------------------------------------------
// SIGN IN SOCIAL CONTRACT
//----------------------------------------------------------------------------------------------------------------------
export class SignInSocialContract extends BS.Class<SignInSocialContract>("SignInSocialContract")(
  {
    provider: AuthProviderNameValue,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SignInSocialContract"),
    identifier: "SignInSocialContract",
    description: "Contract for signing in with a supported social provider",
  }
) {}

export namespace SignInSocialContract {
  export type Type = typeof SignInSocialContract.Type;
  export type Encoded = typeof SignInSocialContract.Encoded;
}

//----------------------------------------------------------------------------------------------------------------------
// SIGN IN USERNAME CONTRACT
//----------------------------------------------------------------------------------------------------------------------
export class SignInUsernameContract extends BS.Class<SignInUsernameContract>("SignInUsernameContract")(
  {
    username: S.NonEmptyTrimmedString,
    password: BS.Password,
    rememberMe: BS.BoolWithDefault(false),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SignInUsernameContract"),
    identifier: "SignInUsernameContract",
    description: "Contract for signing in with username and password",
  }
) {}

export namespace SignInUsernameContract {
  export type Type = typeof SignInUsernameContract.Type;
  export type Encoded = typeof SignInUsernameContract.Encoded;
}

//----------------------------------------------------------------------------------------------------------------------
// SIGN IN PHONE NUMBER CONTRACT
//----------------------------------------------------------------------------------------------------------------------
export class SignInPhoneNumberContract extends BS.Class<SignInPhoneNumberContract>("SignInPhoneNumberContract")(
  {
    phoneNumber: BS.Phone,
    password: BS.Password,
    rememberMe: BS.BoolWithDefault(false),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SignInPhoneNumberContract"),
    identifier: "SignInPhoneNumberContract",
    description: "Contract for signing in with a phone number and password",
  }
) {}

export namespace SignInPhoneNumberContract {
  export type Type = typeof SignInPhoneNumberContract.Type;
  export type Encoded = typeof SignInPhoneNumberContract.Encoded;
}

//----------------------------------------------------------------------------------------------------------------------
// SIGN IN PASSKEY CONTRACT
//----------------------------------------------------------------------------------------------------------------------
export class SignInPasskeyContract extends BS.Class<SignInPasskeyContract>("SignInPasskeyContract")(
  {
    onSuccess: BS.NoInputVoidFn.Schema,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SignInPasskeyContract"),
    identifier: "SignInPasskeyContract",
    description: "Contract for signing in with a passkey",
    title: "Sign in with passkey",
  }
) {}

export namespace SignInPasskeyContract {
  export type Type = typeof SignInPasskeyContract.Type;
  export type Encoded = typeof SignInPasskeyContract.Encoded;
}
