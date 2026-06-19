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
import { Data, Effect, Layer } from "effect";
import { Socket } from "effect/unstable/socket";

const decoder = new TextDecoder();
type StopListening = Awaited<ReturnType<typeof listen>>;
type SidecarClosedPayload = {
  readonly code: number | null;
  readonly kind: string;
  readonly message: string | null;
  readonly signal: number | null;
};

const sidecarClosedMessage = (payload: SidecarClosedPayload): string => {
  if (payload.message !== null && payload.message.length > 0) {
    return `sidecar ${payload.kind}: ${payload.message}`;
  }
  const code = payload.code === null ? "none" : `${payload.code}`;
  const signal = payload.signal === null ? "none" : `${payload.signal}`;
  return `sidecar ${payload.kind}: code=${code} signal=${signal}`;
};

class SidecarClosedError extends Data.TaggedError("SidecarClosedError")<{
  readonly message: string;
  readonly payload: SidecarClosedPayload;
}> {}

class SidecarSendError extends Data.TaggedError("SidecarSendError")<{
  readonly causeMessage: string;
  readonly message: string;
}> {}

const unknownToMessage = (cause: unknown): string => {
  if (cause instanceof Error) {
    return cause.message;
  }
  return String(cause);
};

const closeOutboundBuffer = (buffer: string): string =>
  buffer.length > 0 && !buffer.endsWith("\n") ? `${buffer}\n` : buffer;

// Inbound stdout frames ride the `sidecar://rx` event onto a web ReadableStream;
// outbound frames are written to the sidecar's stdin via `sidecar_send`. The
// frames are ndjson text, so the outgoing Uint8Array chunks are decoded back to
// strings for the command boundary, and `fromTransformStream`'s ndjson decoder
// reassembles inbound chunks into lines.
const makeStream = (): Socket.InputTransformStream => {
  let readableController: ReadableStreamDefaultController<string> | undefined;
  let outboundBuffer = "";
  let listenersReady: Promise<void> = Promise.resolve();
  let sendFailure: SidecarSendError | undefined;
  let stopListening: StopListening | undefined;
  let stopClosedListening: StopListening | undefined;

  const failSend = (cause: unknown): Promise<never> => {
    const causeMessage = unknownToMessage(cause);
    const error = new SidecarSendError({
      causeMessage,
      message: `sidecar send failed: ${causeMessage}`,
    });
    sendFailure = error;
    outboundBuffer = "";
    readableController?.error(error);
    return Promise.reject(error);
  };

  const flushCompleteFrames = (): Promise<void> => {
    if (sendFailure !== undefined) {
      return Promise.reject(sendFailure);
    }

    const newlineIndex = outboundBuffer.indexOf("\n");
    if (newlineIndex === -1) {
      return Promise.resolve();
    }

    const frame = outboundBuffer.slice(0, newlineIndex + 1);
    outboundBuffer = outboundBuffer.slice(newlineIndex + 1);
    return invoke<void>("sidecar_send", { frame }).then(flushCompleteFrames, failSend);
  };

  const readable = new ReadableStream<string>({
    start(controller) {
      readableController = controller;
      listenersReady = Promise.all([
        listen<string>("sidecar://rx", (event) => controller.enqueue(event.payload)),
        listen<SidecarClosedPayload>("sidecar://closed", (event) => {
          controller.error(
            new SidecarClosedError({ message: sidecarClosedMessage(event.payload), payload: event.payload })
          );
        }),
      ]).then(([stopRx, stopClosed]) => {
        stopListening = stopRx;
        stopClosedListening = stopClosed;
        return invoke<void>("sidecar_ipc_ready");
      });
      return listenersReady;
    },
    cancel() {
      stopListening?.();
      stopClosedListening?.();
      readableController = undefined;
    },
  });
  const writable = new WritableStream<Uint8Array>({
    write(chunk) {
      if (sendFailure !== undefined) {
        return Promise.reject(sendFailure);
      }
      outboundBuffer += decoder.decode(chunk, { stream: true });
      return listenersReady.then(flushCompleteFrames, failSend);
    },
    close() {
      if (sendFailure !== undefined) {
        return Promise.reject(sendFailure);
      }
      outboundBuffer = closeOutboundBuffer(outboundBuffer + decoder.decode());
      return listenersReady.then(flushCompleteFrames, failSend);
    },
    abort() {
      outboundBuffer = "";
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
