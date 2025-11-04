"use client";
import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, makeFailureContinuation, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import type { RevokeSessionPayload } from "@beep/iam-sdk/clients/session/session.contracts";
import {
  GetSessionSuccess,
  ListSessionsSuccess,
  SessionContractKit,
} from "@beep/iam-sdk/clients/session/session.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const metadataFactory = new MetadataFactory("session");

const GetSessionMetadata = metadataFactory.make("getSession");
const ListSessionsMetadata = metadataFactory.make("listSessions");
const RevokeSessionMetadata = metadataFactory.make("revokeSession");
const RevokeOtherSessionsMetadata = metadataFactory.make("revokeOtherSessions");
const RevokeSessionsMetadata = metadataFactory.make("revokeSessions");
// =====================================================================================================================
// Get Session Handler
// =====================================================================================================================
const GetSessionHandler = Effect.fn("GetSessionHandler")(
  function* () {
    const continuation = makeFailureContinuation({
      contract: "GetSession",
      metadata: GetSessionMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.getSession({
        fetchOptions: withFetchOptions(handlers),
      })
    );
    yield* continuation.raiseResult(result);

    return yield* S.decodeUnknown(GetSessionSuccess)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => IamError.match(error, ListSessionsMetadata()),
  })
);
// =====================================================================================================================
// List Sessions Handler
// =====================================================================================================================
const ListSessionsHandler = Effect.fn("ListSessionsHandler")(
  function* () {
    const continuation = makeFailureContinuation({
      contract: "ListSessions",
      metadata: ListSessionsMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.listSessions({
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    return yield* Effect.flatMap(
      S.encodeUnknown(ListSessionsSuccess)(result.data),
      S.decodeUnknown(ListSessionsSuccess)
    );
  },
  Effect.catchTags({
    ParseError: (error) => IamError.match(error, ListSessionsMetadata()),
  })
);

// =====================================================================================================================
// Revoke Session Handler
// =====================================================================================================================
const RevokeSessionHandler = Effect.fn("RevokeSessionHandler")(function* (payload: RevokeSessionPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "RevokeSession",
    metadata: RevokeSessionMetadata,
  });

  const result = yield* continuation.run((handlers) =>
    client.revokeSession({
      token: payload.token,
      fetchOptions: withFetchOptions(handlers),
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
    metadata: RevokeOtherSessionsMetadata,
  });

  const result = yield* continuation.run((handlers) =>
    client.revokeOtherSessions({
      fetchOptions: withFetchOptions(handlers),
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
    metadata: RevokeSessionsMetadata,
  });

  const result = yield* continuation.run((handlers) =>
    client.revokeSessions({
      fetchOptions: withFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);
});
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
