"use client";
import { clientEnv } from "@beep/core-env/client";
import { AuthCallback, iam } from "@beep/iam-sdk";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { useRouter } from "@beep/ui/hooks";
import { RouterLink } from "@beep/ui/routing";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { useSearchParams } from "next/navigation";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { FormDivider, FormHead } from "../_components";
import { SignInEmailForm } from "./sign-in-email.form";
import { SignInPasskey } from "./sign-in-passkey";
import { SignInSocial } from "./sign-in-social";

export const SignInView = () => {
  const runtime = useRuntime();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = AuthCallback.getURL(searchParams);
  const runEmailSignIn = makeRunClientPromise(runtime, "iam.signIn.email");
  const runSocialSignIn = makeRunClientPromise(runtime, "iam.signIn.social");
  const runPasskeySignIn = makeRunClientPromise(runtime, "iam.signIn.passkey");
  return (
    <GoogleReCaptchaProvider reCaptchaKey={Redacted.value(clientEnv.captchaSiteKey)}>
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
        onSubmit={async (valueEffect) => runEmailSignIn(Effect.flatMap(valueEffect, iam.signIn.email))}
      />
      <FormDivider />
      <Stack spacing={2}>
        <SignInSocial signIn={async (provider) => runSocialSignIn(iam.signIn.social({ provider }))} />
        <SignInPasskey
          onSubmit={async () =>
            runPasskeySignIn(
              iam.signIn.passkey({
                onSuccess: () => {
                  void router.push(callbackURL);
                },
              })
            )
          }
        />
      </Stack>
    </GoogleReCaptchaProvider>
  );
};
