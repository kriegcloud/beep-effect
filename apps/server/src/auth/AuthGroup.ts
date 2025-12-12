import * as HttpApi from "@effect/platform/HttpApi";
import { SignInGroup } from "./api/sign-in.ts";
import { SignUpGroup } from "./api/sign-up.ts";

export class AuthGroup extends HttpApi.make("iam").add(SignInGroup).add(SignUpGroup).prefix("/iam") {}
