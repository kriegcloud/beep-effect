import { client } from "@beep/iam-sdk/adapters";
import { addFetchOptions, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  PasskeyAddContract,
  PasskeyContractKit,
  PasskeyListContract,
  PasskeyRemoveContract,
  PasskeyUpdateContract,
} from "@beep/iam-sdk/clients/passkey/passkey.contracts";

const PasskeyListHandler = PasskeyListContract.implement((_, { continuation }) =>
  continuation.runDecode((handlers) => client.passkey.listUserPasskeys(undefined, withFetchOptions(handlers)))
);

const PasskeyRemoveHandler = PasskeyRemoveContract.implement((payload, { continuation }) =>
  continuation.runDecode((handlers) =>
    client.passkey.deletePasskey(
      addFetchOptions(handlers, {
        id: payload.passkey.id,
      })
    )
  )
);

const PasskeyUpdateHandler = PasskeyUpdateContract.implement((payload, { continuation }) =>
  continuation.runDecode((handlers) =>
    client.passkey.updatePasskey(
      addFetchOptions(handlers, {
        id: payload.passkey.id,
        name: payload.passkey.name,
      })
    )
  )
);

const PasskeyAddHandler = PasskeyAddContract.implement((payload, { continuation }) =>
  continuation.runVoid((handlers) =>
    client.passkey.addPasskey(
      addFetchOptions(handlers, {
        name: payload.name ?? undefined,
        authenticatorAttachment: payload.authenticatorAttachment ?? undefined,
        useAutoRegister: payload.useAutoRegister ?? undefined,
      })
    )
  )
);

export const passkeyLayer = PasskeyContractKit.toLayer({
  add: PasskeyAddHandler,
  listUserPasskeys: PasskeyListHandler,
  remove: PasskeyRemoveHandler,
  update: PasskeyUpdateHandler,
});
