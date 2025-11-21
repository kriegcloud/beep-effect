"use client";
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
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as P from "effect/Predicate";
import { IamError } from "../../errors";

// =====================================================================================================================
// Get Session Handler
// =====================================================================================================================
export const GetSessionHandler = GetSessionContract.implement(
  Effect.fn("GetSessionHandler")(function* (_, { continuation }) {
    yield* Console.log("GET SESSION Handler");
    const result = yield* continuation.run(async (handlers) => {
      const result = await client.getSession({
        fetchOptions: withFetchOptions(handlers),
      });
      console.log(result);
      return result;
    });
    yield* continuation.raiseResult(result);

    if (P.isNullable(result.data)) {
      return yield* IamError.new("GetSessionHandler", "Session not found", continuation.metadata);
    }

    yield* Console.log(JSON.stringify(result, null, 2));

    return yield* GetSessionContract.decodeUnknownSuccess(result.data);
  })
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
