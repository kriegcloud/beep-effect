"use client";
import { iam } from "@beep/iam-sdk";
import { FormHead, FormReturnLink } from "@beep/iam-ui/_components";
import { useRuntime } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { EmailInboxIcon } from "@beep/ui/icons";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { VerifyPhoneForm } from "./verify-phone.form";

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
