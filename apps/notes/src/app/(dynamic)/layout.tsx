import { isAuth } from "@beep/notes/components/auth/rsc/auth";
import { AuthProvider } from "@beep/notes/components/auth/rsc/auth-provider";
import { DynamicModalProvider } from "@beep/notes/components/modals";
import { DynamicModalEffect } from "@beep/notes/components/modals/dynamic-modal-effect";
import { HydrateClient, trpc } from "@beep/notes/trpc/server";
import type * as React from "react";

export default async function DynamicLayout({ children }: { children: React.ReactNode }) {
  if (await isAuth()) {
    void trpc.layout.app.prefetch();
  }

  return (
    <HydrateClient>
      <AuthProvider>
        {children}

        <DynamicModalProvider />
        <DynamicModalEffect />
      </AuthProvider>
    </HydrateClient>
  );
}
