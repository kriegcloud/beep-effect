import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, makeFailureContinuation, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import { AnonymousContractKit, AnonymousSignInContract } from "@beep/iam-sdk/clients/anonymous/anonymous.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const metadataFactory = new MetadataFactory("signIn");
const AnonymousSignInMetadata = metadataFactory.make("anonymous");

const AnonymousSignInHandler = Effect.fn("AnonymousSignInHandler")(
  function* () {
    const continuation = makeFailureContinuation({
      contract: "AnonymousSignIn",
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

    return yield* S.decodeUnknown(AnonymousSignInContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, AnonymousSignInMetadata())),
  })
);

export const AnonymousImplementations = AnonymousContractKit.of({
  AnonymousSignIn: AnonymousSignInHandler,
});
