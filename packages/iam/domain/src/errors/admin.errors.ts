import { makeErrorProps } from "@beep/iam-domain/errors/_internal";
import * as S from "effect/Schema";
import * as CoreErrors from "./core.errors";

export const ADMIN_ERROR_CODES = {
  FAILED_TO_CREATE_USER: "Failed to create user",
  USER_ALREADY_EXISTS: "User already exists",
  YOU_CANNOT_BAN_YOURSELF: "You cannot ban yourself",
  YOU_ARE_NOT_ALLOWED_TO_CHANGE_USERS_ROLE: "You are not allowed to change users role",
  YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS: "You are not allowed to create users",
  YOU_ARE_NOT_ALLOWED_TO_LIST_USERS: "You are not allowed to list users",
  YOU_ARE_NOT_ALLOWED_TO_LIST_USERS_SESSIONS: "You are not allowed to list users sessions",
  YOU_ARE_NOT_ALLOWED_TO_BAN_USERS: "You are not allowed to ban users",
  YOU_ARE_NOT_ALLOWED_TO_IMPERSONATE_USERS: "You are not allowed to impersonate users",
  YOU_ARE_NOT_ALLOWED_TO_REVOKE_USERS_SESSIONS: "You are not allowed to revoke users sessions",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_USERS: "You are not allowed to delete users",
  YOU_ARE_NOT_ALLOWED_TO_SET_USERS_PASSWORD: "You are not allowed to set users password",
  BANNED_USER: "You have been banned from this application",
};

export class YouCannotBanYourSelf extends S.TaggedError<YouCannotBanYourSelf>(
  "@beep/iam-domain/errors/admin/YouCannotBanYourSelf"
)(...makeErrorProps("YOU_CANNOT_BAN_YOURSELF")(ADMIN_ERROR_CODES.YOU_CANNOT_BAN_YOURSELF)) {}

export class YouAreNotAllowedToChangeUsersRole extends S.TaggedError<YouAreNotAllowedToChangeUsersRole>(
  "@beep/iam-domain/errors/admin/YouAreNotAllowedToChangeUsersRole"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_CHANGE_USERS_ROLE")(
    ADMIN_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_CHANGE_USERS_ROLE
  )
) {}

export class YouAreNotAllowedToCreateUsers extends S.TaggedError<YouAreNotAllowedToCreateUsers>(
  "@beep/iam-domain/errors/admin/YouAreNotAllowedToCreateUsers"
)(...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS")(ADMIN_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS)) {}

export class YouAreNotAllowedToListUsers extends S.TaggedError<YouAreNotAllowedToListUsers>(
  "@beep/iam-domain/errors/admin/YouAreNotAllowedToListUsers"
)(...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_LIST_USERS")(ADMIN_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_LIST_USERS)) {}

export class YouAreNotAllowedToListUsersSessions extends S.TaggedError<YouAreNotAllowedToListUsersSessions>(
  "@beep/iam-domain/errors/admin/YouAreNotAllowedToListUsersSessions"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_LIST_USERS_SESSIONS")(
    ADMIN_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_LIST_USERS_SESSIONS
  )
) {}

export class YouAreNotAllowedToBanUsers extends S.TaggedError<YouAreNotAllowedToBanUsers>(
  "@beep/iam-domain/errors/admin/YouAreNotAllowedToBanUsers"
)(...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_BAN_USERS")(ADMIN_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_BAN_USERS)) {}

export class YouAreNotAllowedToImpersonateUsers extends S.TaggedError<YouAreNotAllowedToImpersonateUsers>(
  "@beep/iam-domain/errors/admin/YouAreNotAllowedToImpersonateUsers"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_IMPERSONATE_USERS")(
    ADMIN_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_IMPERSONATE_USERS
  )
) {}

export class YouAreNotAllowedToRevokeUsersSessions extends S.TaggedError<YouAreNotAllowedToRevokeUsersSessions>(
  "@beep/iam-domain/errors/admin/YouAreNotAllowedToRevokeUsersSessions"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_REVOKE_USERS_SESSIONS")(
    ADMIN_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_REVOKE_USERS_SESSIONS
  )
) {}

export class YouAreNotAllowedToDeleteUsers extends S.TaggedError<YouAreNotAllowedToDeleteUsers>(
  "@beep/iam-domain/errors/admin/YouAreNotAllowedToDeleteUsers"
)(...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_DELETE_USERS")(ADMIN_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_DELETE_USERS)) {}

export class YouAreNotAllowedToSetUsersPassword extends S.TaggedError<YouAreNotAllowedToSetUsersPassword>(
  "@beep/iam-domain/errors/admin/YouAreNotAllowedToSetUsersPassword"
)(
  ...makeErrorProps("YOU_ARE_NOT_ALLOWED_TO_SET_USERS_PASSWORD")(
    ADMIN_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_SET_USERS_PASSWORD
  )
) {}

export class BannedUser extends S.TaggedError<BannedUser>("@beep/iam-domain/errors/admin/BannedUser")(
  ...makeErrorProps("BANNED_USER")(ADMIN_ERROR_CODES.BANNED_USER)
) {}

export class AdminErrors extends S.Union(
  CoreErrors.FailedToCreateUser,
  CoreErrors.UserAlreadyExists,
  YouCannotBanYourSelf,
  YouAreNotAllowedToChangeUsersRole,
  YouAreNotAllowedToCreateUsers,
  YouAreNotAllowedToListUsers,
  YouAreNotAllowedToListUsersSessions,
  YouAreNotAllowedToBanUsers,
  YouAreNotAllowedToImpersonateUsers,
  YouAreNotAllowedToRevokeUsersSessions,
  YouAreNotAllowedToDeleteUsers,
  YouAreNotAllowedToSetUsersPassword,
  BannedUser
) {}

export declare namespace AdminErrors {
  export type Type = typeof AdminErrors.Type;
  export type Encoded = typeof AdminErrors.Encoded;
}
