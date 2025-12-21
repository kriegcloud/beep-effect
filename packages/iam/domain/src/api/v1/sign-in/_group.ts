import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Anonymous from "./anonymous.ts";
import * as Email from "./email.ts";
import * as OAuth2 from "./oauth2.ts";
import * as PhoneNumber from "./phone-number.ts";
import * as Social from "./social.ts";
import * as SSO from "./sso.ts";
import * as Username from "./username.ts";

export class Group extends HttpApiGroup.make("signIn")
  .add(Anonymous.Contract)
  .add(Email.Contract)
  .add(OAuth2.Contract)
  .add(PhoneNumber.Contract)
  .add(Social.Contract)
  .add(SSO.Contract)
  .add(Username.Contract)
  .prefix("/sign-in") {}

export { Anonymous, Email, OAuth2, PhoneNumber, Social, SSO, Username };
