"use client";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { withToast } from "@beep/ui/common";
import { useAtom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { VerifyService } from "./verify.service";

const verifyRuntime = makeAtomRuntime(VerifyService.Live);

const verifyPhoneAtom = verifyRuntime.fn(
  F.flow(
    VerifyService.VerifyPhone,
    withToast({
      onWaiting: "Verifying phone",
      onSuccess: "Phone verified.",
      onFailure: O.match({
        onNone: () => "Failed with unknown error.",
        onSome: (e) => e.message,
      }),
    })
  )
);
export const useVerifyPhone = () => {
  const [verifyPhoneResult, verifyPhone] = useAtom(verifyPhoneAtom);

  return {
    verifyPhoneResult,
    verifyPhone,
  };
};

export const sendEmailVerificationAtom = verifyRuntime.fn(
  F.flow(
    VerifyService.SendEmailVerification,
    withToast({
      onWaiting: "Sending verification email.",
      onSuccess: "Verification email sent.",
      onFailure: O.match({
        onNone: () => "Failed with unknown error.",
        onSome: (e) => e.message,
      }),
    })
  )
);
export const useSendEmailVerification = () => {
  const [sendEmailVerificationResult, sendEmailVerification] = useAtom(sendEmailVerificationAtom);

  return {
    sendEmailVerificationResult,
    sendEmailVerification,
  };
};

export const verifyEmailAtom = verifyRuntime.fn(
  F.flow(
    VerifyService.VerifyEmail,
    withToast({
      onWaiting: "Verifying email.",
      onSuccess: "Email verified.",
      onFailure: O.match({
        onNone: () => "Failed with unknown error.",
        onSome: (e) => e.message,
      }),
    })
  )
);
export const useVerifyEmail = () => {
  const [verifyEmailResult, verifyEmail] = useAtom(verifyEmailAtom);

  return {
    verifyEmailResult,
    verifyEmail,
  };
};
