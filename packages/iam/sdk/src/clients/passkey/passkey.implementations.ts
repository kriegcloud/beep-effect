import { client } from "@beep/iam-sdk/adapters";
import { addFetchOptions, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  PasskeyAddContract,
  PasskeyContractKit,
  PasskeyListContract,
  PasskeyRemoveContract,
  PasskeyUpdateContract,
} from "@beep/iam-sdk/clients/passkey/passkey.contracts";
import * as Effect from "effect/Effect";

const PasskeyListHandler = PasskeyListContract.implement(
  Effect.fn(function* (_, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.passkey.listUserPasskeys(undefined, withFetchOptions(handlers))
    );
    yield* continuation.raiseResult(result);

    return yield* PasskeyListContract.decodeUnknownSuccess(result.data);
  })
);

const PasskeyRemoveHandler = PasskeyRemoveContract.implement(
  Effect.fn(function* (payload, { continuation }) {
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

const PasskeyUpdateHandler = PasskeyUpdateContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.passkey.updatePasskey(
        addFetchOptions(handlers, {
          id: payload.passkey.id,
          name: payload.passkey.name,
        })
      )
    );

    yield* continuation.raiseResult(result);

    return yield* PasskeyUpdateContract.decodeUnknownSuccess(result.data);
  })
);

const PasskeyAddHandler = PasskeyAddContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    yield* continuation.run((handlers) =>
      client.passkey.addPasskey(
        addFetchOptions(handlers, {
          name: payload.name ?? undefined,
          authenticatorAttachment: payload.authenticatorAttachment ?? undefined,
          useAutoRegister: payload.useAutoRegister ?? undefined,
        })
      )
    );
  })
);

export const passkeyLayer = PasskeyContractKit.toLayer({
  add: PasskeyAddHandler,
  listUserPasskeys: PasskeyListHandler,
  remove: PasskeyRemoveHandler,
  update: PasskeyUpdateHandler,
});
