"use client";
import type { IMail, IMailLabel } from "@beep/mock/_mail";
import { FileThumbnail, Iconify, Label } from "@beep/ui/atoms";
import { Markdown } from "@beep/ui/data-display";
import { useBoolean } from "@beep/ui/hooks";
import { EmptyContent } from "@beep/ui/molecules";
import { Scrollbar } from "@beep/ui/molecules/scrollbar";
import { LoadingScreen } from "@beep/ui/progress";
import { fDateTime } from "@beep/ui-core/utils";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Checkbox from "@mui/material/Checkbox";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
// import { CONFIG } from 'src/global-config';
import { darken, alpha as hexAlpha, lighten, useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Editor } from "../editor";

// ----------------------------------------------------------------------

type Props = {
  readonly mail?: undefined | IMail;
  readonly error?: undefined | string;
  readonly loading?: undefined | boolean;
  readonly renderLabel?: undefined | ((id: string) => IMailLabel | undefined);
};

export function MailDetails({ mail, renderLabel, error, loading }: Props) {
  const theme = useTheme();
  const showAttachments = useBoolean(true);
  const isStarred = useBoolean(mail?.isStarred);
  const isImportant = useBoolean(mail?.isImportant);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <EmptyContent title={error} imgUrl={`/public/icons/empty/ic-email-disabled.svg`} />;
  }

  const labelSx = (color: string) => ({
    color: darken(color, 0.24),
    bgcolor: hexAlpha(color, 0.16),
    ...theme.applyStyles("dark", {
      color: lighten(color, 0.24),
    }),
  });

  const renderHead = () => (
    <>
      <Box sx={{ gap: 1, flexGrow: 1, display: "flex" }}>
        {mail?.labelIds.map((labelId) => {
          const label = renderLabel?.(labelId);

          if (!label) return null;

          return (
            <Label key={label.id} sx={label.color ? labelSx(label.color) : {}}>
              {label.name}
            </Label>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", flex: "1 1 auto", alignItems: "center", justifyContent: "flex-end" }}>
        <Checkbox
          color="warning"
          icon={<Iconify icon="eva:star-outline" />}
          checkedIcon={<Iconify icon="eva:star-fill" />}
          checked={isStarred.value}
          onChange={isStarred.onToggle}
          slotProps={{
            input: {
              id: "starred-checkbox",
              "aria-label": "Starred checkbox",
            },
          }}
        />

        <Checkbox
          color="warning"
          icon={<Iconify icon="ic:round-label-important" />}
          checkedIcon={<Iconify icon="ic:round-label-important" />}
          checked={isImportant.value}
          onChange={isImportant.onToggle}
          slotProps={{
            input: {
              id: "important-checkbox",
              "aria-label": "Important checkbox",
            },
          }}
        />

        <Tooltip title="Archive">
          <IconButton>
            <Iconify icon="solar:archive-down-minimlistic-bold" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Mark Unread">
          <IconButton>
            <Iconify icon="solar:letter-unread-bold" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Trash">
          <IconButton>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Tooltip>

        <IconButton>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Box>
    </>
  );

  const renderSubject = () => (
    <>
      <Typography
        variant="subtitle2"
        sx={[
          (theme) => ({
            ...theme.mixins.maxLine({ line: 2 }),
            flex: "1 1 auto",
          }),
        ]}
      >
        Re: {mail?.subject}
      </Typography>

      <Stack spacing={0.5}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <IconButton size="small">
            <Iconify width={18} icon="solar:reply-bold" />
          </IconButton>

          <IconButton size="small">
            <Iconify width={18} icon="solar:multiple-forward-left-broken" />
          </IconButton>

          <IconButton size="small">
            <Iconify width={18} icon="solar:forward-bold" />
          </IconButton>
        </Box>

        <Typography variant="caption" noWrap sx={{ color: "text.disabled" }}>
          {fDateTime(mail?.createdAt)}
        </Typography>
      </Stack>
    </>
  );

  const renderSender = () => (
    <>
      <Avatar alt={mail?.from.name} src={mail?.from.avatarUrl ? `${mail?.from.avatarUrl}` : ""} sx={{ mr: 2 }}>
        {mail?.from.name.charAt(0).toUpperCase()}
      </Avatar>

      <Stack spacing={0.5} sx={{ width: 0, flexGrow: 1 }}>
        <Box sx={{ gap: 0.5, display: "flex" }}>
          <Typography component="span" variant="subtitle2" sx={{ flexShrink: 0 }}>
            {mail?.from.name}
          </Typography>
          <Typography component="span" noWrap variant="body2" sx={{ color: "text.secondary" }}>
            {`<${mail?.from.email}>`}
          </Typography>
        </Box>

        <Typography noWrap component="span" variant="caption" sx={{ color: "text.secondary" }}>
          {`To: `}
          {mail?.to.map((person) => (
            <Link key={person.email} color="inherit" sx={{ "&:hover": { color: "text.primary" } }}>
              {`${person.email}, `}
            </Link>
          ))}
        </Typography>
      </Stack>
    </>
  );

  const renderAttachments = () => (
    <Stack spacing={1} sx={{ p: 1, borderRadius: 1, bgcolor: "background.neutral" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <ButtonBase
          onClick={showAttachments.onToggle}
          sx={{ borderRadius: 0.5, typography: "caption", color: "text.secondary" }}
        >
          <Iconify icon="eva:attach-2-fill" sx={{ mr: 0.5 }} />
          {mail?.attachments.length} attachments
          <Iconify
            icon={showAttachments.value ? "eva:arrow-ios-upward-fill" : "eva:arrow-ios-downward-fill"}
            width={16}
            sx={{ ml: 0.5 }}
          />
        </ButtonBase>

        <ButtonBase
          sx={{
            py: 0.5,
            gap: 0.5,
            px: 0.75,
            borderRadius: 0.75,
            typography: "caption",
            fontWeight: "fontWeightSemiBold",
          }}
        >
          <Iconify width={18} icon="eva:cloud-download-fill" /> Download
        </ButtonBase>
      </Box>

      <Collapse in={showAttachments.value} unmountOnExit timeout="auto">
        <Box sx={{ gap: 0.75, display: "flex", flexWrap: "wrap" }}>
          {mail?.attachments.map((attachment) => (
            <FileThumbnail
              key={attachment.id}
              tooltip
              showImage
              file={attachment.preview}
              onDownload={() => console.info("DOWNLOAD")}
              slotProps={{ icon: { sx: { width: 24, height: 24 } } }}
              sx={{ width: 48, height: 48, bgcolor: "background.paper" }}
            />
          ))}
        </Box>
      </Collapse>
    </Stack>
  );

  const renderContent = () => <Markdown children={mail?.message} sx={{ px: 2, "& p": { typography: "body2" } }} />;

  const renderEditor = () => (
    <>
      <Editor sx={{ maxHeight: 320 }} />

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton>
          <Iconify icon="solar:gallery-add-bold" />
        </IconButton>

        <IconButton>
          <Iconify icon="eva:attach-2-fill" />
        </IconButton>

        <Stack sx={{ flexGrow: 1 }} />

        <Button color="primary" variant="contained" endIcon={<Iconify icon="custom:send-fill" />}>
          Send
        </Button>
      </Box>
    </>
  );

  return (
    mail && (
      <>
        <Box
          sx={{
            pl: 2,
            pr: 1,
            py: 1,
            gap: 1,
            minHeight: 56,
            flexShrink: 0,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {renderHead()}
        </Box>

        <Box
          sx={[
            (theme) => ({
              p: 2,
              gap: 2,
              flexShrink: 0,
              display: "flex",
              borderTop: `1px dashed ${theme.vars.palette.divider}`,
              borderBottom: `1px dashed ${theme.vars.palette.divider}`,
            }),
          ]}
        >
          {renderSubject()}
        </Box>

        <Box
          sx={{
            pt: 2,
            px: 2,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          {renderSender()}
        </Box>

        {!!mail?.attachments.length && <Stack sx={{ px: 2, mt: 2 }}> {renderAttachments()} </Stack>}

        <Scrollbar sx={{ mt: 3, flex: "1 1 240px" }}>{renderContent()}</Scrollbar>

        <Stack spacing={2} sx={{ flexShrink: 0, p: 2 }}>
          {renderEditor()}
        </Stack>
      </>
    )
  );
}
