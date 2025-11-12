import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, makeFailureContinuation, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import { AnonymousContractKit, AnonymousSignInContract } from "@beep/iam-sdk/clients/anonymous/anonymous.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";

const metadataFactory = new MetadataFactory("signIn");
const AnonymousSignInMetadata = metadataFactory.make("anonymous");

const AnonymousSignInHandler = AnonymousSignInContract.implement(
  Effect.fn(function* () {
    const continuation = makeFailureContinuation({
      contract: AnonymousSignInContract.name,
      metadata: AnonymousSignInMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.signIn.anonymous({
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError(
        {},
        "AnonymousSignInHandler returned no payload from Better Auth",
        AnonymousSignInMetadata()
      );
    }

    return yield* AnonymousSignInContract.decodeUnknownSuccess(result.data);
  })
);

export const AnonymousImplementations = AnonymousContractKit.of({
  AnonymousSignIn: AnonymousSignInHandler,
});
