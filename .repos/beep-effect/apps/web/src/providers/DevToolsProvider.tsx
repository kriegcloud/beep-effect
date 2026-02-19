"use client";
import { EnvValue } from "@beep/constants";
import { clientEnv } from "@beep/shared-env/ClientEnv";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import type React from "react";

const isDev = EnvValue.is.dev(clientEnv.env);

export const DevToolsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      {isDev && <TanStackDevtools plugins={[formDevtoolsPlugin()]} />}
      {children}
    </>
  );
};
