"use client";
import { paths } from "@beep/constants";
import { ResetPasswordContract } from "@beep/iam-sdk/clients/iam-client";
import { Form, formOptionsWithSubmit, useAppForm } from "@beep/ui/form";
import { PasswordFieldsGroup } from "@beep/ui/form/groups";
import { useRouter, useSearchParams } from "@beep/ui/hooks";

import { SplashScreen } from "@beep/ui/progress";
import type * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import type { ParseError } from "effect/ParseResult";
import React from "react";

type Props = {
  onSubmit: (values: Effect.Effect<ResetPasswordContract.Type, ParseError, never>) => Promise<void>;
};

export const ResetPasswordForm: React.FC<Props> = ({ onSubmit }) => {
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
    formOptionsWithSubmit({
      schema: ResetPasswordContract,
      defaultValues: {
        password: "",
        passwordConfirm: "",
      },
      onSubmit,
    })
  );
  return (
    <Form onSubmit={form.handleSubmit}>
      <form.AppForm>
        <PasswordFieldsGroup
          form={form}
          fields={{
            password: "password",
            passwordConfirm: "passwordConfirm",
          }}
        />
      </form.AppForm>
    </Form>
  );
};
