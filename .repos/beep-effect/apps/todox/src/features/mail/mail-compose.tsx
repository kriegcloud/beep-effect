import { useBoolean } from "@beep/ui/hooks";
import { rgbaFromChannel } from "@beep/ui-core/utils";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import Portal from "@mui/material/Portal";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  ArrowsInSimpleIcon,
  ArrowsOutSimpleIcon,
  ImageIcon,
  PaperclipIcon,
  PaperPlaneTiltIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { LexicalEditor } from "../../components/editor";

// ----------------------------------------------------------------------

const POSITION = 20;

type Props = {
  readonly onCloseCompose: () => void;
};

export function MailCompose({ onCloseCompose }: Props) {
  const smUp = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  const fullScreen = useBoolean();

  const [message, setMessage] = useState("");

  const handleChangeMessage = useCallback((value: string) => {
    setMessage(value);
  }, []);

  useEffect(() => {
    document.body.style.overflow = fullScreen.value ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullScreen.value]);

  return (
    <Portal>
      {(fullScreen.value || !smUp) && <Backdrop open sx={[(theme) => ({ zIndex: theme.zIndex.modal - 1 })]} />}

      <Paper
        sx={[
          (theme) => ({
            maxWidth: 560,
            right: POSITION,
            borderRadius: 2,
            display: "flex",
            bottom: POSITION,
            position: "fixed",
            overflow: "hidden",
            flexDirection: "column",
            zIndex: theme.zIndex.modal,
            width: `calc(100% - ${POSITION * 2}px)`,
            boxShadow: theme.vars.customShadows.dropdown,
            ...(fullScreen.value && { maxWidth: 1, height: `calc(100% - ${POSITION * 2}px)` }),
          }),
        ]}
      >
        <Box
          sx={[
            (theme) => ({
              display: "flex",
              alignItems: "center",
              bgcolor: "background.neutral",
              p: theme.spacing(1.5, 1, 1.5, 2),
            }),
          ]}
        >
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            New message
          </Typography>

          <IconButton onClick={fullScreen.onToggle}>
            {fullScreen.value ? <ArrowsInSimpleIcon weight="fill" /> : <ArrowsOutSimpleIcon weight="fill" />}
          </IconButton>

          <IconButton onClick={onCloseCompose}>
            <XIcon />
          </IconButton>
        </Box>

        <InputBase
          id="mail-compose-to"
          placeholder="To"
          endAdornment={
            <Box sx={{ gap: 0.5, display: "flex", typography: "subtitle2" }}>
              <Box sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>Cc</Box>
              <Box sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>Bcc</Box>
            </Box>
          }
          sx={[
            (theme) => ({
              px: 2,
              height: 48,
              borderBottom: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08)}`,
            }),
          ]}
        />

        <InputBase
          id="mail-compose-subject"
          placeholder="Subject"
          sx={[
            (theme) => ({
              px: 2,
              height: 48,
              borderBottom: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08)}`,
            }),
          ]}
        />

        <Box
          sx={{
            p: 2,
            gap: 2,
            display: "flex",
            flex: "1 1 auto",
            overflow: "hidden",
            flexDirection: "column",
          }}
        >
          <LexicalEditor
            initialMarkdown={message}
            onChange={handleChangeMessage}
            placeholder="Type a message"
            fullscreenEnabled
          />

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton>
              <ImageIcon weight="bold" />
            </IconButton>

            <IconButton>
              <PaperclipIcon weight="fill" />
            </IconButton>

            <Box sx={{ flexGrow: 1 }} />

            <Button variant="contained" color="primary" endIcon={<PaperPlaneTiltIcon weight="fill" />}>
              Send
            </Button>
          </Box>
        </Box>
      </Paper>
    </Portal>
  );
}
