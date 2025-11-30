import * as DevTools from "@effect/experimental/DevTools";
import { BunSocket } from "@effect/platform-bun";
import * as Bool from "effect/Boolean";
import * as Layer from "effect/Layer";
import { isDevEnvironment } from "./Environment";

export type DevToolsLive = Layer.Layer<never, never, never>;
export const DevToolsLive: DevToolsLive = Bool.match(isDevEnvironment, {
  onTrue: () => DevTools.layerWebSocket().pipe(Layer.provide(BunSocket.layerWebSocketConstructor)),
  onFalse: () => Layer.empty,
});
