"use client";
import { iam } from "@beep/iam-sdk";
import { useRuntime } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { RouterLink } from "@beep/ui/routing";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { FormDivider, FormHead, Terms } from "../_components";
import { SignUpEmailForm } from "./sign-up-email.form";
import { SignUpSocial } from "./sign-up-social";

export const SignUpView = () => {
  const runtime = useRuntime();
  return (
    <>
      <FormHead
        title={"Get Started"}
        description={
          <>
            {`Already have an account? `}
            <Link component={RouterLink} href={paths.auth.signIn} variant={"subtitle2"}>
              Sign in
            </Link>
          </>
        }
        sx={{ textAlign: { xs: "center", md: "left" } }}
      />
      <SignUpEmailForm
        onSubmit={async (valueEffect) => F.pipe(valueEffect, Effect.flatMap(iam.signUp.email), runtime.runPromise)}
      />
      <Terms />
      <Box sx={{ gap: 2, display: "flex", flexDirection: "column" }}>
        <FormDivider />
        <SignUpSocial signUp={async (provider) => F.pipe(iam.signIn.social({ provider }), runtime.runPromise)} />
      </Box>
    </>
  );
};
