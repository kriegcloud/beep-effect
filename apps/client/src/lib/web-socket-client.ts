import { BrowserSocket } from "@effect/platform-browser";
import type { WebSocketEvent } from "@repo/domain/WebSocket";
import { WebSocketRpc } from "@repo/domain/WebSocket";
import { type Cause, Effect, Layer, Stream } from "effect";
import { type Atom, AtomRpc } from "effect/unstable/reactivity";
import {
  RpcClient,
  type RpcClientError,
  RpcSerialization,
} from "effect/unstable/rpc";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:9000/ws";

export class WebSocketClient extends AtomRpc.Service<WebSocketClient>()(
  "WebSocketClient",
  {
    group: WebSocketRpc,
    protocol: RpcClient.layerProtocolSocket({
      retryTransientErrors: true,
    }).pipe(
      Layer.provide(BrowserSocket.layerWebSocket(WS_URL)),
      Layer.provide(RpcSerialization.layerNdjson),
    ),
  },
) {}

export const presenceSubscriptionAtom: Atom.AtomResultFn<
  void,
  readonly WebSocketEvent[],
  RpcClientError.RpcClientError | Cause.NoSuchElementError
> = WebSocketClient.runtime.fn(() =>
  Effect.gen(function* () {
    yield* Effect.log("Starting presence subscription stream");
    const client = yield* WebSocketClient;
    // biome-ignore lint/suspicious/noConfusingVoidType: RPC with no payload requires void argument
    return client("subscribe", undefined as void);
  }).pipe(
    Effect.map((stream) =>
      stream.pipe(
        // Cap event accumulation at 100 to prevent memory growth in long sessions
        Stream.scan<WebSocketEvent[], WebSocketEvent>([], (acc, event) => {
          const updated = [...acc, event];
          return updated.length > 100 ? updated.slice(-100) : updated;
        }),
      ),
    ),
    Stream.unwrap,
  ),
);
