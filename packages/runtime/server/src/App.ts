import * as Layer from "effect/Layer";
import { DevToolsLive } from "./DevTools";
import { LoggingLive } from "./Logging";
import { type Slices, SlicesLive } from "./Slices";
import { type Tracing, TracingLive } from "./Tracing";

type App = Slices | Tracing;

export type AppLive = Layer.Layer<App, never, never>;

export const AppLive = Layer.mergeAll(SlicesLive, TracingLive, LoggingLive, DevToolsLive);
