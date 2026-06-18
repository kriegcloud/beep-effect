/**
 * Dev/QA panel for the Tauri-IPC sidecar transport spike, gated behind `?ipc=1`
 * (so it ships in packaged builds for validation but stays hidden by default).
 *
 * "Send over IPC" creates a thread and streams a fixture assistant turn over the
 * {@link IpcChatProtocolLive} transport — proving the streaming `SendMessage`
 * path round-trips through the Rust stdio bridge with no loopback HTTP (verify
 * DevTools Network shows no `/rpc` / `:3939` traffic). "Cancel" interrupts a
 * running turn, exercising the orchestrator's "cancel leaves no partial assistant
 * row" contract over IPC.
 *
 * @packageDocumentation
 * @category components
 * @since 0.0.0
 */
import { ChatRpcs } from "@beep/agents-use-cases/public";
import { Cause, Effect, Fiber, Layer, Stream } from "effect";
import { RpcClient } from "effect/unstable/rpc";
import { useCallback, useRef, useState } from "react";
import { decodeWorkspaceId, userDocument } from "@/chat/ChatFixtures";
import { IpcChatProtocolLive } from "./IpcChatClient.js";
import type { JSX } from "react";

// One self-contained run: open the IPC socket, create a thread, and stream a
// turn. Scope discharges the socket on completion/interrupt; typed errors are
// surfaced to the log (interrupts bypass catchAll and simply stop the stream).
const sendOverIpcProgram = Effect.fn("ProfessionalDesktop.IpcSpikePanel.sendOverIpcProgram")(function* (
  log: (line: string) => void
) {
  const client = yield* RpcClient.make(ChatRpcs);
  const workspaceId = decodeWorkspaceId(1);
  const thread = yield* client.CreateThread({ workspaceId, title: "ipc spike" });
  log(`thread created over ipc: ${thread.id}`);
  let blocks = 0;
  yield* client.SendMessage({ threadId: thread.id, content: userDocument("hello over tauri ipc") }).pipe(
    Stream.runForEach(() =>
      Effect.sync(() => {
        blocks += 1;
        log(`streamed block ${blocks}`);
      })
    )
  );
  log(`stream complete (${blocks} block(s)) — no /rpc, no :3939`);
});

const sendOverIpc = (log: (line: string) => void): Effect.Effect<void> =>
  Effect.scoped(
    Effect.gen(function* () {
      const context = yield* Layer.build(IpcChatProtocolLive);
      yield* sendOverIpcProgram(log).pipe(Effect.provide(context));
    })
  ).pipe(Effect.catchCause((cause) => Effect.sync(() => log(`stopped: ${Cause.pretty(cause)}`))));

/**
 * Floating dev panel that drives the IPC transport spike. Mounted by `App` only
 * when the page URL carries `?ipc=1`.
 *
 * @example
 * ```tsx
 * import { IpcSpikePanel } from "@/transport/IpcSpikePanel"
 *
 * console.log(IpcSpikePanel.name)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function IpcSpikePanel(): JSX.Element {
  const [lines, setLines] = useState<ReadonlyArray<string>>([]);
  const fiberRef = useRef<Fiber.Fiber<void> | undefined>(undefined);
  const append = useCallback((line: string) => setLines((prev) => [...prev, line]), []);

  const run = useCallback(() => {
    // Guard re-entry: interrupt any in-flight run before forking a new one, so we
    // never orphan a fiber or interleave its log lines.
    if (fiberRef.current !== undefined) {
      void Effect.runPromise(Fiber.interrupt(fiberRef.current));
    }
    setLines([]);
    fiberRef.current = Effect.runFork(sendOverIpc(append));
  }, [append]);

  const cancel = useCallback(() => {
    if (fiberRef.current !== undefined) {
      void Effect.runPromise(Fiber.interrupt(fiberRef.current));
    }
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 9999,
        width: 360,
        padding: 12,
        background: "rgba(0,0,0,0.85)",
        color: "#e6e6e6",
        borderRadius: 8,
        fontFamily: "monospace",
        fontSize: 12,
      }}
    >
      <strong>IPC transport spike</strong>
      <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
        <button type="button" onClick={run}>
          Send over IPC
        </button>
        <button type="button" onClick={cancel}>
          Cancel
        </button>
      </div>
      <div style={{ maxHeight: 180, overflow: "auto" }}>
        {lines.map((line, index) => (
          <div key={`${index}-${line}`}>{line}</div>
        ))}
      </div>
    </div>
  );
}
