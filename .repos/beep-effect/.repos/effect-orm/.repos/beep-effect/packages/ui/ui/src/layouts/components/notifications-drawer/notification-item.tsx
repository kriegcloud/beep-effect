import { FileThumbnail, Label } from "@beep/ui/atoms";
import { fToNow } from "@beep/ui-core/utils/format-time";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import SvgIcon from "@mui/material/SvgIcon";
import { useEffect, useState } from "react";

import { notificationIcons } from "./icons";

export type NotificationItemProps = {
  readonly notification: {
    readonly id: string;
    readonly type: string;
    readonly title: string;
    readonly category: string;
    readonly isUnread: boolean;
    readonly avatarUrl: string | null;
    readonly createdAt: string | number | null;
  };
};

const readerContent = (data: string) => (
  <Box
    dangerouslySetInnerHTML={{ __html: data }}
    sx={{
      "& p": { m: 0, typography: "body2" },
      "& a": { color: "inherit", textDecoration: "none" },
      "& strong": { typography: "subtitle2" },
    }}
  />
);

const renderIcon = (type: string) =>
  ({
    order: notificationIcons.order,
    chat: notificationIcons.chat,
    mail: notificationIcons.mail,
    delivery: notificationIcons.delivery,
  })[type];

export function NotificationItem({ notification }: NotificationItemProps) {
  const [relativeCreatedAt, setRelativeCreatedAt] = useState("");

  useEffect(() => {
    if (!notification.createdAt) {
      setRelativeCreatedAt("");
      return;
    }

    setRelativeCreatedAt(fToNow(notification.createdAt));
  }, [notification.createdAt]);

  const renderAvatar = () => (
    <ListItemAvatar>
      {notification.avatarUrl ? (
        <Avatar src={notification.avatarUrl} sx={{ bgcolor: "background.neutral" }} />
      ) : (
        <Box
          sx={{
            width: 40,
            height: 40,
            display: "flex",
            borderRadius: "50%",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.neutral",
          }}
        >
          <SvgIcon sx={{ width: 24, height: 24 }}>{renderIcon(notification.type)}</SvgIcon>
        </Box>
      )}
    </ListItemAvatar>
  );

  const renderText = () => (
    <ListItemText
      primary={readerContent(notification.title)}
      secondary={
        <>
          {relativeCreatedAt && (
            <>
              {relativeCreatedAt}
              <Box
                component="span"
                sx={{
                  width: 2,
                  height: 2,
                  borderRadius: "50%",
                  bgcolor: "currentColor",
                }}
              />
            </>
          )}
          {notification.category}
        </>
      }
      slotProps={{
        primary: {
          sx: { mb: 0.5 },
        },
        secondary: {
          sx: {
            gap: 0.5,
            display: "flex",
            alignItems: "center",
            typography: "caption",
            color: "text.disabled",
          },
        },
      }}
    />
  );

  const renderUnReadBadge = () =>
    notification.isUnread && (
      <Box
        sx={{
          top: 26,
          width: 8,
          height: 8,
          right: 20,
          borderRadius: "50%",
          bgcolor: "info.main",
          position: "absolute",
        }}
      />
    );

  const renderFriendAction = () => (
    <Box sx={{ gap: 1, mt: 1.5, display: "flex" }}>
      <Button size="small" variant="contained">
        Accept
      </Button>
      <Button size="small" variant="outlined">
        Decline
      </Button>
    </Box>
  );

  const renderProjectAction = () => (
    <>
      <Box
        sx={{
          p: 1.5,
          my: 1.5,
          borderRadius: 1.5,
          color: "text.secondary",
          bgcolor: "background.neutral",
        }}
      >
        {readerContent(
          `<p><strong>@Jaydon Frankie</strong> feedback by asking questions or just leave a note of appreciation.</p>`
        )}
      </Box>

      <Button size="small" variant="contained" sx={{ alignSelf: "flex-start" }}>
        Reply
      </Button>
    </>
  );

  const renderFileAction = () => (
    <Box
      sx={(theme) => ({
        p: theme.spacing(1.5, 1.5, 1.5, 1),
        gap: 1,
        mt: 1.5,
        display: "flex",
        borderRadius: 1.5,
        bgcolor: "background.neutral",
      })}
    >
      <FileThumbnail file="http://localhost:8080/httpsdesign-suriname-2015.mp3" />

      <ListItemText
        primary="design-suriname-2015.mp3 design-suriname-2015.mp3"
        secondary="2.3 Mb"
        slotProps={{
          primary: {
            noWrap: true,
            sx: (theme) => ({
              color: "text.secondary",
              fontSize: theme.typography.pxToRem(13),
            }),
          },
          secondary: {
            sx: {
              mt: 0.25,
              typography: "caption",
              color: "text.disabled",
            },
          },
        }}
      />

      <Button size="small" variant="outlined" sx={{ flexShrink: 0 }}>
        Download
      </Button>
    </Box>
  );

  const renderTagsAction = () => (
    <Box
      sx={{
        mt: 1.5,
        gap: 0.75,
        display: "flex",
        flexWrap: "wrap",
      }}
    >
      <Label variant="outlined" color="info">
        Design
      </Label>
      <Label variant="outlined" color="warning">
        Dashboard
      </Label>
      <Label variant="outlined">Design system</Label>
    </Box>
  );

  const renderPaymentAction = () => (
    <Box sx={{ gap: 1, mt: 1.5, display: "flex" }}>
      <Button size="small" variant="contained">
        Pay
      </Button>
      <Button size="small" variant="outlined">
        Decline
      </Button>
    </Box>
  );

  return (
    <ListItemButton
      disableRipple
      sx={[
        (theme) => ({
          p: 2.5,
          alignItems: "flex-start",
          borderBottom: `dashed 1px ${theme.vars.palette.divider}`,
        }),
      ]}
    >
      {renderUnReadBadge()}
      {renderAvatar()}

      <Box sx={{ minWidth: 0, flex: "1 1 auto" }}>
        {renderText()}
        {notification.type === "friend" && renderFriendAction()}
        {notification.type === "project" && renderProjectAction()}
        {notification.type === "file" && renderFileAction()}
        {notification.type === "tags" && renderTagsAction()}
        {notification.type === "payment" && renderPaymentAction()}
      </Box>
    </ListItemButton>
  );
}
