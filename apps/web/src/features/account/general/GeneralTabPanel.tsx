import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { fData } from "@beep/ui-core/utils/format-number";
import { Divider, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { useAccountSettings } from "@/features/account/account-settings-provider";
import { AccountTabPanelSection } from "@/features/account/common/AccountTabPanelSection";
import Email from "@/features/account/general/Email";
import Identity from "@/features/account/general/Identity";
import Phone from "@/features/account/general/Phone";
import UserName from "@/features/account/general/UserName";
export const GeneralTabPanel = () => {
  const { userInfo } = useAccountSettings();
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: S.Struct({
        image: S.String,
      }),
      defaultValues: {
        image: userInfo.image.pipe(
          O.match({
            onNone: () => "",
            onSome: (img) => img,
          })
        ),
      },
      onSubmit: async (value) => {
        console.log(value);
      },
    })
  );
  return (
    <>
      <Stack justifyContent="center" mb={2}>
        <Form onSubmit={form.handleSubmit}>
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
        </Form>
      </Stack>
      <Stack direction="column" divider={<Divider />} spacing={5}>
        <AccountTabPanelSection
          title="Name"
          subtitle="Edit your name here if you wish to make any changes. You can also edit your user name which will be showed publicly."
          icon="material-symbols:badge-outline"
        >
          <Stack direction="column" spacing={1}>
            <Identity />
            <UserName />
          </Stack>
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
