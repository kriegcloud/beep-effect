import { Layer } from "effect";
import { AgentRuntime } from "./AgentRuntime.js";
import type { SDKSessionOptions } from "./Schema/Session.js";
import { SessionConfig } from "./SessionConfig.js";
import { SessionManager } from "./SessionManager.js";
import { type SessionHistoryOptions, SessionService } from "./SessionService.js";
import { ChatHistoryStore } from "./Storage/index.js";

/**
 * @since 0.0.0
 * @category Configuration
 */
export type EntryPrefix = string;

/**
 * @since 0.0.0
 * @category Configuration
 */
export type SessionEntryLayers = {
  readonly sessionConfig?: Layer.Layer<SessionConfig>;
  readonly sessionManager?: Layer.Layer<SessionManager>;
  readonly chatHistory?: Layer.Layer<ChatHistoryStore>;
};

/**
 * @since 0.0.0
 * @category Configuration
 */
export type SessionEntryOptions = Readonly<{
  readonly prefix?: EntryPrefix;
  readonly history?: SessionHistoryOptions;
  readonly layers?: SessionEntryLayers;
}>;

/**
 * @since 0.0.0
 * @category Configuration
 */
export type RuntimeEntryLayers = {
  readonly runtime?: Layer.Layer<AgentRuntime>;
};

/**
 * @since 0.0.0
 * @category Configuration
 */
export type RuntimeEntryOptions = Readonly<{
  readonly prefix?: EntryPrefix;
  readonly layers?: RuntimeEntryLayers;
}>;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const sessionLayer = (options: SDKSessionOptions, entry?: SessionEntryOptions) => {
  const prefix = entry?.prefix ?? "AGENTSDK";
  const sessionConfig = entry?.layers?.sessionConfig ?? SessionConfig.layerFromEnv(prefix);
  const managerLayer = entry?.layers?.sessionManager ?? SessionManager.layer.pipe(Layer.provide(sessionConfig));
  const baseLayer = SessionService.layer(options).pipe(Layer.provide(managerLayer));

  if (!entry?.history) {
    return baseLayer;
  }

  const historyLayer = entry.layers?.chatHistory ?? ChatHistoryStore.layerMemory;
  return SessionService.layerWithHistory(options, entry.history).pipe(
    Layer.provide(managerLayer),
    Layer.provide(historyLayer)
  );
};

/**
 * @since 0.0.0
 * @category Configuration
 */
export const runtimeLayer = (entry?: RuntimeEntryOptions) => {
  if (entry?.layers?.runtime) return entry.layers.runtime;
  return AgentRuntime.layerDefaultFromEnv(entry?.prefix ?? "AGENTSDK");
};
