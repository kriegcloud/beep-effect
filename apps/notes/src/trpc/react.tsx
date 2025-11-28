"use client";

import { env } from "@beep/notes/env";

import type { AppRouter } from "@beep/notes/server/api/root";
import { getQueryClient } from "@beep/notes/trpc/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import React from "react";
import { SuperJSON } from "superjson";

export const api = createTRPCReact<AppRouter>();

export const useTRPC = () => {
  return api.useUtils();
};

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = React.useState(() =>
    api.createClient({
      links: [
        // loggerLink({
        //   enabled: (op) =>
        //     process.env.NODE_ENV === 'development' ||
        //     (op.direction === 'down' && op.result instanceof Error),
        // }),
        unstable_httpBatchStreamLink({
          transformer: SuperJSON,
          url: `${env.NEXT_PUBLIC_SITE_URL ?? ""}/api/trpc`,
          headers() {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");

            return headers;
          },
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}

        <div className="print:hidden">
          <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} position="bottom" />
        </div>
      </api.Provider>
    </QueryClientProvider>
  );
}
