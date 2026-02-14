import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { GithubLogoIcon, GoogleLogoIcon, XLogoIcon } from "@phosphor-icons/react";

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
        <GoogleLogoIcon size={22} />
      </IconButton>
      <IconButton color="inherit" onClick={singInWithGithub}>
        <GithubLogoIcon size={22} />
      </IconButton>
      <IconButton color="inherit" onClick={signInWithTwitter}>
        <XLogoIcon size={22} />
      </IconButton>
    </Box>
  );
}
