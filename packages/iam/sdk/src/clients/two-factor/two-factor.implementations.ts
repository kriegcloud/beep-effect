import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import { TwoFactorContractKit } from "@beep/iam-sdk/clients/two-factor/two-factor.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type { VerifyOtpPayload, VerifyTotpPayload } from "./two-factor.contracts";

const metadataFactory = new MetadataFactory("two-factor");

const SendOtpMetadata = metadataFactory.make("sendOtp");
const VerifyOtpMetadata = metadataFactory.make("verifyOtp");
const VerifyTotpMetadata = metadataFactory.make("verifyTotp");

const SendOtpHandler = Effect.fn("SendOtpContract")(function* () {
  const continuation = makeFailureContinuation({
    contract: "SendOtpContract",
    metadata: SendOtpMetadata,
  });

  const result = yield* continuation.run((handlers) =>
    client.twoFactor.sendOtp({
      fetchOptions: withFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);
});

const VerifyOtpHandler = Effect.fn("VerifyOtpHandler")(function* (payload: VerifyOtpPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "VerifyOtpContract",
    metadata: VerifyOtpMetadata,
  });

  const result = yield* continuation.run((handlers) =>
    client.twoFactor.verifyOtp({
      code: Redacted.value(payload.code),
      fetchOptions: withFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);
});

const VerifyTotpHandler = Effect.fn("VerifyTotpHandler")(function* (payload: VerifyTotpPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "VerifyTotpContract",
    metadata: VerifyTotpMetadata,
  });

  const result = yield* continuation.run((handlers) =>
    client.twoFactor.verifyTotp({
      code: Redacted.value(payload.code),
      fetchOptions: withFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);
});

export const TwoFactorImplementations = TwoFactorContractKit.of({
  SendOtp: SendOtpHandler,
  VerifyOtp: VerifyOtpHandler,
  VerifyTotp: VerifyTotpHandler,
});
