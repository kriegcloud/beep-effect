import { Contract, ContractKit } from "@beep/contract";
import { IamError } from "@beep/iam-client/errors";
import { Session } from "@beep/iam-domain/entities";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import { User } from "@beep/shared-domain/entities";
import * as S from "effect/Schema";

const AdminRoleInput = S.Union(User.UserRole, S.Array(User.UserRole));

const PermissionMatrix = S.Record({
  key: S.NonEmptyTrimmedString,
  value: S.Array(S.NonEmptyTrimmedString),
});

export class AdminUser extends S.Class<AdminUser>("AdminUser")(
  User.Model.select.pick(
    "id",
    "email",
    "emailVerified",
    "name",
    "image",
    "createdAt",
    "updatedAt",
    "role",
    "banned",
    "banReason",
    "banExpires"
  ),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminUser"),
    identifier: "AdminUser",
    description: "Represents a Better Auth user enriched with administrative metadata.",
  }
) {}

export declare namespace AdminUser {
  export type Type = S.Schema.Type<typeof AdminUser>;
  export type Encoded = S.Schema.Encoded<typeof AdminUser>;
}

export class AdminSession extends S.Class<AdminSession>("AdminSession")(
  Session.Model.select.pick(
    "id",
    "token",
    "userId",
    "createdAt",
    "updatedAt",
    "expiresAt",
    "ipAddress",
    "userAgent",
    "impersonatedBy"
  ),
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminSession"),
    identifier: "AdminSession",
    description: "Represents a Better Auth session including optional impersonation metadata.",
  }
) {}

export declare namespace AdminSession {
  export type Type = S.Schema.Type<typeof AdminSession>;
  export type Encoded = S.Schema.Encoded<typeof AdminSession>;
}

export class AdminSetRolePayload extends S.Class<AdminSetRolePayload>("AdminSetRolePayload")(
  {
    userId: SharedEntityIds.UserId,
    role: AdminRoleInput,
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminSetRolePayload"),
    identifier: "AdminSetRolePayload",
    description: "Payload for setting the role of a target user.",
  }
) {}

export declare namespace AdminSetRolePayload {
  export type Type = S.Schema.Type<typeof AdminSetRolePayload>;
  export type Encoded = S.Schema.Encoded<typeof AdminSetRolePayload>;
}

export class AdminUserSuccess extends S.Class<AdminUserSuccess>("AdminUserSuccess")(
  {
    user: AdminUser,
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminUserSuccess"),
    identifier: "AdminUserSuccess",
    description: "Envelope containing a user entity returned from Better Auth admin APIs.",
  }
) {}

export declare namespace AdminUserSuccess {
  export type Type = S.Schema.Type<typeof AdminUserSuccess>;
  export type Encoded = S.Schema.Encoded<typeof AdminUserSuccess>;
}

export const AdminSetRoleContract = Contract.make("AdminSetRole", {
  description: "Assigns one or more roles to a user via the Better Auth admin plugin.",
  payload: AdminSetRolePayload.fields,
  success: AdminUserSuccess,
  failure: IamError,
}).withAnnotations([Contract.Title, "Set Role"], [Contract.Domain, "Admin"], [Contract.Method, "admin.setRole"]);

export class AdminGetUserPayload extends S.Class<AdminGetUserPayload>("AdminGetUserPayload")(
  {
    userId: SharedEntityIds.UserId,
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminGetUserPayload"),
    identifier: "AdminGetUserPayload",
    description: "Payload for fetching a single user by identifier.",
  }
) {}

export declare namespace AdminGetUserPayload {
  export type Type = S.Schema.Type<typeof AdminGetUserPayload>;
  export type Encoded = S.Schema.Encoded<typeof AdminGetUserPayload>;
}

export const AdminGetUserContract = Contract.make("AdminGetUser", {
  description: "Retrieves a user record using the Better Auth admin endpoint.",
  payload: AdminGetUserPayload.fields,
  success: AdminUserSuccess,
  failure: IamError,
})
  .annotate(Contract.Title, "Get User")
  .annotate(Contract.Domain, "Admin")
  .annotate(Contract.Method, "admin.getUser");

export class AdminCreateUserPayload extends S.Class<AdminCreateUserPayload>("AdminCreateUserPayload")(
  {
    email: BS.Email,
    password: BS.Password,
    name: S.NonEmptyTrimmedString,
    role: S.optional(AdminRoleInput),
    data: S.optional(S.Record({ key: S.String, value: S.Unknown })),
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminCreateUserPayload"),
    identifier: "AdminCreateUserPayload",
    description: "Payload for creating a new credentialed user via the admin plugin.",
  }
) {}

export declare namespace AdminCreateUserPayload {
  export type Type = S.Schema.Type<typeof AdminCreateUserPayload>;
  export type Encoded = S.Schema.Encoded<typeof AdminCreateUserPayload>;
}

export const AdminCreateUserContract = Contract.make("AdminCreateUser", {
  description: "Creates a credentialed user using the Better Auth admin API.",
  payload: AdminCreateUserPayload.fields,
  success: AdminUserSuccess,
  failure: IamError,
})
  .annotate(Contract.Title, "Create User")
  .annotate(Contract.Domain, "Admin")
  .annotate(Contract.Method, "admin.createUser");

export class AdminUpdateUserPayload extends S.Class<AdminUpdateUserPayload>("AdminUpdateUserPayload")(
  {
    userId: SharedEntityIds.UserId,
    data: S.Record({ key: S.String, value: S.Unknown }),
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminUpdateUserPayload"),
    identifier: "AdminUpdateUserPayload",
    description: "Payload describing the partial update applied to a user.",
  }
) {}

export declare namespace AdminUpdateUserPayload {
  export type Type = S.Schema.Type<typeof AdminUpdateUserPayload>;
  export type Encoded = S.Schema.Encoded<typeof AdminUpdateUserPayload>;
}

export const AdminUpdateUserContract = Contract.make("AdminUpdateUser", {
  description: "Updates user attributes through the Better Auth admin API.",
  payload: AdminUpdateUserPayload.fields,
  success: AdminUserSuccess,
  failure: IamError,
})
  .annotate(Contract.Title, "Update User")
  .annotate(Contract.Domain, "Admin")
  .annotate(Contract.Method, "admin.updateUser");

const SearchField = S.Literal("email", "name");
const SearchOperator = S.Literal("contains", "starts_with", "ends_with");
const SortDirection = S.Literal("asc", "desc");
const FilterOperator = S.Literal("eq", "ne", "lt", "lte", "gt", "gte");
const NumberLike = S.Union(S.Number, S.String);
const FilterValue = S.Union(S.String, S.Number, S.Boolean);

export class AdminListUsersPayload extends S.Class<AdminListUsersPayload>("AdminListUsersPayload")(
  {
    searchValue: S.optional(S.NonEmptyTrimmedString),
    searchField: S.optional(SearchField),
    searchOperator: S.optional(SearchOperator),
    limit: S.optional(NumberLike),
    offset: S.optional(NumberLike),
    sortBy: S.optional(S.NonEmptyTrimmedString),
    sortDirection: S.optional(SortDirection),
    filterField: S.optional(S.NonEmptyTrimmedString),
    filterValue: S.optional(FilterValue),
    filterOperator: S.optional(FilterOperator),
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminListUsersPayload"),
    identifier: "AdminListUsersPayload",
    description: "Query parameters accepted by the Better Auth admin list users endpoint.",
  }
) {}

export declare namespace AdminListUsersPayload {
  export type Type = S.Schema.Type<typeof AdminListUsersPayload>;
  export type Encoded = S.Schema.Encoded<typeof AdminListUsersPayload>;
}

export class AdminListUsersSuccess extends S.Class<AdminListUsersSuccess>("AdminListUsersSuccess")(
  {
    users: S.Array(AdminUser),
    total: S.Number,
    limit: S.optional(S.Number),
    offset: S.optional(S.Number),
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminListUsersSuccess"),
    identifier: "AdminListUsersSuccess",
    description: "Paginated collection of users returned by the admin list endpoint.",
  }
) {}

export declare namespace AdminListUsersSuccess {
  export type Type = S.Schema.Type<typeof AdminListUsersSuccess>;
  export type Encoded = S.Schema.Encoded<typeof AdminListUsersSuccess>;
}

export const AdminListUsersContract = Contract.make("AdminListUsers", {
  description: "Lists users with pagination, filtering and search controls.",
  payload: AdminListUsersPayload.fields,
  success: AdminListUsersSuccess,
  failure: IamError,
})
  .annotate(Contract.Title, "List Users")
  .annotate(Contract.Domain, "Admin")
  .annotate(Contract.Method, "admin.listUsers");

export class AdminListUserSessionsPayload extends S.Class<AdminListUserSessionsPayload>("AdminListUserSessionsPayload")(
  {
    userId: SharedEntityIds.UserId,
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminListUserSessionsPayload"),
    identifier: "AdminListUserSessionsPayload",
    description: "Payload for retrieving active sessions for a target user.",
  }
) {}

export declare namespace AdminListUserSessionsPayload {
  export type Type = S.Schema.Type<typeof AdminListUserSessionsPayload>;
  export type Encoded = S.Schema.Encoded<typeof AdminListUserSessionsPayload>;
}

export class AdminListUserSessionsSuccess extends S.Class<AdminListUserSessionsSuccess>("AdminListUserSessionsSuccess")(
  {
    sessions: S.Array(AdminSession),
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminListUserSessionsSuccess"),
    identifier: "AdminListUserSessionsSuccess",
    description: "Active session collection returned by Better Auth for a specific user.",
  }
) {}

export declare namespace AdminListUserSessionsSuccess {
  export type Type = S.Schema.Type<typeof AdminListUserSessionsSuccess>;
  export type Encoded = S.Schema.Encoded<typeof AdminListUserSessionsSuccess>;
}

export const AdminListUserSessionsContract = Contract.make("AdminListUserSessions", {
  description: "Lists active Better Auth sessions for the provided user identifier.",
  payload: AdminListUserSessionsPayload.fields,
  success: AdminListUserSessionsSuccess,
  failure: IamError,
})
  .annotate(Contract.Title, "List User Sessions")
  .annotate(Contract.Domain, "Admin")
  .annotate(Contract.Method, "admin.listUserSessions");

export class AdminUnbanUserPayload extends S.Class<AdminUnbanUserPayload>("AdminUnbanUserPayload")(
  {
    userId: SharedEntityIds.UserId,
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminUnbanUserPayload"),
    identifier: "AdminUnbanUserPayload",
    description: "Payload for clearing ban metadata on a user.",
  }
) {}

export declare namespace AdminUnbanUserPayload {
  export type Type = S.Schema.Type<typeof AdminUnbanUserPayload>;
  export type Encoded = S.Schema.Encoded<typeof AdminUnbanUserPayload>;
}

export const AdminUnbanUserContract = Contract.make("AdminUnbanUser", {
  description: "Removes ban metadata and re-enables a user account.",
  payload: AdminUnbanUserPayload.fields,
  success: AdminUserSuccess,
  failure: IamError,
})
  .annotate(Contract.Title, "Unban User")
  .annotate(Contract.Domain, "Admin")
  .annotate(Contract.Method, "admin.unbanUser");

export class AdminBanUserPayload extends S.Class<AdminBanUserPayload>("AdminBanUserPayload")(
  {
    userId: SharedEntityIds.UserId,
    banReason: S.optional(S.String),
    banExpiresIn: S.optional(S.Number),
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminBanUserPayload"),
    identifier: "AdminBanUserPayload",
    description: "Payload for banning a user with optional reason and expiry.",
  }
) {}

export declare namespace AdminBanUserPayload {
  export type Type = S.Schema.Type<typeof AdminBanUserPayload>;
  export type Encoded = S.Schema.Encoded<typeof AdminBanUserPayload>;
}

export const AdminBanUserContract = Contract.make("AdminBanUser", {
  description: "Bans a user, optionally specifying a reason and expiry window.",
  payload: AdminBanUserPayload.fields,
  success: AdminUserSuccess,
  failure: IamError,
})
  .annotate(Contract.Title, "Ban User")
  .annotate(Contract.Domain, "Admin")
  .annotate(Contract.Method, "admin.banUser");

export class AdminImpersonateUserPayload extends S.Class<AdminImpersonateUserPayload>("AdminImpersonateUserPayload")(
  {
    userId: SharedEntityIds.UserId,
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminImpersonateUserPayload"),
    identifier: "AdminImpersonateUserPayload",
    description: "Payload for starting an impersonation session for a target user.",
  }
) {}

export declare namespace AdminImpersonateUserPayload {
  export type Type = S.Schema.Type<typeof AdminImpersonateUserPayload>;
  export type Encoded = S.Schema.Encoded<typeof AdminImpersonateUserPayload>;
}

export class AdminSessionBundleSuccess extends S.Class<AdminSessionBundleSuccess>("AdminSessionBundleSuccess")(
  {
    session: AdminSession,
    user: AdminUser,
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminSessionBundleSuccess"),
    identifier: "AdminSessionBundleSuccess",
    description: "Represents a session + user tuple returned from impersonation endpoints.",
  }
) {}

export declare namespace AdminSessionBundleSuccess {
  export type Type = S.Schema.Type<typeof AdminSessionBundleSuccess>;
  export type Encoded = S.Schema.Encoded<typeof AdminSessionBundleSuccess>;
}

export const AdminImpersonateUserContract = Contract.make("AdminImpersonateUser", {
  description: "Starts an impersonation session for the provided user identifier.",
  payload: AdminImpersonateUserPayload.fields,
  success: AdminSessionBundleSuccess,
  failure: IamError,
})
  .annotate(Contract.Title, "Impersonate User")
  .annotate(Contract.Domain, "Admin")
  .annotate(Contract.Method, "admin.impersonateUser");

export const AdminStopImpersonatingPayload = S.Struct({});

export declare namespace AdminStopImpersonatingPayload {
  export type Type = S.Schema.Type<typeof AdminStopImpersonatingPayload>;
  export type Encoded = S.Schema.Encoded<typeof AdminStopImpersonatingPayload>;
}

export const AdminStopImpersonatingContract = Contract.make("AdminStopImpersonating", {
  description: "Restores the original admin session after impersonation ends.",
  payload: AdminStopImpersonatingPayload.fields,
  success: AdminSessionBundleSuccess,
  failure: IamError,
})
  .annotate(Contract.Title, "Stop Impersonating")
  .annotate(Contract.Domain, "Admin")
  .annotate(Contract.Method, "admin.stopImpersonating");

export class AdminRevokeUserSessionPayload extends S.Class<AdminRevokeUserSessionPayload>(
  "AdminRevokeUserSessionPayload"
)(
  {
    sessionToken: S.NonEmptyTrimmedString,
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminRevokeUserSessionPayload"),
    identifier: "AdminRevokeUserSessionPayload",
    description: "Payload for revoking a specific session token.",
  }
) {}

export declare namespace AdminRevokeUserSessionPayload {
  export type Type = S.Schema.Type<typeof AdminRevokeUserSessionPayload>;
  export type Encoded = S.Schema.Encoded<typeof AdminRevokeUserSessionPayload>;
}

export class AdminBooleanSuccess extends S.Class<AdminBooleanSuccess>("AdminBooleanSuccess")(
  {
    success: S.Boolean,
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminBooleanSuccess"),
    identifier: "AdminBooleanSuccess",
    description: "Generic success envelope containing a boolean result flag.",
  }
) {}

export declare namespace AdminBooleanSuccess {
  export type Type = S.Schema.Type<typeof AdminBooleanSuccess>;
  export type Encoded = S.Schema.Encoded<typeof AdminBooleanSuccess>;
}

export const AdminRevokeUserSessionContract = Contract.make("AdminRevokeUserSession", {
  description: "Revokes a single session token for a user.",
  payload: AdminRevokeUserSessionPayload.fields,
  success: AdminBooleanSuccess,
  failure: IamError,
})
  .annotate(Contract.Title, "Revoke User Session")
  .annotate(Contract.Domain, "Admin")
  .annotate(Contract.Method, "admin.revokeUserSession");

export class AdminRevokeUserSessionsPayload extends S.Class<AdminRevokeUserSessionsPayload>(
  "AdminRevokeUserSessionsPayload"
)(
  {
    userId: SharedEntityIds.UserId,
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminRevokeUserSessionsPayload"),
    identifier: "AdminRevokeUserSessionsPayload",
    description: "Payload for revoking all sessions for a user.",
  }
) {}

export declare namespace AdminRevokeUserSessionsPayload {
  export type Type = S.Schema.Type<typeof AdminRevokeUserSessionsPayload>;
  export type Encoded = S.Schema.Encoded<typeof AdminRevokeUserSessionsPayload>;
}

export const AdminRevokeUserSessionsContract = Contract.make("AdminRevokeUserSessions", {
  description: "Revokes all sessions associated with a user.",
  payload: AdminRevokeUserSessionsPayload.fields,
  success: AdminBooleanSuccess,
  failure: IamError,
})
  .annotate(Contract.Title, "Revoke User Sessions")
  .annotate(Contract.Domain, "Admin")
  .annotate(Contract.Method, "admin.revokeUserSessions");

export class AdminRemoveUserPayload extends S.Class<AdminRemoveUserPayload>("AdminRemoveUserPayload")(
  {
    userId: SharedEntityIds.UserId,
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminRemoveUserPayload"),
    identifier: "AdminRemoveUserPayload",
    description: "Payload for permanently deleting a user.",
  }
) {}

export declare namespace AdminRemoveUserPayload {
  export type Type = S.Schema.Type<typeof AdminRemoveUserPayload>;
  export type Encoded = S.Schema.Encoded<typeof AdminRemoveUserPayload>;
}

export const AdminRemoveUserContract = Contract.make("AdminRemoveUser", {
  description: "Removes a user and cascading state using Better Auth admin API.",
  payload: AdminRemoveUserPayload.fields,
  success: AdminBooleanSuccess,
  failure: IamError,
})
  .annotate(Contract.Title, "Remove User")
  .annotate(Contract.Domain, "Admin")
  .annotate(Contract.Method, "admin.removeUser");

export class AdminSetUserPasswordPayload extends S.Class<AdminSetUserPasswordPayload>("AdminSetUserPasswordPayload")(
  {
    userId: SharedEntityIds.UserId,
    newPassword: BS.Password,
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminSetUserPasswordPayload"),
    identifier: "AdminSetUserPasswordPayload",
    description: "Payload for setting a new credential password on a user.",
  }
) {}

export declare namespace AdminSetUserPasswordPayload {
  export type Type = S.Schema.Type<typeof AdminSetUserPasswordPayload>;
  export type Encoded = S.Schema.Encoded<typeof AdminSetUserPasswordPayload>;
}

export class AdminSetUserPasswordSuccess extends S.Class<AdminSetUserPasswordSuccess>("AdminSetUserPasswordSuccess")(
  {
    status: S.Boolean,
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminSetUserPasswordSuccess"),
    identifier: "AdminSetUserPasswordSuccess",
    description: "Boolean status returned after updating a user's password.",
  }
) {}

export declare namespace AdminSetUserPasswordSuccess {
  export type Type = S.Schema.Type<typeof AdminSetUserPasswordSuccess>;
  export type Encoded = S.Schema.Encoded<typeof AdminSetUserPasswordSuccess>;
}

export const AdminSetUserPasswordContract = Contract.make("AdminSetUserPassword", {
  description: "Replaces a user's password via the Better Auth admin endpoint.",
  payload: AdminSetUserPasswordPayload.fields,
  success: AdminSetUserPasswordSuccess,
  failure: IamError,
})
  .annotate(Contract.Title, "Set User Password")
  .annotate(Contract.Domain, "Admin")
  .annotate(Contract.Method, "admin.setUserPassword");

export class AdminHasPermissionPayload extends S.Class<AdminHasPermissionPayload>("AdminHasPermissionPayload")(
  {
    userId: S.optional(SharedEntityIds.UserId),
    role: S.optional(User.UserRole),
    permission: S.optional(PermissionMatrix),
    permissions: S.optional(PermissionMatrix),
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminHasPermissionPayload"),
    identifier: "AdminHasPermissionPayload",
    description: "Payload for checking permissions for either a role or user identifier.",
  }
) {}

export declare namespace AdminHasPermissionPayload {
  export type Type = S.Schema.Type<typeof AdminHasPermissionPayload>;
  export type Encoded = S.Schema.Encoded<typeof AdminHasPermissionPayload>;
}

export class AdminHasPermissionSuccess extends S.Class<AdminHasPermissionSuccess>("AdminHasPermissionSuccess")(
  {
    success: S.Boolean,
    error: S.NullOr(S.String),
  },
  {
    schemaId: Symbol.for("@beep/iam-client/clients/AdminHasPermissionSuccess"),
    identifier: "AdminHasPermissionSuccess",
    description: "Result of evaluating a permission set for a user or role.",
  }
) {}

export declare namespace AdminHasPermissionSuccess {
  export type Type = S.Schema.Type<typeof AdminHasPermissionSuccess>;
  export type Encoded = S.Schema.Encoded<typeof AdminHasPermissionSuccess>;
}

export const AdminHasPermissionContract = Contract.make("AdminHasPermission", {
  description: "Checks whether a role or user satisfies the provided permissions.",
  payload: AdminHasPermissionPayload.fields,
  success: AdminHasPermissionSuccess,
  failure: IamError,
})
  .annotate(Contract.Title, "Has Permission")
  .annotate(Contract.Domain, "Admin")
  .annotate(Contract.Method, "admin.hasPermission");

export const AdminContractKit = ContractKit.make(
  AdminSetRoleContract,
  AdminGetUserContract,
  AdminCreateUserContract,
  AdminUpdateUserContract,
  AdminListUsersContract,
  AdminListUserSessionsContract,
  AdminUnbanUserContract,
  AdminBanUserContract,
  AdminImpersonateUserContract,
  AdminStopImpersonatingContract,
  AdminRevokeUserSessionContract,
  AdminRevokeUserSessionsContract,
  AdminRemoveUserContract,
  AdminSetUserPasswordContract,
  AdminHasPermissionContract
);
