import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { thunkTrue } from "@beep/utils";
import * as S from "effect/Schema";

const $I = $IamClientId.create("_common/common.schemas");

export class UserEmail extends BS.Email.annotations(
  $I.annotations("UserEmail", {
    description: "The users email address.",
  })
) {}

export declare namespace UserEmail {
  export type Type = typeof UserEmail.Type;
  export type Encoded = typeof UserEmail.Encoded;
}

export class UserPassword extends BS.Password.annotations(
  $I.annotations("UserPassword", {
    description: "The users password.",
  })
) {}

export declare namespace UserPassword {
  export type Type = typeof UserPassword.Type;
  export type Encoded = typeof UserPassword.Encoded;
}

export const RememberMe = S.optionalWith(S.Boolean, { default: thunkTrue }).annotations(
  $I.annotations("RememberMe", {
    description: "If this is false, the session will not be remembered. Default is true.",
  })
);

export declare namespace RememberMe {
  export type Type = S.Schema.Type<typeof RememberMe>;
  export type Encoded = S.Schema.Encoded<typeof RememberMe>;
}
