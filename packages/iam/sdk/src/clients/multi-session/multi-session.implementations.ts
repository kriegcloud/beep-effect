import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, makeFailureContinuation, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  MultiSessionContractKit,
  MultiSessionListContract,
  MultiSessionRevokeContract,
  MultiSessionSetActiveContract,
} from "@beep/iam-sdk/clients/multi-session/multi-session.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

const metadataFactory = new MetadataFactory("multiSession");

const MultiSessionListMetadata = metadataFactory.make("listDeviceSessions");

const MultiSessionSetActiveMetadata = metadataFactory.make("setActive");

const MultiSessionRevokeMetadata = metadataFactory.make("revoke");

const MultiSessionListHandler = MultiSessionListContract.implement(
  Effect.fn(function* () {
    const continuation = makeFailureContinuation({
      contract: MultiSessionListContract.name,
      metadata: MultiSessionListMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.multiSession.listDeviceSessions(undefined, withFetchOptions(handlers))
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "MultiSessionListHandler returned no payload from Better Auth", {
        domain: "multiSession",
        method: "listDeviceSessions",
      });
    }

    return yield* MultiSessionListContract.decodeUnknownSuccess(result.data);
  })
);

const MultiSessionSetActiveHandler = MultiSessionSetActiveContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: MultiSessionSetActiveContract.name,
      metadata: MultiSessionSetActiveMetadata,
    });

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
      return yield* new IamError({}, "MultiSessionSetActiveHandler returned no payload from Better Auth", {
        domain: "multiSession",
        method: "setActive",
      });
    }

    const decoded = yield* MultiSessionSetActiveContract.decodeUnknownSuccess(result.data);

    client.$store.notify("$sessionSignal");

    return decoded;
  })
);

const MultiSessionRevokeHandler = MultiSessionRevokeContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: "MultiSessionRevoke",
      metadata: MultiSessionRevokeMetadata,
    });

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
      return yield* new IamError({}, "MultiSessionRevokeHandler returned no payload from Better Auth", {
        domain: "multiSession",
        method: "revoke",
      });
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
