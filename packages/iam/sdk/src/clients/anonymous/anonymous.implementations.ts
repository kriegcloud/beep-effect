import { client } from "@beep/iam-sdk/adapters";
import { withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import { AnonymousContractKit, AnonymousSignInContract } from "@beep/iam-sdk/clients/anonymous/anonymous.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";

const AnonymousSignInHandler = AnonymousSignInContract.implement(
  Effect.fn(function* (_, { continuation }) {
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
        continuation.metadata
      );
    }

    return yield* AnonymousSignInContract.decodeUnknownSuccess(result.data);
  })
);

export const AnonymousImplementations = AnonymousContractKit.of({
  AnonymousSignIn: AnonymousSignInHandler,
});
