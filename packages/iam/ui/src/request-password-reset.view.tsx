"use client";
import { paths } from "@beep/constants";
import { iam } from "@beep/iam-sdk";
import { FormHead, FormReturnLink } from "@beep/iam-ui/_components";
import { RequestResetPasswordForm } from "@beep/iam-ui/request-reset-password";
import { useRuntime } from "@beep/runtime-client";
import { PasswordIcon } from "@beep/ui/icons/password-icon/index";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
export const RequestPasswordResetView = () => {
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
          F.pipe(valueEffect, Effect.flatMap(iam.requestPasswordReset), runtime.runPromise)
        }
      />
      <FormReturnLink href={paths.auth.signIn} />
    </>
  );
};
