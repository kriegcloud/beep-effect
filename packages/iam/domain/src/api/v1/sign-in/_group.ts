import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Anonymous from "./anonymous";
import * as Email from "./email";
import * as OAuth2 from "./oauth2";
import * as PhoneNumber from "./phone-number";
import * as Social from "./social";
import * as SSO from "./sso";
import * as Username from "./username";

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
