import { client } from "@beep/iam-client/adapters";
import { withFetchOptions } from "@beep/iam-client/clients/_internal";
import {
  SendEmailVerificationContract,
  VerifyContractKit,
  VerifyEmailContract,
  VerifyPhoneContract,
} from "@beep/iam-client/clients/verify/verify.contracts";
import { IamError } from "@beep/iam-client/errors";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

export const SendEmailVerificationHandler = SendEmailVerificationContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    // yield* Console.log("PAYLOAD", JSON.stringify(payload, null, 2));
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
// TS4023: Exported variable VerifyEmailHandler has or is using name S from external module
// "/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/primitives/function"
// but cannot be named.
export const VerifyEmailHandler = VerifyEmailContract.implement(
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

export const VerifyPhoneHandler = VerifyPhoneContract.implement(
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
// TS4023: Exported variable VerifyImplementations has or is using name S from external module
// "/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/primitives/function"
// but cannot be named.
export const VerifyImplementations = VerifyContractKit.of({
  VerifyPhone: VerifyPhoneHandler,
  SendEmailVerification: SendEmailVerificationHandler,
  VerifyEmail: VerifyEmailHandler,
});
// TS4023: Exported variable verifyLayer has or is using name S from external module
// "/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/primitives/function"
export const verifyLayer = VerifyContractKit.toLayer(VerifyImplementations);
