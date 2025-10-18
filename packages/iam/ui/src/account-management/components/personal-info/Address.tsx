import { useAccountManagement } from "@beep/iam-ui/account-management/account-management.provider";
import { Visibility } from "@beep/iam-ui/account-management/constants";
import { BS } from "@beep/schema";
import { Iconify } from "@beep/ui/atoms/iconify/iconify";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { useBreakpoints } from "@beep/ui/providers/break-points.provider";
import FormControl from "@mui/material/FormControl";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as A from "effect/Array";
import * as F from "effect/Function";
import type * as S from "effect/Schema";
import React from "react";
import { AccountFormDialog, InfoCard, InfoCardAttribute } from "../common";

export class AddressFormValues extends BS.Class<AddressFormValues>("AddressFormValues")({
  country: BS.CountryName,
  state: BS.USStateName,
  city: BS.Locality,
  street: BS.StreetLine,
  zip: BS.PostalCode,
  visibility: BS.toOptionalWithDefault(Visibility)(Visibility.Enum.only_me),
}) {}

export declare namespace AddressFormValues {
  export type Type = S.Schema.Type<typeof AddressFormValues>;
  export type Encoded = S.Schema.Encoded<typeof AddressFormValues>;
}

export const Address = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const { personalInfo } = useAccountManagement();
  const { up } = useBreakpoints();
  const [currentAddress] = React.useState<AddressFormValues.Type>({
    country: personalInfo.country,
    state: personalInfo.state,
    city: personalInfo.city,
    street: personalInfo.street,
    zip: personalInfo.zip,
    visibility: Visibility.Enum.only_me,
  });

  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: AddressFormValues,
      defaultValues: {
        country: personalInfo.country,
        state: personalInfo.state,
        city: personalInfo.city,
        street: personalInfo.street,
        zip: personalInfo.zip,
        visibility: Visibility.Enum.only_me,
      },
      onSubmit: async (value) => {
        console.log(value);
      },
    })
  );

  const upSm = up("sm");

  const handleDiscard = () => {
    form.reset();
    setOpen(false);
  };

  return (
    <Form>
      <InfoCard setOpen={setOpen} sx={{ mb: 3 }}>
        <Stack direction="column" spacing={{ xs: 2, sm: 1 }}>
          <InfoCardAttribute label="Country" value={currentAddress.country} />
          <InfoCardAttribute label="State" value={currentAddress.state} />
          <InfoCardAttribute label="City" value={currentAddress.city} />
          <InfoCardAttribute label="Street" value={currentAddress.street} />
          <InfoCardAttribute label="ZIP" value={currentAddress.zip} />
        </Stack>
        <Iconify
          icon="material-symbols-light:edit-outline"
          sx={{ fontSize: 20, color: "neutral.dark", visibility: "hidden" }}
        />
      </InfoCard>
      <AccountFormDialog
        title="Address"
        subtitle="Enter your updated address to ensure we have your most recent and accurate location information."
        open={open}
        handleDialogClose={() => setOpen(false)}
        handleDiscard={handleDiscard}
        sx={{
          maxWidth: 463,
        }}
      >
        <Stack direction="column" spacing={1} p={0.125}>
          <form.AppField name={"country"} children={(field) => <field.Country fullWidth />} />
          <form.AppField
            name={"state"}
            children={(field) => (
              <field.Autocomplete
                fullWidth
                options={F.pipe(
                  BS.USStateName.Options,
                  A.map(
                    (o) =>
                      ({
                        value: o,
                        label: o,
                      }) as const
                  )
                )}
              />
            )}
          />
          <form.AppField name={"city"} children={(field) => <field.Text fullWidth label={"City"} />} />
          <form.AppField name={"street"} children={(field) => <field.Text fullWidth label={"Street"} />} />
          <form.AppField name={"zip"} children={(field) => <field.Text fullWidth label={"ZIP"} />} />
        </Stack>
      </AccountFormDialog>
      <FormControl sx={{ gap: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>
          Who can see your address?
        </Typography>
        <form.AppField
          name={"visibility"}
          children={(field) => (
            <field.RadioGroup
              row={upSm}
              options={Visibility.Options}
              aria-labelledby={"address-visibility-radio-buttons"}
            />
          )}
        />
      </FormControl>
    </Form>
  );
};
