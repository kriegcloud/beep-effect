import { AccountTabPanelSection } from "@beep/iam-ui/account-management/components/common";
import { BS } from "@beep/schema";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import type * as S from "effect/Schema";
import { Address } from "./Address";
import { Birthday } from "./Birthday";
import { Email } from "./Email";
import { Names } from "./Names";
import { Phone } from "./Phone";
import { Username } from "./Username";

export class AvatarFormValue extends BS.Class<AvatarFormValue>("AvatarFormValue")({
  image: BS.Url,
}) {}

export declare namespace AvatarFormValue {
  export type Type = S.Schema.Type<typeof AvatarFormValue>;
  export type Encoded = S.Schema.Encoded<typeof AvatarFormValue>;
}

export const PersonalInfoTabPanel = () => {
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: AvatarFormValue,
      defaultValues: {
        image: "",
      },
      onSubmit: async (value) => {
        console.log(value);
      },
    })
  );

  return (
    <>
      <Stack justifyContent={"center"} mb={2}>
        <Form>
          <form.AppField name={"image"} children={(field) => <field.UploadAvatar />} />
        </Form>
      </Stack>
      <Stack direction="column" divider={<Divider />} spacing={5}>
        <AccountTabPanelSection
          title="Name"
          subtitle="Edit your name here if you wish to make any changes. You can also edit your user name which will be showed publicly."
          icon="material-symbols:badge-outline"
        >
          <Stack direction="column" spacing={1}>
            <Names />
            <Username />
          </Stack>
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="Birthday"
          subtitle="Adjust your date of birth to ensure it’s accurate in your account. Visibility of your birthday can also be controlled here."
          icon="material-symbols:cake-outline"
        >
          <Birthday />
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="Address"
          subtitle="You can edit your address and control who can see it."
          icon="material-symbols:location-on-outline"
        >
          <Address />
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="Phone"
          subtitle="Add a personal or official phone number to stay connected with ease and ensure account recovery options are available."
          icon="material-symbols:call-outline"
        >
          <Phone />
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="Email Address"
          subtitle="Edit your primary email address for notifications and add an alternate email address for extra security and communication flexibility."
          icon="material-symbols:mail-outline"
        >
          <Email />
        </AccountTabPanelSection>
      </Stack>
    </>
  );
};
