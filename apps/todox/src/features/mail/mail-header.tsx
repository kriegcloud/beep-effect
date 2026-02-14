import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { ChatCircleDotsIcon, EnvelopeSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";

// ----------------------------------------------------------------------

type Props = BoxProps & {
  readonly onOpenNav: () => void;
  readonly onOpenMail?: undefined | (() => void);
};

export function MailHeader({ onOpenNav, onOpenMail, sx, ...other }: Props) {
  return (
    <Box
      sx={[
        {
          py: 1,
          mb: 1,
          display: "flex",
          alignItems: "center",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <IconButton onClick={onOpenNav}>
        <EnvelopeSimpleIcon weight="bold" />
      </IconButton>

      {onOpenMail && (
        <IconButton onClick={onOpenMail}>
          <ChatCircleDotsIcon weight="bold" />
        </IconButton>
      )}

      <TextField
        fullWidth
        size="small"
        placeholder="Search..."
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <MagnifyingGlassIcon weight="fill" style={{ color: "text.disabled" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ ml: 2 }}
      />
    </Box>
  );
}
