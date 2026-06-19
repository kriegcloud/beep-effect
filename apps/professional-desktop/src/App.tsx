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

import { chatProtocolLayerAtom, HttpChatProtocolLive } from "@beep/agents-client";
import { Toaster } from "@beep/ui/components/sonner";
import { useAtomSet } from "@effect/atom-react";
import { useEffect, useState } from "react";
import { ChatApp } from "./chat/ui/ChatApp.tsx";
import { ChatTurnErrorToasts } from "./chat/ui/ChatTurnErrorToasts.tsx";
import { IpcChatProtocolLive } from "./transport/IpcChatClient.ts";
import { IpcSpikePanel } from "./transport/IpcSpikePanel.tsx";
import type { JSX } from "react";

type SidecarTransport = {
  readonly ipc: boolean;
};

type TransportState =
  | {
      readonly _tag: "checking";
    }
  | {
      readonly _tag: "failed";
      readonly message: string;
    }
  | {
      readonly _tag: "ready";
      readonly ipc: boolean;
    };

const hasTauriRuntime = (): boolean => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

const readSidecarTransport = (): Promise<SidecarTransport> =>
  hasTauriRuntime()
    ? import("@tauri-apps/api/core").then(({ invoke }) => invoke<SidecarTransport>("sidecar_transport"))
    : Promise.resolve({ ipc: false });

const hasIpcSpikeFlag = (): boolean =>
  typeof window !== "undefined" && new URLSearchParams(window.location.search).has("ipc");

const TransportLoading = (): JSX.Element => (
  <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="h-2 w-2 rounded-full bg-primary motion-safe:animate-pulse" />
      Connecting desktop transport
    </div>
  </div>
);

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
  const setChatProtocolLayer = useAtomSet(chatProtocolLayerAtom);
  const [transport, setTransport] = useState<TransportState>(() =>
    hasTauriRuntime() ? { _tag: "checking" } : { _tag: "ready", ipc: false }
  );

  useEffect(() => {
    let mounted = true;
    void readSidecarTransport().then(
      ({ ipc }) => {
        if (mounted) {
          setChatProtocolLayer(ipc ? IpcChatProtocolLive : HttpChatProtocolLive);
          setTransport({ _tag: "ready", ipc });
        }
      },
      (cause) => {
        if (mounted) {
          setTransport({ _tag: "failed", message: String(cause) });
        }
      }
    );
    return () => {
      mounted = false;
    };
  }, [setChatProtocolLayer]);

  if (transport._tag === "checking") {
    return (
      <>
        <TransportLoading />
        <ChatTurnErrorToasts />
        <Toaster richColors />
      </>
    );
  }

  if (transport._tag === "failed") {
    return (
      <>
        <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
          <div className="max-w-md rounded-md border bg-card p-4 shadow-sm">
            <h1 className="text-base font-semibold">Desktop transport unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">{transport.message}</p>
          </div>
        </div>
        <ChatTurnErrorToasts />
        <Toaster richColors />
      </>
    );
  }

  return (
    <>
      <ChatApp />
      <ChatTurnErrorToasts />
      <Toaster richColors />
      {transport.ipc && hasIpcSpikeFlag() ? <IpcSpikePanel /> : null}
    </>
  );
}
