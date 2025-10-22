import { client } from "@beep/iam-sdk/adapters";
import { TwoFactorContractKit } from "@beep/iam-sdk/clients/two-factor/two-factor.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type { VerifyOtpPayload, VerifyTotpPayload } from "./two-factor.contracts";

const SendOtpHandler = Effect.fn("SendOtpContract")(function* () {
  const continuation = makeFailureContinuation({
    contract: "SendOtpContract",
    metadata: () => ({
      plugin: "two-factor",
      method: "sendOtp",
    }),
  });

  const result = yield* continuation.run(() => client.twoFactor.sendOtp());

  yield* continuation.raiseResult(result);
});

const VerifyOtpHandler = Effect.fn("VerifyOtpHandler")(function* (payload: VerifyOtpPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "VerifyOtpContract",
    metadata: () => ({
      plugin: "two-factor",
      method: "verifyOtp",
    }),
  });

  const result = yield* continuation.run(() =>
    client.twoFactor.verifyOtp({
      code: Redacted.value(payload.code),
    })
  );

  yield* continuation.raiseResult(result);
});

const VerifyTotpHandler = Effect.fn("VerifyTotpHandler")(function* (payload: VerifyTotpPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "VerifyTotpContract",
    metadata: () => ({
      plugin: "two-factor",
      method: "verifyTotp",
    }),
  });

  const result = yield* continuation.run(() =>
    client.twoFactor.verifyTotp({
      code: Redacted.value(payload.code),
    })
  );

  yield* continuation.raiseResult(result);
});

export const TwoFactorImplementations = TwoFactorContractKit.of({
  SendOtp: SendOtpHandler,
  VerifyOtp: VerifyOtpHandler,
  VerifyTotp: VerifyTotpHandler,
});
