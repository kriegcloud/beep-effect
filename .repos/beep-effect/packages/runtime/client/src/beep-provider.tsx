"use client";
import { KaServices } from "@beep/runtime-client/services";
import { RegistryProvider } from "@effect-atom/atom-react";
import * as ManagedRuntime from "effect/ManagedRuntime";
import React from "react";
import { clientRuntimeLayer } from "./layer";
import { RuntimeProvider } from "./providers";
import type { LiveManagedRuntime } from "./runtime";

type BeepProviderProps = {
  children: React.ReactNode;
};

export const BeepProvider: React.FC<BeepProviderProps> = ({ children }) => {
  const runtime: LiveManagedRuntime = React.useMemo(() => ManagedRuntime.make(clientRuntimeLayer), []);

  return (
    <RegistryProvider>
      <KaServices />
      <RuntimeProvider runtime={runtime}>{children}</RuntimeProvider>
    </RegistryProvider>
  );
};
