import { EnvValue } from "@beep/constants";
import { serverEnv } from "@beep/shared-server/ServerEnv";
import * as DevTools from "@effect/experimental/DevTools";
import { BunSocket } from "@effect/platform-bun";
import * as Bool from "effect/Boolean";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Tracer from "./Tracer.layer.ts";

export const devToolsLayer: Layer.Layer<never, never, never> = Bool.match(EnvValue.is.dev(serverEnv.app.env), {
  onTrue: F.constant(DevTools.layerWebSocket().pipe(Layer.provide(BunSocket.layerWebSocketConstructor))),
  onFalse: F.constant(Layer.empty),
});

export const layer = Layer.mergeAll(devToolsLayer, Tracer.layer);
