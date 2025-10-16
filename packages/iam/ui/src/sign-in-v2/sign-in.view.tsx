"use client";
import { paths } from "@beep/shared-domain";
import { RouterLink } from "@beep/ui/routing";
import Link from "@mui/material/Link";
import { FormDivider, FormHead } from "../_components";
import { SignInEmailForm } from "./sign-in-email.form";

export const SignInView = () => {
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
      <SignInEmailForm />
      <FormDivider />
    </>
  );
};
