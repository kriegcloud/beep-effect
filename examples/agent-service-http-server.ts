import { BunRuntime } from "@effect/platform-bun"
import * as Layer from "effect/Layer"
import {
  AgentRuntime,
  AgentRuntimeConfig,
  AgentSdk,
  QuerySupervisor,
  QuerySupervisorConfig,
  Service
} from "../src/index.js"

const sdkLayer = AgentSdk.layerDefaultFromEnv()

const supervisorLayer = QuerySupervisor.layer.pipe(
  Layer.provide(QuerySupervisorConfig.layerFromEnv()),
  Layer.provide(sdkLayer)
)

const runtimeLayer = AgentRuntime.layer.pipe(
  Layer.provide(AgentRuntimeConfig.layerFromEnv()),
  Layer.provide(supervisorLayer)
)

const appLayer = Service.agentHttpServerLayer({ port: 3000 }).pipe(
  Layer.provide(runtimeLayer)
)

BunRuntime.runMain(Layer.launch(appLayer))
