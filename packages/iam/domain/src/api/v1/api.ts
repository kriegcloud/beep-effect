import * as HttpApi from "@effect/platform/HttpApi";
import { Admin } from "./admin";
import { Core } from "./core";
import { Organization } from "./organization";
import { SignIn } from "./sign-in";
import { SignUp } from "./sign-up";

export class Api extends HttpApi.make("domain")
  .add(SignIn.Group)
  .add(SignUp.Group)
  .add(Core.Group)
  .add(Admin.Group)
  .add(Organization.Group)
  .prefix("/iam") {}

export { Admin, Core, Organization, SignIn, SignUp };
