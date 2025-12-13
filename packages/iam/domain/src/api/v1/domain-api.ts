import {SignIn} from "./sign-in";
import {SignUp} from "./sign-up";
import * as HttpApi from "@effect/platform/HttpApi";

export class IamDomainApi extends HttpApi.make("domain")
  .add(SignIn.Group)
  .add(SignUp.Group)
  .prefix("/v1/iam") {
}

export {
  SignIn,
  SignUp,
}