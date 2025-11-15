"use client";
import { useResetPasswordForm } from "@beep/iam-sdk/clients/recover";
import { paths } from "@beep/shared-domain";
import { Form } from "@beep/ui/form";
import { PasswordFieldsGroup } from "@beep/ui/form/groups";
import { useRouter, useSearchParams } from "@beep/ui/hooks";
import { SplashScreen } from "@beep/ui/progress";
import * as F from "effect/Function";
import * as O from "effect/Option";
import React from "react";

export const ResetPasswordForm = () => {
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
  const { form } = useResetPasswordForm();
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
