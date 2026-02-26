import * as ConfigProvider from "effect/ConfigProvider";

import type {SettingSource} from "../Schema/Options.js";

export const defaultSettingSources: ReadonlyArray<SettingSource> = [];

export const projectSettingSources: ReadonlyArray<SettingSource> = [
	"project",
	"local"
];

export const layerConfigFromEnv = (prefix = "AGENTSDK") => ConfigProvider.layerAdd(ConfigProvider.fromEnv()
.pipe(ConfigProvider.nested(prefix)));
