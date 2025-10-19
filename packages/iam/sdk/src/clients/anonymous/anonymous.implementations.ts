import { client } from "@beep/iam-sdk/adapters";
import { AnonymousContractSet, AnonymousSignInContract } from "@beep/iam-sdk/clients/anonymous/anonymous.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const AnonymousSignInHandler = Effect.fn("AnonymousSignInHandler")(
  function* () {
    const continuation = makeFailureContinuation({
      contract: "AnonymousSignIn",
      metadata: () => ({
        plugin: "signIn",
        method: "anonymous",
      }),
    });

    const result = yield* continuation.run((handlers) =>
      client.signIn.anonymous({
        fetchOptions: handlers.signal
          ? {
              onError: handlers.onError,
              signal: handlers.signal,
            }
          : {
              onError: handlers.onError,
            },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "AnonymousSignInHandler returned no payload from Better Auth", {
        plugin: "signIn",
        method: "anonymous",
      });
    }

    return yield* S.decodeUnknown(AnonymousSignInContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.dieMessage(`AnonymousSignInHandler failed to parse response: ${error.message}`),
  })
);

export const AnonymousImplementations = AnonymousContractSet.of({
  AnonymousSignIn: AnonymousSignInHandler,
});
