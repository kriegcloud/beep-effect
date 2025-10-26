import { BS } from "@beep/schema";
import { Iconify } from "@beep/ui/atoms";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { toast } from "@beep/ui/molecules";
import Card from "@mui/material/Card";
import InputAdornment from "@mui/material/InputAdornment";
import * as A from "effect/Array";
import * as Struct from "effect/Struct";
import type { ISocialLink } from "./types";

type Props = {
  readonly socialLinks: ISocialLink;
};

export class AccountSocialsPayload extends BS.Class<AccountSocialsPayload>("AccountSocialsPayload")({
  facebook: BS.Url,
  instagram: BS.Url,
  linkedin: BS.Url,
  x: BS.Url,
}) {}

export function AccountSocials({ socialLinks }: Props) {
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: AccountSocialsPayload,
      defaultValues: {
        facebook: "",
        instagram: "",
        linkedin: "",
        x: "",
      },
      onSubmit: async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success("Update success!");
        console.info("DATA", value);
      },
    })
  );

  return (
    <Form onSubmit={form.handleSubmit}>
      <Card
        sx={{
          p: 3,
          gap: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {A.map(Struct.keys(socialLinks), (social) => (
          <form.AppField
            key={social}
            name={social}
            children={(field) => (
              <field.Text
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        {social === "x" && <Iconify width={24} icon="socials:twitter" />}
                        {social === "facebook" && <Iconify width={24} icon="socials:facebook" />}
                        {social === "instagram" && <Iconify width={24} icon="socials:instagram" />}
                        {social === "linkedin" && <Iconify width={24} icon="socials:linkedin" />}
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
        ))}
        <form.AppForm>
          <form.Submit variant={"contained"} sx={{ ml: "auto" }}>
            Save changes
          </form.Submit>
        </form.AppForm>
      </Card>
    </Form>
  );
}
