import { Effect, Layer } from "effect"
import type { Entity } from "effect/unstable/cluster"
import { EntityProxy } from "effect/unstable/cluster"
import { HttpApi, HttpApiBuilder } from "effect/unstable/httpapi"
import type { Rpc } from "effect/unstable/rpc"
import { AgentEntity } from "../entities/AgentEntity.js"
import { MemoryEntity } from "../entities/MemoryEntity.js"

// ---------------------------------------------------------------------------
// HttpApi definition — auto-derives endpoints from entity RPCs
// ---------------------------------------------------------------------------

export class ProxyApi extends HttpApi.make("proxy")
  .add(EntityProxy.toHttpApiGroup("agents", AgentEntity).prefix("/agents"))
  .add(EntityProxy.toHttpApiGroup("memories", MemoryEntity).prefix("/memories"))
{}

// ---------------------------------------------------------------------------
// Handler layers — one per entity
//
// EntityProxyServer.layerHttpApi has a bug in effect@4.0.0-beta.11: it
// destructures `{ path }` from the handler request but HttpApiBuilder
// provides `{ params }`.  Work around by implementing handlers directly.
// ---------------------------------------------------------------------------

const makeEntityHandlers = <Type extends string, Rpcs extends Rpc.Any>(
  api: typeof ProxyApi,
  name: "agents" | "memories",
  entity: Entity.Entity<Type, Rpcs>
) =>
  HttpApiBuilder.group(
    api,
    name,
    Effect.fnUntraced(function*(handlers_) {
      const client = yield* entity.client
      let handlers = handlers_
      for (const parentRpc_ of entity.protocol.requests.values()) {
        const parentRpc = parentRpc_ as any
        handlers = (handlers
          .handle(
            parentRpc._tag as any,
            (({ params, payload }: { params: { entityId: string }; payload: any }) =>
              (client(params.entityId) as any as Record<string, (p: any) => Effect.Effect<any>>)[parentRpc._tag](
                payload
              ).pipe(
                Effect.tapDefect(Effect.logError),
                Effect.annotateLogs({
                  module: "EntityProxyServer",
                  entity: entity.type,
                  entityId: params.entityId,
                  method: parentRpc._tag
                })
              )) as any
          ) as any)
          .handle(
            `${parentRpc._tag}Discard` as any,
            (({ params, payload }: { params: { entityId: string }; payload: any }) =>
              (client(params.entityId) as any as Record<
                string,
                (p: any, o: Record<string, unknown>) => Effect.Effect<any>
              >)[parentRpc._tag](
                payload,
                { discard: true }
              ).pipe(
                Effect.tapDefect(Effect.logError),
                Effect.annotateLogs({
                  module: "EntityProxyServer",
                  entity: entity.type,
                  entityId: params.entityId,
                  method: `${parentRpc._tag}Discard`
                })
              )) as any
          ) as any
      }
      return handlers as HttpApiBuilder.Handlers<never, never>
    })
  )

export const ProxyHandlersLive = Layer.mergeAll(
  makeEntityHandlers(ProxyApi, "agents", AgentEntity),
  makeEntityHandlers(ProxyApi, "memories", MemoryEntity)
)
