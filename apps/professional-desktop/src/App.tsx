/**
 * Professional Desktop React workbench shell bootstrap.
 *
 * Mounts the desktop chat surface ({@link ChatApp}), wired to the
 * `@beep/agents-client` atoms and `@beep/editor`. The chat surface renders its
 * own loading/empty/streaming states without a live sidecar; live interaction
 * needs the rpc server (built separately).
 *
 * @packageDocumentation
 * @category components
 * @since 0.0.0
 */

import { Toaster } from "@beep/ui/components/sonner";
import { useEffect, useState } from "react";
import { ChatApp } from "./chat/ui/ChatApp.tsx";
import { ChatTurnErrorToasts } from "./chat/ui/ChatTurnErrorToasts.tsx";
import { IpcSpikePanel } from "./transport/IpcSpikePanel.tsx";
import type { JSX } from "react";

type SidecarTransport = {
  readonly ipc: boolean;
};

type TransportState = "checking" | "http" | "ipc";

const hasTauriRuntime = (): boolean => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

const readSidecarTransport = (): Promise<SidecarTransport> =>
  hasTauriRuntime()
    ? import("@tauri-apps/api/core")
        .then(({ invoke }) => invoke<SidecarTransport>("sidecar_transport"))
        .catch(() => ({ ipc: false }))
    : Promise.resolve({ ipc: false });

/**
 * The desktop application root. A thin wrapper that mounts the chat surface.
 *
 * @example
 * ```tsx
 * import { App } from "@/App"
 *
 * console.log(App.name) // "App"
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function App(): JSX.Element {
  const [transport, setTransport] = useState<TransportState>(() => (hasTauriRuntime() ? "checking" : "http"));

  useEffect(() => {
    let mounted = true;
    void readSidecarTransport().then(({ ipc }) => {
      if (mounted) {
        setTransport(ipc ? "ipc" : "http");
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {transport === "checking" ? null : transport === "ipc" ? <IpcSpikePanel /> : <ChatApp />}
      <ChatTurnErrorToasts />
      <Toaster richColors />
    </>
  );
}
