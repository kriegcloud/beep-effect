"use client";
import { SignInImplementations } from "@beep/iam-sdk/clients/sign-in/sign-in.implementations";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { withToast } from "@beep/ui/common";
import { RouterLink } from "@beep/ui/routing";
import { Atom, useAtom } from "@effect-atom/atom-react";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { FormDivider, FormHead } from "../_components";
import { SignInEmailForm } from "./sign-in-email.form";
import { SignInPasskey } from "./sign-in-passkey";
import { SignInSocial } from "./sign-in-social";

const runtime = Atom.runtime(clientRuntimeLayer);
const signInPasskeyAtom = runtime.fn(
  F.flow(
    SignInImplementations.SignInPasskeyContract,
    withToast({
      onWaiting: "Signing in",
      onSuccess: "Signed in successfully",
      onFailure: O.match({
        onNone: () => "Failed with unknown error.",
        onSome: (e) => e.message,
      }),
    })
  )
);

const signInSocialAtom = runtime.fn(
  F.flow(
    SignInImplementations.SignInSocialContract,
    withToast({
      onWaiting: "Signing in",
      onSuccess: "Signed in successfully",
      onFailure: O.match({
        onNone: () => "Failed with unknown error.",
        onSome: (e) => e.message,
      }),
    })
  )
);

export const SignInView = () => {
  const [, signInPasskey] = useAtom(signInPasskeyAtom);
  const [, signInSocial] = useAtom(signInSocialAtom);
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
      // onSubmit={async (valueEffect) => runEmailSignIn(Effect.flatMap(valueEffect, iam.signIn.email))}
      />
      <FormDivider />
      <Stack spacing={2}>
        <SignInSocial signIn={async (provider) => signInSocial({ provider })} />
        <SignInPasskey onSubmit={async () => signInPasskey()} />
      </Stack>
    </>
  );
};
