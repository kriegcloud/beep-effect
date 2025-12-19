import * as HttpApi from "@effect/platform/HttpApi";
import { Admin } from "./admin";
import { Core } from "./core";
import { Organization } from "./organization";
import { Passkey } from "./passkey";
import { SignIn } from "./sign-in";
import { SignUp } from "./sign-up";
import { TwoFactor } from "./two-factor";

export class Api extends HttpApi.make("domain")
  .add(SignIn.Group)
  .add(SignUp.Group)
  .add(Core.Group)
  .add(Admin.Group)
  .add(Organization.Group)
  .add(Passkey.Group)
  .add(TwoFactor.Group)
  .prefix("/iam") {}

export { Admin, Core, Organization, Passkey, SignIn, SignUp, TwoFactor };
