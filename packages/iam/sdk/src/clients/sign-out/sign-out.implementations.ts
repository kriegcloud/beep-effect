import { client } from "@beep/iam-sdk/adapters";
import { SignOutContractSet } from "@beep/iam-sdk/clients/sign-out/sign-out.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contractkit";
import * as Effect from "effect/Effect";
import type { SignOutPayload } from "./sign-out.contracts";

const SignOutHandler = Effect.fn("SignOutHandler")(function* (payload: SignOutPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "SignOutContract",
    metadata: () => ({
      plugin: "core",
      method: "signOut",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.signOut({
      fetchOptions: handlers.signal
        ? {
            signal: handlers.signal,
            onSuccess: () => payload.onSuccess(undefined),
            onError: handlers.onError,
          }
        : {
            onSuccess: () => payload.onSuccess(undefined),
            onError: handlers.onError,
          },
    })
  );

  yield* continuation.raiseResult(result);

  if (result.error == null) {
    client.$store.notify("$sessionSignal");
  }
});

export const SignOutImplementations = SignOutContractSet.of({
  SignOutContract: SignOutHandler,
});
