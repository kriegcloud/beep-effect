import * as ConfigProvider from "effect/ConfigProvider"
import * as Layer from "effect/Layer"
import type { SettingSource } from "../Schema/Options.js"

export const defaultSettingSources: ReadonlyArray<SettingSource> = []

export const projectSettingSources: ReadonlyArray<SettingSource> = [
  "project",
  "local"
]

export const layerConfigFromEnv = (prefix = "AGENTSDK") =>
  Layer.setConfigProvider(
    ConfigProvider.fromEnv().pipe(ConfigProvider.nested(prefix))
  )
