import {client} from "@beep/iam-sdk/adapters";
import {MetadataFactory, makeFailureContinuation, withFetchOptions} from "@beep/iam-sdk/clients/_internal";
import {
  PasskeyAddContract,
  PasskeyContractKit,
  PasskeyRemoveContract,
  PasskeyListContract,
  PasskeyUpdateContract,
} from "@beep/iam-sdk/clients/passkey-v2/passkey.contracts";
import {IamError} from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const metadataFactory = new MetadataFactory("passkey");

const PasskeyAddMetadata = metadataFactory.make("addPasskey");
const PasskeyListMetadata = metadataFactory.make("listUserPasskeys");
const PasskeyRemoveMetadata = metadataFactory.make("deletePasskey");
const PasskeyUpdateMetadata = metadataFactory.make("updatePasskey");


const PasskeyListHandler = Effect.fn("PasskeyListHandler")(
  function* () {
    const continuation = makeFailureContinuation(
      {
        contract: "PasskeyList",
        metadata: PasskeyListMetadata,
      },
      {
        supportsAbort: true,
      }
    );

    const result = yield* continuation.run((handlers) =>
      client.passkey.listUserPasskeys(undefined, withFetchOptions(handlers))
    );


    return yield* S.decodeUnknown(PasskeyListContract.successSchema)(
      result
    );
  },
  Effect.catchTags({ParseError: (error) => Effect.fail(IamError.match(error, PasskeyListMetadata()))})
);

const PasskeyRemoveHandler = Effect.fn("PasskeyRemoveHandler")(
  function* (payload: typeof PasskeyRemoveContract.payloadSchema.Type) {
    const continuation = makeFailureContinuation({
      contract: "PasskeyRemove",
      metadata: PasskeyRemoveMetadata,
    });


    const result = yield* continuation.run((handlers) =>
      client.passkey.deletePasskey(
        {
          id: payload.passkey.id,
        },
        withFetchOptions(handlers)
      )
    );

    yield* continuation.raiseResult(result);

    return yield* S.decodeUnknown(PasskeyRemoveContract.successSchema)(result.data);
  },
  Effect.catchTags({ParseError: (error) => Effect.fail(IamError.match(error, PasskeyRemoveMetadata()))})
);

const PasskeyUpdateHandler = Effect.fn("PasskeyUpdateHandler")(
  function* (payload: typeof PasskeyUpdateContract.payloadSchema.Type) {
    const continuation = makeFailureContinuation({
      contract: "PasskeyUpdate",
      metadata: PasskeyUpdateMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.passkey.updatePasskey(
        {
          id: payload.passkey.id,
          name: payload.passkey.name,
        },
        withFetchOptions(handlers)
      )
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError(
        {},
        "PasskeyUpdateHandler returned no payload from Better Auth",
        PasskeyUpdateMetadata()
      );
    }

    return yield* S.decodeUnknown(PasskeyUpdateContract.successSchema)(result.data);
  },
  Effect.catchTags({ParseError: (error) => Effect.fail(IamError.match(error, PasskeyUpdateMetadata()))})
);

export const PasskeyImplementations = PasskeyContractKit.of({
  PasskeyAdd: (payload) => Effect.gen(function* () {
    const continuation = makeFailureContinuation(
      {
        contract: "PasskeyAdd",
        metadata: PasskeyAddMetadata,
      },
      {
        supportsAbort: true,
      }
    );

    const result = yield* continuation.run((handlers) =>
      client.passkey.addPasskey(
        {
          name: payload.name ?? undefined,
          authenticatorAttachment: payload.authenticatorAttachment ?? undefined,
          useAutoRegister: payload.useAutoRegister ?? undefined,
          fetchOptions: withFetchOptions(handlers),
        },
        withFetchOptions(handlers)
      )
    );

    return yield* S.decodeUnknown(PasskeyAddContract.successSchema)(result?.data);
  }).pipe(Effect.catchTags({ParseError: (error) => Effect.fail(IamError.match(error, PasskeyAddMetadata()))})),
  PasskeyList: PasskeyListHandler,
  PasskeyRemove: PasskeyRemoveHandler,
  PasskeyUpdate: PasskeyUpdateHandler,
});


export const passkeyLayer = PasskeyContractKit.toLayer(PasskeyImplementations);

