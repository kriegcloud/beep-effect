"use client";
import { FormHead, FormReturnLink } from "@beep/iam-ui/_components";
import { paths } from "@beep/shared-domain";
import { EmailInboxIcon } from "@beep/ui/icons";
import { VerifyPhoneForm } from "./verify-phone.form";

export const VerifyPhoneView = () => {
  return (
    <>
      <FormHead
        icon={<EmailInboxIcon />}
        title={"Please check your phone!"}
        description={`We've sent a confirmation code to you your phone number.`}
      />
      <VerifyPhoneForm />
      <FormReturnLink href={paths.auth.signIn} sx={{ mt: 0 }} />
    </>
  );
};
