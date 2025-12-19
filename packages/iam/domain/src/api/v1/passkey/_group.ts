import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as DeletePasskey from "./delete-passkey.ts";
import * as GenerateAuthenticateOptions from "./generate-authenticate-options.ts";
import * as GenerateRegisterOptions from "./generate-register-options.ts";
import * as ListUserPasskeys from "./list-user-passkeys.ts";
import * as UpdatePasskey from "./update-passkey.ts";
import * as VerifyAuthentication from "./verify-authentication.ts";
import * as VerifyRegistration from "./verify-registration.ts";

export class Group extends HttpApiGroup.make("iam.passkey")
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
