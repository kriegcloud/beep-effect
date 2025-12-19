"use client";
import { useSignIn } from "@beep/iam-client";
import { paths } from "@beep/shared-domain";
import { varFade } from "@beep/ui/animate";
import { RouterLink } from "@beep/ui/routing";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { AnimatePresence, m } from "framer-motion";
import { FormDivider, FormHead, Terms } from "../_components";
import { SignUpEmailForm } from "./sign-up-email.form";
import { SignUpSocial } from "./sign-up-social";

const signUpTransitionVariants = varFade("inUp", { distance: 64 });

export const SignUpView = () => {
  const { signInSocial } = useSignIn();

  return (
    <AnimatePresence mode={"wait"} initial={false}>
      <Box
        key={"sign-up-form"}
        component={m.div}
        variants={signUpTransitionVariants}
        initial={"initial"}
        animate={"animate"}
        exit={"exit"}
        sx={{ width: 1 }}
      >
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
        <SignUpEmailForm />
        <Terms />
        <Box sx={{ gap: 2, display: "flex", flexDirection: "column" }}>
          <FormDivider />
          <SignUpSocial signUp={async (provider) => signInSocial({ provider })} />
        </Box>
      </Box>
    </AnimatePresence>
  );
};
