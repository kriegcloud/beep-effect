"use client";
import { iam } from "@beep/iam-sdk";
import { FormHead, FormReturnLink } from "@beep/iam-ui/_components";
import { useRuntime } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { PasswordIcon } from "@beep/ui/icons/password-icon/index";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { RequestResetPasswordForm } from "./request-reset-password.form";
export const RequestResetPasswordView = () => {
  const runtime = useRuntime();
  return (
    <>
      <FormHead
        icon={<PasswordIcon />}
        title="Forgot your password?"
        description={`Please enter the email address associated with your account and we'll email you a link to reset your password.`}
      />
      <RequestResetPasswordForm
        onSubmit={async (valueEffect) =>
          F.pipe(valueEffect, Effect.flatMap(iam.recover.requestPasswordReset), runtime.runPromise)
        }
      />
      <FormReturnLink href={paths.auth.signIn} />
    </>
  );
};
