import * as Layer from "effect/Layer";
import { DevToolsLive } from "./DevTools.ts";
import { LoggingLive } from "./Logging.ts";
import { type Slices, SlicesLive } from "./Slices.ts";
import { type Tracing, TracingLive } from "./Tracing.ts";

type App = Slices | Tracing;

export type AppLive = Layer.Layer<App, never, never>;

export const AppLive: AppLive = Layer.mergeAll(SlicesLive, TracingLive, LoggingLive, DevToolsLive);
