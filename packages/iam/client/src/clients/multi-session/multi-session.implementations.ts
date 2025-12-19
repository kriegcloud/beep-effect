import { client } from "@beep/iam-client/adapters";
import { withFetchOptions } from "@beep/iam-client/clients/_internal";
import {
  MultiSessionContractKit,
  MultiSessionListContract,
  MultiSessionRevokeContract,
  MultiSessionSetActiveContract,
} from "@beep/iam-client/clients/multi-session/multi-session.contracts";
import { IamError } from "@beep/iam-client/errors";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

const MultiSessionListHandler = MultiSessionListContract.implement(
  Effect.fn(function* (_, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.multiSession.listDeviceSessions(undefined, withFetchOptions(handlers))
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* IamError.new(
        {},
        "MultiSessionListHandler returned no payload from Better Auth",
        continuation.metadata
      );
    }

    return yield* MultiSessionListContract.decodeUnknownSuccess(result.data);
  })
);

const MultiSessionSetActiveHandler = MultiSessionSetActiveContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.multiSession.setActive(
        {
          sessionToken: Redacted.value(payload.sessionToken),
        },
        withFetchOptions(handlers)
      )
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* IamError.new(
        {},
        "MultiSessionSetActiveHandler returned no payload from Better Auth",
        continuation.metadata
      );
    }

    const decoded = yield* MultiSessionSetActiveContract.decodeUnknownSuccess(result.data);

    client.$store.notify("$sessionSignal");

    return decoded;
  })
);

const MultiSessionRevokeHandler = MultiSessionRevokeContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.multiSession.revoke(
        {
          sessionToken: Redacted.value(payload.sessionToken),
        },
        withFetchOptions(handlers)
      )
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* IamError.new(
        {},
        "MultiSessionRevokeHandler returned no payload from Better Auth",
        continuation.metadata
      );
    }

    const decoded = yield* MultiSessionRevokeContract.decodeUnknownSuccess(result.data);

    client.$store.notify("$sessionSignal");

    return decoded;
  })
);

export const MultiSessionImplementations = MultiSessionContractKit.of({
  MultiSessionList: MultiSessionListHandler,
  MultiSessionSetActive: MultiSessionSetActiveHandler,
  MultiSessionRevoke: MultiSessionRevokeHandler,
});

export const multiSessionLayer = MultiSessionContractKit.toLayer(MultiSessionImplementations);
