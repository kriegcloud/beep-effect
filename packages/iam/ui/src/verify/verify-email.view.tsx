"use client";
import { iam } from "@beep/iam-sdk";
import { FormHead, FormReturnLink } from "@beep/iam-ui/_components";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { useRouter, useSearchParams } from "@beep/ui/hooks";
import { EmailInboxIcon } from "@beep/ui/icons";
import { SplashScreen } from "@beep/ui/progress";
import Stack from "@mui/material/Stack";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import React from "react";
import { VerifyEmailForm } from "./verify-email.form";

export const VerifyEmailView = () => {
  const searchParams = useSearchParams();

  const token = O.fromNullable(searchParams.get("token")).pipe(
    O.liftPredicate(P.and(Str.isString, S.is(S.NonEmptyTrimmedString))),
    O.match({
      onNone: () => O.none<Redacted.Redacted<string>>(),
      onSome: (token) => O.some(Redacted.make(token)),
    })
  );

  const errorMessage = O.fromNullable(searchParams.get("errorMessage")).pipe(O.liftPredicate(Str.isString));

  const runtime = useRuntime();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = React.useState<boolean>(false);
  const runSendVerificationEmail = makeRunClientPromise(runtime, "iam.verify.email.sendVerificationEmail");
  const runVerifyEmail = makeRunClientPromise(runtime, "iam.verify.email.verifyEmail");
  const isTokenSome = O.isSome(token);

  React.useEffect(() => {
    if (isTokenSome) {
      const verifyFn = async () => {
        setIsVerifying(true);
        try {
          await runVerifyEmail(
            iam.verify.email.verifyEmail({
              token: token.value,
              onSuccess: () => void router.push(paths.root),
              onFailure: () => {
                if (O.isSome(errorMessage)) {
                }
              },
            })
          );
        } catch (e) {
          console.error(e);
        }
      };

      void verifyFn();

      return () => {
        setIsVerifying(false);
      };
    }
  }, [isTokenSome, setIsVerifying, router.push, runVerifyEmail]);

  if (isVerifying) {
    return <SplashScreen />;
  }

  return (
    <>
      <FormHead
        icon={<EmailInboxIcon />}
        title={"Please check your email!"}
        description={`We've emailed a confirmation link to you your email address.`}
      />
      <Stack spacing={2}>
        <VerifyEmailForm
          onSubmit={async (valueEffect) =>
            F.pipe(valueEffect, Effect.flatMap(iam.verify.email.sendVerificationEmail), runSendVerificationEmail)
          }
        />
        <FormReturnLink href={paths.auth.signIn} sx={{ mt: 0 }} />
      </Stack>
    </>
  );
};
