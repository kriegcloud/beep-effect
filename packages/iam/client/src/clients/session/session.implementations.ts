"use client";
import { client } from "@beep/iam-client/adapters";
import { withFetchOptions } from "@beep/iam-client/clients/_internal";
import {
  GetSessionContract,
  ListSessionsContract,
  RevokeOtherSessionsContract,
  RevokeSessionContract,
  RevokeSessionsContract,
  SessionContractKit,
} from "@beep/iam-client/clients/session/session.contracts";
import * as Effect from "effect/Effect";

// =====================================================================================================================
// Get Session Handler
// =====================================================================================================================
export const GetSessionHandler = GetSessionContract.implement((_, { continuation }) =>
  continuation.runDecode(async (handlers) =>
    client.getSession({
      fetchOptions: withFetchOptions(handlers),
    })
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
const RevokeSessionHandler = RevokeSessionContract.implement((payload, { continuation }) =>
  continuation.runVoid((handlers) =>
    client.revokeSession({
      token: payload.token,
      fetchOptions: withFetchOptions(handlers),
    })
  )
);
// =====================================================================================================================
// Revoke Other Sessions Handler
// =====================================================================================================================
const RevokeOtherSessionsHandler = RevokeOtherSessionsContract.implement((_, { continuation }) =>
  continuation.runVoid((handlers) =>
    client.revokeOtherSessions({
      fetchOptions: withFetchOptions(handlers),
    })
  )
);
// =====================================================================================================================
// Revoke Sessions Handler
// =====================================================================================================================
const RevokeSessionsHandler = RevokeSessionsContract.implement((_, { continuation }) =>
  continuation.runVoid((handlers) =>
    client.revokeSessions({
      fetchOptions: withFetchOptions(handlers),
    })
  )
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
