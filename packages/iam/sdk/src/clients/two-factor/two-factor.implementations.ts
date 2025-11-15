import { client } from "@beep/iam-sdk/adapters";
import { withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  SendOtpContract,
  TwoFactorContractKit,
  VerifyOtpContract,
  VerifyTotpContract,
} from "@beep/iam-sdk/clients/two-factor/two-factor.contracts";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

const SendOtpHandler = SendOtpContract.implement(
  Effect.fn(function* (_, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.twoFactor.sendOtp({
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);

const VerifyOtpHandler = VerifyOtpContract.implement(
  Effect.fn(function* (payload, { continuation }) {
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
  Effect.fn(function* (payload, { continuation }) {
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

export const twoFactorLayer = TwoFactorContractKit.toLayer(TwoFactorImplementations);
