import { EnvValue } from "@beep/constants";
import { clientEnv } from "@beep/core-env/client";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import type React from "react";
export const TanstackDevToolsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const isEnabled = clientEnv.env === EnvValue.Enum.dev;
  return (
    <>
      {isEnabled && <TanStackDevtools plugins={[formDevtoolsPlugin()]} />}
      {children}
    </>
  );
};
