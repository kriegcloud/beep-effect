import { client } from "@beep/iam-sdk/adapters";
import { VerifyContractSet } from "@beep/iam-sdk/clients/verify/verify.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contractkit";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

import type { SendEmailVerificationPayload, SendVerifyPhonePayload, VerifyEmailPayload } from "./verify.contracts";

const SendEmailVerificationHandler = Effect.fn("SendEmailVerificationHandler")(function* (
  payload: SendEmailVerificationPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "SendEmailVerificationContract",
    metadata: () => ({
      plugin: "verification",
      method: "sendVerificationEmail",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.sendVerificationEmail({
      email: Redacted.value(payload.email),
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
});

const VerifyEmailHandler = Effect.fn("VerifyEmailHandler")(function* (payload: VerifyEmailPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "VerifyEmailContract",
    metadata: () => ({
      plugin: "verification",
      method: "verifyEmail",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.verifyEmail(
      {
        query: {
          token: Redacted.value(payload.token),
        },
      },
      handlers.signal
        ? {
            signal: handlers.signal,
            onSuccess: () => {
              payload.onSuccess(undefined);
            },
            onError: (ctx) => {
              payload.onFailure(undefined);
              handlers.onError(ctx);
            },
          }
        : {
            onSuccess: () => {
              payload.onSuccess(undefined);
            },
            onError: (ctx) => {
              payload.onFailure(undefined);
              handlers.onError(ctx);
            },
          }
    )
  );

  yield* continuation.raiseResult(result);
});

const SendVerifyPhoneHandler = Effect.fn("SendVerifyPhoneHandler")(function* (payload: SendVerifyPhonePayload.Type) {
  const { phoneNumber, code, updatePhoneNumber } = payload;
  const continuation = makeFailureContinuation({
    contract: "SendVerifyPhoneContract",
    metadata: () => ({
      plugin: "verification",
      method: "phone",
    }),
  });

  const result = yield* continuation.run(() =>
    client.phoneNumber.verify({
      phoneNumber: Redacted.value(phoneNumber),
      code: Redacted.value(code),
      updatePhoneNumber: updatePhoneNumber,
    })
  );

  yield* continuation.raiseResult(result);
});

export const VerifyImplementations = VerifyContractSet.of({
  SendVerifyPhoneContract: SendVerifyPhoneHandler,
  SendEmailVerificationContract: SendEmailVerificationHandler,
  VerifyEmailContract: VerifyEmailHandler,
});
