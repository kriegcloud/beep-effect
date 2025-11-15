import { Iconify } from "@beep/ui/atoms";
import { Form } from "@beep/ui/form";
import { Stack } from "@mui/material";
import * as DateTime from "effect/DateTime";
import { useState } from "react";
import { AccountFormDialog } from "../common/AccountFormDialog";
import { InfoCard } from "../common/InfoCard";
import { InfoCardAttribute } from "../common/InfoCardAttribute";

const Birthday = () => {
  const [open, setOpen] = useState(false);

  const handleDiscard = () => {
    setOpen(false);
  };

  return (
    <Form>
      <InfoCard setOpen={setOpen} sx={{ mb: 3 }}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
          <InfoCardAttribute
            label="Date"
            value={DateTime.format({
              locale: "en-US",
              dateStyle: "long",
              timeStyle: "short",
            })(DateTime.unsafeNow())}
          />
        </Stack>
        <Iconify icon="material-symbols-light:edit-outline" width={20} />
      </InfoCard>
      <AccountFormDialog
        title="Birthday"
        subtitle="Provide your birthday to ensure you get the right content and features for your age."
        open={open}
        onSubmit={() => {}}
        handleDialogClose={() => setOpen(false)}
        handleDiscard={handleDiscard}
        sx={{
          maxWidth: 463,
        }}
      >
        <Stack direction={{ xs: "column" }} spacing={1} />
      </AccountFormDialog>
    </Form>
  );
};

export default Birthday;
