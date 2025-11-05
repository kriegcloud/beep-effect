import { Iconify } from "@beep/ui/atoms";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

type FormSocialsProps = BoxProps & {
  readonly signInWithGoogle?: (() => void) | undefined;
  readonly singInWithGithub?: (() => void) | undefined;
  readonly signInWithTwitter?: (() => void) | undefined;
};

export function FormSocials({ sx, signInWithGoogle, singInWithGithub, signInWithTwitter, ...other }: FormSocialsProps) {
  return (
    <Box
      sx={[
        {
          gap: 1.5,
          display: "flex",
          justifyContent: "center",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <IconButton color="inherit" onClick={signInWithGoogle}>
        <Iconify width={22} icon="socials:google" />
      </IconButton>
      <IconButton color="inherit" onClick={singInWithGithub}>
        <Iconify width={22} icon="socials:github" />
      </IconButton>
      <IconButton color="inherit" onClick={signInWithTwitter}>
        <Iconify width={22} icon="socials:twitter" />
      </IconButton>
    </Box>
  );
}
