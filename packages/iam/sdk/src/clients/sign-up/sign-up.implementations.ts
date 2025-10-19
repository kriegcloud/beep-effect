import { client } from "@beep/iam-sdk/adapters";
import { SignUpContractSet } from "@beep/iam-sdk/clients/sign-up/sign-up.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type { SignUpEmailPayload } from "./sign-up.contracts";

const SignUpEmailHandler = Effect.fn("SignUpEmailHandler")(function* (payload: SignUpEmailPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "SignUpEmail",
    metadata: () => ({
      plugin: "signUp",
      method: "email",
    }),
  });

  const { value } = payload;
  const { captchaResponse, ...rest } = value;

  const result = yield* continuation.run((handlers) =>
    client.signUp.email({
      ...rest,
      fetchOptions: handlers.signal
        ? {
            headers: {
              "x-captcha-response": Redacted.value(captchaResponse),
            },
            onError: handlers.onError,
            signal: handlers.signal,
          }
        : {
            headers: {
              "x-captcha-response": Redacted.value(captchaResponse),
            },
            onError: handlers.onError,
          },
    })
  );

  yield* continuation.raiseResult(result);

  if (result.error == null) {
    client.$store.notify("$sessionSignal");
  }

  return result.error ? ({ _tag: "Failure" } as const) : ({ _tag: "Success" } as const);
});

export const SignUpImplementations = SignUpContractSet.of({
  SignUpEmail: SignUpEmailHandler,
});
