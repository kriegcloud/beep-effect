import { client } from "@beep/iam-client/adapters";
import { withCaptchaHeaders, withFetchOptions } from "@beep/iam-client/clients/_internal";
import { SignUpContractKit, SignUpEmailContract } from "@beep/iam-client/clients/sign-up/sign-up.contracts";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

const SignUpEmailHandler = SignUpEmailContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const { captchaResponse, ...rest } = payload;

    const result = yield* continuation.run((handlers) =>
      client.signUp.email({
        email: Redacted.value(rest.email),
        password: Redacted.value(rest.password),
        name: `${rest.firstName} ${rest.lastName}`,
        fetchOptions: withFetchOptions(handlers, withCaptchaHeaders(Redacted.value(captchaResponse))),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.error == null) {
      client.$store.notify("$sessionSignal");
    }
  })
);

export const SignUpImplementations = SignUpContractKit.of({
  SignUpEmail: SignUpEmailHandler,
});

export const signUpLayer = SignUpContractKit.toLayer(SignUpImplementations);
