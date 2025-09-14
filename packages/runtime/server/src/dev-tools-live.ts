import { serverEnv } from "@beep/core-env/server";
import { DevTools } from "@effect/experimental";
import { NodeSocket } from "@effect/platform-node";
import * as Layer from "effect/Layer";

export type DevToolsLive = Layer.Layer<never, never, never>;

export const DevToolsLive: DevToolsLive =
  serverEnv.app.env === "dev"
    ? DevTools.layerWebSocket().pipe(Layer.provide(NodeSocket.layerWebSocketConstructor))
    : Layer.empty;
