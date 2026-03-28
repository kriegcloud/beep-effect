import {
  defaultSettingSources as defaultSettingSources_,
  layerConfigFromEnv as layerConfigFromEnv_,
  projectSettingSources as projectSettingSources_,
} from "./internal/config.js";

/**
 * Re-exported helpers for configuring AgentSdk options from environment
 * and project-level settings.
 */
/**
 * @since 0.0.0
 * @category Configuration
 */
export const defaultSettingSources = defaultSettingSources_;
/**
 * @since 0.0.0
 * @category Configuration
 */
export const layerConfigFromEnv = layerConfigFromEnv_;
/**
 * @since 0.0.0
 * @category Configuration
 */
export const projectSettingSources = projectSettingSources_;
