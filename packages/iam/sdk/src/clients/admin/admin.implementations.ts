import { client } from "@beep/iam-sdk/adapters";
import {
  AdminBanUserContract,
  type AdminBanUserPayload,
  AdminContractSet,
  AdminCreateUserContract,
  type AdminCreateUserPayload,
  AdminGetUserContract,
  type AdminGetUserPayload,
  AdminHasPermissionContract,
  type AdminHasPermissionPayload,
  AdminImpersonateUserContract,
  type AdminImpersonateUserPayload,
  AdminListUserSessionsContract,
  type AdminListUserSessionsPayload,
  AdminListUsersContract,
  type AdminListUsersPayload,
  AdminRemoveUserContract,
  type AdminRemoveUserPayload,
  AdminRevokeUserSessionContract,
  type AdminRevokeUserSessionPayload,
  AdminRevokeUserSessionsContract,
  type AdminRevokeUserSessionsPayload,
  AdminSetRoleContract,
  type AdminSetRolePayload,
  AdminSetUserPasswordContract,
  type AdminSetUserPasswordPayload,
  AdminStopImpersonatingContract,
  type AdminStopImpersonatingPayload,
  AdminUnbanUserContract,
  type AdminUnbanUserPayload,
  AdminUpdateUserContract,
  type AdminUpdateUserPayload,
} from "@beep/iam-sdk/clients/admin/admin.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import type { FailureContinuationHandlers } from "@beep/iam-sdk/contract-kit/failure-continuation";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

const buildFetchOptions = (handlers: FailureContinuationHandlers) =>
  handlers.signal
    ? {
        onError: handlers.onError,
        signal: handlers.signal,
      }
    : {
        onError: handlers.onError,
      };

const requireData = <T>(
  data: T,
  handlerName: string,
  metadata: { readonly plugin: string; readonly method: string }
): Effect.Effect<T, IamError> =>
  data == null
    ? Effect.fail(
        new IamError(
          {},
          `${handlerName} returned no payload from Better Auth`,
          metadata
        )
      )
    : Effect.succeed(data);

const decodeResult = <Schema extends S.Schema.Any>(
  schema: Schema,
  handlerName: string,
  data: unknown
) =>
  S.decodeUnknown(schema)(data).pipe(
    Effect.catchTag("ParseError", (error) =>
      Effect.dieMessage(`${handlerName} failed to parse response: ${error.message}`)
    )
  );

const AdminSetRoleHandler = Effect.fn("AdminSetRoleHandler")(function* (
  payload: AdminSetRolePayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "AdminSetRole",
    metadata: () => ({
      plugin: "admin",
      method: "setRole",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.admin.setRole(
      {
        userId: payload.userId,
        // TS2322: Type string | readonly string[] is not assignable to type "user" | "admin" | ("user" | "admin")[]
        // Type string is not assignable to type "user" | "admin" | ("user" | "admin")[]
        // index.d.ts(200, 21): The expected type comes from property role which is declared here on type
        // Prettify<{
        //   userId: string;
        //   role: "user" | "admin" | ("user" | "admin")[];
        // } & {
        //   fetchOptions?: {
        //     onError: (ctx: {
        //       readonly error: unknown;
        //     }) => void;
        //     signal: AbortSignal;
        //   } | {
        //     onError: (ctx: { ...; }) => void;
        //     signal?: undefined;
        //   } | undefined;
        // }>
        role: payload.role,
        fetchOptions: buildFetchOptions(handlers),
      }
    )
  );

  yield* continuation.raiseResult(result);

  const raw = yield* requireData(result.data, "AdminSetRoleHandler", {
    plugin: "admin",
    method: "setRole",
  });

  const normalized =
    typeof raw === "object" &&
    raw !== null &&
    Object.prototype.hasOwnProperty.call(raw, "user")
      ? raw
      : { user: raw };

  return yield* decodeResult(
    AdminSetRoleContract.successSchema,
    "AdminSetRoleHandler",
    normalized
  );
});

const AdminGetUserHandler = Effect.fn("AdminGetUserHandler")(function* (
  payload: AdminGetUserPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "AdminGetUser",
    metadata: () => ({
      plugin: "admin",
      method: "getUser",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.admin.getUser(
      {
        query: {
          id: payload.userId,
        },
        fetchOptions: buildFetchOptions(handlers),
      } as any
    )
  );

  yield* continuation.raiseResult(result);

  const raw = yield* requireData(result.data, "AdminGetUserHandler", {
    plugin: "admin",
    method: "getUser",
  });

  const normalized =
    typeof raw === "object" &&
    raw !== null &&
    Object.prototype.hasOwnProperty.call(raw, "user")
      ? raw
      : { user: raw };

  return yield* decodeResult(
    AdminGetUserContract.successSchema,
    "AdminGetUserHandler",
    normalized
  );
});

const AdminCreateUserHandler = Effect.fn("AdminCreateUserHandler")(function* (
  payload: AdminCreateUserPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "AdminCreateUser",
    metadata: () => ({
      plugin: "admin",
      method: "createUser",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.admin.createUser(
      {
        email: Redacted.value(payload.email),
        password: Redacted.value(payload.password),
        name: payload.name,
        ...(payload.role === undefined
          ? {}
          : { role: payload.role as unknown as string | readonly string[] }),
        ...(payload.data === undefined ? {} : { data: payload.data }),
        fetchOptions: buildFetchOptions(handlers),
      } as any
    )
  );

  yield* continuation.raiseResult(result);

  const raw = yield* requireData(result.data, "AdminCreateUserHandler", {
    plugin: "admin",
    method: "createUser",
  });

  const normalized =
    typeof raw === "object" &&
    raw !== null &&
    Object.prototype.hasOwnProperty.call(raw, "user")
      ? raw
      : { user: raw };

  return yield* decodeResult(
    AdminCreateUserContract.successSchema,
    "AdminCreateUserHandler",
    normalized
  );
});

const AdminUpdateUserHandler = Effect.fn("AdminUpdateUserHandler")(function* (
  payload: AdminUpdateUserPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "AdminUpdateUser",
    metadata: () => ({
      plugin: "admin",
      method: "updateUser",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.admin.updateUser(
      {
        userId: payload.userId,
        data: payload.data,
        fetchOptions: buildFetchOptions(handlers),
      } as any
    )
  );

  yield* continuation.raiseResult(result);

  const raw = yield* requireData(result.data, "AdminUpdateUserHandler", {
    plugin: "admin",
    method: "updateUser",
  });

  const normalized =
    typeof raw === "object" &&
    raw !== null &&
    Object.prototype.hasOwnProperty.call(raw, "user")
      ? raw
      : { user: raw };

  return yield* decodeResult(
    AdminUpdateUserContract.successSchema,
    "AdminUpdateUserHandler",
    normalized
  );
});

const AdminListUsersHandler = Effect.fn("AdminListUsersHandler")(function* (
  payload: AdminListUsersPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "AdminListUsers",
    metadata: () => ({
      plugin: "admin",
      method: "listUsers",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.admin.listUsers(
      {
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
        fetchOptions: buildFetchOptions(handlers),
      } as any
    )
  );

  yield* continuation.raiseResult(result);

  const raw = yield* requireData(result.data, "AdminListUsersHandler", {
    plugin: "admin",
    method: "listUsers",
  });

  return yield* decodeResult(
    AdminListUsersContract.successSchema,
    "AdminListUsersHandler",
    raw
  );
});

const AdminListUserSessionsHandler = Effect.fn("AdminListUserSessionsHandler")(function* (
  payload: AdminListUserSessionsPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "AdminListUserSessions",
    metadata: () => ({
      plugin: "admin",
      method: "listUserSessions",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.admin.listUserSessions({
      userId: payload.userId,
      fetchOptions: buildFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);

  const raw = yield* requireData(result.data, "AdminListUserSessionsHandler", {
    plugin: "admin",
    method: "listUserSessions",
  });

  return yield* decodeResult(
    AdminListUserSessionsContract.successSchema,
    "AdminListUserSessionsHandler",
    raw
  );
});

const AdminUnbanUserHandler = Effect.fn("AdminUnbanUserHandler")(function* (
  payload: AdminUnbanUserPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "AdminUnbanUser",
    metadata: () => ({
      plugin: "admin",
      method: "unbanUser",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.admin.unbanUser({
      userId: payload.userId,
      fetchOptions: buildFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);

  const raw = yield* requireData(result.data, "AdminUnbanUserHandler", {
    plugin: "admin",
    method: "unbanUser",
  });

  const normalized =
    typeof raw === "object" &&
    raw !== null &&
    Object.prototype.hasOwnProperty.call(raw, "user")
      ? raw
      : { user: raw };

  return yield* decodeResult(
    AdminUnbanUserContract.successSchema,
    "AdminUnbanUserHandler",
    normalized
  );
});

const AdminBanUserHandler = Effect.fn("AdminBanUserHandler")(function* (
  payload: AdminBanUserPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "AdminBanUser",
    metadata: () => ({
      plugin: "admin",
      method: "banUser",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.admin.banUser({
      userId: payload.userId,
      ...(payload.banReason === undefined ? {} : { banReason: payload.banReason }),
      ...(payload.banExpiresIn === undefined ? {} : { banExpiresIn: payload.banExpiresIn }),
      fetchOptions: buildFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);

  const raw = yield* requireData(result.data, "AdminBanUserHandler", {
    plugin: "admin",
    method: "banUser",
  });

  const normalized =
    typeof raw === "object" &&
    raw !== null &&
    Object.prototype.hasOwnProperty.call(raw, "user")
      ? raw
      : { user: raw };

  return yield* decodeResult(
    AdminBanUserContract.successSchema,
    "AdminBanUserHandler",
    normalized
  );
});

const AdminImpersonateUserHandler = Effect.fn("AdminImpersonateUserHandler")(function* (
  payload: AdminImpersonateUserPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "AdminImpersonateUser",
    metadata: () => ({
      plugin: "admin",
      method: "impersonateUser",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.admin.impersonateUser({
      userId: payload.userId,
      fetchOptions: buildFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);

  if (result.error == null) {
    client.$store.notify("$sessionSignal");
  }

  const raw = yield* requireData(result.data, "AdminImpersonateUserHandler", {
    plugin: "admin",
    method: "impersonateUser",
  });

  if (
    typeof raw !== "object" ||
    raw === null ||
    !Object.prototype.hasOwnProperty.call(raw, "session") ||
    !Object.prototype.hasOwnProperty.call(raw, "user")
  ) {
    return yield* Effect.fail(
      new IamError(
        raw,
        "AdminImpersonateUserHandler received malformed payload from Better Auth",
        {
          plugin: "admin",
          method: "impersonateUser",
        }
      )
    );
  }

  return yield* decodeResult(
    AdminImpersonateUserContract.successSchema,
    "AdminImpersonateUserHandler",
    raw
  );
});

const AdminStopImpersonatingHandler = Effect.fn("AdminStopImpersonatingHandler")(function* (
  _payload: AdminStopImpersonatingPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "AdminStopImpersonating",
    metadata: () => ({
      plugin: "admin",
      method: "stopImpersonating",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.admin.stopImpersonating({
      fetchOptions: buildFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);

  if (result.error == null) {
    client.$store.notify("$sessionSignal");
  }

  const raw = yield* requireData(result.data, "AdminStopImpersonatingHandler", {
    plugin: "admin",
    method: "stopImpersonating",
  });

  if (
    typeof raw !== "object" ||
    raw === null ||
    !Object.prototype.hasOwnProperty.call(raw, "session") ||
    !Object.prototype.hasOwnProperty.call(raw, "user")
  ) {
    return yield* Effect.fail(
      new IamError(
        raw,
        "AdminStopImpersonatingHandler received malformed payload from Better Auth",
        {
          plugin: "admin",
          method: "stopImpersonating",
        }
      )
    );
  }

  return yield* decodeResult(
    AdminStopImpersonatingContract.successSchema,
    "AdminStopImpersonatingHandler",
    raw
  );
});

const AdminRevokeUserSessionHandler = Effect.fn("AdminRevokeUserSessionHandler")(function* (
  payload: AdminRevokeUserSessionPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "AdminRevokeUserSession",
    metadata: () => ({
      plugin: "admin",
      method: "revokeUserSession",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.admin.revokeUserSession({
      sessionToken: payload.sessionToken,
      fetchOptions: buildFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);

  return yield* S.decodeUnknown(AdminRevokeUserSessionContract.successSchema)(result.data);
}, Effect.catchTags({
  ParseError: (e) => Effect.dieMessage(`AdminRevokeUserSessionHandler failed to parse response: ${e.message}`)
}));

const AdminRevokeUserSessionsHandler = Effect.fn("AdminRevokeUserSessionsHandler")(function* (
  payload: AdminRevokeUserSessionsPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "AdminRevokeUserSessions",
    metadata: () => ({
      plugin: "admin",
      method: "revokeUserSessions",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.admin.revokeUserSessions({
      userId: payload.userId,
      fetchOptions: buildFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);


  return yield* S.decodeUnknown(AdminRevokeUserSessionsContract.successSchema)(result.data);
}, Effect.catchTags({
  ParseError: (e) => Effect.dieMessage(`AdminRevokeUserSessionsHandler failed to parse response: ${e.message}`)
}));

const AdminRemoveUserHandler = Effect.fn("AdminRemoveUserHandler")(function* (
  payload: AdminRemoveUserPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "AdminRemoveUser",
    metadata: () => ({
      plugin: "admin",
      method: "removeUser",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.admin.removeUser({
      userId: payload.userId,
      fetchOptions: buildFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);


  return yield* S.decodeUnknown(AdminRemoveUserContract.successSchema)(result.data);
});

const AdminSetUserPasswordHandler = Effect.fn("AdminSetUserPasswordHandler")(function* (
  payload: AdminSetUserPasswordPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "AdminSetUserPassword",
    metadata: () => ({
      plugin: "admin",
      method: "setUserPassword",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.admin.setUserPassword({
      userId: payload.userId,
      newPassword: Redacted.value(payload.newPassword),
      fetchOptions: buildFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);

  const raw = yield* requireData(result.data, "AdminSetUserPasswordHandler", {
    plugin: "admin",
    method: "setUserPassword",
  });

  return yield* decodeResult(
    AdminSetUserPasswordContract.successSchema,
    "AdminSetUserPasswordHandler",
    raw
  );
});

const AdminHasPermissionHandler = Effect.fn("AdminHasPermissionHandler")(function* (
  payload: AdminHasPermissionPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "AdminHasPermission",
    metadata: () => ({
      plugin: "admin",
      method: "hasPermission",
    }),
  });

  const body =
    payload.permission != null
      ? {
          permission: payload.permission,
        }
      : {
          permissions: payload.permissions!,
        };

  const result = yield* continuation.run((handlers) =>
    client.admin.hasPermission({
      ...body,
      ...(payload.userId === undefined ? {} : { userId: payload.userId }),
      ...(payload.role === undefined ? {} : { role: payload.role }),
      fetchOptions: buildFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);


  return yield* S.decodeUnknown(AdminHasPermissionContract.successSchema)(result.data);
});

export const AdminImplementations = AdminContractSet.of({
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
