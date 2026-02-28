import type * as Duration from "effect/Duration";
import type { StreamBroadcastConfig, StreamShareConfig } from "../Query.js";

/**
 * @since 0.0.0
 */
export type SessionLifecyclePolicy = {
  readonly closeDrainTimeout: Duration.Input;
};

/**
 * @since 0.0.0
 */
export type CloudflareLifecyclePolicy = {
  readonly defaultExecTimeoutMs: number | undefined;
  readonly defaultShareConfig: StreamShareConfig;
  readonly defaultBroadcastLag: StreamBroadcastConfig;
};

/**
 * @since 0.0.0
 */
export const defaultSessionLifecyclePolicy: SessionLifecyclePolicy = {
  closeDrainTimeout: "15 seconds",
};

/**
 * @since 0.0.0
 */
export const defaultCloudflareLifecyclePolicy: CloudflareLifecyclePolicy = {
  defaultExecTimeoutMs: undefined,
  defaultShareConfig: { capacity: 64, strategy: "suspend" },
  defaultBroadcastLag: 64,
};
