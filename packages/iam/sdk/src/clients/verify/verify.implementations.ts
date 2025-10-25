import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  SendEmailVerificationContract,
  VerifyContractKit,
  VerifyEmailContract,
} from "@beep/iam-sdk/clients/verify/verify.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import type { SendEmailVerificationPayload, VerifyEmailPayload, VerifyPhonePayload } from "./verify.contracts";

const metadataFactory = new MetadataFactory("verification");

const SendEmailVerificationMetadata = metadataFactory.make("sendVerificationEmail");
const VerifyEmailMetadata = metadataFactory.make("verifyEmail");
const VerifyPhoneMetadata = metadataFactory.make("verifyPhone");

const SendEmailVerificationHandler = Effect.fn("SendEmailVerificationHandler")(
  function* (payload: SendEmailVerificationPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "SendEmailVerificationContract",
      metadata: SendEmailVerificationMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.sendVerificationEmail({
        email: Redacted.value(payload.email),
        ...(payload.callbackURL === undefined ? {} : { callbackURL: payload.callbackURL }),
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    const response = result.data ?? { status: true };

    return yield* S.decodeUnknown(SendEmailVerificationContract.successSchema)(response);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, SendEmailVerificationMetadata())),
  })
);

const VerifyEmailHandler = Effect.fn("VerifyEmailHandler")(
  function* (payload: VerifyEmailPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "VerifyEmailContract",
      metadata: VerifyEmailMetadata,
    });

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
      return yield* new IamError({}, "VerifyEmailHandler returned no payload from Better Auth");
    }

    return yield* S.decodeUnknown(VerifyEmailContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, VerifyEmailMetadata())),
  })
);

const VerifyPhoneHandler = Effect.fn("VerifyPhoneHandler")(function* (payload: VerifyPhonePayload.Type) {
  const { phoneNumber, code, updatePhoneNumber } = payload;
  const continuation = makeFailureContinuation({
    contract: "VerifyPhoneContract",
    metadata: VerifyPhoneMetadata,
  });

  const result = yield* continuation.run((handlers) =>
    client.phoneNumber.verify({
      phoneNumber: Redacted.value(phoneNumber),
      code: Redacted.value(code),
      updatePhoneNumber: updatePhoneNumber,
      fetchOptions: withFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);
});

export const VerifyImplementations = VerifyContractKit.of({
  VerifyPhone: VerifyPhoneHandler,
  SendEmailVerification: SendEmailVerificationHandler,
  VerifyEmail: VerifyEmailHandler,
});
