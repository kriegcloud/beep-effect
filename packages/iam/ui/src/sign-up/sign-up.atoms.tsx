import { SignUpImplementations } from "@beep/iam-sdk/clients";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { withToast } from "@beep/ui/common/with-toast";
import { useAtom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const runtime = makeAtomRuntime(Layer.empty);

const signUpToastOptions = {
  onWaiting: "Signing up",
  onSuccess: "Signed up successfully",
  onFailure: O.match({
    onNone: () => "Failed with unknown error.",
    onSome: (e: { message: string }) => e.message,
  }),
} as const;

const signUpEmailAtom = runtime.fn(F.flow(SignUpImplementations.SignUpEmail, withToast(signUpToastOptions)));
export const useSignUpEmail = () => {
  const [signUpResult, signUpEmail] = useAtom(signUpEmailAtom);
  return {
    signUpResult,
    signUpEmail,
  };
};
