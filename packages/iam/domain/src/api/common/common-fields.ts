import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as F from "effect/Function";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/common/common-fields");

export const UserEmail = BS.Email.annotations($I.annotations("UserEmail", { description: "The email of the user." }));

export declare namespace UserEmail {
  export type Type = typeof UserEmail.Type;
  export type Encoded = typeof UserEmail.Encoded;
}

export const UserPassword = BS.Password.annotations(
  $I.annotations("UserPassword", { description: "The password of the user." })
);

export declare namespace UserPassword {
  export type Type = typeof UserPassword.Type;
  export type Encoded = typeof UserPassword.Encoded;
}

export const CallbackURL = S.optionalWith(BS.URLPath, { as: "Option", exact: true, }).annotations(
  $I.annotations("CallbackURL", { description: "The URL to use for email verification callback." })
);

export declare namespace CallbackURL {
  export type Type = S.Schema.Type<typeof CallbackURL>;
  export type Encoded = S.Schema.Encoded<typeof CallbackURL>;
}

export const RememberMe = S.optionalWith(S.Boolean, { default: F.constFalse }).annotations(
  $I.annotations("RememberMe", {
    description: "If this is false, the session will not be remembered. Default is true.",
  })
);

export declare namespace RememberMe {
  export type Type = S.Schema.Type<typeof RememberMe>;
  export type Encoded = S.Schema.Encoded<typeof RememberMe>;
}

export const Redirect = S.Boolean.annotations(
  $I.annotations("Redirect", { description: "Whether to redirect the user." })
);

export declare namespace Redirect {
  export type Type = S.Schema.Type<typeof Redirect>;
  export type Encoded = S.Schema.Encoded<typeof Redirect>;
}

export const SessionToken = S.optionalWith(S.String, { as: "Option", nullable: true }).annotations(
  $I.annotations("SessionToken", { description: "Session token." })
);

export declare namespace SessionToken {
  export type Type = S.Schema.Type<typeof SessionToken>;
  export type Encoded = S.Schema.Encoded<typeof SessionToken>;
}

export const RedirectURL = S.optionalWith(BS.URLString, { as: "Option", nullable: true }).annotations({
  description: "URL to redirect to.",
});

export declare namespace RedirectURL {
  export type Type = S.Schema.Type<typeof RedirectURL>;
  export type Encoded = S.Schema.Encoded<typeof RedirectURL>;
}

export const Name = BS.NameAttribute.annotations({ description: "The name of the user." });

export declare namespace Name {
  export type Type = typeof Name.Type;
  export type Encoded = typeof Name.Encoded;
}

export const UserImage = S.optionalWith(BS.URLString, { as: "Option", nullable: true }).annotations({
  description: "The profile image URL of the user.",
});

export declare namespace UserImage {
  export type Type = S.Schema.Type<typeof UserImage>;
  export type Encoded = S.Schema.Encoded<typeof UserImage>;
}
