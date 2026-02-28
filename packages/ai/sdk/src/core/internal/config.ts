import * as ConfigProvider from "effect/ConfigProvider";

import type { SettingSource } from "../Schema/Options.js";

/**
 * @since 0.0.0
 */
export const defaultSettingSources: ReadonlyArray<SettingSource> = [];

/**
 * @since 0.0.0
 */
export const projectSettingSources: ReadonlyArray<SettingSource> = ["project", "local"];

/**
 * @since 0.0.0
 */
export const layerConfigFromEnv = (prefix = "AGENTSDK") =>
  ConfigProvider.layerAdd(ConfigProvider.fromEnv().pipe(ConfigProvider.nested(prefix)));
