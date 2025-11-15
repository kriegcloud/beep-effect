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

export class ChangeEmailPayload extends S.Class<ChangeEmailPayload>("@beep/iam-sdk/clients/user/ChangeEmailPayload")({
  newEmail: User.Model.update.fields.email,
  callbackURL: S.optional(BS.URLString),
}) {}

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
  "@beep/iam-sdk/clients/user/ChangePasswordPayload"
)({
  newPassword: BS.Password,
  confirmNewPassword: BS.Password,
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
  UpdateUserInformationContract,
  ChangeEmailContract,
  ChangePasswordContract
);
