"use client";

import * as ClientRuntime from "@beep/core-runtime/client";
import { QueryClientProvider, QueryClient as TanstackQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import * as Duration from "effect/Duration";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import React from "react";
import type { LiveManagedRuntime } from "@/services/live-layer";
import { RuntimeProvider } from "@/services/runtime/runtime-provider";
import { QueryClient } from "./services/common/QueryClient";
import { WorkerClient } from "./services/worker/WorkerClient";

type GlobalProviders = {
  children: React.ReactNode;
};

export const GlobalProviders: React.FC<GlobalProviders> = ({ children }) => {
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
    () =>
      ManagedRuntime.make(
        Layer.mergeAll(
          ClientRuntime.DevToolsLive,
          ClientRuntime.WebSdkLive,
          ClientRuntime.NetworkMonitor.Default,
          WorkerClient.Default,
          QueryClient.make(queryClient),
          Logger.minimumLogLevel(process.env.NEXT_PUBLIC_ENV === "dev" ? LogLevel.Debug : LogLevel.Info)
        ).pipe(Layer.provide(Logger.pretty))
      ),
    [queryClient]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <RuntimeProvider runtime={runtime}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </RuntimeProvider>
    </QueryClientProvider>
  );
};
