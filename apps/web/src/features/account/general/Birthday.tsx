import { Iconify } from "@beep/ui/atoms";
import { formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { Stack } from "@mui/material";
import * as DateTime from "effect/DateTime";
import * as S from "effect/Schema";
import { useState } from "react";
import { InfoCard } from "../common/InfoCard";
import { InfoCardAttribute } from "../common/InfoCardAttribute";

const Birthday = () => {
  const [open, setOpen] = useState(false);

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: S.Struct({
        birthday: S.Date,
      }),
      defaultValues: {
        birthday: "",
      },
      onSubmit: async (value) => {
        console.log(value);
        setOpen(false);
      },
    })
  );

  const handleDiscard = () => {
    setOpen(false);
    form.reset();
  };
  return (
    <>
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
      <form.AppForm>
        <form.FormDialog
          title="Birthday"
          subtitle="Provide your birthday to ensure you get the right content and features for your age."
          open={open}
          handleDialogClose={() => setOpen(false)}
          handleDiscard={handleDiscard}
          sx={{
            maxWidth: 463,
          }}
        >
          <Stack direction={{ xs: "column" }} spacing={1}>
            <form.AppField name={"birthday"} children={(field) => <field.DatePicker label={"Birthday"} />} />
          </Stack>
        </form.FormDialog>
      </form.AppForm>
    </>
  );
};

export default Birthday;
