import { BS } from "@beep/schema";
import * as O from "effect/Option";
import type * as S from "effect/Schema";
import { Model } from "./User.model";

export class NewUser extends BS.Class<NewUser>("NewUser")(
  Model.insert.pick("email", "name", "username", "phoneNumber", "displayUsername"),
  {
    schemaId: Symbol.for("@beep/iam-domain/User/NewUser"),
    title: "New User",
    description: "The shape of a new user",
  }
) {
  static readonly create = (input: NewUser.Type) =>
    Model.insert.make({
      email: input.email,
      name: input.name,
      username: input.username,
      phoneNumber: input.phoneNumber,
      displayUsername: input.displayUsername,
      emailVerified: false,
      phoneNumberVerified: false,
      banned: false,
      createdBy: O.some("system"),
      updatedBy: O.some("system"),
      source: O.some("sign-up"),
    });
}

export namespace NewUser {
  export type Type = S.Schema.Type<typeof NewUser>;
  export type Encoded = S.Schema.Encoded<typeof NewUser>;
}
