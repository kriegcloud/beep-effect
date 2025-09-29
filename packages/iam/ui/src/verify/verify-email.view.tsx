"use client";
import { iam } from "@beep/iam-sdk";
import { FormHead, FormReturnLink } from "@beep/iam-ui/_components";
import { useRuntime } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { EmailInboxIcon } from "@beep/ui/icons";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { VerifyEmailForm } from "./verify-email.form";

export const VerifyEmailView = () => {
  const runtime = useRuntime();
  return (
    <>
      <FormHead
        icon={<EmailInboxIcon />}
        title={"Please check your email!"}
        description={`We've emailed a confirmation link to you your email address.`}
      />
      <VerifyEmailForm
        onSubmit={async (valueEffect) => F.pipe(valueEffect, Effect.flatMap(iam.verify.email), runtime.runPromise)}
      />
      <FormReturnLink href={paths.auth.signIn} sx={{ mt: 0 }} />
    </>
  );
};
