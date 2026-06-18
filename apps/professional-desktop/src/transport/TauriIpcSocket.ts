/**
 * App-local Tauri-IPC transport for the desktop chat sidecar (transport spike).
 *
 * Builds an Effect {@link Socket} whose inbound bytes arrive on the Rust shell's
 * `sidecar://rx` event channel (the sidecar's stdout, bridged in
 * `src-tauri/src/lib.rs`) and whose outbound frames are written to the sidecar's
 * stdin via the `sidecar_send` command. Tunnelling the existing ndjson rpc frames
 * over this socket lets `RpcClient.layerProtocolSocket` drive the same
 * {@link ChatRpcs} contract the HTTP transport uses — with no loopback HTTP, no
 * `:3939`, and no CSP `connect-src` carve-out.
 *
 * This is the ONLY module that imports `@tauri-apps/api`; keeping the framework
 * wrapper app-local preserves the rule that shared clients/drivers stay
 * browser-safe (see `standards/architecture/03-driver-boundaries.md`).
 *
 * @packageDocumentation
 * @category transport
 * @since 0.0.0
 */
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Effect, Layer } from "effect";
import { Socket } from "effect/unstable/socket";
import type { UnlistenFn } from "@tauri-apps/api/event";

const decoder = new TextDecoder();

// Inbound stdout frames ride the `sidecar://rx` event onto a web ReadableStream;
// outbound frames are written to the sidecar's stdin via `sidecar_send`. The
// frames are ndjson text, so the outgoing Uint8Array chunks are decoded back to
// strings for the command boundary, and `fromTransformStream`'s ndjson decoder
// reassembles inbound chunks into lines.
const makeStream = (): Socket.InputTransformStream => {
  let unlisten: UnlistenFn | undefined;
  const readable = new ReadableStream<string>({
    start(controller) {
      // `listen` is async, but this rpc is strictly client-initiated: the server
      // only ever emits frames in response to a request the client sends after
      // the socket is open, so there is no unsolicited frame to miss while the
      // listener is still registering. (A server-side boot banner or push would
      // need Rust-side buffering until the first listener attaches.)
      return listen<string>("sidecar://rx", (event) => controller.enqueue(event.payload)).then((fn) => {
        unlisten = fn;
      });
    },
    cancel() {
      unlisten?.();
    },
  });
  const writable = new WritableStream<Uint8Array>({
    write(chunk) {
      // `stream: true` keeps decoding correct if a frame ever spans two chunks
      // mid-codepoint; the awaited invoke also applies natural write backpressure.
      return invoke<void>("sidecar_send", { frame: decoder.decode(chunk, { stream: true }) });
    },
  });
  return { readable, writable };
};

/**
 * The `Socket` service that backs the IPC rpc client, bridged to the sidecar's
 * stdio through the Tauri Rust shell.
 *
 * @example
 * ```ts
 * import { TauriIpcSocketLive } from "@/transport/TauriIpcSocket"
 *
 * console.log(TauriIpcSocketLive)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const TauriIpcSocketLive: Layer.Layer<Socket.Socket> = Layer.effect(
  Socket.Socket,
  Socket.fromTransformStream(Effect.sync(makeStream))
);
