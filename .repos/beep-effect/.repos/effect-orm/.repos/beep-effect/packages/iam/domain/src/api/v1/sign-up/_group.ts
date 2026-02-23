import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Email from "./email";

export class Group extends HttpApiGroup.make("signUp").add(Email.Contract).prefix("/sign-up") {}

export { Email };
