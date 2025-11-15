import { Iconify } from "@beep/ui/atoms";
import { Form } from "@beep/ui/form";
import { Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { AccountFormDialog } from "../common/AccountFormDialog";

const ChangePassword = () => {
  const [open, setOpen] = useState(false);

  return (
    <Form>
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
        <AccountFormDialog
          title="Set New Password"
          subtitle="Create a new password for your account. New password must be different from any previous passwords."
          open={open}
          handleDialogClose={() => setOpen(false)}
          onSubmit={() => {}}
          sx={{
            maxWidth: 463,
          }}
        >
          <Stack direction="column" spacing={1} pb={0.125}></Stack>
        </AccountFormDialog>
      </Stack>
    </Form>
  );
};

export default ChangePassword;
