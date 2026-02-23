"use client";
import { FormHead, FormReturnLink } from "@beep/iam-ui/_components";
import { paths } from "@beep/shared-domain";
import { PasswordIcon } from "@beep/ui/icons/password-icon/index";
import { RequestResetPasswordForm } from "./request-reset-password.form";

export const RequestResetPasswordView = () => {
  return (
    <>
      <FormHead
        icon={<PasswordIcon />}
        title="Forgot your password?"
        description={`Please enter the email address associated with your account and we'll email you a link to reset your password.`}
      />
      <RequestResetPasswordForm />
      <FormReturnLink href={paths.auth.signIn} />
    </>
  );
};
