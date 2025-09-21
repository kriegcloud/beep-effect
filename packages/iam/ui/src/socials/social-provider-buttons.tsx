import { AuthProviderNameValue } from "@beep/constants";
import { clientEnv } from "@beep/core-env/client";
import { SocialIcon, SocialProviderIcons } from "@beep/iam-ui/socials/icons";
import Box, { type BoxProps } from "@mui/material/Box";
import * as A from "effect/Array";
import * as F from "effect/Function";

type Props = BoxProps & {
  signIn: (provider: AuthProviderNameValue.Type) => Promise<void>;
};

export const SocialProviderButtons = ({ signIn, sx, ...rest }: Props) => {
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
      {...rest}
    >
      {F.pipe(
        clientEnv.authProviderNames,
        AuthProviderNameValue.filterMap,
        A.map((provider) =>
          F.pipe(SocialProviderIcons[provider], (Component) => (
            <SocialIcon key={provider} onClick={() => signIn(provider)} name={provider}>
              <Component />
            </SocialIcon>
          ))
        )
      )}
    </Box>
  );
};
