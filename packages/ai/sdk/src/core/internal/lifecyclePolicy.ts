import type * as Duration from "effect/Duration"
import type { StreamBroadcastConfig, StreamShareConfig } from "../Query.js"

export type SessionLifecyclePolicy = {
  readonly closeDrainTimeout: Duration.Input
}

export type CloudflareLifecyclePolicy = {
  readonly defaultExecTimeoutMs: number | undefined
  readonly defaultShareConfig: StreamShareConfig
  readonly defaultBroadcastLag: StreamBroadcastConfig
}

export const defaultSessionLifecyclePolicy: SessionLifecyclePolicy = {
  closeDrainTimeout: "15 seconds"
}

export const defaultCloudflareLifecyclePolicy: CloudflareLifecyclePolicy = {
  defaultExecTimeoutMs: undefined,
  defaultShareConfig: { capacity: 64, strategy: "suspend" },
  defaultBroadcastLag: 64
}
