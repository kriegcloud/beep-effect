"use client";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import React from "react";
import type { LiveManagedRuntime } from "./services/runtime/live-layer";
import { clientRuntimeLayer } from "./services/runtime/live-layer";
import { RuntimeProvider } from "./services/runtime/runtime-provider";

type BeepProviderProps = {
  children: React.ReactNode;
};

export const BeepProvider: React.FC<BeepProviderProps> = ({ children }) => {
  const runtime: LiveManagedRuntime = React.useMemo(() => ManagedRuntime.make(clientRuntimeLayer), []);

  return (
    <RuntimeProvider runtime={runtime}>
      <NuqsAdapter>{children}</NuqsAdapter>
    </RuntimeProvider>
  );
};
