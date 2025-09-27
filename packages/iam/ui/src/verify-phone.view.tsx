"use client";
import { paths } from "@beep/constants";
import { iam } from "@beep/iam-sdk";
import { FormHead, FormReturnLink } from "@beep/iam-ui/_components";
import { VerifyPhoneForm } from "@beep/iam-ui/verify-phone/verify-phone.form";
import { useRuntime } from "@beep/runtime-client";
import { EmailInboxIcon } from "@beep/ui/icons";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

export const VerifyPhoneView = () => {
  const runtime = useRuntime();
  return (
    <>
      <FormHead
        icon={<EmailInboxIcon />}
        title={"Please check your phone!"}
        description={`We've sent a confirmation code to you your phone number.`}
      />
      <VerifyPhoneForm
        onSubmit={async (valueEffect) => F.pipe(valueEffect, Effect.flatMap(iam.verify.phone), runtime.runPromise)}
      />
      <FormReturnLink href={paths.auth.signIn} sx={{ mt: 0 }} />
    </>
  );
};
