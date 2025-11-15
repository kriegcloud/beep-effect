import { useChangePasswordForm } from "@beep/iam-sdk/clients/user/user.forms";
import { Iconify } from "@beep/ui/atoms";
import { PasswordFieldsGroup } from "@beep/ui/form/groups";
import { useBoolean } from "@beep/ui/hooks/use-boolean";
import { Button, Stack, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { useState } from "react";

const ChangePassword = () => {
  const [open, setOpen] = useState(false);
  const { form } = useChangePasswordForm({
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });
  const showPassword = useBoolean();

  return (
    <>
      <Stack direction="column" spacing={2} alignItems="flex-start">
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: "info.main",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Iconify icon="material-symbols:info-outline" sx={{ fontSize: 24 }} />
          Your password was last updated on 07/08/22
        </Typography>
        <Button
          variant="soft"
          onClick={() => setOpen(true)}
          endIcon={<Iconify icon="material-symbols:chevron-right" sx={{ fontSize: 20 }} />}
        >
          Change password
        </Button>
        <form.AppForm>
          <form.FormDialog
            title="Set New Password"
            subtitle="Create a new password for your account. New password must be different from any previous passwords."
            open={open}
            handleDialogClose={() => setOpen(false)}
            sx={{
              maxWidth: 463,
            }}
          >
            <Stack direction="column" spacing={1} pb={0.125}>
              <form.AppField
                name={"currentPassword"}
                children={(field) => (
                  <field.Text
                    label={"Current Password"}
                    type={showPassword.value ? "text" : "password"}
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={showPassword.onToggle} edge="end">
                              <Iconify icon={showPassword.value ? "solar:eye-bold" : "solar:eye-closed-bold"} />
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
              <PasswordFieldsGroup
                form={form}
                fields={
                  {
                    password: "password",
                    passwordConfirm: "passwordConfirm",
                  } as const
                }
              />
              <form.AppField
                name={"revokeOtherSessions"}
                children={(field) => <field.Checkbox label={"Revoke Other Sessions"} />}
              />
            </Stack>
          </form.FormDialog>
        </form.AppForm>
      </Stack>
    </>
  );
};

export default ChangePassword;
