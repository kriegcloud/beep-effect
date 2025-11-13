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
import * as F from "effect/Function";

const PASSKEY_DOMAIN = "passkey" as const;

const toIamMetadata = (metadata: Contract.Metadata): Parameters<typeof IamError.match>[1] => ({
  domain: metadata.domain ?? PASSKEY_DOMAIN,
  method: metadata.method ?? PASSKEY_DOMAIN,
  plugin: metadata.domain ?? PASSKEY_DOMAIN,
});

const PasskeyListHandler = PasskeyListContract.implement((_payload, _ctx, continuation) =>
  continuation
    .run((handlers) => client.passkey.listUserPasskeys(undefined, withFetchOptions(handlers)))
    .pipe(Effect.flatMap(PasskeyListContract.decodeUnknownSuccess))
);

const PasskeyRemoveHandler = PasskeyRemoveContract.implement((payload, _ctx, continuation) =>
  F.pipe(
    continuation.run((handlers) =>
      client.passkey.deletePasskey(
        addFetchOptions(handlers, {
          id: payload.passkey.id,
        })
      )
    ),
    Effect.flatMap((result) =>
      Effect.flatMap(continuation.raiseResult(result), () => PasskeyRemoveContract.decodeSuccess(result.data))
    )
  )
);

const PasskeyUpdateHandler = PasskeyUpdateContract.implement((payload, _ctx, continuation) =>
  F.pipe(
    continuation.run((handlers) =>
      client.passkey.updatePasskey(
        addFetchOptions(handlers, {
          id: payload.passkey.id,
          name: payload.passkey.name,
        })
      )
    ),
    Effect.flatMap((result) =>
      Effect.flatMap(continuation.raiseResult(result), () => PasskeyUpdateContract.decodeUnknownSuccess(result.data))
    )
  )
);

const PasskeyAddHandler = PasskeyAddContract.implement((payload, _ctx, continuation) =>
  Effect.gen(function* () {
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
