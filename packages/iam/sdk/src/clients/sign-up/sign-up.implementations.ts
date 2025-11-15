import { client } from "@beep/iam-sdk/adapters";
import { withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import { SignUpContractKit, SignUpEmailContract } from "@beep/iam-sdk/clients/sign-up/sign-up.contracts";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

const SignUpEmailHandler = SignUpEmailContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const { value } = payload;
    const { captchaResponse, ...rest } = value;

    const result = yield* continuation.run((handlers) =>
      client.signUp.email({
        ...rest,
        banned: false,
        isAnonymous: false,
        phoneNumberVerified: false,
        twoFactorEnabled: false,
        fetchOptions: withFetchOptions(handlers, {
          headers: {
            "x-captcha-response": Redacted.value(captchaResponse),
          },
        }),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.error == null) {
      client.$store.notify("$sessionSignal");
    }

    return result.error ? ({ _tag: "Failure" } as const) : ({ _tag: "Success" } as const);
  })
);

export const SignUpImplementations = SignUpContractKit.of({
  SignUpEmail: SignUpEmailHandler,
});
