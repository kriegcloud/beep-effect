import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  MultiSessionContractKit,
  MultiSessionListContract,
  MultiSessionRevokeContract,
  MultiSessionSetActiveContract,
  type MultiSessionTokenPayload,
} from "@beep/iam-sdk/clients/multi-session/multi-session.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/clients/_internal";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

const metadataFactory = new MetadataFactory("multiSession");

const MultiSessionListMetadata = metadataFactory.make("listDeviceSessions");

const MultiSessionSetActiveMetadata = metadataFactory.make("setActive");

const MultiSessionRevokeMetadata = metadataFactory.make("revoke");

const MultiSessionListHandler = Effect.fn("MultiSessionListHandler")(
  function* () {
    const continuation = makeFailureContinuation({
      contract: "MultiSessionList",
      metadata: MultiSessionListMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.multiSession.listDeviceSessions(undefined, withFetchOptions(handlers))
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
    ParseError: (error) => Effect.fail(IamError.match(error, MultiSessionListMetadata())),
  })
);

const MultiSessionSetActiveHandler = Effect.fn("MultiSessionSetActiveHandler")(
  function* (payload: MultiSessionTokenPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "MultiSessionSetActive",
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
        plugin: "multiSession",
        method: "setActive",
      });
    }

    const decoded = yield* S.decodeUnknown(MultiSessionSetActiveContract.successSchema)(result.data);

    client.$store.notify("$sessionSignal");

    return decoded;
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, MultiSessionSetActiveMetadata())),
  })
);

const MultiSessionRevokeHandler = Effect.fn("MultiSessionRevokeHandler")(
  function* (payload: MultiSessionTokenPayload.Type) {
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
        plugin: "multiSession",
        method: "revoke",
      });
    }

    const decoded = yield* S.decodeUnknown(MultiSessionRevokeContract.successSchema)(result.data);

    client.$store.notify("$sessionSignal");

    return decoded;
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, MultiSessionRevokeMetadata())),
  })
);

export const MultiSessionImplementations = MultiSessionContractKit.of({
  MultiSessionList: MultiSessionListHandler,
  MultiSessionSetActive: MultiSessionSetActiveHandler,
  MultiSessionRevoke: MultiSessionRevokeHandler,
});
