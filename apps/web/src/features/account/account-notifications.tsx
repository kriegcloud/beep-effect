import { BS } from "@beep/schema";
import { Form, formOptionsWithSubmitEffect, useAppForm } from "@beep/ui/form";
import { toast } from "@beep/ui/molecules";
import Box from "@mui/material/Box";
import type { CardProps } from "@mui/material/Card";
import Card from "@mui/material/Card";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import ListItemText from "@mui/material/ListItemText";
import Switch from "@mui/material/Switch";
import * as A from "effect/Array";
import * as S from "effect/Schema";

export const NotificationSelectionKit = BS.stringLiteralKit(
  "activity_comments",
  "activity_answers",
  "activityFollows",
  "application_news",
  "application_product",
  "application_blog"
);

export class NotificationSelectionPayload extends S.Class<NotificationSelectionPayload>("NotificationSelectionPayload")(
  {
    selected: S.Array(NotificationSelectionKit.Schema),
  }
) {}

// ----------------------------------------------------------------------

const NOTIFICATIONS = [
  {
    subheader: "Activity",
    caption: "Donec mi odio, faucibus at, scelerisque quis",
    items: [
      { id: "activity_comments", label: "Email me when someone comments onmy article" },
      { id: "activity_answers", label: "Email me when someone answers on my form" },
      { id: "activityFollows", label: "Email me hen someone follows me" },
    ],
  },
  {
    subheader: "Application",
    caption: "Donec mi odio, faucibus at, scelerisque quis",
    items: [
      { id: "application_news", label: "News and announcements" },
      { id: "application_product", label: "Weekly product updates" },
      { id: "application_blog", label: "Weekly blog digest" },
    ],
  },
] as const;

// ----------------------------------------------------------------------

export function AccountNotifications({ sx, ...other }: CardProps) {
  const form = useAppForm(
    formOptionsWithSubmitEffect({
      schema: NotificationSelectionPayload,
      defaultValues: {
        selected: ["activity_comments", "application_product"],
      },
      onSubmit: async (data) => {
        toast.success("Update success!");
        console.info("DATA", data);
      },
    })
  );

  const getSelected = (
    selectedItems: ReadonlyArray<typeof NotificationSelectionKit.Schema.Type>,
    item: typeof NotificationSelectionKit.Schema.Type
  ) => (selectedItems.includes(item) ? A.filter(selectedItems, (value) => value !== item) : [...selectedItems, item]);

  return (
    <Form onSubmit={form.handleSubmit}>
      <Card
        sx={[
          {
            p: 3,
            gap: 3,
            display: "flex",
            flexDirection: "column",
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        {A.map(NOTIFICATIONS, (notification) => (
          <Grid key={notification.subheader} container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <ListItemText
                primary={notification.subheader}
                secondary={notification.caption}
                slotProps={{
                  primary: { sx: { typography: "h6" } },
                  secondary: { sx: { mt: 0.5 } },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Box
                sx={{
                  p: 3,
                  gap: 1,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "background.neutral",
                }}
              >
                <form.Field name={"selected"} mode={"array"}>
                  {(field) => (
                    <>
                      {A.map(notification.items, (item) => (
                        <FormControlLabel
                          key={item.id}
                          label={item.label}
                          labelPlacement="start"
                          control={
                            <Switch
                              checked={field.state.value.includes(item.id)}
                              onChange={() => field.handleChange((v) => getSelected(v, item.id))}
                              slotProps={{
                                input: {
                                  id: `${item.label}-switch`,
                                  "aria-label": `${item.label} switch`,
                                },
                              }}
                            />
                          }
                          sx={{ m: 0, width: 1, justifyContent: "space-between" }}
                        />
                      ))}
                    </>
                  )}
                </form.Field>
              </Box>
            </Grid>
          </Grid>
        ))}

        <form.AppForm>
          <form.Submit variant="contained" sx={{ ml: "auto" }}>
            Save Changes
          </form.Submit>
        </form.AppForm>
      </Card>
    </Form>
  );
}
