import { useAccountManagement } from "@beep/iam-ui/account-management/account-management.provider";
import { Visibility } from "@beep/iam-ui/account-management/constants";
import { BS } from "@beep/schema";
import { Iconify } from "@beep/ui/atoms";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { useBoolean } from "@beep/ui/hooks/use-boolean";
import { useBreakpoints } from "@beep/ui/providers/break-points.provider";
import FormControl from "@mui/material/FormControl";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import type * as S from "effect/Schema";
import { AccountFormDialog, InfoCard, InfoCardAttribute } from "../common";

export class BirthdayFormValues extends BS.Class<BirthdayFormValues>("BirthdayFormValues")({
  birthDate: BS.BirthDate,
  visibility: BS.toOptionalWithDefault(Visibility)(Visibility.Enum.only_me),
}) {}

export declare namespace BirthdayFormValues {
  export type Type = S.Schema.Type<typeof BirthdayFormValues>;
  export type Encoded = S.Schema.Type<typeof BirthdayFormValues>;
}

export const Birthday = () => {
  const { value: open, setValue: setOpen } = useBoolean();
  const { personalInfo } = useAccountManagement();
  const { up } = useBreakpoints();

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: BirthdayFormValues,
      defaultValues: {
        birthDate: personalInfo.birthDate.toISOString(),
        visibility: Visibility.Enum.only_me,
      },
      onSubmit: async (value) => {
        setOpen(false);
        console.log(value);
      },
    })
  );
  const handleDiscard = () => {
    form.reset();
    setOpen(false);
  };

  const upSm = up("sm");

  return (
    <Form>
      <InfoCard setOpen={setOpen} sx={{ mb: 3 }}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
          <InfoCardAttribute label="Date" value={dayjs(personalInfo.birthDate).format("D MMMM, YYYY")} />
        </Stack>
        <Iconify
          icon="material-symbols-light:edit-outline"
          sx={{ fontSize: 20, color: "neutral.dark", visibility: "hidden" }}
        />
      </InfoCard>
      <AccountFormDialog
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
          <form.AppField
            name="birthDate"
            children={(field) => (
              <field.DatePicker
                {...field}
                label="Birthday"
                format="DD MMMM YYYY"
                sx={{ width: "100%" }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                  inputAdornment: {
                    position: "start",
                  },
                }}
              />
            )}
          />
        </Stack>
      </AccountFormDialog>
      ;
      <FormControl sx={{ gap: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>
          Who can see your birthday?
        </Typography>
        <form.AppField
          name={"visibility"}
          children={(field) => (
            <field.RadioGroup
              row={upSm}
              aria-labelledby="birthday-visibility-radio-buttons"
              options={Visibility.Options}
            />
          )}
        />
      </FormControl>
    </Form>
  );
};
