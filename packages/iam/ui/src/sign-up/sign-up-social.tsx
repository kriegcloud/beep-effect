import { AuthProviderNameValue } from "@beep/constants";
import { clientEnv } from "@beep/shared-env/ClientEnv";
import Box, { type BoxProps } from "@mui/material/Box";
import * as A from "effect/Array";
import * as F from "effect/Function";
import { SocialIconButton, SocialProviderIcons } from "../_components";

type Props = BoxProps & {
  readonly signUp: (provider: AuthProviderNameValue.Type) => Promise<void>;
};

export const SignUpSocial = ({ signUp, sx, ...rest }: Props) => {
  return (
    <Box
      sx={[
        {
          gap: 1.5,
          display: "flex",
          justifyContent: "space-evenly",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    >
      {F.pipe(
        clientEnv.authProviderNames,
        AuthProviderNameValue.filter,
        A.map((provider) =>
          F.pipe(SocialProviderIcons[provider], (Component) => (
            <SocialIconButton key={provider} onClick={() => signUp(provider)} name={provider}>
              <Component />
            </SocialIconButton>
          ))
        )
      )}
    </Box>
  );
};
