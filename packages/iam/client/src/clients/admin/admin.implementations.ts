import { client } from "@beep/iam-client/adapters";
import { requireData, withFetchOptions } from "@beep/iam-client/clients/_internal";
import {
  AdminBanUserContract,
  AdminContractKit,
  AdminCreateUserContract,
  AdminGetUserContract,
  AdminHasPermissionContract,
  AdminImpersonateUserContract,
  AdminListUserSessionsContract,
  AdminListUsersContract,
  AdminRemoveUserContract,
  AdminRevokeUserSessionContract,
  AdminRevokeUserSessionsContract,
  AdminSetRoleContract,
  AdminSetUserPasswordContract,
  AdminStopImpersonatingContract,
  AdminUnbanUserContract,
  AdminUpdateUserContract,
} from "@beep/iam-client/clients/admin/admin.contracts";
import { IamError } from "@beep/iam-client/errors";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

const AdminSetRoleHandler = AdminSetRoleContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run(async (handlers) => {
      const fetchOptions = withFetchOptions(handlers);
      const role = typeof payload.role === "string" ? payload.role : [...payload.role];
      const request = {
        userId: payload.userId,
        role,
        fetchOptions,
      } satisfies Parameters<typeof client.admin.setRole>[0];

      return client.admin.setRole(request);
    });

    yield* continuation.raiseResult(result);

    const raw = yield* requireData(result.data, "AdminSetRoleHandler", continuation.metadata);

    const normalized =
      typeof raw === "object" && raw !== null && Object.prototype.hasOwnProperty.call(raw, "user")
        ? raw
        : { user: raw };

    return yield* AdminSetRoleContract.decodeUnknownSuccess(normalized);
  })
);

const AdminGetUserHandler = AdminGetUserContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) => {
      const fetchOptions = withFetchOptions(handlers);
      const request = {
        query: {
          id: payload.userId,
        },
        fetchOptions,
      } satisfies Parameters<typeof client.admin.getUser>[0];

      return client.admin.getUser(request);
    });

    yield* continuation.raiseResult(result);

    const raw = yield* requireData(result.data, "AdminGetUserHandler", continuation.metadata);

    const normalized =
      typeof raw === "object" && raw !== null && Object.prototype.hasOwnProperty.call(raw, "user")
        ? raw
        : { user: raw };

    return yield* AdminGetUserContract.decodeUnknownSuccess(normalized);
  })
);

const AdminCreateUserHandler = AdminCreateUserContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) => {
      const fetchOptions = withFetchOptions(handlers);
      const role =
        payload.role === undefined ? undefined : typeof payload.role === "string" ? payload.role : [...payload.role];
      const request = {
        email: Redacted.value(payload.email),
        password: Redacted.value(payload.password),
        name: payload.name,
        ...(role === undefined ? {} : { role }),
        ...(payload.data === undefined ? {} : { data: payload.data }),
        fetchOptions,
      } satisfies Parameters<typeof client.admin.createUser>[0];

      return client.admin.createUser(request);
    });

    yield* continuation.raiseResult(result);

    const raw = yield* requireData(result.data, "AdminCreateUserHandler", continuation.metadata);

    const normalized =
      typeof raw === "object" && raw !== null && Object.prototype.hasOwnProperty.call(raw, "user")
        ? raw
        : { user: raw };

    return yield* AdminCreateUserContract.decodeUnknownSuccess(normalized);
  })
);

const AdminUpdateUserHandler = AdminUpdateUserContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) => {
      const fetchOptions = withFetchOptions(handlers);
      const request = {
        userId: payload.userId,
        data: payload.data,
        fetchOptions,
      } satisfies Parameters<typeof client.admin.updateUser>[0];

      return client.admin.updateUser(request);
    });

    yield* continuation.raiseResult(result);

    const raw = yield* requireData(result.data, "AdminUpdateUserHandler", continuation.metadata);

    const normalized =
      typeof raw === "object" && raw !== null && Object.prototype.hasOwnProperty.call(raw, "user")
        ? raw
        : { user: raw };

    return yield* AdminUpdateUserContract.decodeUnknownSuccess(normalized);
  })
);

const AdminListUsersHandler = AdminListUsersContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) => {
      const fetchOptions = withFetchOptions(handlers);
      const request = {
        query: {
          ...(payload.searchValue === undefined ? {} : { searchValue: payload.searchValue }),
          ...(payload.searchField === undefined ? {} : { searchField: payload.searchField }),
          ...(payload.searchOperator === undefined ? {} : { searchOperator: payload.searchOperator }),
          ...(payload.limit === undefined ? {} : { limit: payload.limit }),
          ...(payload.offset === undefined ? {} : { offset: payload.offset }),
          ...(payload.sortBy === undefined ? {} : { sortBy: payload.sortBy }),
          ...(payload.sortDirection === undefined ? {} : { sortDirection: payload.sortDirection }),
          ...(payload.filterField === undefined ? {} : { filterField: payload.filterField }),
          ...(payload.filterValue === undefined ? {} : { filterValue: payload.filterValue }),
          ...(payload.filterOperator === undefined ? {} : { filterOperator: payload.filterOperator }),
        },
        fetchOptions,
      } satisfies Parameters<typeof client.admin.listUsers>[0];

      return client.admin.listUsers(request);
    });

    yield* continuation.raiseResult(result);

    const raw = yield* requireData(result.data, "AdminListUsersHandler", continuation.metadata);

    return yield* AdminListUsersContract.decodeUnknownSuccess(raw);
  })
);

const AdminListUserSessionsHandler = AdminListUserSessionsContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) => {
      const request = {
        userId: payload.userId,
        fetchOptions: withFetchOptions(handlers),
      } satisfies Parameters<typeof client.admin.listUserSessions>[0];

      return client.admin.listUserSessions(request);
    });

    yield* continuation.raiseResult(result);

    const raw = yield* requireData(result.data, "AdminListUserSessionsHandler", continuation.metadata);

    return yield* AdminListUserSessionsContract.decodeUnknownSuccess(raw);
  })
);

const AdminUnbanUserHandler = AdminUnbanUserContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.admin.unbanUser({
        userId: payload.userId,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    const raw = yield* requireData(result.data, "AdminUnbanUserHandler", continuation.metadata);

    const normalized =
      typeof raw === "object" && raw !== null && Object.prototype.hasOwnProperty.call(raw, "user")
        ? raw
        : { user: raw };

    return yield* AdminUnbanUserContract.decodeUnknownSuccess(normalized);
  })
);

const AdminBanUserHandler = AdminBanUserContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.admin.banUser({
        userId: payload.userId,
        ...(payload.banReason === undefined ? {} : { banReason: payload.banReason }),
        ...(payload.banExpiresIn === undefined ? {} : { banExpiresIn: payload.banExpiresIn }),
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    const raw = yield* requireData(result.data, "AdminBanUserHandler", continuation.metadata);

    const normalized =
      typeof raw === "object" && raw !== null && Object.prototype.hasOwnProperty.call(raw, "user")
        ? raw
        : { user: raw };

    return yield* AdminBanUserContract.decodeUnknownSuccess(normalized);
  })
);

const AdminImpersonateUserHandler = AdminImpersonateUserContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.admin.impersonateUser({
        userId: payload.userId,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.error == null) {
      client.$store.notify("$sessionSignal");
    }

    const raw = yield* requireData(result.data, "AdminImpersonateUserHandler", continuation.metadata);

    if (
      typeof raw !== "object" ||
      raw === null ||
      !Object.prototype.hasOwnProperty.call(raw, "session") ||
      !Object.prototype.hasOwnProperty.call(raw, "user")
    ) {
      return yield* Effect.fail(
        IamError.new(
          raw,
          "AdminImpersonateUserHandler received malformed payload from Better Auth",
          continuation.metadata
        )
      );
    }

    return yield* AdminImpersonateUserContract.decodeUnknownSuccess(raw);
  })
);

const AdminStopImpersonatingHandler = AdminStopImpersonatingContract.implement(
  Effect.fn(function* (_, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.admin.stopImpersonating({
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.error == null) {
      client.$store.notify("$sessionSignal");
    }

    const raw = yield* requireData(result.data, "AdminStopImpersonatingHandler", continuation.metadata);

    if (
      typeof raw !== "object" ||
      raw === null ||
      !Object.prototype.hasOwnProperty.call(raw, "session") ||
      !Object.prototype.hasOwnProperty.call(raw, "user")
    ) {
      return yield* Effect.fail(
        IamError.new(
          raw,
          "AdminStopImpersonatingHandler received malformed payload from Better Auth",
          continuation.metadata
        )
      );
    }

    return yield* AdminStopImpersonatingContract.decodeUnknownSuccess(raw);
  })
);

const AdminRevokeUserSessionHandler = AdminRevokeUserSessionContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.admin.revokeUserSession({
        sessionToken: payload.sessionToken,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    const raw = yield* requireData(result.data, "AdminRevokeUserSessionHandler", continuation.metadata);

    return yield* AdminRevokeUserSessionContract.decodeUnknownSuccess(raw);
  })
);

const AdminRevokeUserSessionsHandler = AdminRevokeUserSessionsContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.admin.revokeUserSessions({
        userId: payload.userId,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    const raw = yield* requireData(result.data, "AdminRevokeUserSessionsHandler", continuation.metadata);

    return yield* AdminRevokeUserSessionsContract.decodeUnknownSuccess(raw);
  })
);

const AdminRemoveUserHandler = AdminRemoveUserContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.admin.removeUser({
        userId: payload.userId,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    const raw = yield* requireData(result.data, "AdminRemoveUserHandler", continuation.metadata);

    return yield* AdminRemoveUserContract.decodeUnknownSuccess(raw);
  })
);

const AdminSetUserPasswordHandler = AdminSetUserPasswordContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.admin.setUserPassword({
        userId: payload.userId,
        newPassword: Redacted.value(payload.newPassword),
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    const raw = yield* requireData(result.data, "AdminSetUserPasswordHandler", continuation.metadata);

    return yield* AdminSetUserPasswordContract.decodeUnknownSuccess(raw);
  })
);

const AdminHasPermissionHandler = AdminHasPermissionContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    if (
      (payload.permission !== undefined && payload.permissions !== undefined) ||
      (payload.permission === undefined && payload.permissions === undefined)
    ) {
      return yield* Effect.fail(
        IamError.new(
          payload,
          "AdminHasPermissionHandler requires exactly one of permission or permissions",
          continuation.metadata
        )
      );
    }

    const result = yield* continuation.run((handlers) => {
      const body =
        payload.permission !== undefined
          ? {
              permission: payload.permission,
            }
          : {
              permissions: payload.permissions,
            };

      const request = {
        ...body,
        ...(payload.userId === undefined ? {} : { userId: payload.userId }),
        ...(payload.role === undefined ? {} : { role: payload.role }),
        fetchOptions: withFetchOptions(handlers),
      } satisfies Parameters<typeof client.admin.hasPermission>[0];

      return client.admin.hasPermission(request);
    });

    yield* continuation.raiseResult(result);

    const raw = yield* requireData(result.data, "AdminHasPermissionHandler", continuation.metadata);

    return yield* AdminHasPermissionContract.decodeUnknownSuccess(raw);
  })
);

export const AdminImplementations = AdminContractKit.of({
  // type error
  AdminSetRole: AdminSetRoleHandler,
  AdminGetUser: AdminGetUserHandler,
  AdminCreateUser: AdminCreateUserHandler,
  AdminUpdateUser: AdminUpdateUserHandler,
  AdminListUsers: AdminListUsersHandler,
  AdminListUserSessions: AdminListUserSessionsHandler,
  AdminUnbanUser: AdminUnbanUserHandler,
  AdminBanUser: AdminBanUserHandler,
  AdminImpersonateUser: AdminImpersonateUserHandler,
  AdminStopImpersonating: AdminStopImpersonatingHandler,
  AdminRevokeUserSession: AdminRevokeUserSessionHandler,
  AdminRevokeUserSessions: AdminRevokeUserSessionsHandler,
  AdminRemoveUser: AdminRemoveUserHandler,
  AdminSetUserPassword: AdminSetUserPasswordHandler,
  AdminHasPermission: AdminHasPermissionHandler,
});

export const adminLayer = AdminContractKit.toLayer(AdminImplementations);
