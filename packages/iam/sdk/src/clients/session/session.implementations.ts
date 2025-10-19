import { client } from "@beep/iam-sdk/adapters";
import type { RevokeSessionPayload } from "@beep/iam-sdk/clients/session/session.contracts";
import {
  GetSessionSuccess,
  ListSessionsSuccess,
  SessionContractSet,
} from "@beep/iam-sdk/clients/session/session.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const GetSessionMetadata = {
  plugin: "session",
  method: "getSession",
} as const;

const ListSessionsMetadata = {
  plugin: "session",
  method: "listSessions",
} as const;

// =====================================================================================================================
// Get Session Handler
// =====================================================================================================================
const GetSessionHandler = Effect.fn("GetSessionHandler")(
  function* () {
    const continuation = makeFailureContinuation({
      contract: "GetSession",
      metadata: () => GetSessionMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.getSession({
        fetchOptions: handlers.signal
          ? {
              onError: handlers.onError,
              signal: handlers.signal,
            }
          : {
              onError: handlers.onError,
            },
      })
    );
    yield* continuation.raiseResult(result);

    return yield* Effect.flatMap(S.encodeUnknown(GetSessionSuccess)(result.data), S.decodeUnknown(GetSessionSuccess));
  },
  Effect.catchTags({
    ParseError: (error) => IamError.match(error, ListSessionsMetadata),
  })
);
// =====================================================================================================================
// List Sessions Handler
// =====================================================================================================================
const ListSessionsHandler = Effect.fn("ListSessionsHandler")(
  function* () {
    const continuation = makeFailureContinuation({
      contract: "ListSessions",
      metadata: () => ListSessionsMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.listSessions({
        fetchOptions: handlers.signal
          ? {
              onError: handlers.onError,
              signal: handlers.signal,
            }
          : {
              onError: handlers.onError,
            },
      })
    );

    yield* continuation.raiseResult(result);

    return yield* Effect.flatMap(
      S.encodeUnknown(ListSessionsSuccess)(result.data),
      S.decodeUnknown(ListSessionsSuccess)
    );
  },
  Effect.catchTags({
    ParseError: (error) => IamError.match(error, ListSessionsMetadata),
  })
);

// =====================================================================================================================
// Revoke Session Handler
// =====================================================================================================================
const RevokeSessionHandler = Effect.fn("RevokeSessionHandler")(function* (payload: RevokeSessionPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "RevokeSession",
    metadata: () => ({
      plugin: "session",
      method: "revokeSession",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.revokeSession({
      token: payload.token,
      fetchOptions: handlers.signal
        ? {
            onError: handlers.onError,
            signal: handlers.signal,
          }
        : {
            onError: handlers.onError,
          },
    })
  );

  yield* continuation.raiseResult(result);
});
// =====================================================================================================================
// Revoke Other Sessions Handler
// =====================================================================================================================
const RevokeOtherSessionsHandler = Effect.fn("RevokeOtherSessionsHandler")(function* () {
  const continuation = makeFailureContinuation({
    contract: "RevokeOtherSessions",
    metadata: () => ({
      plugin: "session",
      method: "revokeOtherSessions",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.revokeOtherSessions({
      fetchOptions: handlers.signal
        ? {
            onError: handlers.onError,
            signal: handlers.signal,
          }
        : {
            onError: handlers.onError,
          },
    })
  );

  yield* continuation.raiseResult(result);
});
// =====================================================================================================================
// Revoke Sessions Handler
// =====================================================================================================================
const RevokeSessionsHandler = Effect.fn("RevokeSessionsHandler")(function* () {
  const continuation = makeFailureContinuation({
    contract: "RevokeSessions",
    metadata: () => ({
      plugin: "session",
      method: "revokeSessions",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.revokeSessions({
      fetchOptions: handlers.signal
        ? {
            onError: handlers.onError,
            signal: handlers.signal,
          }
        : {
            onError: handlers.onError,
          },
    })
  );

  yield* continuation.raiseResult(result);
});
// =====================================================================================================================
// Session Implementations Service
// =====================================================================================================================
export const SessionImplementations = SessionContractSet.of({
  GetSession: GetSessionHandler,
  ListSessions: ListSessionsHandler,
  RevokeSession: RevokeSessionHandler,
  RevokeOtherSessions: RevokeOtherSessionsHandler,
  RevokeSessions: RevokeSessionsHandler,
});
