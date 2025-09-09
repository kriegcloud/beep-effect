import type * as Layer from "effect/Layer";
import type * as ManagedRuntime from "effect/ManagedRuntime";
import type { NetworkMonitor } from "./common/NetworkMonitor";
import type { QueryClient } from "./common/QueryClient";
import type { WorkerClient } from "./worker/WorkerClient.ts";

export type LiveLayerType = Layer.Layer<NetworkMonitor | QueryClient | WorkerClient>;
export type LiveManagedRuntime = ManagedRuntime.ManagedRuntime<Layer.Layer.Success<LiveLayerType>, never>;
export type LiveRuntimeContext = ManagedRuntime.ManagedRuntime.Context<LiveManagedRuntime>;
