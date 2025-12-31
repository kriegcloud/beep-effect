import { client } from "@beep/iam-client/adapters";
import { withFetchOptions } from "@beep/iam-client/clients/_internal";
import {
  SendEmailVerificationContract,
  VerifyContractKit,
  VerifyPhoneContract,
} from "@beep/iam-client/clients/verify/verify.contracts";
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
});

export const verifyLayer = VerifyContractKit.toLayer(VerifyImplementations);
