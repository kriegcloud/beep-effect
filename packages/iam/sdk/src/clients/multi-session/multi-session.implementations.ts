import { client } from "@beep/iam-sdk/adapters";
import {
  MultiSessionContractSet,
  MultiSessionListContract,
  MultiSessionRevokeContract,
  MultiSessionSetActiveContract,
  type MultiSessionTokenPayload,
} from "@beep/iam-sdk/clients/multi-session/multi-session.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

const MultiSessionListHandler = Effect.fn("MultiSessionListHandler")(
  function* () {
    const continuation = makeFailureContinuation({
      contract: "MultiSessionList",
      metadata: () => ({
        plugin: "multiSession",
        method: "listDeviceSessions",
      }),
    });

    const result = yield* continuation.run((handlers) =>
      client.multiSession.listDeviceSessions(
        undefined,
        handlers.signal
          ? {
              onError: handlers.onError,
              signal: handlers.signal,
            }
          : {
              onError: handlers.onError,
            }
      )
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "MultiSessionListHandler returned no payload from Better Auth", {
        plugin: "multiSession",
        method: "listDeviceSessions",
      });
    }

    return yield* S.decodeUnknown(MultiSessionListContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.dieMessage(`MultiSessionListHandler failed to parse response: ${error.message}`),
  })
);

const MultiSessionSetActiveHandler = Effect.fn("MultiSessionSetActiveHandler")(
  function* (payload: MultiSessionTokenPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "MultiSessionSetActive",
      metadata: () => ({
        plugin: "multiSession",
        method: "setActive",
      }),
    });

    const result = yield* continuation.run((handlers) =>
      client.multiSession.setActive(
        {
          sessionToken: Redacted.value(payload.sessionToken),
        },
        handlers.signal
          ? {
              onError: handlers.onError,
              signal: handlers.signal,
            }
          : {
              onError: handlers.onError,
            }
      )
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "MultiSessionSetActiveHandler returned no payload from Better Auth", {
        plugin: "multiSession",
        method: "setActive",
      });
    }

    const decoded = yield* S.decodeUnknown(MultiSessionSetActiveContract.successSchema)(result.data);

    client.$store.notify("$sessionSignal");

    return decoded;
  },
  Effect.catchTags({
    ParseError: (error) => Effect.dieMessage(`MultiSessionSetActiveHandler failed to parse response: ${error.message}`),
  })
);

const MultiSessionRevokeHandler = Effect.fn("MultiSessionRevokeHandler")(
  function* (payload: MultiSessionTokenPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "MultiSessionRevoke",
      metadata: () => ({
        plugin: "multiSession",
        method: "revoke",
      }),
    });

    const result = yield* continuation.run((handlers) =>
      client.multiSession.revoke(
        {
          sessionToken: Redacted.value(payload.sessionToken),
        },
        handlers.signal
          ? {
              onError: handlers.onError,
              signal: handlers.signal,
            }
          : {
              onError: handlers.onError,
            }
      )
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "MultiSessionRevokeHandler returned no payload from Better Auth", {
        plugin: "multiSession",
        method: "revoke",
      });
    }

    const decoded = yield* S.decodeUnknown(MultiSessionRevokeContract.successSchema)(result.data);

    client.$store.notify("$sessionSignal");

    return decoded;
  },
  Effect.catchTags({
    ParseError: (error) => Effect.dieMessage(`MultiSessionRevokeHandler failed to parse response: ${error.message}`),
  })
);

export const MultiSessionImplementations = MultiSessionContractSet.of({
  MultiSessionList: MultiSessionListHandler,
  MultiSessionSetActive: MultiSessionSetActiveHandler,
  MultiSessionRevoke: MultiSessionRevokeHandler,
});
