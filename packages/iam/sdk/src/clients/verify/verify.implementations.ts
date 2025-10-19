import { client } from "@beep/iam-sdk/adapters";
import {
  SendEmailVerificationContract,
  VerifyContractSet,
  VerifyEmailContract,
} from "@beep/iam-sdk/clients/verify/verify.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import type { SendEmailVerificationPayload, SendVerifyPhonePayload, VerifyEmailPayload } from "./verify.contracts";

const SendEmailVerificationMetadata = {
  plugin: "verification",
  method: "sendVerificationEmail",
} as const;

const VerifyEmailMetadata = {
  plugin: "verification",
  method: "verifyEmail",
} as const;

const SendEmailVerificationHandler = Effect.fn("SendEmailVerificationHandler")(
  function* (payload: SendEmailVerificationPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "SendEmailVerificationContract",
      metadata: () => SendEmailVerificationMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.sendVerificationEmail({
        email: Redacted.value(payload.email),
        ...(payload.callbackURL === undefined ? {} : { callbackURL: payload.callbackURL }),
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

    const response = result.data ?? { status: true };

    return yield* S.decodeUnknown(SendEmailVerificationContract.successSchema)(response);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, SendEmailVerificationMetadata)),
  })
);

const VerifyEmailHandler = Effect.fn("VerifyEmailHandler")(
  function* (payload: VerifyEmailPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "VerifyEmailContract",
      metadata: () => VerifyEmailMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.verifyEmail(
        {
          query: {
            token: Redacted.value(payload.token),
            ...(payload.callbackURL === undefined ? {} : { callbackURL: payload.callbackURL }),
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

    if (result.data == null) {
      return yield* new IamError({}, "VerifyEmailHandler returned no payload from Better Auth");
    }

    return yield* S.decodeUnknown(VerifyEmailContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, VerifyEmailMetadata)),
  })
);

const SendVerifyPhoneHandler = Effect.fn("SendVerifyPhoneHandler")(function* (payload: SendVerifyPhonePayload.Type) {
  const { phoneNumber, code, updatePhoneNumber } = payload;
  const continuation = makeFailureContinuation({
    contract: "SendVerifyPhoneContract",
    metadata: () => ({
      plugin: "verification",
      method: "phone",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.phoneNumber.verify({
      phoneNumber: Redacted.value(phoneNumber),
      code: Redacted.value(code),
      updatePhoneNumber: updatePhoneNumber,
      fetchOptions: handlers.signal
        ? {
            signal: handlers.signal,
            onError: handlers.onError,
          }
        : {
            onError: handlers.onError,
          },
    })
  );

  yield* continuation.raiseResult(result);
});

export const VerifyImplementations = VerifyContractSet.of({
  SendVerifyPhone: SendVerifyPhoneHandler,
  SendEmailVerification: SendEmailVerificationHandler,
  VerifyEmail: VerifyEmailHandler,
});
