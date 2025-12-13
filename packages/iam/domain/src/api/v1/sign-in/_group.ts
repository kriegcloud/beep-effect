import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import * as Email from "./email.ts";

export const Group = HttpApiGroup.make("signIn")
  .add(Email.Contract)
  .prefix("/sign-in")

export {
  Email
}
