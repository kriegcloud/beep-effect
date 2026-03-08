import { IntegrationNotFound } from "@template/domain/errors"
import type { AgentId, ExternalServiceId, IntegrationId } from "@template/domain/ids"
import { ServiceCapability } from "@template/domain/integration"
import type { ExternalServiceRecord } from "@template/domain/integration"
import { DateTime, Effect, Schema } from "effect"
import { ClusterSchema, Entity } from "effect/unstable/cluster"
import { Rpc } from "effect/unstable/rpc"
import { ExternalServiceClientRegistry } from "../integrations/ExternalServiceClientRegistry.js"
import { IntegrationPortTag } from "../PortTags.js"

const ConnectRpc = Rpc.make("connect", {
  payload: {
    agentId: Schema.String,
    serviceId: Schema.String,
    name: Schema.String,
    endpoint: Schema.String,
    transport: Schema.Literals(["stdio", "sse", "http"]),
    identifier: Schema.optional(Schema.String)
  },
  success: Schema.Void,
  primaryKey: ({ serviceId }) => `connect:${serviceId}`
}).annotate(ClusterSchema.Persisted, true)

const DisconnectRpc = Rpc.make("disconnect", {
  payload: {},
  success: Schema.Void,
  error: IntegrationNotFound
})

const GetStatusRpc = Rpc.make("getIntegrationStatus", {
  payload: {},
  success: Schema.Struct({
    integrationId: Schema.String,
    serviceId: Schema.String,
    status: Schema.String,
    capabilities: Schema.Array(ServiceCapability)
  }),
  error: IntegrationNotFound
})

export const IntegrationEntity = Entity.make("Integration", [
  ConnectRpc,
  DisconnectRpc,
  GetStatusRpc
])

export const layer = IntegrationEntity.toLayer(Effect.gen(function*() {
  const integrationPort = yield* IntegrationPortTag
  const registry = yield* ExternalServiceClientRegistry

  return {
    connect: (request) =>
      Effect.gen(function*() {
        const integrationId = String(request.address.entityId) as IntegrationId
        const agentId = request.payload.agentId as AgentId
        const now = yield* DateTime.now

        const serviceId = request.payload.serviceId as ExternalServiceId
        const serviceRecord = {
          serviceId,
          name: request.payload.name,
          endpoint: request.payload.endpoint,
          transport: request.payload.transport,
          identifier: request.payload.identifier ?? request.payload.endpoint,
          createdAt: now
        } as ExternalServiceRecord

        yield* registry.connect({
          integrationId,
          agentId,
          service: serviceRecord
        })
      }).pipe(
        Effect.withSpan("IntegrationEntity.connect"),
        Effect.annotateLogs({ module: "IntegrationEntity", entityId: request.address.entityId })
      ),

    disconnect: (request) =>
      Effect.gen(function*() {
        const integrationId = String(request.address.entityId) as IntegrationId
        const existing = yield* integrationPort.getIntegration(integrationId)
        if (existing === null) {
          return yield* new IntegrationNotFound({ integrationId })
        }
        yield* registry.disconnect(existing.serviceId)
      }).pipe(
        Effect.withSpan("IntegrationEntity.disconnect"),
        Effect.annotateLogs({ module: "IntegrationEntity", entityId: request.address.entityId })
      ),

    getIntegrationStatus: (request) =>
      Effect.gen(function*() {
        const integrationId = String(request.address.entityId) as IntegrationId
        const runtimeStatus = yield* registry.getStatus(integrationId)
        if (runtimeStatus !== null) {
          return {
            integrationId: runtimeStatus.integrationId,
            serviceId: runtimeStatus.serviceId,
            status: runtimeStatus.status,
            capabilities: [...runtimeStatus.capabilities]
          }
        }

        const persisted = yield* integrationPort.getIntegration(integrationId)
        if (persisted === null) {
          return yield* new IntegrationNotFound({ integrationId })
        }
        return {
          integrationId: persisted.integrationId,
          serviceId: persisted.serviceId,
          status: persisted.status,
          capabilities: [...persisted.capabilities]
        }
      }).pipe(
        Effect.withSpan("IntegrationEntity.getIntegrationStatus"),
        Effect.annotateLogs({ module: "IntegrationEntity", entityId: request.address.entityId })
      )
  }
}))
