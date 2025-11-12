import type { Contract } from "@beep/contract";
import { client } from "@beep/iam-sdk/adapters";
import { addFetchOptions, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  PasskeyAddContract,
  PasskeyContractKit,
  PasskeyListContract,
  PasskeyRemoveContract,
  PasskeyUpdateContract,
} from "@beep/iam-sdk/clients/passkey/passkey.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";

const PASSKEY_DOMAIN = "passkey" as const;

const toIamMetadata = (metadata: Contract.Metadata): Parameters<typeof IamError.match>[1] => ({
  domain: metadata.domain ?? PASSKEY_DOMAIN,
  method: metadata.method ?? PASSKEY_DOMAIN,
  plugin: metadata.domain ?? PASSKEY_DOMAIN,
});

const PasskeyListHandler = PasskeyListContract.implement(() => {
  const continuation = PasskeyListContract.continuation({
    supportsAbort: true,
    metadata: {
      overrides: {
        domain: PASSKEY_DOMAIN,
        method: "listUserPasskeys",
      },
    },
  });

  return continuation
    .run((handlers) => client.passkey.listUserPasskeys(undefined, withFetchOptions(handlers)))
    .pipe(Effect.flatMap(PasskeyListContract.decodeUnknownSuccess));
});

const PasskeyRemoveHandler = PasskeyRemoveContract.implement((payload) =>
  Effect.gen(function* () {
    const continuation = PasskeyRemoveContract.continuation({
      supportsAbort: true,
      metadata: {
        overrides: {
          domain: PASSKEY_DOMAIN,
          method: "deletePasskey",
        },
        ...(payload.passkey.id ? { extra: { passkeyId: payload.passkey.id } } : {}),
      },
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
    const continuation = PasskeyUpdateContract.continuation({
      supportsAbort: true,
      metadata: {
        overrides: {
          domain: PASSKEY_DOMAIN,
          method: "updatePasskey",
        },
        ...(payload.passkey.id ? { extra: { passkeyId: payload.passkey.id } } : {}),
      },
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
      return yield* new IamError(
        {},
        "PasskeyUpdateHandler returned no payload from Better Auth",
        toIamMetadata(continuation.metadata)
      );
    }

    return yield* PasskeyUpdateContract.decodeUnknownSuccess(result.data);
  })
);

const PasskeyAddHandler = PasskeyAddContract.implement((payload) =>
  // TS2322: Type Effect<void, IamError | UnknownError, never> is not assignable to type Effect<void, IamError, never>
  // Type IamError | UnknownError is not assignable to type IamError
  // Property customMessage is missing in type UnknownError but required in type IamError
  // errors.ts(17, 3): customMessage is declared here.
  // Contract.ts(1688, 52): The expected type comes from the return type of this signature.
  Effect.gen(function* () {
    const continuation = PasskeyAddContract.continuation({
      supportsAbort: true,
    });

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
      return yield* new IamError(
        {},
        "PasskeyAddHandler returned no payload from Better Auth",
        toIamMetadata(continuation.metadata)
      );
    }
    yield* continuation.raiseResult(result);

    return yield* PasskeyAddContract.decodeUnknownSuccess(result.data);
  })
);

export const passkeyLayer = PasskeyContractKit.toLayer({
  add: PasskeyAddHandler,
  list: PasskeyListHandler,
  remove: PasskeyRemoveHandler,
  update: PasskeyUpdateHandler,
});
