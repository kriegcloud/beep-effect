import { HttpApiBuilder } from "@effect/platform"
import { BunHttpServer } from "@effect/platform-bun"
import * as Layer from "effect/Layer"
import { AgentHttpApi } from "./AgentHttpApi.js"
import { layer as AgentHttpHandlers } from "./AgentHttpHandlers.js"

export type AgentHttpServerOptions = {
  readonly port?: number
}

export const layer = (options: AgentHttpServerOptions = {}) => {
  const port = options.port ?? 3000
  const apiLayer = HttpApiBuilder.api(AgentHttpApi).pipe(
    Layer.provide(AgentHttpHandlers)
  )

  return HttpApiBuilder.serve().pipe(
    Layer.provide(apiLayer),
    Layer.provide(BunHttpServer.layer({ port }))
  )
}
