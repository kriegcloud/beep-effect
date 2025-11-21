import { client } from "@beep/iam-sdk/adapters";
import { withCaptchaHeaders, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import { SignUpContractKit, SignUpEmailContract } from "@beep/iam-sdk/clients/sign-up/sign-up.contracts";
import * as Effect from "effect/Effect";

const SignUpEmailHandler = SignUpEmailContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const { captchaResponse, ...rest } = payload;

    const result = yield* continuation.run((handlers) =>
      client.signUp.email({
        email: rest.email,
        password: rest.password,
        name: `${rest.firstName} ${rest.lastName}`,
        fetchOptions: withFetchOptions(handlers, withCaptchaHeaders(captchaResponse)),
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
