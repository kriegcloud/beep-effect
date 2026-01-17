"use client";

import { paths } from "@beep/shared-domain";
import { RouterLink } from "@beep/ui/routing/index";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { FormDivider, FormHead } from "../_components";
import { Email } from "./email";
// import { SignInPasskey } from "./sign-in-passkey";
// import { SignInSocial } from "./sign-in-social";

export const SignInView = () => {
  return (
    <>
      <FormHead
        title="Sign in to your account"
        description={
          <>
            {`Don't have an account? `}
            <Link component={RouterLink} href={paths.auth.signUp} variant="subtitle2">
              Get started
            </Link>
          </>
        }
        sx={{ textAlign: { xs: "center", md: "left" } }}
      />
      <Email.Form />
      <FormDivider />
      <Stack spacing={2}>
        {/*<SignInSocial signIn={async (provider) => signInSocial({ provider })} />*/}
        {/*<SignInPasskey onSubmit={async () => signInPasskey()} />*/}
      </Stack>
    </>
  );
};
