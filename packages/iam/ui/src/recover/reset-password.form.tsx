"use client";
import { RecoverImplementations, ResetPasswordPayload } from "@beep/iam-sdk/clients";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { withToast } from "@beep/ui/common";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { PasswordFieldsGroup } from "@beep/ui/form/groups";
import { useRouter, useSearchParams } from "@beep/ui/hooks";
import { SplashScreen } from "@beep/ui/progress";
import { Atom, useAtom } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as O from "effect/Option";
import React from "react";

const runtime = Atom.runtime(clientRuntimeLayer);

const resetPasswordAtom = runtime.fn(
  F.flow(
    RecoverImplementations.ResetPassword,
    withToast({
      onWaiting: "Resetting password",
      onSuccess: "Password reset successfully",
      onFailure: O.match({
        onNone: () => "Password reset failed",
        onSome: (error) => error.message,
      }),
    })
  )
);

export const ResetPasswordForm = () => {
  const [, resetPassword] = useAtom(resetPasswordAtom);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = O.fromNullable(searchParams.get("token"));
  React.useEffect(
    () =>
      F.pipe(
        token,
        O.match({
          onNone: () => console.warn("No token found"),
          onSome: () => void router.push(paths.auth.signIn),
        })
      ),
    [token, router.push]
  );

  if (!token) {
    return <SplashScreen />;
  }

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: ResetPasswordPayload,
      defaultValues: {
        newPassword: "",
        passwordConfirm: "",
      },
      onSubmit: async (value) => resetPassword(value),
    })
  );
  return (
    <Form onSubmit={form.handleSubmit}>
      <form.AppForm>
        <PasswordFieldsGroup
          form={form}
          fields={{
            password: "newPassword",
            passwordConfirm: "passwordConfirm",
          }}
        />
      </form.AppForm>
    </Form>
  );
};
