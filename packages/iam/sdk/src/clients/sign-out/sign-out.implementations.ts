import { client } from "@beep/iam-sdk/adapters";
import { withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import { SignOutContractKit } from "@beep/iam-sdk/clients/sign-out/sign-out.contracts";
import * as Effect from "effect/Effect";
import { SignOutContract } from "./sign-out.contracts";

const SignOutHandler = SignOutContract.implement(
  Effect.fn(function* ({ onSuccess }, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.signOut({
        fetchOptions: withFetchOptions(handlers, {
          onSuccess: () => onSuccess()
        }),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.error == null) {
      client.$store.notify("$sessionSignal");
    }
  })
);

export const SignOutImplementations = SignOutContractKit.of({
  SignOut: SignOutHandler,
});

export const signOutLayer = SignOutContractKit.toLayer(SignOutImplementations);
