import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { withToast } from "@beep/ui/common";
import { useAtomSet } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { RecoverService } from "./recover.service";
export const recoverRuntime = makeAtomRuntime(RecoverService.Live);

export const resetPasswordAtom = recoverRuntime.fn(
  F.flow(
    RecoverService.ResetPassword,
    withToast({
      onWaiting: "Resetting password",
      onSuccess: "Password reset successfully",
      onFailure: O.match({
        onNone: () => "Password reset failed",
        onSome: (error) => error.message,
      }),
    })
  )
);

export const requestResetPasswordAtom = recoverRuntime.fn(
  F.flow(
    RecoverService.RequestResetPassword,
    withToast({
      onWaiting: "Requesting reset password",
      onSuccess: "Reset password requested successfully",
      onFailure: O.match({
        onNone: () => "Reset password request failed",
        onSome: (error) => error.message,
      }),
    })
  )
);

export const useRecover = () => {
  const resetPassword = useAtomSet(resetPasswordAtom, {
    mode: "promise",
  });
  const requestResetPassword = useAtomSet(requestResetPasswordAtom, {
    mode: "promise",
  });

  return {
    resetPassword,
    requestResetPassword,
  };
};
