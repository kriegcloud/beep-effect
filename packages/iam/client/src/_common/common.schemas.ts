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

export const CallbackURL = BS.OptionFromOptionalProperty(BS.URLPath).annotations(
  $I.annotations("CallbackURL", {
    description: "Callback URL to use as a redirect for email verification.",
  })
);

export declare namespace CallbackURL {
  export type Type = S.Schema.Type<typeof CallbackURL>;
  export type Encoded = S.Schema.Encoded<typeof CallbackURL>;
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

export const Redirect = BS.OptionFromOptionalProperty(S.Boolean).annotations(
  $I.annotations("Redirect", {
    description: "Whether to redirect the user.",
  })
);

export declare namespace Redirect {
  export type Type = S.Schema.Type<typeof Redirect>;
  export type Encoded = S.Schema.Encoded<typeof Redirect>;
}

export const RedirectURL = BS.OptionFromOptionalProperty(BS.URLString).annotations(
  $I.annotations("RedirectURL", {
    description: "The URL to redirect to.",
  })
);

export declare namespace RedirectURL {
  export type Type = S.Schema.Type<typeof RedirectURL>;
  export type Encoded = S.Schema.Encoded<typeof RedirectURL>;
}

export const CaptchaResponse = S.Redacted(S.String).annotations(
  $I.annotations("CaptchaResponse", {
    description: "The captcha response.",
  })
);

export declare namespace CaptchaResponse {
  export type Type = S.Schema.Type<typeof CaptchaResponse>;
  export type Encoded = S.Schema.Encoded<typeof CaptchaResponse>;
}
