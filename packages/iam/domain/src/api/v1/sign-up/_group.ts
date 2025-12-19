import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Email from "./email.ts";

export class Group extends HttpApiGroup.make("iam.signUp").add(Email.Contract).prefix("/sign-up") {}

export { Email };
