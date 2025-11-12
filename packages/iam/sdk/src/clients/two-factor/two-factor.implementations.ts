import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, makeFailureContinuation, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  SendOtpContract,
  TwoFactorContractKit,
  VerifyOtpContract,
  VerifyTotpContract,
} from "@beep/iam-sdk/clients/two-factor/two-factor.contracts";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

const metadataFactory = new MetadataFactory("two-factor");

const SendOtpHandler = SendOtpContract.implement(
  Effect.fn(function* () {
    const continuation = makeFailureContinuation({
      contract: SendOtpContract.name,
      metadata: metadataFactory.make("sendOtp"),
    });

    const result = yield* continuation.run((handlers) =>
      client.twoFactor.sendOtp({
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);

const VerifyOtpHandler = VerifyOtpContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: VerifyOtpContract.name,
      metadata: metadataFactory.make("verifyOtp"),
    });

    const result = yield* continuation.run((handlers) =>
      client.twoFactor.verifyOtp({
        code: Redacted.value(payload.code),
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);

const VerifyTotpHandler = VerifyTotpContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: VerifyTotpContract.name,
      metadata: metadataFactory.make("verifyTotp"),
    });

    const result = yield* continuation.run((handlers) =>
      client.twoFactor.verifyTotp({
        code: Redacted.value(payload.code),
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);

export const TwoFactorImplementations = TwoFactorContractKit.of({
  SendOtp: SendOtpHandler,
  VerifyOtp: VerifyOtpHandler,
  VerifyTotp: VerifyTotpHandler,
});
