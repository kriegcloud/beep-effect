import { DevToolsServer } from "@beep/notes/components/dev/dev-tools-server";
import { TRPCReactProvider } from "@beep/notes/trpc/react";

export function ProvidersServer({ children }: { readonly children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <DevToolsServer>{children}</DevToolsServer>
    </TRPCReactProvider>
  );
}
