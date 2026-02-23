"use client";
import { FormHead } from "@beep/iam-ui/_components";
import { NewPasswordIcon } from "@beep/ui/icons/new-password-icon/index";
import Box from "@mui/material/Box";
import { ResetPasswordForm } from "./reset-password.form";

export const ResetPasswordView = () => {
  return (
    <>
      <FormHead
        icon={<NewPasswordIcon />}
        title="Update password"
        description="Successful updates enable access using the new password."
      />
      <Box sx={{ gap: 3, display: "flex", flexDirection: "column" }}>
        <ResetPasswordForm />
      </Box>
    </>
  );
};
