import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

export class AuthenticatorAttachment extends BS.StringLiteralKit("platform", "cross-platform").annotations(
  $IamDomainId.annotations("AuthenticatorAttachment", {
    description: "Authenticator attachment type",
  })
) {}
