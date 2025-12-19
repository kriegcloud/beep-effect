import { atomPromise } from "@beep/iam-client/clients/_internal";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { withToast } from "@beep/ui/common";
import { useAtomSet } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import { RecoverService } from "./recover.service";
export const recoverRuntime = makeAtomRuntime(RecoverService.Live);

export const resetPasswordAtom = recoverRuntime.fn(
  F.flow(
    RecoverService.ResetPassword,
    withToast({
      onWaiting: "Resetting password",
      onSuccess: "Password reset successfully",
      onFailure: (e) => e.message,
    })
  )
);

export const requestResetPasswordAtom = recoverRuntime.fn(
  F.flow(
    RecoverService.RequestResetPassword,
    withToast({
      onWaiting: "Requesting reset password",
      onSuccess: "Reset password requested successfully",
      onFailure: (e) => e.message,
    })
  )
);

export const useRecover = () => {
  const resetPassword = useAtomSet(resetPasswordAtom, atomPromise);
  const requestResetPassword = useAtomSet(requestResetPasswordAtom, atomPromise);

  return {
    resetPassword,
    requestResetPassword,
  };
};
