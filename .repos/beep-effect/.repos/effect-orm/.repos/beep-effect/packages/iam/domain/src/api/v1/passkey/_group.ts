import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as DeletePasskey from "./delete-passkey";
import * as GenerateAuthenticateOptions from "./generate-authenticate-options";
import * as GenerateRegisterOptions from "./generate-register-options";
import * as ListUserPasskeys from "./list-user-passkeys";
import * as UpdatePasskey from "./update-passkey";
import * as VerifyAuthentication from "./verify-authentication";
import * as VerifyRegistration from "./verify-registration";

export class Group extends HttpApiGroup.make("passkey")
  .add(DeletePasskey.Contract)
  .add(GenerateAuthenticateOptions.Contract)
  .add(GenerateRegisterOptions.Contract)
  .add(ListUserPasskeys.Contract)
  .add(UpdatePasskey.Contract)
  .add(VerifyAuthentication.Contract)
  .add(VerifyRegistration.Contract)
  .prefix("/passkey") {}

export {
  DeletePasskey,
  GenerateAuthenticateOptions,
  GenerateRegisterOptions,
  ListUserPasskeys,
  UpdatePasskey,
  VerifyAuthentication,
  VerifyRegistration,
};
