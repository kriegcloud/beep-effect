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
import { ChatApp } from "./chat/ui/ChatApp.tsx";
import { ChatTurnErrorToasts } from "./chat/ui/ChatTurnErrorToasts.tsx";
import type { JSX } from "react";

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
  return (
    <>
      <ChatApp />
      <ChatTurnErrorToasts />
      <Toaster richColors />
    </>
  );
}
