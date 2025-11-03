import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  PasskeyAddContract,
  PasskeyAddPayload,
  PasskeyContractKit,
  PasskeyDeleteContract,
  PasskeyDeletePayload,
  PasskeyListContract,
  PasskeyUpdateContract,
  PasskeyUpdatePayload,
} from "@beep/iam-sdk/clients/passkey/passkey.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/clients/_internal";
import { IamError } from "@beep/iam-sdk/errors";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const metadataFactory = new MetadataFactory("passkey");

const PasskeyAddMetadata = metadataFactory.make("addPasskey");
const PasskeyListMetadata = metadataFactory.make("listUserPasskeys");
const PasskeyDeleteMetadata = metadataFactory.make("deletePasskey");
const PasskeyUpdateMetadata = metadataFactory.make("updatePasskey");

const PasskeyAddHandler = Effect.fn("PasskeyAddHandler")(
  function* (payload: PasskeyAddPayload.Type) {
    const continuation = makeFailureContinuation(
      {
        contract: "PasskeyAdd",
        metadata: PasskeyAddMetadata,
      },
      {
        supportsAbort: true,
      }
    );

    const encoded = yield* S.encode(PasskeyAddPayload)(payload);

    const result = yield* continuation.run((handlers) =>
      client.passkey.addPasskey(
        {
          name: encoded.name ?? undefined,
          authenticatorAttachment: encoded.authenticatorAttachment ?? undefined,
          useAutoRegister: encoded.useAutoRegister ?? undefined,
          fetchOptions: withFetchOptions(handlers),
        },
        withFetchOptions(handlers)
      )
    );

    if (result && typeof result === "object" && "error" in result) {
      yield* continuation.raiseResult(result);
    }

    return yield* S.decodeUnknown(PasskeyAddContract.successSchema)(undefined);
  },
  Effect.catchTags({ ParseError: (error) => Effect.fail(IamError.match(error, PasskeyAddMetadata())) })
);

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

    if (result.data == null) {
      return yield* Effect.fail(
        new IamError({}, "PasskeyListHandler returned no payload from Better Auth", PasskeyListMetadata())
      );
    }

    yield* continuation.raiseResult(result);

    return yield* S.decodeUnknown(PasskeyListContract.successSchema)(
      A.map(result.data, (passkey) => ({
        id: passkey.id,
        name: passkey.name,
      }))
    );
  },
  Effect.catchTags({ ParseError: (error) => Effect.fail(IamError.match(error, PasskeyListMetadata())) })
);

const PasskeyDeleteHandler = Effect.fn("PasskeyDeleteHandler")(
  function* (payload: PasskeyDeletePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "PasskeyDelete",
      metadata: PasskeyDeleteMetadata,
    });

    const encoded = yield* S.encode(PasskeyDeletePayload)(payload);

    const result = yield* continuation.run((handlers) =>
      client.passkey.deletePasskey(
        {
          id: encoded.id,
        },
        withFetchOptions(handlers)
      )
    );

    yield* continuation.raiseResult(result);

    return yield* S.decodeUnknown(PasskeyDeleteContract.successSchema)(result.data);
  },
  Effect.catchTags({ ParseError: (error) => Effect.fail(IamError.match(error, PasskeyDeleteMetadata())) })
);

const PasskeyUpdateHandler = Effect.fn("PasskeyUpdateHandler")(
  function* (payload: PasskeyUpdatePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "PasskeyUpdate",
      metadata: PasskeyUpdateMetadata,
    });

    const encoded = yield* S.encode(PasskeyUpdatePayload)(payload);
    const { id, name } = encoded;
    if (name == null) {
      return yield* new IamError({}, "PasskeyUpdateHandler received no name to apply", PasskeyUpdateMetadata());
    }

    const result = yield* continuation.run((handlers) =>
      client.passkey.updatePasskey(
        {
          id,
          name,
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
  Effect.catchTags({ ParseError: (error) => Effect.fail(IamError.match(error, PasskeyUpdateMetadata())) })
);

export const PasskeyImplementations = PasskeyContractKit.of({
  PasskeyAdd: PasskeyAddHandler,
  PasskeyList: PasskeyListHandler,
  PasskeyDelete: PasskeyDeleteHandler,
  PasskeyUpdate: PasskeyUpdateHandler,
});
