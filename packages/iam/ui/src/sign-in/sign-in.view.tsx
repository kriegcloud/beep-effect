"use client";
import { AuthCallback, iam } from "@beep/iam-sdk";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { useRouter } from "@beep/ui/hooks";
import { RouterLink } from "@beep/ui/routing";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { useSearchParams } from "next/navigation";
import { FormDivider, FormHead } from "../_components";
import { SignInEmailForm } from "./sign-in-email.form";
import { SignInPasskey } from "./sign-in-passkey";
import { SignInSocial } from "./sign-in-social";

export const SignInView = () => {
  const runtime = useRuntime();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = AuthCallback.getURL(searchParams);
  const signUpHref =
    callbackURL === AuthCallback.defaultTarget
      ? paths.auth.signUp
      : `${paths.auth.signUp}?${AuthCallback.paramName}=${encodeURIComponent(callbackURL)}`;
  const runEmailSignIn = makeRunClientPromise(runtime, "iam.signIn.email");
  const runSocialSignIn = makeRunClientPromise(runtime, "iam.signIn.social");
  const runPasskeySignIn = makeRunClientPromise(runtime, "iam.signIn.passkey");
  return (
    <>
      <FormHead
        title="Sign in to your account"
        description={
          <>
            {`Don’t have an account? `}
            <Link component={RouterLink} href={signUpHref} variant="subtitle2">
              Get started
            </Link>
          </>
        }
        sx={{ textAlign: { xs: "center", md: "left" } }}
      />
      <SignInEmailForm // F.pipe(iam.signIn.email)
        onSubmit={async (valueEffect) => {
          return F.pipe(F.identity(Effect.flatMap(iam.signIn.email)), (mapper) =>
            F.pipe(valueEffect, mapper, runEmailSignIn)
          );
        }}
      />
      <FormDivider />
      <Stack spacing={2}>
        <SignInSocial signIn={async (provider) => runSocialSignIn(iam.signIn.social({ provider }))} />
        <SignInPasskey
          onSubmit={async () =>
            runPasskeySignIn(iam.signIn.passkey({ onSuccess: () => void router.replace(callbackURL) }))
          }
        />
      </Stack>
    </>
  );
};
