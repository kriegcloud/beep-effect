"use client";
import { iamAtomRuntime } from "@beep/iam-sdk/clients/runtime";
import { withToast } from "@beep/ui/common";
import { useAtom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { VerifyImplementations } from "./verify.implementations";

const verifyPhoneAtom = iamAtomRuntime.fn(
  F.flow(
    VerifyImplementations.VerifyPhone,
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

export const sendEmailVerificationAtom = iamAtomRuntime.fn(
  F.flow(
    VerifyImplementations.SendEmailVerification,
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

export const verifyEmailAtom = iamAtomRuntime.fn(
  F.flow(
    VerifyImplementations.VerifyEmail,
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
