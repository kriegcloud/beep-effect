"use client";
import { Session } from "@beep/iam-domain/entities";
import { client } from "@beep/iam-sdk/adapters";
import { withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  GetSessionContract,
  ListSessionsContract,
  RevokeOtherSessionsContract,
  RevokeSessionContract,
  RevokeSessionsContract,
  SessionContractKit,
} from "@beep/iam-sdk/clients/session/session.contracts";
import { User } from "@beep/shared-domain/entities";
import * as Effect from "effect/Effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

// =====================================================================================================================
// Get Session Handler
// =====================================================================================================================
export const GetSessionHandler = GetSessionContract.implement(
  Effect.fn("GetSessionHandler")(
    function* (_, { continuation }) {
      const result = yield* continuation.run((handlers) =>
        client.getSession({
          fetchOptions: withFetchOptions(handlers),
        })
      );
      if (P.isNullable(result.data)) {
        return yield* new IamError("GetSessionHandler", "Session not found", continuation.metadata);
      }

      const { user, session } = result.data;
      const userDecoded = yield* S.decodeUnknown(User.Model)({
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
        createdBy: user.createdBy,
        updatedBy: user.updatedBy,
        deletedBy: user.deletedBy,
        version: user.version,
        source: user.source,
        id: user.id,
        _rowId: user._rowId,
        name: user.name,
        email: user.email,
        secondaryEmail: user.secondaryEmail,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        gender: user.gender,
        banned: user.banned,
        banExpires: user.banExpires,
        isAnonymous: user.isAnonymous,
        phoneNumber: user.phoneNumber,
        phoneNumberVerified: user.phoneNumberVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        displayUsername: user.displayUsername,
        stripeCustomerId: user.stripeCustomerId,
        lastLoginMethod: user.lastLoginMethod,
        username: user.username,
        banReason: user.banReason,
      });

      const sessionDecoded = yield* S.decodeUnknown(Session.Model)({
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        deletedAt: session.deletedAt,
        createdBy: session.createdBy,
        updatedBy: session.updatedBy,
        deletedBy: session.deletedBy,
        version: session.version,
        source: session.source,
        id: session.id,
        _rowId: session._rowId,
        expiresAt: session.expiresAt,
        token: session.token,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        userId: session.userId,
        activeOrganizationId: session.activeOrganizationId,
        activeTeamId: session.activeTeamId,
        impersonatedBy: session.impersonatedBy,
      });

      yield* continuation.raiseResult(result);

      return yield* Effect.succeed({
        user: userDecoded,
        session: sessionDecoded,
      });
    },
    Effect.catchTag("ParseError", (e) => new IamError(e, e.message))
  )
);
// =====================================================================================================================
// List Sessions Handler
// =====================================================================================================================
const ListSessionsHandler = ListSessionsContract.implement(
  Effect.fn(function* (_, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.listSessions({
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    return yield* Effect.flatMap(ListSessionsContract.encodeUnknownSuccess(result.data), (r) =>
      ListSessionsContract.decodeUnknownSuccess(r)
    );
  })
);

// =====================================================================================================================
// Revoke Session Handler
// =====================================================================================================================
const RevokeSessionHandler = RevokeSessionContract.implement(
  Effect.fn("RevokeSessionHandler")(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.revokeSession({
        token: payload.token,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);
// =====================================================================================================================
// Revoke Other Sessions Handler
// =====================================================================================================================
const RevokeOtherSessionsHandler = RevokeOtherSessionsContract.implement(
  Effect.fn("RevokeOtherSessionsHandler")(function* (_, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.revokeOtherSessions({
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);
// =====================================================================================================================
// Revoke Sessions Handler
// =====================================================================================================================
const RevokeSessionsHandler = RevokeSessionsContract.implement(
  Effect.fn("RevokeSessionsHandler")(function* (_, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.revokeSessions({
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);
// =====================================================================================================================
// Session Implementations Service
// =====================================================================================================================
export const SessionImplementations = SessionContractKit.of({
  GetSession: GetSessionHandler,
  ListSessions: ListSessionsHandler,
  RevokeSession: RevokeSessionHandler,
  RevokeOtherSessions: RevokeOtherSessionsHandler,
  RevokeSessions: RevokeSessionsHandler,
});

export const sessionLayer = SessionContractKit.toLayer(SessionImplementations);
