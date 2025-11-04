import { BS } from "@beep/schema";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import Box from "@mui/material/Box";
import type { ButtonProps } from "@mui/material/Button";
import Button from "@mui/material/Button";
import type { DialogProps } from "@mui/material/Dialog";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import * as S from "effect/Schema";
import type { IAddressItem } from "../types";

// ----------------------------------------------------------------------

export const AddressCreate = S.Struct({
  city: S.String.pipe(S.minLength(1, { message: () => "City is Required!" })),
  state: S.String.pipe(S.minLength(1, { message: () => "State is Required!" })),
  name: S.String.pipe(S.minLength(1, { message: () => "Name is required!" })),
  address: S.String.pipe(S.minLength(1, { message: () => "Address is required!" })),
  zipCode: S.String.pipe(S.minLength(1, { message: () => "Zip code is required!" })),
  phoneNumber: BS.Phone,
  country: S.NullOr(S.String.pipe(S.minLength(1, { message: () => "Country is required!" }))),
  primary: S.Boolean,
  addressType: S.String,
});

// ----------------------------------------------------------------------

type Props = DialogProps & {
  readonly onClose: () => void;
  readonly onCreate: (address: IAddressItem) => void;
  readonly slotProps?:
    | (DialogProps["slotProps"] & {
        readonly cancelButton?: (ButtonProps & { readonly label?: string | undefined }) | undefined;
        readonly submitButton?: (ButtonProps & { readonly label?: string | undefined }) | undefined;
      })
    | undefined;
};

export function AddressCreateForm({ open, onClose, onCreate, slotProps, sx, ...other }: Props) {
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: AddressCreate,
      defaultValues: {
        name: "",
        city: "",
        state: "",
        address: "",
        zipCode: "",
        country: "",
        primary: true,
        phoneNumber: "",
        addressType: "None",
      },
      onSubmit: async (data) => {
        // console.log("data: ", data);
        onClose();
      },
    })
  );

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} slotProps={slotProps} sx={sx} {...other}>
      <Form onSubmit={form.handleSubmit}>
        <DialogTitle>Add address</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            <form.AppField
              name={"addressType"}
              children={(field) => (
                <field.RadioGroup
                  row
                  options={[
                    { label: "Home", value: "Home" },
                    { label: "Office", value: "Office" },
                  ]}
                />
              )}
            />
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: "grid",
                gridTemplateColumns: { xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" },
              }}
            >
              <form.AppField name={"name"} children={(field) => <field.Text label={"Full name"} />} />
              <form.AppField
                name={"phoneNumber"}
                children={(field) => <field.Phone label={"Phone number"} defaultCountry={"US"} />}
              />
            </Box>

            <form.AppField name={"address"} children={(field) => <field.Text label={"Address"} />} />

            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: "grid",
                gridTemplateColumns: { xs: "repeat(1, 1fr)", sm: "repeat(3, 1fr)" },
              }}
            >
              <form.AppField name={"city"} children={(field) => <field.Text label={"Town/city"} />} />
              <form.AppField name={"state"} children={(field) => <field.Text label={"State"} />} />
              <form.AppField name={"zipCode"} children={(field) => <field.Text label={"Zip/code"} />} />
            </Box>

            <form.AppField
              name={"country"}
              children={(field) => <field.Country label={"Country"} placeholder={"Choose a country"} />}
            />
            <form.AppField
              name={"primary"}
              children={(field) => <field.Checkbox label={"Use this address as default."} />}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onClose} {...slotProps?.cancelButton}>
            {slotProps?.cancelButton?.label ?? "Cancel"}
          </Button>
          <form.AppForm>
            <form.Submit variant={"contained"} {...slotProps?.submitButton}>
              {slotProps?.submitButton?.label ?? "Add"}
            </form.Submit>
          </form.AppForm>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
