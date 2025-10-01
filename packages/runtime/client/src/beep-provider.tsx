"use client";
import { clientEnv } from "@beep/core-env/client";
import { QueryClientProvider, QueryClient as TanstackQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import * as Duration from "effect/Duration";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import React from "react";
import type { LiveManagedRuntime } from "./services/runtime/live-layer";
import { createClientRuntimeLayer } from "./services/runtime/live-layer";
import { RuntimeProvider } from "./services/runtime/runtime-provider";

type BeepProviderProps = {
  children: React.ReactNode;
};

export const BeepProvider: React.FC<BeepProviderProps> = ({ children }) => {
  const queryClient = React.useMemo(
    () =>
      new TanstackQueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            retryDelay: 0,
            staleTime: Duration.toMillis("5 minutes"),
          },
          mutations: {
            retry: false,
            retryDelay: 0,
          },
        },
      }),
    []
  );

  const runtime: LiveManagedRuntime = React.useMemo(
    () => ManagedRuntime.make(createClientRuntimeLayer(queryClient)),
    [queryClient]
  );

  return (
    <QueryClientProvider client={queryClient}>
      {clientEnv.env === "dev" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      <RuntimeProvider runtime={runtime}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </RuntimeProvider>
    </QueryClientProvider>
  );
};
