import * as HttpApi from "@effect/platform/HttpApi";
import { Admin } from "./admin";
import { ApiKey } from "./api-key";
import { Core } from "./core";
import { OAuth2 } from "./oauth2";
import { Organization } from "./organization";
import { Passkey } from "./passkey";
import { SignIn } from "./sign-in";
import { SignUp } from "./sign-up";
import { SSO } from "./sso";
import { TwoFactor } from "./two-factor";

// NOTE: Device, Misc, MultiSession, PhoneNumber groups are handled internally
// by Better Auth plugins. They do not expose callable API methods via auth.api.
// These endpoints are still available via Better Auth's internal router.

export class Api extends HttpApi.make("domain")
  .add(SignIn.Group)
  .add(SignUp.Group)
  .add(Core.Group)
  .add(Admin.Group)
  .add(ApiKey.Group)
  .add(OAuth2.Group)
  .add(Organization.Group)
  .add(Passkey.Group)
  .add(SSO.Group)
  .add(TwoFactor.Group)
  .prefix("/iam") {}

export { Admin, ApiKey, Core, OAuth2, Organization, Passkey, SignIn, SignUp, SSO, TwoFactor };
