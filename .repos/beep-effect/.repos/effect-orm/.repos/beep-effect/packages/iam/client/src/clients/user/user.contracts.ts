import { Contract, ContractKit } from "@beep/contract";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

export const UpdateUserInformationContract = Contract.make("UpdateUserInformation", {
  description: "Updates user information.",
  payload: {
    ...User.Model.update.pick("username", "displayUsername", "image").fields,
    firstName: S.String,
    lastName: S.String,
  },
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Update User Information Contract")
  .annotate(Contract.Domain, "User")
  .annotate(Contract.Method, "updateUser");

export const UpdateUserIdentityContract = Contract.make("UpdateUserIdentity", {
  description: "Updates user information.",
  payload: {
    firstName: S.String,
    lastName: S.String,
  },
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Update User Identity Contract")
  .annotate(Contract.Domain, "User")
  .annotate(Contract.Method, "updateUser");

export const UpdateUsernameContract = Contract.make("UpdateUsername", {
  description: "Updates user information.",
  payload: User.Model.update.pick("username", "displayUsername").fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Update Username Contract")
  .annotate(Contract.Domain, "User")
  .annotate(Contract.Method, "updateUser");

export const UpdatePhoneNumberContract = Contract.make("UpdatePhoneNumber", {
  description: "Updates user phone number.",
  payload: User.Model.update.pick("phoneNumber").fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Update Phone Number Contract")
  .annotate(Contract.Domain, "User")
  .annotate(Contract.Method, "updateUser");

export class ChangeEmailPayload extends S.Class<ChangeEmailPayload>("@beep/iam-client/clients/user/ChangeEmailPayload")(
  {
    newEmail: User.Model.update.fields.email,
    callbackURL: S.optional(BS.URLString),
  }
) {}

export const ChangeEmailContract = Contract.make("ChangeEmail", {
  description: "Change the users email.",
  payload: ChangeEmailPayload.fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Change Email Contract")
  .annotate(Contract.Domain, "User")
  .annotate(Contract.Method, "changeEmail");

export class ChangePasswordPayload extends S.Class<ChangePasswordPayload>(
  "@beep/iam-client/clients/user/ChangePasswordPayload"
)({
  password: BS.Password,
  passwordConfirm: BS.Password,
  currentPassword: BS.Password,
  revokeOtherSessions: BS.BoolWithDefault(false),
}) {}

export const ChangePasswordContract = Contract.make("ChangePassword", {
  description: "Change the users password.",
  payload: ChangePasswordPayload.fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Change Password Contract")
  .annotate(Contract.Domain, "User")
  .annotate(Contract.Method, "changePassword");

export const UserContractKit = ContractKit.make(
  UpdatePhoneNumberContract,
  UpdateUsernameContract,
  UpdateUserInformationContract,
  ChangeEmailContract,
  ChangePasswordContract,
  UpdateUserIdentityContract
);
