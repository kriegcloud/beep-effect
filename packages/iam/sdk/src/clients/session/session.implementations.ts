"use client";
import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, makeFailureContinuation, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  GetSessionContract,
  ListSessionsContract,
  RevokeOtherSessionsContract,
  RevokeSessionContract,
  RevokeSessionsContract,
  SessionContractKit,
} from "@beep/iam-sdk/clients/session/session.contracts";
import * as Effect from "effect/Effect";

const metadataFactory = new MetadataFactory("session");

const GetSessionMetadata = metadataFactory.make("getSession");
const ListSessionsMetadata = metadataFactory.make("listSessions");
const RevokeSessionMetadata = metadataFactory.make("revokeSession");
const RevokeOtherSessionsMetadata = metadataFactory.make("revokeOtherSessions");
const RevokeSessionsMetadata = metadataFactory.make("revokeSessions");
// =====================================================================================================================
// Get Session Handler
// =====================================================================================================================
const GetSessionHandler = GetSessionContract.implement(
  Effect.fn("GetSessionHandler")(function* () {
    const continuation = makeFailureContinuation({
      contract: GetSessionContract.name,
      metadata: GetSessionMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.getSession({
        fetchOptions: withFetchOptions(handlers),
      })
    );
    yield* continuation.raiseResult(result);

    return yield* GetSessionContract.decodeUnknownSuccess(result.data);
  })
);
// =====================================================================================================================
// List Sessions Handler
// =====================================================================================================================
const ListSessionsHandler = ListSessionsContract.implement(
  Effect.fn(function* () {
    const continuation = makeFailureContinuation({
      contract: ListSessionsContract.name,
      metadata: ListSessionsMetadata,
    });

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
  Effect.fn("RevokeSessionHandler")(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: RevokeSessionContract.name,
      metadata: RevokeSessionMetadata,
    });

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
  Effect.fn("RevokeOtherSessionsHandler")(function* () {
    const continuation = makeFailureContinuation({
      contract: RevokeOtherSessionsContract.name,
      metadata: RevokeOtherSessionsMetadata,
    });

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
  Effect.fn("RevokeSessionsHandler")(function* () {
    const continuation = makeFailureContinuation({
      contract: RevokeSessionsContract.name,
      metadata: RevokeSessionsMetadata,
    });

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
