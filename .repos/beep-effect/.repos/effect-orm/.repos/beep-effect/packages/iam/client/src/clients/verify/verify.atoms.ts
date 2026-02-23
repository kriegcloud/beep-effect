"use client";
import type { Contract } from "@beep/contract";
import { makeAtomRuntime } from "@beep/runtime-client/runtime";
import { withToast } from "@beep/ui/common";
import { useAtomSet } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as S from "effect/Schema";

import { SendEmailVerificationContract } from "./verify.contracts";
import { VerifyService } from "./verify.service";

const verifyRuntime = makeAtomRuntime(VerifyService.Live);

const verifyPhoneAtom = verifyRuntime.fn(
  F.flow(
    VerifyService.VerifyPhone,
    withToast({
      onWaiting: "Verifying phone",
      onSuccess: "Phone verified.",
      onFailure: (e) => e.message,
    })
  )
);
export const useVerifyPhone = () => {
  const verifyPhone = useAtomSet(verifyPhoneAtom);

  return {
    verifyPhone,
  };
};

export const sendEmailVerificationAtom = verifyRuntime.fn(
  F.flow(
    VerifyService.SendEmailVerification,
    withToast({
      onWaiting: "Sending verification email.",
      onSuccess: "Verification email sent.",
      onFailure: (e) => e.message,
    })
  )
);
export const useSendEmailVerification = () => {
  const sendEmailVerification = useAtomSet(sendEmailVerificationAtom);

  const handleSendEmailVerification = (payload: Contract.PayloadEncoded<typeof SendEmailVerificationContract>) => {
    sendEmailVerification(S.decodeUnknownSync(SendEmailVerificationContract.payloadSchema)(payload));
  };

  return {
    sendEmailVerification: handleSendEmailVerification,
  };
};

export const verifyEmailAtom = verifyRuntime.fn(
  F.flow(
    VerifyService.VerifyEmail,
    withToast({
      onWaiting: "Verifying email.",
      onSuccess: "Email verified.",
      onFailure: (e) => e.message,
    })
  )
);
export const useVerifyEmail = () => {
  const verifyEmail = useAtomSet(verifyEmailAtom);

  return {
    verifyEmail,
  };
};
