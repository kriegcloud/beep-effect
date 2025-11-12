import { client } from "@beep/iam-sdk/adapters";
import {
  addFetchOptions,
  MetadataFactory,
  makeFailureContinuation,
  withFetchOptions,
} from "@beep/iam-sdk/clients/_internal";
import {
  PasskeyAddContract,
  PasskeyContractKit,
  PasskeyListContract,
  PasskeyRemoveContract,
  PasskeyUpdateContract,
} from "@beep/iam-sdk/clients/passkey/passkey.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const metadataFactory = new MetadataFactory("passkey");

const PasskeyListHandler = PasskeyListContract.implement(() =>
  F.pipe(
    makeFailureContinuation(
      {
        contract: PasskeyListContract.name,
        metadata: metadataFactory.make("listUserPasskeys"),
      },
      {
        supportsAbort: true,
      }
    ),
    (continuation) =>
      continuation
        .run((handlers) => client.passkey.listUserPasskeys(undefined, withFetchOptions(handlers)))
        .pipe(Effect.flatMap(PasskeyListContract.decodeUnknownSuccess))
  )
);

const PasskeyRemoveHandler = PasskeyRemoveContract.implement((payload) =>
  Effect.gen(function* () {
    const continuation = makeFailureContinuation({
      contract: PasskeyRemoveContract.name,
      metadata: metadataFactory.make("deletePasskey"),
    });

    const result = yield* continuation.run((handlers) =>
      client.passkey.deletePasskey(
        addFetchOptions(handlers, {
          id: payload.passkey.id,
        })
      )
    );

    yield* continuation.raiseResult(result);

    return yield* PasskeyRemoveContract.decodeSuccess(result.data);
  })
);

const PasskeyUpdateHandler = PasskeyUpdateContract.implement((payload) =>
  Effect.gen(function* () {
    const metadata = metadataFactory.make("updatePasskey");
    const continuation = makeFailureContinuation({
      contract: PasskeyRemoveContract.name,
      metadata: metadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.passkey.updatePasskey(
        addFetchOptions(handlers, {
          id: payload.passkey.id,
          name: payload.passkey.name,
        })
      )
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "PasskeyUpdateHandler returned no payload from Better Auth", metadata());
    }

    return yield* PasskeyUpdateContract.decodeUnknownSuccess(result.data);
  })
);

const PasskeyAddHandler = PasskeyAddContract.implement((payload) =>
  Effect.gen(function* () {
    const metadata = metadataFactory.make("addPasskey");
    const continuation = makeFailureContinuation(
      {
        contract: PasskeyAddContract.name,
        metadata,
      },
      {
        supportsAbort: true,
      }
    );

    const result = yield* continuation.run((handlers) =>
      client.passkey.addPasskey(
        addFetchOptions(handlers, {
          name: payload.name ?? undefined,
          authenticatorAttachment: payload.authenticatorAttachment ?? undefined,
          useAutoRegister: payload.useAutoRegister ?? undefined,
        })
      )
    );

    if (result?.data == null) {
      return yield* new IamError({}, "PasskeyAddHandler returned no payload from Better Auth", metadata());
    }
    yield* continuation.raiseResult(result);

    return yield* PasskeyAddContract.decodeUnknownSuccess(result?.data);
  })
);

export const passkeyLayer = PasskeyContractKit.toLayer({
  add: PasskeyAddHandler,
  list: PasskeyListHandler,
  remove: PasskeyRemoveHandler,
  update: PasskeyUpdateHandler,
});
