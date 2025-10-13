"use client";
import { AuthCallback, iam } from "@beep/iam-sdk";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { varFade } from "@beep/ui/animate";
import { useBoolean, useRouter } from "@beep/ui/hooks";
import { EmailInboxIcon } from "@beep/ui/icons";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import { RouterLink } from "@beep/ui/routing";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { AnimatePresence, m } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormDivider, FormHead, Terms } from "../_components";
import { SignUpEmailForm } from "./sign-up-email.form";
import { SignUpSocial } from "./sign-up-social";

const signUpTransitionVariants = varFade("inUp", { distance: 64 });

export const SignUpView = () => {
  const runtime = useRuntime();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = AuthCallback.getURL(searchParams);
  const signInHref =
    callbackURL === AuthCallback.defaultTarget
      ? paths.auth.signIn
      : `${paths.auth.signIn}?${AuthCallback.paramName}=${encodeURIComponent(callbackURL)}`;
  const runSignUpEmail = makeRunClientPromise(runtime, "iam.signUp.email");
  const runSocialSignIn = makeRunClientPromise(runtime, "iam.signIn.social");
  const { value: isLoading, setValue: setIsLoading } = useBoolean();
  const [verificationNotice, setVerificationNotice] = useState<{
    redirectPath: string;
    firstName: string;
  } | null>(null);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <AnimatePresence mode={"wait"} initial={false}>
      {verificationNotice ? (
        <Box
          key={"verification-notice"}
          component={m.div}
          variants={signUpTransitionVariants}
          initial={"initial"}
          animate={"animate"}
          exit={"exit"}
          sx={{ width: 1 }}
        >
          <Stack
            spacing={3}
            sx={{ textAlign: { xs: "center", md: "left" }, alignItems: { xs: "center", md: "flex-start" } }}
          >
            <FormHead
              icon={<EmailInboxIcon />}
              title={"Check your inbox"}
              description={
                <>
                  Thanks {verificationNotice.firstName}! We just sent a verification email to the address you provided.
                  You can verify whenever it suits you—skip for now and start exploring.
                </>
              }
            />
            <Button
              variant={"contained"}
              color={"primary"}
              fullWidth
              onClick={() => {
                setIsLoading(true);
                void router.push(verificationNotice.redirectPath);
              }}
            >
              Skip for now.
            </Button>
          </Stack>
        </Box>
      ) : (
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
                <Link component={RouterLink} href={signInHref} variant={"subtitle2"}>
                  Sign in
                </Link>
              </>
            }
            sx={{ textAlign: { xs: "center", md: "left" } }}
          />
          <SignUpEmailForm
            onSubmit={async (valueEffect) =>
              runSignUpEmail(
                Effect.gen(function* () {
                  const value = yield* valueEffect;
                  return yield* iam.signUp.email({
                    value,
                    onSuccess: (path) =>
                      setVerificationNotice({
                        redirectPath: path,
                        firstName: value.firstName,
                      }),
                  });
                })
              )
            }
          />
          <Terms />
          <Box sx={{ gap: 2, display: "flex", flexDirection: "column" }}>
            <FormDivider />
            <SignUpSocial signUp={async (provider) => F.pipe(iam.signIn.social({ provider }), runSocialSignIn)} />
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
};
