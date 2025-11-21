import { client } from "@beep/iam-sdk/adapters";
import { withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  SendEmailVerificationContract,
  VerifyContractKit,
  VerifyEmailContract,
  VerifyPhoneContract,
} from "@beep/iam-sdk/clients/verify/verify.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

const SendEmailVerificationHandler = SendEmailVerificationContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    yield* Console.log("PAYLOAD", JSON.stringify(payload, null, 2));
    const result = yield* continuation.run((handlers) =>
      client.sendVerificationEmail({
        email: payload.email,
        callbackURL: payload.callbackURL,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    const response = result.data ?? { status: true };

    return yield* SendEmailVerificationContract.decodeUnknownSuccess(response);
  })
);

const VerifyEmailHandler = VerifyEmailContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.verifyEmail(
        {
          query: {
            token: Redacted.value(payload.token),
            ...(payload.callbackURL === undefined ? {} : { callbackURL: payload.callbackURL }),
          },
        },
        withFetchOptions(handlers, {
          onSuccess: () => {
            payload.onSuccess(undefined);
          },
        })
      )
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* IamError.new({}, "VerifyEmailHandler returned no payload from Better Auth", continuation.metadata);
    }

    return yield* VerifyEmailContract.decodeUnknownSuccess(result.data);
  })
);

const VerifyPhoneHandler = VerifyPhoneContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const { phoneNumber, code, updatePhoneNumber } = payload;

    const result = yield* continuation.run((handlers) =>
      client.phoneNumber.verify({
        phoneNumber: Redacted.value(phoneNumber),
        code: Redacted.value(code),
        updatePhoneNumber: updatePhoneNumber,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);

export const VerifyImplementations = VerifyContractKit.of({
  VerifyPhone: VerifyPhoneHandler,
  SendEmailVerification: SendEmailVerificationHandler,
  VerifyEmail: VerifyEmailHandler,
});

export const verifyLayer = VerifyContractKit.toLayer(VerifyImplementations);
