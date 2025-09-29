"use client";
import { iam } from "@beep/iam-sdk";
import { useRuntime } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { useRouter } from "@beep/ui/hooks";
import { RouterLink } from "@beep/ui/routing";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { FormDivider, FormHead } from "../_components";
import { SignInEmailForm } from "./sign-in-email.form";
import { SignInPasskey } from "./sign-in-passkey";
import { SignInSocial } from "./sign-in-social";

export const SignInView = () => {
  const runtime = useRuntime();
  const router = useRouter();
  return (
    <>
      <FormHead
        title="Sign in to your account"
        description={
          <>
            {`Don’t have an account? `}
            <Link component={RouterLink} href={paths.auth.signUp} variant="subtitle2">
              Get started
            </Link>
          </>
        }
        sx={{ textAlign: { xs: "center", md: "left" } }}
      />
      <SignInEmailForm
        onSubmit={async (valuesEffect) => F.pipe(valuesEffect, Effect.flatMap(iam.signIn.email), runtime.runPromise)}
      />
      <FormDivider />
      <Stack spacing={2}>
        <SignInSocial signIn={async (provider) => F.pipe({ provider }, iam.signIn.social, runtime.runPromise)} />
        <SignInPasskey
          onSubmit={async () => runtime.runPromise(iam.signIn.passkey({ onSuccess: () => router.push(paths.root) }))}
        />
      </Stack>
    </>
  );
};
