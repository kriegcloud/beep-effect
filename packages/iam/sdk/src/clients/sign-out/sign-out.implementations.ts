import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import { SignOutContractKit } from "@beep/iam-sdk/clients/sign-out/sign-out.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/clients/_internal";
import * as Effect from "effect/Effect";
import type { SignOutPayload } from "./sign-out.contracts";

const metadataFactory = new MetadataFactory("sign-out");

const SignOutMetadata = metadataFactory.make("signOut");

const SignOutHandler = Effect.fn("SignOutHandler")(function* (payload: SignOutPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "SignOutContract",
    metadata: SignOutMetadata,
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
});

export const SignOutImplementations = SignOutContractKit.of({
  SignOut: SignOutHandler,
});
