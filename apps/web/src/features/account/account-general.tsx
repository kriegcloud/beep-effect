import { BS } from "@beep/schema";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { toast } from "@beep/ui/molecules";
import { fData } from "@beep/ui-core/utils";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as S from "effect/Schema";

// ----------------------------------------------------------------------

export class UpdateUserPayload extends BS.Class<UpdateUserPayload>("UpdateUserPayload")({
  name: S.String.pipe(S.minLength(1, { message: () => "Name is required" })),
  email: BS.Email,
  image: S.NullOr(BS.URLString),
  phoneNumber: BS.Phone,
  country: S.NullOr(BS.CountryName),
  address: BS.StreetLine,
  state: BS.USStateName,
  city: BS.Locality,
  zipCode: BS.PostalCode,
  about: S.String,
  isPublic: S.Boolean,
}) {}

// ----------------------------------------------------------------------

export function AccountGeneral() {
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: UpdateUserPayload,
      defaultValues: {
        name: "",
        email: "",
        image: null,
        phoneNumber: "",
        country: null,
        address: "",
        state: "Minnesota",
        city: "",
        zipCode: "",
        about: "",
        isPublic: false,
      },
      onSubmit: async (data) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success("Update success!");
        console.info("DATA", data);
      },
    })
  );

  return (
    <Form onSubmit={form.handleSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              pt: 10,
              pb: 5,
              px: 3,
              textAlign: "center",
            }}
          >
            <form.AppField
              name={"image"}
              children={(field) => (
                <field.UploadAvatar
                  maxSize={3145728}
                  helperText={
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 3,
                        mx: "auto",
                        display: "block",
                        textAlign: "center",
                        color: "text.disabled",
                      }}
                    >
                      Allowed *.jpeg, *.jpg, *.png, *.gif
                      <br /> max size of {fData(3145728)}
                    </Typography>
                  }
                />
              )}
            />
            <form.AppField
              name={"isPublic"}
              children={(field) => <field.Switch labelPlacement="start" label="Public profile" sx={{ mt: 5 }} />}
            />
            <Button variant="soft" color="error" sx={{ mt: 3 }}>
              Delete user
            </Button>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: "grid",
                gridTemplateColumns: { xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" },
              }}
            >
              <form.AppField name={"name"} children={(field) => <field.Text label={"Name"} />} />
              <form.AppField name={"email"} children={(field) => <field.Text type="email" label={"Email"} />} />
              <form.AppField name={"phoneNumber"} children={(field) => <field.Phone label={"Phone number"} />} />
              <form.AppField name={"address"} children={(field) => <field.Text label={"Address"} />} />
              <form.AppField
                name={"country"}
                children={(field) => <field.Country label={"Country"} placeholder="Choose a country" />}
              />
              <form.AppField name={"state"} children={(field) => <field.Text label="State/region" />} />
              <form.AppField name={"city"} children={(field) => <field.Text label={"City"} />} />
              <form.AppField name={"zipCode"} children={(field) => <field.Text label={"Zip/code"} />} />
            </Box>

            <Stack spacing={3} sx={{ mt: 3, alignItems: "flex-end" }}>
              <form.AppField name={"about"} children={(field) => <field.Text multiline rows={4} label={"About"} />} />
              <form.AppForm>
                <form.Submit variant={"contained"}>Save Changes</form.Submit>
              </form.AppForm>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
