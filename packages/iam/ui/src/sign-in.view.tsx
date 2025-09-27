"use client";
import { paths } from "@beep/constants";
import { iam } from "@beep/iam-sdk";
import { SignInEmailForm } from "@beep/iam-ui/sign-in-email";
import { SignInPasskey } from "@beep/iam-ui/sign-in-passkey";
import { useRuntime } from "@beep/runtime-client";
import { useRouter } from "@beep/ui/hooks";
import { RouterLink } from "@beep/ui/routing";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import * as Effect from "effect/Effect";
import { FormDivider, FormHead } from "./_components";
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
        onSubmit={async (valuesEffect) => Effect.flatMap(valuesEffect, iam.signIn.email).pipe(runtime.runPromise)}
      />
      <FormDivider />
      <Stack sx={{}} spacing={2}>
        <SignInSocial signIn={async (provider) => iam.signIn.social(provider).pipe(runtime.runPromise)} />
        <SignInPasskey
          onSubmit={async () =>
            runtime.runPromise(
              iam.signIn.passkey({
                onSuccess: () => router.push("/"),
              })
            )
          }
        />
      </Stack>
    </>
  );
};
