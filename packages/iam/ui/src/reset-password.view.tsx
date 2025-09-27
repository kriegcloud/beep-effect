"use client";
import { iam } from "@beep/iam-sdk";
import { FormHead } from "@beep/iam-ui/_components";
import { ResetPasswordForm } from "@beep/iam-ui/reset-password";
import { useRuntime } from "@beep/runtime-client";
import { NewPasswordIcon } from "@beep/ui/icons/new-password-icon/index";
import Box from "@mui/material/Box";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

export const ResetPasswordView = () => {
  const runtime = useRuntime();
  return (
    <>
      <FormHead
        icon={<NewPasswordIcon />}
        title="Update password"
        description="Successful updates enable access using the new password."
      />
      <Box sx={{ gap: 3, display: "flex", flexDirection: "column" }}>
        <ResetPasswordForm
          onSubmit={async (valueEffect) => F.pipe(valueEffect, Effect.flatMap(iam.resetPassword), runtime.runPromise)}
        />
      </Box>
    </>
  );
};
