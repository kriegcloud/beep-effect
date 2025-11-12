import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, makeFailureContinuation, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import { SignOutContractKit } from "@beep/iam-sdk/clients/sign-out/sign-out.contracts";
import * as Effect from "effect/Effect";
import { SignOutContract } from "./sign-out.contracts";

const metadataFactory = new MetadataFactory("sign-out");

const SignOutHandler = SignOutContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: SignOutContract.name,
      metadata: metadataFactory.make("signOut"),
    });

    const result = yield* continuation.run((handlers) =>
      client.signOut({
        fetchOptions: withFetchOptions(handlers, {
          onSuccess: () => payload.onSuccess(undefined),
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
